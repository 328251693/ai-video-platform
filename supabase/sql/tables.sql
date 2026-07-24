-- AI Video Platform Database Schema
-- Run this in Supabase SQL Editor

-- Users profile extension (Supabase Auth handles authentication)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'enterprise')),
  credits_remaining INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Models table (read from upstream, managed by admin)
CREATE TABLE public.models (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('video', 'image', 'audio', 'text')),
  description TEXT,
  icon_url TEXT,
  parameters JSONB DEFAULT '{}',
  capabilities JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Public read for models
CREATE POLICY "Anyone can read models"
  ON public.models FOR SELECT
  USING (is_active = true);

-- Generation tasks table
CREATE TABLE public.generation_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  model_id TEXT REFERENCES public.models(id),

  -- Input
  prompt TEXT NOT NULL,
  input_params JSONB DEFAULT '{}',

  -- Output
  output_url TEXT,
  output_thumbnail TEXT,
  metadata JSONB DEFAULT '{}',

  -- Status: pending -> processing -> completed / failed
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,

  -- Timing
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Credits
  credits_used INTEGER DEFAULT 0
);

-- RLS for generation tasks
ALTER TABLE public.generation_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own tasks"
  ON public.generation_tasks FOR SELECT
  USING (user_id = (SELECT id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create tasks"
  ON public.generation_tasks FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update own tasks"
  ON public.generation_tasks FOR UPDATE
  USING (user_id = (SELECT id FROM public.profiles WHERE id = auth.uid()))
  WITH CHECK (user_id = (SELECT id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete own tasks"
  ON public.generation_tasks FOR DELETE
  USING (user_id = (SELECT id FROM public.profiles WHERE id = auth.uid()));

-- Templates table
CREATE TABLE public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,

  -- Associated model
  model_id TEXT REFERENCES public.models(id),

  -- Template content
  prompt_template TEXT NOT NULL,
  default_params JSONB DEFAULT '{}',

  -- Thumbnail
  thumbnail_url TEXT,

  -- Public visibility
  is_public BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for templates
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own templates"
  ON public.templates FOR SELECT
  USING (user_id = (SELECT id FROM public.profiles WHERE id = auth.uid()) OR is_public = true);

CREATE POLICY "Users can manage own templates"
  ON public.templates FOR ALL
  USING (user_id = (SELECT id FROM public.profiles WHERE id = auth.uid()));

-- Credit transactions table
CREATE TABLE public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Amount: positive = deposit, negative = consumption
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,

  -- Source: purchase, generation, refund, bonus
  source TEXT NOT NULL CHECK (source IN ('purchase', 'generation', 'refund', 'bonus')),
  reference_id TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for transactions
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own transactions"
  ON public.credit_transactions FOR SELECT
  USING (user_id = (SELECT id FROM public.profiles WHERE id = auth.uid()));

-- 交易只能由下方的安全函数写入，避免客户端伪造积分流水
CREATE OR REPLACE FUNCTION public.consume_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_reference_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_balance INTEGER;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Unauthorized credit operation';
  END IF;

  UPDATE public.profiles
  SET credits_remaining = credits_remaining - p_amount,
      updated_at = NOW()
  WHERE id = p_user_id AND credits_remaining >= p_amount
  RETURNING credits_remaining INTO new_balance;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;

  INSERT INTO public.credit_transactions (user_id, amount, balance_after, source, reference_id)
  VALUES (p_user_id, -p_amount, new_balance, 'generation', p_reference_id);

  RETURN jsonb_build_object('balance_after', new_balance);
END;
$$;

CREATE OR REPLACE FUNCTION public.refund_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_reference_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_balance INTEGER;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Unauthorized credit operation';
  END IF;

  UPDATE public.profiles
  SET credits_remaining = credits_remaining + p_amount,
      updated_at = NOW()
  WHERE id = p_user_id
  RETURNING credits_remaining INTO new_balance;

  INSERT INTO public.credit_transactions (user_id, amount, balance_after, source, reference_id)
  VALUES (p_user_id, p_amount, new_balance, 'refund', p_reference_id);

  RETURN jsonb_build_object('balance_after', new_balance);
END;
$$;

-- API Keys table (for advanced users)
CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL,
  name TEXT,

  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,

  -- Rate limiting
  rate_limit INTEGER DEFAULT 60,
  monthly_usage INTEGER DEFAULT 0
);

-- RLS for api_keys
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own api keys"
  ON public.api_keys FOR ALL
  USING (user_id = (SELECT id FROM public.profiles WHERE id = auth.uid()));

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, credits_remaining)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', 10);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Index for faster queries
CREATE INDEX idx_tasks_user_id ON public.generation_tasks(user_id);
CREATE INDEX idx_tasks_status ON public.generation_tasks(status);
CREATE INDEX idx_tasks_created_at ON public.generation_tasks(created_at DESC);
CREATE INDEX idx_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX idx_transactions_created_at ON public.credit_transactions(created_at DESC);
