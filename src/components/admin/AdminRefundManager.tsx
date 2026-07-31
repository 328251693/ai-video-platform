"use client";

import { useState } from "react";

export default function AdminRefundManager({
  orderId,
  refundId,
  status,
}: {
  orderId?: string;
  refundId?: string;
  status?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function updateRefund(nextStatus: "completed" | "rejected") {
    const target = refundId || orderId;
    if (!target) return;
    const reason = nextStatus === "rejected" || !refundId ? window.prompt("请输入退款原因") : null;
    if (nextStatus === "rejected" && !reason?.trim()) return;
    const providerRefundId = nextStatus === "completed" && refundId ? window.prompt("请输入 Creem Refund ID（可选）") : null;
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch(
        nextStatus === "completed" ? `/api/admin/orders/${encodeURIComponent(target)}/refund` : `/api/admin/orders/${encodeURIComponent(target)}/refund`,
        {
          method: refundId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(refundId
            ? { status: nextStatus, reason, provider_refund_id: providerRefundId }
            : { reason }),
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "退款操作失败");
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "退款操作失败");
    } finally {
      setBusy(false);
    }
  }

  if (status === "completed" || status === "rejected") return <span className="admin-table__sub">{status}</span>;

  return (
    <div className="admin-task-action">
      {!refundId && <button type="button" className="admin-action-button" onClick={() => updateRefund("completed")} disabled={busy}>申请退款</button>}
      {refundId && <>
        <button type="button" className="admin-action-button" onClick={() => updateRefund("completed")} disabled={busy}>已在 Creem 处理</button>
        <button type="button" className="admin-action-button" onClick={() => updateRefund("rejected")} disabled={busy}>拒绝</button>
      </>}
      {message && <small className="admin-table__sub admin-error-text">{message}</small>}
    </div>
  );
}
