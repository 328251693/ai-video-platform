"use client";

import { useState } from "react";
import { ExternalLink, LoaderCircle } from "lucide-react";

export default function BillingPortalButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function openPortal() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/billing/portal", { method: "POST" });
      const body = (await response.json().catch(() => null)) as
        | { customer_portal_link?: string; error?: string }
        | null;

      if (!response.ok || !body?.customer_portal_link) {
        throw new Error(body?.error || "Unable to open billing portal");
      }

      window.location.assign(body.customer_portal_link);
    } catch (portalError) {
      setError(portalError instanceof Error ? portalError.message : "Unable to open billing portal");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={openPortal}
        disabled={loading}
        className="inline-flex min-h-10 items-center gap-2 border border-neutral-700 px-4 text-sm text-white hover:bg-neutral-800 disabled:cursor-wait disabled:opacity-60"
      >
        {loading ? <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" /> : <ExternalLink aria-hidden="true" className="h-4 w-4" />}
        Manage billing
      </button>
      {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
    </div>
  );
}
