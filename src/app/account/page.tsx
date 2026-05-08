"use client";

import Link from "next/link";

export default function AccountPage() {
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 border-r border-neutral-800 bg-neutral-900 p-4">
        <Link href="/" className="text-xl font-bold block mb-8">AI Video</Link>
        <nav className="space-y-2">
          <Link href="/generate" className="block py-2 px-3 rounded-md text-neutral-400 hover:text-neutral-100">Generate</Link>
          <Link href="/history" className="block py-2 px-3 rounded-md text-neutral-400 hover:text-neutral-100">History</Link>
          <Link href="/account" className="block py-2 px-3 rounded-md bg-neutral-800 text-neutral-100">Account</Link>
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <h1 className="text-2xl font-semibold mb-6">Account</h1>

        {/* Profile */}
        <section className="mb-8">
          <h2 className="text-lg font-medium mb-4">Profile</h2>
          <div className="card p-6 max-w-md">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl">
                👤
              </div>
              <div>
                <p className="font-medium">Demo User</p>
                <p className="text-sm text-neutral-400">demo@example.com</p>
              </div>
            </div>
          </div>
        </section>

        {/* Credits */}
        <section className="mb-8">
          <h2 className="text-lg font-medium mb-4">Credits</h2>
          <div className="card p-6 max-w-md">
            <p className="text-3xl font-bold">{credits.remaining}</p>
            <p className="text-sm text-neutral-400">credits remaining</p>
            <Link href="/pricing" className="btn-primary mt-4 inline-block">
              Buy More Credits
            </Link>
          </div>
        </section>

        {/* Plan */}
        <section className="mb-8">
          <h2 className="text-lg font-medium mb-4">Current Plan</h2>
          <div className="card p-6 max-w-md">
            <p className="font-medium">{credits.plan}</p>
            <p className="text-sm text-neutral-400">{credits.nextbilling}</p>
          </div>
        </section>

        {/* Transactions */}
        <section>
          <h2 className="text-lg font-medium mb-4">Recent Transactions</h2>
          <div className="card max-w-md">
            {transactions.map((t) => (
              <div key={t.id} className="flex justify-between p-4 border-b border-neutral-800 last:border-0">
                <div>
                  <p className="text-sm">{t.description}</p>
                  <p className="text-xs text-neutral-500">{t.date}</p>
                </div>
                <p className={`text-sm ${t.amount > 0 ? "text-green-500" : "text-neutral-400"}`}>
                  {t.amount > 0 ? `+${t.amount}` : t.amount}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

const credits = {
  remaining: 850,
  plan: "Pro",
  nextbilling: "Next billing date: May 28, 2026",
};

const transactions = [
  { id: "1", description: "Pro Plan - Monthly", amount: -3000, date: "2026-04-28" },
  { id: "2", description: "Video Generation (Sora)", amount: -500, date: "2026-04-27" },
  { id: "3", description: "Video Generation (Runway)", amount: -400, date: "2026-04-26" },
  { id: "4", description: "Welcome Bonus", amount: 1000, date: "2026-04-25" },
];