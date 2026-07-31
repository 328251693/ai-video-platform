"use client";

import Link from "next/link";
import { useState } from "react";

interface SidebarProps {
  activeItem: string;
}

const navGroups = [
  {
    label: "AI VIDEO",
    items: [
      { name: "Text to Video", href: "/generate", icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" },
      { name: "Image to Video", href: "/generate/image-to-video", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
      { name: "Video to Video", href: "/generate/video-to-video", icon: "M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2" },
    ],
  },
  {
    label: "AI IMAGE",
    items: [
      { name: "Text to Image", href: "/tools/image", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
      { name: "Image to Image", href: "/tools/image/image-to-image", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
    ],
  },
  {
    label: "AI VOICE",
    items: [
      { name: "Text to Speech", href: "/tools/audio", icon: "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" },
      { name: "Voice Cloning", href: "/tools/voice-cloning", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
      { name: "Text to Dialogue", href: "/tools/text-to-dialogue", icon: "M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h8z" },
      { name: "Noise Remover", href: "/tools/noise-remover", icon: "M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" },
      { name: "Speech to Text", href: "/tools/speech-to-text", icon: "M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" },
    ],
  },
  {
    label: "AI MUSIC",
    items: [
      { name: "Suno", href: "/tools/music", icon: "M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" },
    ],
  },
];

export default function Sidebar({ activeItem }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`${collapsed ? "w-[60px]" : "w-[240px]"} flex-shrink-0 bg-[#0d0d0d] flex flex-col border-r border-[#222222] transition-all duration-200`}>
      {/* Logo */}
      {!collapsed && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#222222]">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <span className="text-[15px] font-bold text-white">AI Video</span>
          </Link>
          <button className="px-2.5 py-1 bg-gradient-to-r from-[#3B82F6] to-[#6366F1] text-[10px] text-white font-bold rounded-md">New</button>
        </div>
      )}
      {collapsed && (
        <div className="flex justify-center py-3 border-b border-[#222222]">
          <Link href="/" className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </Link>
        </div>
      )}

      {/* Nav */}
      <div className="flex-1 overflow-y-auto scrollbar-hide py-2">
        {navGroups.map((group) => (
          <div key={group.label} className="mt-1">
            {!collapsed && (
              <div className="flex items-center justify-between px-5 pt-2 pb-1.5">
                <span className="text-[11px] font-medium text-[#888888] uppercase tracking-wider">{group.label}</span>
              </div>
            )}
            {group.items.map((item) => {
              const isActive = activeItem === item.name;
              return !collapsed ? (
                <a
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 mx-2 px-3 h-[36px] rounded-lg text-[13px] transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-[#6B21A8] to-[#A21CAF] text-white font-medium"
                      : "text-[#888888] hover:bg-[#1a1a1a] hover:text-white"
                  }`}
                >
                  <svg className="w-[17px] h-[17px] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={item.icon} /></svg>
                  <span className="flex-1">{item.name}</span>
                </a>
              ) : (
                <a
                  key={item.name}
                  href={item.href}
                  className={`flex justify-center mx-2 px-2 h-[36px] items-center rounded-lg transition-colors ${
                    isActive
                      ? "text-white bg-gradient-to-r from-[#6B21A8] to-[#A21CAF]"
                      : "text-[#888888] hover:bg-[#1a1a1a] hover:text-white"
                  }`}
                >
                  <svg className="w-[17px] h-[17px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={item.icon} /></svg>
                </a>
              );
            })}
          </div>
        ))}
      </div>

      {/* Collapse */}
      <div className="border-t border-[#222222] py-2">
        {!collapsed ? (
          <button onClick={() => setCollapsed(true)} className="flex items-center gap-3 mx-2 px-3 h-[38px] w-[calc(100%-16px)] rounded-lg text-[13px] text-[#888888] hover:bg-[#1a1a1a] hover:text-white transition-colors">
            <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
            <span>Collapse</span>
          </button>
        ) : (
          <button onClick={() => setCollapsed(false)} className="flex justify-center mx-2 px-2 h-[38px] items-center rounded-lg text-[#888888] hover:bg-[#1a1a1a] hover:text-white transition-colors">
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
          </button>
        )}
      </div>
    </aside>
  );
}
