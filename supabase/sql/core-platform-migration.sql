-- 核心平台升级：补齐任务权限，并将积分操作收敛到安全函数
-- 已执行过 tables.sql 的环境请执行本文件

CREATE POLICY "Users can update own tasks"
  ON public.generation_tasks FOR UPDATE
  USING (user_id = (SELECT id FROM public.profiles WHERE id = auth.uid()))
  WITH CHECK (user_id = (SELECT id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete own tasks"
  ON public.generation_tasks FOR DELETE
  USING (user_id = (SELECT id FROM public.profiles WHERE id = auth.uid()));

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
  SET credits_remaining = credits_remaining - p_amount, updated_at = NOW()
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
  SET credits_remaining = credits_remaining + p_amount, updated_at = NOW()
  WHERE id = p_user_id
  RETURNING credits_remaining INTO new_balance;

  INSERT INTO public.credit_transactions (user_id, amount, balance_after, source, reference_id)
  VALUES (p_user_id, p_amount, new_balance, 'refund', p_reference_id);

  RETURN jsonb_build_object('balance_after', new_balance);
END;
$$;
