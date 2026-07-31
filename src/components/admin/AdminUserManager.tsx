"use client";

import { Coins, Save, X } from "lucide-react";
import { useState } from "react";

type AdminUser = {
  id: string;
  username: string | null;
  email: string;
  plan: string | null;
  credits_remaining: number;
  created_at: string;
};

export default function AdminUserManager({ initialUsers }: { initialUsers: AdminUser[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function openAdjuster(user: AdminUser) {
    setSelectedUser(user);
    setAmount("");
    setReason("");
    setError(null);
    setMessage(null);
  }

  async function submitAdjustment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedUser) return;
    const numericAmount = Number(amount);
    if (!Number.isSafeInteger(numericAmount) || numericAmount === 0) {
      setError("请输入不为 0 的整数 Credits");
      return;
    }
    if (!window.confirm(`确认对 ${selectedUser.email} 调整 ${numericAmount > 0 ? "+" : ""}${numericAmount} Credits？`)) return;

    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/users/${encodeURIComponent(selectedUser.id)}/credits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: numericAmount, reason: reason.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Credits 调整失败");
      const newBalance = Number(data.result?.balance_after);
      setUsers((current) => current.map((user) => user.id === selectedUser.id ? { ...user, credits_remaining: newBalance } : user));
      setSelectedUser(null);
      setMessage(`${selectedUser.email} 的 Credits 已调整为 ${newBalance}`);
    } catch (adjustmentError) {
      setError(adjustmentError instanceof Error ? adjustmentError.message : "Credits 调整失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-page">
      <section className="admin-page-heading">
        <div><span className="admin-eyebrow">Directory · 02</span><h1>用户账户</h1><p>查看账户状态、套餐和 Credits 余额；余额调整会写入流水和审计日志。</p></div>
        <span className="admin-count-badge">{users.length} 条记录</span>
      </section>
      {message && <div className="admin-inline-message admin-inline-message--success">{message}</div>}
      {error && !selectedUser && <div className="admin-inline-message admin-inline-message--error">{error}</div>}
      <div className="admin-table-panel">
        <table className="admin-table">
          <thead><tr><th>用户</th><th>套餐</th><th>Credits</th><th>注册时间</th><th>用户 ID</th><th>操作</th></tr></thead>
          <tbody>{users.map((user) => <tr key={user.id}>
            <td><div className="admin-user-cell"><span className="admin-avatar admin-avatar--small">{user.email.slice(0, 1).toUpperCase()}</span><span><strong>{user.email}</strong><small>{user.username || "未设置用户名"}</small></span></div></td>
            <td><span className="admin-tag">{user.plan ?? "free"}</span></td>
            <td><strong className="admin-number">{user.credits_remaining ?? 0}</strong></td>
            <td>{formatDate(user.created_at)}</td>
            <td><code className="admin-code">{user.id.slice(0, 8)}…</code></td>
            <td><button type="button" className="admin-icon-action" onClick={() => openAdjuster(user)} aria-label={`调整 ${user.email} 的 Credits`} title="调整 Credits"><Coins size={14} /></button></td>
          </tr>)}</tbody>
        </table>
        {users.length === 0 && <p className="admin-empty">暂无用户数据。</p>}
      </div>

      {selectedUser && <div className="admin-model-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedUser(null); }}>
        <section className="admin-model-modal" role="dialog" aria-modal="true" aria-labelledby="credit-adjustment-title">
          <div className="admin-model-modal__header"><div><span className="admin-eyebrow">Credits ledger</span><h2 id="credit-adjustment-title">调整用户余额</h2><p className="admin-modal-subtitle">{selectedUser.email} · 当前 {selectedUser.credits_remaining} Credits</p></div><button type="button" className="admin-icon-action" onClick={() => setSelectedUser(null)} aria-label="关闭"><X size={16} /></button></div>
          <form className="admin-model-form" onSubmit={submitAdjustment}>
            <label>调整数量<span className="admin-form-help">正数为增加，负数为扣除</span><input className="input" type="number" step="1" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="例如：100 或 -20" required /></label>
            <label>操作原因<textarea className="input" rows={4} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="填写客服工单号或业务原因" required /></label>
            {error && <div className="admin-inline-message admin-inline-message--error">{error}</div>}
            <div className="admin-model-modal__footer"><button type="button" className="admin-action-button" onClick={() => setSelectedUser(null)}>取消</button><button type="submit" className="admin-action-button admin-action-button--primary" disabled={saving}><Save size={15} />{saving ? "提交中…" : "确认调整"}</button></div>
          </form>
        </section>
      </div>}
    </div>
  );
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString("zh-CN") : "—";
}
