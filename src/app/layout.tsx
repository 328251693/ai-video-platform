import type { Metadata } from "next";
import "./globals.css";
import AppChrome from "@/components/AppChrome";

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
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
