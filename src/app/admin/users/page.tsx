import { getAdminUsers } from "@/lib/admin-data";

export default async function AdminUsersPage() {
  const users = await getAdminUsers();

  return (
    <div className="admin-page">
      <section className="admin-page-heading">
        <div><span className="admin-eyebrow">Directory · 02</span><h1>用户账户</h1><p>查看账户状态、套餐和 Credits 余额。</p></div>
        <span className="admin-count-badge">{users.length} 条记录</span>
      </section>
      <div className="admin-table-panel">
        <table className="admin-table">
          <thead><tr><th>用户</th><th>套餐</th><th>Credits</th><th>注册时间</th><th>用户 ID</th></tr></thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td><div className="admin-user-cell"><span className="admin-avatar admin-avatar--small">{user.email.slice(0, 1).toUpperCase()}</span><span><strong>{user.email}</strong><small>{user.username || "未设置用户名"}</small></span></div></td>
                <td><span className="admin-tag">{user.plan ?? "free"}</span></td>
                <td><strong className="admin-number">{user.credits_remaining ?? 0}</strong></td>
                <td>{formatDate(user.created_at)}</td>
                <td><code className="admin-code">{user.id.slice(0, 8)}…</code></td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <p className="admin-empty">暂无用户数据。</p>}
      </div>
    </div>
  );
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString("zh-CN") : "—";
}
