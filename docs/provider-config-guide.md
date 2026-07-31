# 供应商配置管理

## 数据库迁移

在 Supabase 控制台打开 `SQL Editor`，执行：

```text
supabase/sql/provider-config-migration.sql
```

`provider_configs` 表只允许服务端管理客户端访问，前端不会读取 API Key 原文。

## 必需环境变量

在 Vercel 项目的 `Production` 环境新增：

```text
MODEL_CONFIG_ENCRYPTION_KEY=<随机生成的长字符串>
```

该变量用于加密数据库中的供应商 API Key。修改后需要重新部署。

现有的 `grsai_key`、`apimart_key` 可以继续保留，数据库没有对应配置时系统会自动回退到它们。

## 后台操作

打开 `/admin/models`：

1. 在供应商卡片中填写 Base URL、模型列表路径和 API Key，点击“保存”。
2. 点击“测试连接”确认 Key 和模型列表路径可用。
3. 点击“查询模型”获取供应商返回的模型。
4. 选择模型后点击“一键导入”，再在下方模型卡片中调整 Credits 和启用状态。

模型列表接口不是所有供应商都相同，页面中的“模型列表路径”可以按供应商文档修改。系统支持常见的数组、`data` 和 `models` 返回格式。
