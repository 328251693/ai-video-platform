import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: {
    default: "FrameForge - AI 创作工作台",
    template: "%s | FrameForge",
  },
  description:
    "用多个 AI 模型生成图片和视频，统一管理你的创作素材。",
  keywords: ["AI 生图", "AI 生视频", "AI 创作", "素材管理"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col bg-neutral-950 text-neutral-100">
        <Header />
        <main className="flex-1 pt-16">
          {children}
        </main>
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
      </body>
    </html>
  );
}
