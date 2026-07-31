-- Creem 支付、订阅、订单和 Credits 入账迁移

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_plan_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_plan_check
  CHECK (plan IN ('free', 'basic', 'starter', 'pro', 'plus', 'ultra', 'enterprise'));
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS creem_customer_id TEXT;

ALTER TABLE public.credit_transactions DROP CONSTRAINT IF EXISTS credit_transactions_source_check;
ALTER TABLE public.credit_transactions
  ADD CONSTRAINT credit_transactions_source_check
  CHECK (source IN ('purchase', 'purchase_reversal', 'generation', 'refund', 'bonus'));

CREATE TABLE IF NOT EXISTS public.billing_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  request_id TEXT NOT NULL UNIQUE,
  checkout_id TEXT UNIQUE,
  creem_order_id TEXT UNIQUE,
  creem_product_id TEXT NOT NULL,
  plan_key TEXT NOT NULL CHECK (plan_key IN ('basic', 'pro', 'plus', 'ultra')),
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'annual', 'one_time')),
  credits_amount INTEGER NOT NULL CHECK (credits_amount > 0),
  amount INTEGER,
  currency TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'disputed')),
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.billing_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  creem_subscription_id TEXT NOT NULL UNIQUE,
  creem_product_id TEXT NOT NULL,
  plan_key TEXT NOT NULL CHECK (plan_key IN ('basic', 'pro', 'plus', 'ultra')),
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'annual')),
  status TEXT NOT NULL,
  credits_per_period INTEGER NOT NULL CHECK (credits_per_period > 0),
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.billing_webhook_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'received'
    CHECK (status IN ('received', 'processed', 'failed')),
  error_message TEXT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

ALTER TABLE public.billing_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_webhook_events ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'billing_orders'
      AND policyname = 'Users can read own billing orders'
  ) THEN
    CREATE POLICY "Users can read own billing orders"
      ON public.billing_orders FOR SELECT
      USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'billing_subscriptions'
      AND policyname = 'Users can read own billing subscriptions'
  ) THEN
    CREATE POLICY "Users can read own billing subscriptions"
      ON public.billing_subscriptions FOR SELECT
      USING (user_id = auth.uid());
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_billing_orders_user_id
  ON public.billing_orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_creem_customer_id
  ON public.profiles(creem_customer_id);
CREATE INDEX IF NOT EXISTS idx_billing_orders_status
  ON public.billing_orders(status);
CREATE INDEX IF NOT EXISTS idx_billing_subscriptions_user_id
  ON public.billing_subscriptions(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_billing_webhook_events_status
  ON public.billing_webhook_events(status, received_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_purchase_credit_reference
  ON public.credit_transactions(source, reference_id)
  WHERE source IN ('purchase', 'purchase_reversal') AND reference_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.grant_purchase_credits(
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
  current_balance INTEGER;
  new_balance INTEGER;
BEGIN
  IF p_user_id IS NULL OR p_amount <= 0 OR p_reference_id IS NULL OR p_reference_id = '' THEN
    RAISE EXCEPTION 'Invalid purchase credit operation';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('purchase:' || p_reference_id));

  IF EXISTS (
    SELECT 1 FROM public.credit_transactions
    WHERE source = 'purchase' AND reference_id = p_reference_id
  ) THEN
    SELECT credits_remaining INTO current_balance
    FROM public.profiles WHERE id = p_user_id;
    RETURN jsonb_build_object('balance_after', current_balance, 'duplicate', true);
  END IF;

  SELECT credits_remaining INTO current_balance
  FROM public.profiles WHERE id = p_user_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  new_balance := current_balance + p_amount;
  UPDATE public.profiles
  SET credits_remaining = new_balance, updated_at = NOW()
  WHERE id = p_user_id;

  INSERT INTO public.credit_transactions (user_id, amount, balance_after, source, reference_id)
  VALUES (p_user_id, p_amount, new_balance, 'purchase', p_reference_id);

  RETURN jsonb_build_object('balance_after', new_balance, 'duplicate', false);
END;
$$;

CREATE OR REPLACE FUNCTION public.revoke_purchase_credits(
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
  current_balance INTEGER;
  new_balance INTEGER;
  deducted INTEGER;
BEGIN
  IF p_user_id IS NULL OR p_amount <= 0 OR p_reference_id IS NULL OR p_reference_id = '' THEN
    RAISE EXCEPTION 'Invalid purchase reversal operation';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('purchase:' || p_reference_id));

  IF EXISTS (
    SELECT 1 FROM public.credit_transactions
    WHERE source = 'purchase_reversal' AND reference_id = p_reference_id
  ) THEN
    SELECT credits_remaining INTO current_balance
    FROM public.profiles WHERE id = p_user_id;
    RETURN jsonb_build_object('balance_after', current_balance, 'duplicate', true);
  END IF;

  SELECT credits_remaining INTO current_balance
  FROM public.profiles WHERE id = p_user_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  deducted := LEAST(current_balance, p_amount);
  new_balance := current_balance - deducted;

  UPDATE public.profiles
  SET credits_remaining = new_balance, updated_at = NOW()
  WHERE id = p_user_id;

  INSERT INTO public.credit_transactions (user_id, amount, balance_after, source, reference_id)
  VALUES (p_user_id, -deducted, new_balance, 'purchase_reversal', p_reference_id);

  RETURN jsonb_build_object('balance_after', new_balance, 'duplicate', false);
END;
$$;
