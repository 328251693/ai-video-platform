"use client";

import { RefreshCw } from "lucide-react";
import { useState } from "react";

export default function AdminTaskRetryButton({ taskId, retryCount }: { taskId: string; retryCount: number }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function retry() {
    if (!window.confirm("确认重新生成这个失败任务吗？系统会重新扣除同等 Credits。")) return;
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/tasks/${encodeURIComponent(taskId)}/retry`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "任务重试失败");
      setMessage("已提交");
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "任务重试失败");
    } finally {
      setBusy(false);
    }
  }

  if (retryCount >= 2) return <span className="admin-table__sub">已达上限</span>;

  return (
    <div className="admin-task-action">
      <button type="button" className="admin-action-button" onClick={retry} disabled={busy}>
        <RefreshCw size={13} className={busy ? "admin-spin" : ""} />
        {busy ? "提交中" : "重试"}
      </button>
      {message && <small className="admin-table__sub">{message}</small>}
    </div>
  );
}
