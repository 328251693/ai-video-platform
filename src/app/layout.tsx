import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: {
    default: "AI Video Platform - Create Stunning Videos with AI",
    template: "%s | AI Video Platform",
  },
  description:
    "Generate stunning videos and images using advanced AI models. The creative tool for creators, marketers, and businesses.",
  keywords: ["AI video generation", "AI image generation", "video creation", "AI tools", "content creation"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col bg-neutral-950 text-neutral-100">
        <Header />
        <main className="flex-1 pt-14">
          {children}
        </main>
      </body>
    </html>
  );
}
