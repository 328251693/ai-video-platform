"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";

const FULLSCREEN_PATHS = ["/generate", "/tools/image", "/tools/audio"];

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFullscreen = FULLSCREEN_PATHS.some((p) => pathname.startsWith(p));

  if (isFullscreen) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="flex-1 pt-14">{children}</main>
    </>
  );
}
