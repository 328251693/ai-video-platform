-- 支付核心：套餐、订单、Creem 回调事件和幂等发放 Credits

-- 注意：如果数据库已经执行过旧版 billing-migration.sql，请先完成
-- docs/payment-schema-reconciliation.md 中的 schema 统一，不能直接执行本迁移。

CREATE TABLE IF NOT EXISTS public.billing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  provider_product_id TEXT UNIQUE,
  price_cents INTEGER NOT NULL DEFAULT 0 CHECK (price_cents >= 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  credits INTEGER NOT NULL DEFAULT 0 CHECK (credits >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.billing_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.billing_plans(id),
  provider TEXT NOT NULL DEFAULT 'creem',
  provider_checkout_id TEXT UNIQUE,
  provider_order_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'failed', 'refunding', 'refunded', 'cancelled')),
  amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  credits INTEGER NOT NULL CHECK (credits > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  order_id UUID REFERENCES public.billing_orders(id) ON DELETE SET NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (provider, event_id)
);

ALTER TABLE public.billing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'billing_plans' AND policyname = 'Anyone can read active billing plans') THEN
    CREATE POLICY "Anyone can read active billing plans"
      ON public.billing_plans FOR SELECT USING (is_active = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'billing_orders' AND policyname = 'Users can read own billing orders') THEN
    CREATE POLICY "Users can read own billing orders"
      ON public.billing_orders FOR SELECT USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'billing_orders' AND policyname = 'Users can create own billing orders') THEN
    CREATE POLICY "Users can create own billing orders"
      ON public.billing_orders FOR INSERT WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'billing_orders' AND policyname = 'Users can update own pending orders') THEN
    CREATE POLICY "Users can update own pending orders"
      ON public.billing_orders FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_billing_orders_user_created
  ON public.billing_orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_events_order
  ON public.payment_events(order_id, created_at DESC);

-- 首次迁移只创建展示数据，不覆盖后来在后台配置的 Creem Product ID。
INSERT INTO public.billing_plans (code, name, description, price_cents, credits, sort_order)
VALUES
  ('free', 'Free', '适合体验基础功能', 0, 50, 10),
  ('starter', 'Starter', '适合个人创作者', 999, 500, 20),
  ('pro', 'Pro', '适合专业创作者', 2999, 2000, 30)
ON CONFLICT (code) DO NOTHING;

CREATE UNIQUE INDEX IF NOT EXISTS idx_credit_transactions_purchase_reference
  ON public.credit_transactions(reference_id)
  WHERE source = 'purchase' AND reference_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.complete_billing_order(
  p_provider TEXT,
  p_event_id TEXT,
  p_order_id UUID,
  p_provider_order_id TEXT,
  p_provider_checkout_id TEXT,
  p_event_type TEXT,
  p_payload JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inserted_event_id UUID;
  order_row public.billing_orders%ROWTYPE;
  new_balance INTEGER;
BEGIN
  INSERT INTO public.payment_events (provider, event_id, event_type, order_id, payload)
  VALUES (p_provider, p_event_id, p_event_type, p_order_id, COALESCE(p_payload, '{}'::jsonb))
  ON CONFLICT (provider, event_id) DO NOTHING
  RETURNING id INTO inserted_event_id;

  IF inserted_event_id IS NULL THEN
    RETURN jsonb_build_object('processed', false, 'reason', 'duplicate_event');
  END IF;

  UPDATE public.billing_orders
  SET status = 'paid',
      provider_order_id = COALESCE(p_provider_order_id, provider_order_id),
      provider_checkout_id = COALESCE(p_provider_checkout_id, provider_checkout_id),
      paid_at = COALESCE(paid_at, NOW()),
      updated_at = NOW()
  WHERE id = p_order_id AND status = 'pending'
  RETURNING * INTO order_row;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('processed', true, 'credited', false, 'reason', 'order_not_pending');
  END IF;

  UPDATE public.profiles
  SET credits_remaining = credits_remaining + order_row.credits,
      updated_at = NOW()
  WHERE id = order_row.user_id
  RETURNING credits_remaining INTO new_balance;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Billing order user profile not found';
  END IF;

  INSERT INTO public.credit_transactions (user_id, amount, balance_after, source, reference_id)
  VALUES (order_row.user_id, order_row.credits, new_balance, 'purchase', order_row.id::TEXT)
  ON CONFLICT DO NOTHING;

  RETURN jsonb_build_object(
    'processed', true,
    'credited', true,
    'order_id', order_row.id,
    'balance_after', new_balance
  );
END;
$$;
