-- 管理后台运营能力迁移。可重复执行，不删除现有数据。

ALTER TABLE public.billing_orders DROP CONSTRAINT IF EXISTS billing_orders_status_check;
ALTER TABLE public.billing_orders
  ADD CONSTRAINT billing_orders_status_check
  CHECK (status IN ('pending', 'completed', 'failed', 'refund_requested', 'refunded', 'disputed'));

ALTER TABLE public.generation_tasks
  ADD COLUMN IF NOT EXISTS retry_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_retry_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS credits_refunded_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS credits_refund_reference TEXT;

ALTER TABLE public.generation_tasks DROP CONSTRAINT IF EXISTS generation_tasks_retry_count_check;
ALTER TABLE public.generation_tasks
  ADD CONSTRAINT generation_tasks_retry_count_check CHECK (retry_count >= 0);

CREATE TABLE IF NOT EXISTS public.billing_refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.billing_orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INTEGER,
  currency TEXT,
  credits_to_revoke INTEGER NOT NULL CHECK (credits_to_revoke > 0),
  status TEXT NOT NULL DEFAULT 'manual_pending'
    CHECK (status IN ('requested', 'manual_pending', 'completed', 'rejected', 'failed')),
  reason TEXT NOT NULL,
  provider_refund_id TEXT UNIQUE,
  external_reference TEXT,
  requested_by UUID NOT NULL REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL REFERENCES auth.users(id),
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  before_data JSONB,
  after_data JSONB,
  reason TEXT,
  request_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.billing_refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_billing_refunds_order_id
  ON public.billing_refunds(order_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_billing_refunds_status
  ON public.billing_refunds(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_target
  ON public.admin_audit_logs(target_type, target_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generation_tasks_retry
  ON public.generation_tasks(status, retry_count, created_at DESC);

CREATE OR REPLACE FUNCTION public.admin_retry_generation_task(
  p_task_id UUID,
  p_admin_id UUID,
  p_max_retries INTEGER DEFAULT 2
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  task_row public.generation_tasks%ROWTYPE;
  current_balance INTEGER;
  new_balance INTEGER;
  next_retry INTEGER;
  retry_reference TEXT;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_roles
    WHERE user_id = p_admin_id AND role IN ('owner', 'admin')
  ) THEN
    RAISE EXCEPTION 'Unauthorized admin operation';
  END IF;

  SELECT * INTO task_row
  FROM public.generation_tasks
  WHERE id = p_task_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Task not found';
  END IF;
  IF task_row.status <> 'failed' THEN
    RAISE EXCEPTION 'Only failed tasks can be retried';
  END IF;
  IF task_row.retry_count >= p_max_retries THEN
    RAISE EXCEPTION 'Retry limit reached';
  END IF;
  IF task_row.credits_used IS NULL OR task_row.credits_used <= 0 THEN
    RAISE EXCEPTION 'Task has no billable credits';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.credit_transactions
    WHERE user_id = task_row.user_id
      AND source = 'refund'
      AND reference_id = task_row.id::TEXT
  ) THEN
    RAISE EXCEPTION 'Original task credits have not been refunded';
  END IF;

  SELECT credits_remaining INTO current_balance
  FROM public.profiles
  WHERE id = task_row.user_id
  FOR UPDATE;
  IF NOT FOUND OR current_balance < task_row.credits_used THEN
    RAISE EXCEPTION 'Insufficient credits for retry';
  END IF;

  next_retry := task_row.retry_count + 1;
  retry_reference := task_row.id::TEXT || ':retry:' || next_retry::TEXT;
  new_balance := current_balance - task_row.credits_used;

  UPDATE public.profiles
  SET credits_remaining = new_balance, updated_at = NOW()
  WHERE id = task_row.user_id;

  INSERT INTO public.credit_transactions (user_id, amount, balance_after, source, reference_id)
  VALUES (task_row.user_id, -task_row.credits_used, new_balance, 'generation', retry_reference);

  UPDATE public.generation_tasks
  SET status = 'pending',
      error_message = NULL,
      output_url = NULL,
      output_thumbnail = NULL,
      completed_at = NULL,
      started_at = NULL,
      retry_count = next_retry,
      last_retry_at = NOW()
  WHERE id = p_task_id;

  INSERT INTO public.admin_audit_logs (actor_id, action, target_type, target_id, after_data, reason)
  VALUES (
    p_admin_id,
    'generation_task.retry',
    'generation_task',
    p_task_id::TEXT,
    jsonb_build_object('retry_count', next_retry, 'credits', task_row.credits_used),
    '后台重试失败生成任务'
  );

  RETURN jsonb_build_object(
    'task_id', p_task_id,
    'retry_count', next_retry,
    'credits_remaining', new_balance,
    'retry_reference', retry_reference
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_refund_generation_credits(
  p_task_id UUID,
  p_admin_id UUID,
  p_amount INTEGER,
  p_reference_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  task_user_id UUID;
  current_balance INTEGER;
  new_balance INTEGER;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_roles
    WHERE user_id = p_admin_id AND role IN ('owner', 'admin')
  ) THEN
    RAISE EXCEPTION 'Unauthorized admin operation';
  END IF;
  IF p_amount <= 0 OR p_reference_id IS NULL OR p_reference_id = '' THEN
    RAISE EXCEPTION 'Invalid refund operation';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.credit_transactions
    WHERE source = 'refund' AND reference_id = p_reference_id
  ) THEN
    SELECT credits_remaining INTO current_balance
    FROM public.profiles p
    JOIN public.generation_tasks t ON t.user_id = p.id
    WHERE t.id = p_task_id;
    RETURN jsonb_build_object('balance_after', current_balance, 'duplicate', true);
  END IF;

  SELECT user_id INTO task_user_id
  FROM public.generation_tasks
  WHERE id = p_task_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Task not found';
  END IF;

  SELECT credits_remaining INTO current_balance
  FROM public.profiles
  WHERE id = task_user_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  new_balance := current_balance + p_amount;
  UPDATE public.profiles
  SET credits_remaining = new_balance, updated_at = NOW()
  WHERE id = task_user_id;

  INSERT INTO public.credit_transactions (user_id, amount, balance_after, source, reference_id)
  VALUES (task_user_id, p_amount, new_balance, 'refund', p_reference_id);

  UPDATE public.generation_tasks
  SET credits_refunded_at = NOW(), credits_refund_reference = p_reference_id
  WHERE id = p_task_id;

  RETURN jsonb_build_object('balance_after', new_balance, 'duplicate', false);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_complete_billing_refund(
  p_refund_id UUID,
  p_admin_id UUID,
  p_provider_refund_id TEXT DEFAULT NULL,
  p_external_reference TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  refund_row public.billing_refunds%ROWTYPE;
  current_balance INTEGER;
  new_balance INTEGER;
  refund_reference TEXT;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_roles
    WHERE user_id = p_admin_id AND role IN ('owner', 'admin')
  ) THEN
    RAISE EXCEPTION 'Unauthorized admin operation';
  END IF;

  SELECT * INTO refund_row
  FROM public.billing_refunds
  WHERE id = p_refund_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Refund not found';
  END IF;
  IF refund_row.status = 'completed' THEN
    RETURN jsonb_build_object('refund_id', p_refund_id, 'duplicate', true);
  END IF;
  IF refund_row.status NOT IN ('requested', 'manual_pending') THEN
    RAISE EXCEPTION 'Refund is not completable';
  END IF;

  refund_reference := 'billing_refund:' || p_refund_id::TEXT;
  SELECT credits_remaining INTO current_balance
  FROM public.profiles
  WHERE id = refund_row.user_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.credit_transactions
    WHERE source = 'purchase_reversal' AND reference_id = refund_reference
  ) THEN
    new_balance := GREATEST(0, current_balance - refund_row.credits_to_revoke);
    UPDATE public.profiles
    SET credits_remaining = new_balance, updated_at = NOW()
    WHERE id = refund_row.user_id;
    INSERT INTO public.credit_transactions (user_id, amount, balance_after, source, reference_id)
    VALUES (refund_row.user_id, new_balance - current_balance, new_balance, 'purchase_reversal', refund_reference);
  ELSE
    new_balance := current_balance;
  END IF;

  UPDATE public.billing_refunds
  SET status = 'completed',
      provider_refund_id = COALESCE(p_provider_refund_id, provider_refund_id),
      external_reference = COALESCE(p_external_reference, external_reference),
      approved_by = p_admin_id,
      completed_at = NOW(),
      updated_at = NOW()
  WHERE id = p_refund_id;

  UPDATE public.billing_orders
  SET status = 'refunded', updated_at = NOW()
  WHERE id = refund_row.order_id;

  INSERT INTO public.admin_audit_logs (actor_id, action, target_type, target_id, after_data, reason)
  VALUES (
    p_admin_id,
    'billing_refund.completed',
    'billing_refund',
    p_refund_id::TEXT,
    jsonb_build_object('credits_to_revoke', refund_row.credits_to_revoke, 'balance_after', new_balance),
    refund_row.reason
  );

  RETURN jsonb_build_object('refund_id', p_refund_id, 'balance_after', new_balance, 'duplicate', false);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_retry_generation_task(UUID, UUID, INTEGER) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_refund_generation_credits(UUID, UUID, INTEGER, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_complete_billing_refund(UUID, UUID, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_retry_generation_task(UUID, UUID, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_refund_generation_credits(UUID, UUID, INTEGER, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_complete_billing_refund(UUID, UUID, TEXT, TEXT) TO service_role;
