import { getAdminTaskRefunds, getAdminTaskStats, getAdminTasks } from "@/lib/admin-data";

export default async function AdminTasksPage() {
  const tasks = await getAdminTasks();
  const [stats, refunds] = await Promise.all([
    getAdminTaskStats(),
    getAdminTaskRefunds(tasks.filter((task) => task.status === "failed").map((task) => task.id)),
  ]);

  return (
    <div className="admin-page">
      <section className="admin-page-heading">
        <div><span className="admin-eyebrow">Pipeline · 04</span><h1>生成任务</h1><p>观察任务状态、模型调用和失败原因。</p></div>
        <span className="admin-count-badge">最近 100 条</span>
      </section>
      <div className="admin-stat-grid">
        <StatCard label="待处理" value={stats.counts.pending} tone="amber" />
        <StatCard label="处理中" value={stats.counts.processing} tone="blue" />
        <StatCard label="已完成" value={stats.counts.completed} tone="green" />
        <StatCard label="24 小时失败率" value={`${stats.recentFailureRate}%`} tone="red" />
      </div>
      <div className="admin-table-panel">
        <table className="admin-table">
          <thead><tr><th>任务</th><th>模型</th><th>提示词</th><th>状态</th><th>消耗</th><th>退款核验</th><th>创建时间</th></tr></thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td><code className="admin-code">{task.id.slice(0, 8)}…</code><small className="admin-table__sub">{task.user_id.slice(0, 8)}…</small></td>
                <td><span className="admin-tag">{task.model_id}</span></td>
                <td className="admin-prompt" title={task.prompt}>{task.prompt}</td>
                <td><span className={`admin-status admin-status--${task.status}`}>{task.status}</span>{task.error_message && <small className="admin-table__sub admin-error-text">{task.error_message}</small>}</td>
                <td><strong className="admin-number">{task.credits_used}</strong></td>
                <td>{task.status === "failed" ? <RefundStatus refund={refunds.get(task.id)} creditsUsed={task.credits_used} /> : <span className="admin-table__sub">不适用</span>}</td>
                <td>{formatDate(task.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {tasks.length === 0 && <p className="admin-empty">暂无生成任务。</p>}
      </div>
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: number | string; tone: string }) {
  return <div className={`admin-stat-card admin-stat-card--${tone}`}><div className="admin-stat-card__topline"><span>{label}</span></div><strong>{value}</strong></div>;
}

function RefundStatus({ refund, creditsUsed }: { refund?: { id: string; amount: number }; creditsUsed: number }) {
  if (refund) return <span className="admin-status admin-status--completed">已退款 {refund.amount}</span>;
  if (creditsUsed > 0) return <span className="admin-status admin-status--failed">待核验</span>;
  return <span className="admin-status">无需退款</span>;
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString("zh-CN", { hour12: false }) : "—";
}
