import { getAdminBillingOrders } from "@/lib/admin-data";

export default async function AdminOrdersPage() {
  const orders = await getAdminBillingOrders();

  return (
    <div className="admin-page">
      <section className="admin-page-heading">
        <div><span className="admin-eyebrow">Billing · 03</span><h1>支付订单</h1><p>查看 Creem Checkout、订单状态、金额和 Credits 发放关联。</p></div>
        <span className="admin-count-badge">最近 {orders.length} 条</span>
      </section>
      <div className="admin-table-panel">
        <table className="admin-table">
          <thead><tr><th>订单</th><th>用户</th><th>套餐</th><th>金额</th><th>Credits</th><th>状态</th><th>创建时间</th></tr></thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td><code className="admin-code">{order.id.slice(0, 8)}…</code><small className="admin-table__sub">{order.provider_checkout_id?.slice(0, 14) ?? "尚未创建 Checkout"}</small></td>
                <td><code className="admin-code">{order.user_id.slice(0, 8)}…</code></td>
                <td><span className="admin-tag">{order.plan_id.slice(0, 8)}…</span></td>
                <td>{formatMoney(order.amount_cents, order.currency)}</td>
                <td><strong className="admin-number">{order.credits}</strong></td>
                <td><span className={`admin-status admin-status--${order.status}`}>{order.status}</span></td>
                <td>{formatDate(order.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p className="admin-empty">暂无支付订单。</p>}
      </div>
    </div>
  );
}

function formatMoney(cents: number | null, currency: string | null) {
  if (cents === null || cents === undefined) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD" }).format(Number(cents) / 100);
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString("zh-CN", { hour12: false }) : "—";
}
