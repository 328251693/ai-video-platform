import { getAdminAuditLogs } from "@/lib/admin-data";

export default async function AdminAuditLogsPage() {
  const logs = await getAdminAuditLogs();

  return (
    <div className="admin-page">
      <section className="admin-page-heading">
        <div><span className="admin-eyebrow">Audit trail · 06</span><h1>操作日志</h1><p>记录管理员对 Credits 和用户账户执行的敏感操作。</p></div>
        <span className="admin-count-badge">最近 100 条</span>
      </section>
      <div className="admin-table-panel">
        <table className="admin-table">
          <thead><tr><th>时间</th><th>操作</th><th>对象</th><th>原因</th><th>结果</th><th>操作人</th></tr></thead>
          <tbody>
            {logs.map((log) => {
              const metadata = log.metadata as { amount?: number; balance_after?: number } | null;
              return (
                <tr key={log.id}>
                  <td>{formatDate(log.created_at)}</td>
                  <td><span className="admin-tag">{log.action}</span></td>
                  <td><code className="admin-code">{log.target_id?.slice(0, 8) ?? "-"}</code></td>
                  <td className="admin-prompt">{log.reason}</td>
                  <td><span className={Number(metadata?.amount) >= 0 ? "admin-positive" : "admin-negative"}>{Number(metadata?.amount) >= 0 ? "+" : ""}{metadata?.amount ?? "-"}</span>{metadata?.balance_after !== undefined && <small className="admin-table__sub">余额 {metadata.balance_after}</small>}</td>
                  <td><code className="admin-code">{log.actor_id?.slice(0, 8) ?? "-"}</code></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {logs.length === 0 && <p className="admin-empty">暂无操作日志。</p>}
      </div>
    </div>
  );
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString("zh-CN", { hour12: false }) : "-";
}
