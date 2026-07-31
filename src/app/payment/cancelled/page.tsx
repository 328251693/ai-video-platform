import Link from "next/link";

export default function PaymentCancelledPage() {
  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-24 text-neutral-100 sm:px-6">
      <section className="mx-auto max-w-xl border border-neutral-800 bg-neutral-900/50 p-8 text-center sm:p-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Checkout cancelled</p>
        <h1 className="mt-4 text-3xl font-semibold text-white">No payment was taken.</h1>
        <p className="mt-4 leading-7 text-neutral-400">Your account and Credits balance were not changed.</p>
        <Link href="/pricing" className="mt-8 inline-flex min-h-11 items-center justify-center bg-white px-5 text-sm font-medium text-neutral-950 hover:bg-neutral-200">
          Back to pricing
        </Link>
      </section>
    </main>
  );
}
