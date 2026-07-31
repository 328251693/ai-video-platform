import { getAdminTransactions } from "@/lib/admin-data";

export default async function AdminTransactionsPage() {
  const transactions = await getAdminTransactions();

  return (
    <div className="admin-page">
      <section className="admin-page-heading">
        <div><span className="admin-eyebrow">Ledger · 03</span><h1>Credits 流水</h1><p>所有生成消耗、购买、退款和赠送记录。</p></div>
        <span className="admin-count-badge">最近 100 条</span>
      </section>
      <div className="admin-table-panel">
        <table className="admin-table">
          <thead><tr><th>时间</th><th>用户 ID</th><th>来源</th><th>变化</th><th>余额</th><th>关联记录</th></tr></thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{formatDate(transaction.created_at)}</td>
                <td><code className="admin-code">{transaction.user_id.slice(0, 8)}…</code></td>
                <td><span className={`admin-tag admin-tag--${transaction.source}`}>{transaction.source}</span></td>
                <td className={transaction.amount >= 0 ? "admin-positive" : "admin-negative"}>{transaction.amount >= 0 ? "+" : ""}{transaction.amount}</td>
                <td><strong className="admin-number">{transaction.balance_after}</strong></td>
                <td><code className="admin-code">{transaction.reference_id?.slice(0, 12) ?? "—"}</code></td>
              </tr>
            ))}
          </tbody>
        </table>
        {transactions.length === 0 && <p className="admin-empty">暂无 Credits 流水。</p>}
      </div>
    </div>
  );
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString("zh-CN", { hour12: false }) : "—";
}
