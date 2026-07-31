import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminUserDetail } from "@/lib/admin-data";

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getAdminUserDetail(id);
  if (!detail) notFound();

  return (
    <div className="admin-page">
      <Link href="/admin/users" className="admin-back-link">← 返回用户列表</Link>
      <section className="admin-page-heading">
        <div><span className="admin-eyebrow">User detail</span><h1>{detail.email}</h1><p>{detail.profile.username || "未设置用户名"} · {detail.profile.id}</p></div>
        <span className="admin-count-badge">{detail.profile.credits_remaining} Credits</span>
      </section>
      <div className="admin-stat-grid">
        <StatCard label="当前套餐" value={detail.profile.plan ?? "free"} />
        <StatCard label="Credits 余额" value={detail.profile.credits_remaining} />
        <StatCard label="Credits 流水" value={detail.transactions.length} />
        <StatCard label="生成任务" value={detail.tasks.length} />
      </div>
      <section className="admin-table-panel">
        <table className="admin-table">
          <thead><tr><th>时间</th><th>类型</th><th>变化</th><th>余额</th><th>关联记录</th></tr></thead>
          <tbody>{detail.transactions.map((transaction) => <tr key={transaction.id}><td>{formatDate(transaction.created_at)}</td><td><span className="admin-tag">{transaction.source}</span></td><td className={transaction.amount >= 0 ? "admin-positive" : "admin-negative"}>{transaction.amount >= 0 ? "+" : ""}{transaction.amount}</td><td>{transaction.balance_after}</td><td><code className="admin-code">{transaction.reference_id ?? "—"}</code></td></tr>)}</tbody>
        </table>
      </section>
      <section className="admin-table-panel">
        <table className="admin-table">
          <thead><tr><th>任务</th><th>模型</th><th>状态</th><th>Credits</th><th>提示词</th><th>创建时间</th></tr></thead>
          <tbody>{detail.tasks.map((task) => <tr key={task.id}><td><code className="admin-code">{task.id.slice(0, 8)}…</code></td><td><span className="admin-tag">{task.model_id}</span></td><td><span className={`admin-status admin-status--${task.status}`}>{task.status}</span></td><td>{task.credits_used}</td><td className="admin-prompt" title={task.prompt}>{task.prompt}</td><td>{formatDate(task.created_at)}</td></tr>)}</tbody>
        </table>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return <div className="admin-stat-card admin-stat-card--blue"><div className="admin-stat-card__topline"><span>{label}</span></div><strong>{value}</strong></div>;
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString("zh-CN", { hour12: false }) : "—";
}
