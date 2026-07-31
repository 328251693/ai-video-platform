"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Check, LoaderCircle } from "lucide-react";
import {
  BILLING_CYCLES,
  getBillingPlans,
  type BillingCycle,
  type BillingPlan,
} from "@/lib/billing";

const commonFeatures = [
  "Access to available AI models",
  "Credits based on actual usage",
  "Private creations",
  "Download generated files",
  "Commercial usage rights",
];

export default function PricingClient() {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const plans = useMemo(() => getBillingPlans(cycle), [cycle]);

  async function handleCheckout(plan: BillingPlan) {
    setLoadingPlan(`${plan.key}:${plan.cycle}`);
    setError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_key: plan.key,
          billing_cycle: plan.cycle,
        }),
      });

      const body = (await response.json().catch(() => null)) as
        | { checkout_url?: string; error?: string }
        | null;

      if (response.status === 401) {
        window.location.assign("/login?next=/pricing");
        return;
      }

      if (!response.ok || !body?.checkout_url) {
        throw new Error(body?.error || "Unable to start checkout");
      }

      window.location.assign(body.checkout_url);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Unable to start checkout");
      setLoadingPlan(null);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-4 pb-24 pt-20 text-neutral-100 sm:px-6">
      <section className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">
            Credits for serious creation
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-6xl">
            More room to make the good version.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-400 sm:text-lg">
            Choose recurring access for a steady workflow or buy Credits once for a focused project.
            Credits are added after Creem confirms your payment.
          </p>
        </div>

        <div className="mt-12 flex flex-col gap-5 border-y border-neutral-800/80 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-white">Plans & pricing</p>
            <p className="mt-1 text-sm text-neutral-500">Cancel subscriptions from Creem when needed.</p>
          </div>
          <div className="inline-flex w-full gap-1 rounded-lg border border-neutral-800 bg-neutral-900/70 p-1 sm:w-auto">
            {BILLING_CYCLES.map((item) => {
              const selected = item.value === cycle;
              return (
                <button
                  key={item.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setCycle(item.value)}
                  className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md px-4 text-sm transition-colors sm:flex-none ${
                    selected
                      ? "bg-white text-neutral-950"
                      : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                  }`}
                >
                  {item.label}
                  {item.value === "annual" && (
                    <span className={selected ? "text-emerald-700" : "text-emerald-400"}>
                      50% OFF
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div role="alert" className="mt-6 border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => {
            const planId = `${plan.key}:${plan.cycle}`;
            const isLoading = loadingPlan === planId;
            return (
              <article
                key={planId}
                className={`relative flex min-h-[510px] flex-col border p-6 ${
                  plan.popular
                    ? "border-violet-400/70 bg-violet-500/[0.08]"
                    : "border-neutral-800 bg-neutral-900/45"
                }`}
              >
                {plan.badge && (
                  <span className="absolute right-4 top-4 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-300">
                    {plan.badge}
                  </span>
                )}
                <p className="text-sm font-medium text-neutral-400">{plan.name}</p>
                <h2 className="mt-3 text-3xl font-semibold text-white">{plan.price}</h2>
                <p className="mt-1 text-xs text-neutral-500">{plan.pricePeriod}</p>
                <p className="mt-6 border-t border-neutral-800 pt-5 text-2xl font-semibold text-white">
                  {plan.credits.toLocaleString()}
                  <span className="ml-2 text-sm font-normal text-neutral-500">
                    {plan.cycle === "one_time" ? "Credits" : "Credits / period"}
                  </span>
                </p>
                <p className="mt-3 min-h-12 text-sm leading-6 text-neutral-400">{plan.description}</p>

                <ul className="mt-6 flex-1 space-y-3 border-t border-neutral-800 pt-5">
                  {commonFeatures.map((feature) => (
                    <li key={feature} className="flex gap-3 text-sm text-neutral-300">
                      <Check aria-hidden="true" className="mt-0.5 h-4 w-4 flex-none text-emerald-400" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  disabled={loadingPlan !== null}
                  onClick={() => handleCheckout(plan)}
                  className={`mt-7 flex min-h-11 w-full items-center justify-center gap-2 px-4 text-sm font-medium transition-colors disabled:cursor-wait disabled:opacity-60 ${
                    plan.popular
                      ? "bg-white text-neutral-950 hover:bg-neutral-200"
                      : "border border-neutral-700 bg-neutral-800 text-white hover:bg-neutral-700"
                  }`}
                >
                  {isLoading ? <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" /> : <ArrowRight aria-hidden="true" className="h-4 w-4" />}
                  {isLoading ? "Connecting to Creem..." : "Buy now"}
                </button>
              </article>
            );
          })}
        </div>

        <div className="mt-12 grid gap-4 border-t border-neutral-800/80 pt-8 text-sm text-neutral-400 sm:grid-cols-3">
          <div>
            <p className="font-medium text-white">Usage-based Credits</p>
            <p className="mt-2 leading-6">Generation cost depends on model, resolution, length, and output type.</p>
          </div>
          <div>
            <p className="font-medium text-white">Payment protection</p>
            <p className="mt-2 leading-6">Your balance changes only after a verified Creem Webhook event.</p>
          </div>
          <div>
            <p className="font-medium text-white">Failed generations</p>
            <p className="mt-2 leading-6">Generation failures can be refunded through the account workflow.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
