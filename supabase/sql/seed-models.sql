-- Seed models for Grsai proxy and Apimart
-- Run this in Supabase SQL Editor after tables.sql

INSERT INTO public.models (id, name, provider, type, description, is_active) VALUES
  ('MiniMax-Hailuo-2.3', 'MiniMax Hailuo 2.3', 'apimart', 'video', 'Hailuo 2.3 视频生成模型，支持6秒和10秒，768p/1080p', true),
  ('MiniMax-Hailuo-2.3-Fast', 'MiniMax Hailuo 2.3 Fast', 'apimart', 'video', 'Hailuo 2.3 Fast 快速视频生成模型', true),
  ('nano-banana', 'Nano Banana', 'grsai', 'video', 'AI video generation model via Grsai proxy', true),
  ('gpt-image-2', 'GPT Image 2', 'grsai', 'image', 'AI image generation model via Grsai proxy', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  provider = EXCLUDED.provider,
  type = EXCLUDED.type,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;
