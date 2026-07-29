"use client";

import { useState } from "react";
import { ArrowUpRight, LoaderCircle } from "lucide-react";

export default function CheckoutButton({
  planId,
  className,
  children,
}: {
  planId: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function startCheckout() {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_id: planId }),
      });
      const result = await response.json();
      if (response.status === 401) {
        window.location.href = `/login?next=${encodeURIComponent("/pricing")}`;
        return;
      }
      if (!response.ok || !result.checkout_url) throw new Error(result.error || "支付暂不可用");
      window.location.href = result.checkout_url;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "支付暂不可用");
      setLoading(false);
    }
  }

  return (
    <div>
      <button type="button" onClick={startCheckout} disabled={loading} className={className}>
        {loading ? <LoaderCircle className="animate-spin" size={15} /> : <ArrowUpRight size={15} />}
        {loading ? "正在打开支付" : children}
      </button>
      {message && <p className="mt-2 text-xs text-red-300">{message}</p>}
    </div>
  );
}
