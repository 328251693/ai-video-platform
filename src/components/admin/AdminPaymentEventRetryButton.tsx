"use client";

import { RefreshCw } from "lucide-react";
import { useState } from "react";

export default function AdminPaymentEventRetryButton({ eventId }: { eventId: string }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function retry() {
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/payment-events/${encodeURIComponent(eventId)}/retry`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "支付事件重试失败");
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "支付事件重试失败");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-task-action">
      <button type="button" className="admin-action-button" onClick={retry} disabled={busy}>
        <RefreshCw size={13} className={busy ? "admin-spin" : ""} />
        {busy ? "处理中" : "重试"}
      </button>
      {message && <small className="admin-table__sub admin-error-text">{message}</small>}
    </div>
  );
}
