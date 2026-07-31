# 支付实现统一说明

当前项目存在两套 Creem 支付实现，不能直接同时上线：

- 现有未提交实现使用 `billing_orders`、`billing_subscriptions` 和 `billing_webhook_events`，套餐由环境变量映射，支持月付、年付和一次性 Credits。
- `payment-core` 分支使用 `billing_plans`、`billing_orders` 和 `payment_events`，套餐由数据库管理，订单通过 `complete_billing_order` 发放 Credits。

统一前必须完成以下决策：

1. 以数据库套餐还是环境变量作为唯一价格来源。
2. 保留订阅能力，还是首版只保留一次性 Credits。
3. 统一订单状态、金额字段、Creem 产品 ID 和 Webhook 事件表。
4. 统一 Credits 发放函数，确保支付事件重复发送不会重复增加余额。

本 worktree 的后续实现基于 `payment-core`，但不会把两套迁移脚本直接一起执行。合并前应先选定唯一 schema，再删除另一套 API 和迁移脚本。
