-- 管理员 Credits 调整与审计日志迁移

ALTER TABLE public.credit_transactions
  DROP CONSTRAINT IF EXISTS credit_transactions_source_check;

ALTER TABLE public.credit_transactions
  ADD CONSTRAINT credit_transactions_source_check
  CHECK (source IN ('purchase', 'generation', 'refund', 'bonus', 'admin_adjustment'));

CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  reason TEXT NOT NULL,
  idempotency_key TEXT UNIQUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON public.admin_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_target ON public.admin_audit_logs(target_type, target_id);

CREATE OR REPLACE FUNCTION public.admin_adjust_credits(
  p_actor_id UUID,
  p_user_id UUID,
  p_amount INTEGER,
  p_reason TEXT,
  p_idempotency_key TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  audit_id UUID;
  new_balance INTEGER;
  existing_log public.admin_audit_logs;
BEGIN
  IF p_amount = 0 OR p_reason IS NULL OR length(trim(p_reason)) < 3 THEN
    RAISE EXCEPTION 'Invalid credit adjustment';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.admin_roles
    WHERE user_id = p_actor_id AND role IN ('owner', 'admin')
  ) THEN
    RAISE EXCEPTION 'Unauthorized admin credit operation';
  END IF;

  IF p_idempotency_key IS NOT NULL THEN
    SELECT * INTO existing_log
    FROM public.admin_audit_logs
    WHERE idempotency_key = p_idempotency_key;

    IF existing_log.id IS NOT NULL THEN
      RETURN existing_log.metadata || jsonb_build_object('audit_id', existing_log.id, 'replayed', true);
    END IF;
  END IF;

  audit_id := gen_random_uuid();

  INSERT INTO public.admin_audit_logs (
    id, actor_id, action, target_type, target_id, reason, idempotency_key, metadata
  ) VALUES (
    audit_id, p_actor_id, 'credits.adjust', 'user', p_user_id::TEXT,
    trim(p_reason), p_idempotency_key, jsonb_build_object('amount', p_amount)
  );

  UPDATE public.profiles
  SET credits_remaining = credits_remaining + p_amount,
      updated_at = NOW()
  WHERE id = p_user_id AND credits_remaining + p_amount >= 0
  RETURNING credits_remaining INTO new_balance;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found or credit balance cannot become negative';
  END IF;

  INSERT INTO public.credit_transactions (user_id, amount, balance_after, source, reference_id)
  VALUES (p_user_id, p_amount, new_balance, 'admin_adjustment', audit_id::TEXT);

  UPDATE public.admin_audit_logs
  SET metadata = metadata || jsonb_build_object('balance_after', new_balance)
  WHERE id = audit_id;

  RETURN jsonb_build_object(
    'audit_id', audit_id,
    'balance_after', new_balance,
    'amount', p_amount,
    'replayed', false
  );
END;
$$;
