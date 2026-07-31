import { getAdminBillingRefunds, getAdminOrders } from "@/lib/admin-data";
import AdminRefundManager from "@/components/admin/AdminRefundManager";

export default async function AdminOrdersPage() {
  const [orders, refunds] = await Promise.all([getAdminOrders(), getAdminBillingRefunds()]);
  const refundsByOrder = new Map(refunds.map((refund) => [refund.order_id, refund]));

  return (
    <div className="admin-page">
      <section className="admin-page-heading">
        <div><span className="admin-eyebrow">Billing · 06</span><h1>支付订单</h1><p>查看支付订单、Creem 回调状态和退款对账。</p></div>
        <span className="admin-count-badge">最近 {orders.length} 条</span>
      </section>
      <div className="admin-table-panel">
        <table className="admin-table">
          <thead><tr><th>订单</th><th>用户</th><th>套餐</th><th>金额</th><th>Credits</th><th>状态</th><th>退款</th><th>时间</th></tr></thead>
          <tbody>{orders.map((order) => {
            const refund = refundsByOrder.get(order.id);
            return <tr key={order.id}>
              <td><code className="admin-code">{order.id.slice(0, 8)}…</code><small className="admin-table__sub">{order.creem_order_id || order.checkout_id || "无 Creem ID"}</small></td>
              <td><code className="admin-code">{order.user_id.slice(0, 8)}…</code></td>
              <td><span className="admin-tag">{order.plan_key} / {order.billing_cycle}</span></td>
              <td>{order.amount ?? "—"} {order.currency || ""}</td>
              <td><strong className="admin-number">{order.credits_amount}</strong></td>
              <td><span className={`admin-status admin-status--${order.status}`}>{order.status}</span></td>
              <td>{refund ? <><span className={`admin-status admin-status--${refund.status}`}>{refund.status}</span><AdminRefundManager refundId={refund.id} status={refund.status} /></> : order.status === "completed" ? <AdminRefundManager orderId={order.id} /> : <span className="admin-table__sub">—</span>}</td>
              <td>{formatDate(order.created_at)}</td>
            </tr>;
          })}</tbody>
        </table>
        {orders.length === 0 && <p className="admin-empty">暂无支付订单。</p>}
      </div>
    </div>
  );
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString("zh-CN", { hour12: false }) : "—";
}
