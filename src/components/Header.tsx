"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const tools = [
  { name: "AI Video Generation", href: "/generate", icon: "🎬" },
  { name: "AI Image Generation", href: "/tools/image", icon: "🖼️" },
  { name: "AI Audio Generation", href: "/tools/audio", icon: "🎵" },
  { name: "AI Outpainting", href: "/outpainting", icon: "📐" },
  { name: "Video Compare", href: "/compare", icon: "⚖️" },
  { name: "AI Clips", href: "/clips", icon: "🎞️" },
];

const generationTabs = [
  { name: "AI Video Generation", href: "/generate" },
  { name: "AI Image Generation", href: "/tools/image" },
  { name: "AI Audio Generation", href: "/tools/audio" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toolsOpen, setToolsOpen] = useState(false);
  const toolsRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) {
        setToolsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const isActive = (href: string) => pathname === href;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800/50">
      <div className="mx-auto max-w-[1400px] flex h-14 items-center justify-between px-4 lg:px-6">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              </svg>
            </div>
            <span className="text-white font-semibold text-base hidden sm:block">AI Video</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {/* Tools Dropdown */}
            <div className="relative" ref={toolsRef}>
              <button
                onClick={() => setToolsOpen(!toolsOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-neutral-400 hover:text-neutral-200 transition-colors rounded-lg hover:bg-neutral-800/50"
              >
                Tools
                <svg className={`w-3.5 h-3.5 transition-transform ${toolsOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {toolsOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl overflow-hidden py-1 z-50">
                  {tools.map((tool) => (
                    <Link
                      key={tool.name}
                      href={tool.href}
                      onClick={() => setToolsOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
                    >
                      <span className="text-base">{tool.icon}</span>
                      {tool.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Generation Tabs */}
            {generationTabs.map((tab) => (
              <Link
                key={tab.name}
                href={tab.href}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  isActive(tab.href)
                    ? "text-white bg-neutral-800"
                    : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50"
                }`}
              >
                {tab.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/pricing"
            className="hidden sm:block text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            Pricing
          </Link>

          <a
            href="https://discord.gg"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-sm text-neutral-400 hover:text-neutral-200 border border-neutral-700 rounded-lg hover:bg-neutral-800/50 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
            </svg>
            Discord Community
          </a>

          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-2">
                  <Link
                    href="/generate"
                    className="px-4 py-1.5 bg-white text-neutral-950 text-sm font-medium rounded-lg hover:bg-neutral-200 transition-colors"
                  >
                    Open
                  </Link>
                  <div className="flex items-center gap-2">
                    {user.user_metadata?.avatar_url ? (
                      <img
                        src={user.user_metadata.avatar_url}
                        alt={user.user_metadata.full_name}
                        className="w-7 h-7 rounded-full"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center text-xs font-medium text-white">
                        {user.email?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <button
                      onClick={handleLogout}
                      className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-3 py-1.5 text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/login"
                    className="px-4 py-1.5 bg-white text-neutral-950 text-sm font-medium rounded-lg hover:bg-neutral-200 transition-colors"
                  >
                    Open
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
