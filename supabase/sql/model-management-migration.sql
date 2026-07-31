-- 模型管理阶段迁移
-- 在 Supabase SQL Editor 中执行一次。不会删除现有数据。

ALTER TABLE public.models
  ADD COLUMN IF NOT EXISTS provider_model_id TEXT,
  ADD COLUMN IF NOT EXISTS credits_cost INTEGER NOT NULL DEFAULT 20,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

UPDATE public.models
SET provider_model_id = id
WHERE provider_model_id IS NULL OR provider_model_id = '';

UPDATE public.models
SET credits_cost = CASE id
  WHEN 'MiniMax-Hailuo-2.3' THEN 30
  WHEN 'MiniMax-Hailuo-2.3-Fast' THEN 30
  WHEN 'nano-banana' THEN 20
  WHEN 'gpt-image-2' THEN 5
  ELSE credits_cost
END
WHERE credits_cost IS NULL OR credits_cost = 20;

ALTER TABLE public.models
  DROP CONSTRAINT IF EXISTS models_credits_cost_check;

ALTER TABLE public.models
  ADD CONSTRAINT models_credits_cost_check CHECK (credits_cost >= 0);

CREATE INDEX IF NOT EXISTS idx_models_active_sort
  ON public.models (is_active, sort_order, name);
