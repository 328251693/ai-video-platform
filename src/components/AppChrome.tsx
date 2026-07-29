"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <>
      <Header />
      <main className="flex-1 pt-16">{children}</main>
      <footer className="border-t border-neutral-800/60 bg-neutral-950 px-4 py-6 text-sm text-neutral-500">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <span>Support: support@aividox.com</span>
          <nav className="flex flex-wrap gap-4" aria-label="Legal links">
            <Link href="/terms" className="hover:text-neutral-200">Terms of Service</Link>
            <Link href="/acceptable-use" className="hover:text-neutral-200">Acceptable Use Policy</Link>
            <Link href="/privacy" className="hover:text-neutral-200">Privacy Policy</Link>
            <Link href="/contact" className="hover:text-neutral-200">Contact</Link>
          </nav>
        </div>
      </footer>
    </>
  );
}
