-- 管理后台基础迁移
-- 执行前请确认当前 Supabase 项目和生产数据库，首次管理员需要手动填入 auth.users.id。

CREATE TABLE IF NOT EXISTS public.admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'support')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_admin_roles_user_id ON public.admin_roles(user_id);

-- RLS 开启后默认拒绝普通客户端访问；后台使用服务端 service role 查询角色。
COMMENT ON TABLE public.admin_roles IS '管理后台角色表，禁止普通客户端直接写入';

-- 首次初始化示例：将 UUID 替换成实际管理员的 auth.users.id 后单独执行。
-- INSERT INTO public.admin_roles (user_id, role) VALUES ('00000000-0000-0000-0000-000000000000', 'owner');
