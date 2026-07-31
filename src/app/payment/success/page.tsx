import Link from "next/link";

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const orderId = typeof params.order_id === "string" ? params.order_id : null;

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-24 text-neutral-100 sm:px-6">
      <section className="mx-auto max-w-xl border border-neutral-800 bg-neutral-900/50 p-8 text-center sm:p-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Payment received</p>
        <h1 className="mt-4 text-3xl font-semibold text-white">Your payment is being confirmed.</h1>
        <p className="mt-4 leading-7 text-neutral-400">
          Creem has redirected you back to AIVIDOX. Credits will appear after the signed Webhook is processed.
          You can safely close this page and check your account shortly.
        </p>
        {orderId && <p className="mt-5 break-all text-xs text-neutral-500">Order: {orderId}</p>}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/account" className="inline-flex min-h-11 items-center justify-center bg-white px-5 text-sm font-medium text-neutral-950 hover:bg-neutral-200">
            Open account
          </Link>
          <Link href="/generate" className="inline-flex min-h-11 items-center justify-center border border-neutral-700 px-5 text-sm font-medium text-white hover:bg-neutral-800">
            Start creating
          </Link>
        </div>
      </section>
    </main>
  );
}
