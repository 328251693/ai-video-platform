-- 初始化模型配置
-- 在 tables.sql 和模型管理迁移之后执行

INSERT INTO public.models (
  id, name, provider, provider_model_id, type, description,
  credits_cost, sort_order, is_active
) VALUES
  ('MiniMax-Hailuo-2.3', 'MiniMax Hailuo 2.3', 'apimart', 'MiniMax-Hailuo-2.3', 'video', 'Hailuo 2.3 视频生成模型', 30, 10, true),
  ('MiniMax-Hailuo-2.3-Fast', 'MiniMax Hailuo 2.3 Fast', 'apimart', 'MiniMax-Hailuo-2.3-Fast', 'video', 'Hailuo 2.3 Fast 视频生成模型', 30, 20, true),
  ('nano-banana', 'Nano Banana', 'grsai', 'nano-banana', 'video', '通过 Grsai 接入的视频生成模型', 20, 30, true),
  ('gpt-image-2', 'GPT Image 2', 'grsai', 'gpt-image-2', 'image', '通过 Grsai 接入的图片生成模型', 5, 40, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  provider = EXCLUDED.provider,
  provider_model_id = EXCLUDED.provider_model_id,
  type = EXCLUDED.type,
  description = EXCLUDED.description,
  credits_cost = EXCLUDED.credits_cost,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;
