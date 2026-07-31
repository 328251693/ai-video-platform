-- 供应商配置管理迁移
-- API Key 只保存加密密文，解密密钥由服务端环境变量 MODEL_CONFIG_ENCRYPTION_KEY 提供。

CREATE TABLE IF NOT EXISTS public.provider_configs (
  provider TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  base_url TEXT NOT NULL,
  models_path TEXT NOT NULL DEFAULT '/v1/models',
  api_key_ciphertext TEXT,
  api_key_last4 TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_tested_at TIMESTAMPTZ,
  last_test_status TEXT NOT NULL DEFAULT 'not_tested'
    CHECK (last_test_status IN ('not_tested', 'passed', 'failed')),
  last_test_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.provider_configs ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_provider_configs_active
  ON public.provider_configs(is_active, display_name);
