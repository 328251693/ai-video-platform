import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import BillingPortalButton from "@/components/BillingPortalButton";

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function formatPlan(value: string | null | undefined) {
  if (!value) return "Free";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [{ data: profile }, { data: transactions }, { data: orders }, { data: subscriptions }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase
      .from("credit_transactions")
      .select("id, amount, balance_after, source, reference_id, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("billing_orders")
      .select("id, plan_key, billing_cycle, credits_amount, amount, currency, status, created_at, paid_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("billing_subscriptions")
      .select("id, plan_key, billing_cycle, status, current_period_end, cancel_at_period_end")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(5),
  ]);

  const activeSubscription = subscriptions?.find((subscription) =>
    ["active", "paid", "trialing"].includes(subscription.status),
  );

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-16 text-neutral-100 sm:px-6">
      <section className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-5 border-b border-neutral-800 pb-8 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">Account</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">Your creative balance.</h1>
            <p className="mt-3 text-neutral-400">{user.email}</p>
          </div>
          <Link href="/pricing" className="inline-flex min-h-11 items-center justify-center bg-white px-5 text-sm font-medium text-neutral-950 hover:bg-neutral-200">
            Buy more Credits
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <section className="border border-neutral-800 bg-neutral-900/50 p-6">
            <p className="text-sm text-neutral-500">Credits remaining</p>
            <p className="mt-3 text-4xl font-semibold text-white">{profile?.credits_remaining ?? 0}</p>
          </section>
          <section className="border border-neutral-800 bg-neutral-900/50 p-6">
            <p className="text-sm text-neutral-500">Current plan</p>
            <p className="mt-3 text-2xl font-semibold text-white">{formatPlan(profile?.plan)}</p>
            <p className="mt-2 text-sm text-neutral-500">
              {activeSubscription
                ? `${activeSubscription.billing_cycle} · renews ${formatDate(activeSubscription.current_period_end)}`
                : "No active subscription"}
            </p>
          </section>
          <section className="border border-neutral-800 bg-neutral-900/50 p-6">
            <p className="text-sm text-neutral-500">Payment status</p>
            <p className="mt-3 text-2xl font-semibold text-white">
              {activeSubscription?.cancel_at_period_end ? "Cancels at period end" : activeSubscription?.status || "Free"}
            </p>
            <p className="mt-2 text-sm text-neutral-500">Creem confirms payments through Webhooks.</p>
            <div className="mt-5">
              <BillingPortalButton />
            </div>
          </section>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <section>
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">Orders</p>
                <h2 className="mt-2 text-xl font-semibold text-white">Payment history</h2>
              </div>
            </div>
            <div className="overflow-hidden border border-neutral-800 bg-neutral-900/40">
              {orders?.length ? orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between gap-4 border-b border-neutral-800 px-5 py-4 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-white">
                      {formatPlan(order.plan_key)} · {order.billing_cycle === "one_time" ? "One-time" : order.billing_cycle}
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">{formatDate(order.paid_at || order.created_at)} · {order.credits_amount.toLocaleString()} Credits</p>
                  </div>
                  <span className={`text-xs ${order.status === "completed" ? "text-emerald-300" : "text-neutral-500"}`}>
                    {order.status}
                  </span>
                </div>
              )) : <p className="px-5 py-8 text-sm text-neutral-500">No payment records yet.</p>}
            </div>
          </section>

          <section>
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">Credits ledger</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Recent activity</h2>
            </div>
            <div className="overflow-hidden border border-neutral-800 bg-neutral-900/40">
              {transactions?.length ? transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between gap-4 border-b border-neutral-800 px-5 py-4 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-white">{transaction.source}</p>
                    <p className="mt-1 text-xs text-neutral-500">{formatDate(transaction.created_at)}</p>
                  </div>
                  <span className={transaction.amount >= 0 ? "text-sm text-emerald-300" : "text-sm text-neutral-300"}>
                    {transaction.amount >= 0 ? "+" : ""}{transaction.amount}
                  </span>
                </div>
              )) : <p className="px-5 py-8 text-sm text-neutral-500">No Credits activity yet.</p>}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
