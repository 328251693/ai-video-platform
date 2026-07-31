import { getAdminPaymentEvents } from "@/lib/admin-data";
import AdminPaymentEventRetryButton from "@/components/admin/AdminPaymentEventRetryButton";

export default async function AdminPaymentEventsPage() {
  const events = await getAdminPaymentEvents();

  return (
    <div className="admin-page">
      <section className="admin-page-heading">
        <div><span className="admin-eyebrow">Webhooks · 07</span><h1>支付事件</h1><p>检查 Creem Webhook 处理状态，失败事件可以安全重试。</p></div>
        <span className="admin-count-badge">最近 {events.length} 条</span>
      </section>
      <div className="admin-table-panel">
        <table className="admin-table">
          <thead><tr><th>事件 ID</th><th>类型</th><th>状态</th><th>错误</th><th>收到时间</th><th>操作</th></tr></thead>
          <tbody>{events.map((event) => <tr key={event.event_id}>
            <td><code className="admin-code">{event.event_id}</code></td>
            <td><span className="admin-tag">{event.event_type}</span></td>
            <td><span className={`admin-status admin-status--${event.status}`}>{event.status}</span></td>
            <td className="admin-error-text">{event.error_message || "—"}</td>
            <td>{formatDate(event.received_at)}</td>
            <td>{event.status === "failed" ? <AdminPaymentEventRetryButton eventId={event.event_id} /> : <span className="admin-table__sub">—</span>}</td>
          </tr>)}</tbody>
        </table>
        {events.length === 0 && <p className="admin-empty">暂无支付事件。</p>}
      </div>
    </div>
  );
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString("zh-CN", { hour12: false }) : "—";
}
