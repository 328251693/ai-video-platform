import { getAdminTasks } from "@/lib/admin-data";
import AdminTaskRetryButton from "@/components/admin/AdminTaskRetryButton";

export default async function AdminTasksPage() {
  const tasks = await getAdminTasks();

  return (
    <div className="admin-page">
      <section className="admin-page-heading">
        <div><span className="admin-eyebrow">Pipeline · 04</span><h1>生成任务</h1><p>观察任务状态、模型调用和失败原因。</p></div>
        <span className="admin-count-badge">最近 100 条</span>
      </section>
      <div className="admin-table-panel">
        <table className="admin-table">
          <thead><tr><th>任务</th><th>模型</th><th>提示词</th><th>状态</th><th>消耗</th><th>重试</th><th>创建时间</th></tr></thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td><code className="admin-code">{task.id.slice(0, 8)}…</code><small className="admin-table__sub">{task.user_id.slice(0, 8)}…</small></td>
                <td><span className="admin-tag">{task.model_id}</span></td>
                <td className="admin-prompt" title={task.prompt}>{task.prompt}</td>
                <td><span className={`admin-status admin-status--${task.status}`}>{task.status}</span>{task.error_message && <small className="admin-table__sub admin-error-text">{task.error_message}</small>}</td>
                <td><strong className="admin-number">{task.credits_used}</strong></td>
                <td>{task.status === "failed" ? <AdminTaskRetryButton taskId={task.id} retryCount={task.retry_count ?? 0} /> : <span className="admin-table__sub">—</span>}</td>
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

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString("zh-CN", { hour12: false }) : "—";
}
