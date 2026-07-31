"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";

export default function SpeechToTextPage() {
  const [generating] = useState(false);
  const [transcript] = useState<string | null>(null);
  const [language, setLanguage] = useState("en");

  const languages = [
    { code: "en", name: "English" },
    { code: "zh", name: "Chinese" },
    { code: "ja", name: "Japanese" },
    { code: "ko", name: "Korean" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
  ];

  return (
    <div className="h-[calc(100vh-56px)] flex flex-col bg-[#000000] overflow-hidden">
      <div className="flex flex-1 min-h-0">
        <Sidebar activeItem="Speech to Text" />
        <div className="w-[420px] flex-shrink-0 overflow-y-auto p-4 scrollbar-hide">
          <div className="bg-[#1a1a1a] rounded-xl p-5 flex flex-col min-h-full">
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-[15px] font-bold text-white">Speech to Text</h2>
                <svg className="w-4 h-4 text-[#555555]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </div>
              <p className="text-[12px] text-[#888888]">Transcribe audio files into text using AI.</p>
            </div>

            <div className="mb-5">
              <label className="text-[14px] font-bold text-white mb-3 block">Upload Audio</label>
              <div className="border-2 border-dashed border-[#333333] rounded-xl p-6 text-center hover:border-[#A855F7]/40 transition-colors cursor-pointer">
                <svg className="w-9 h-9 text-[#555555] mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                <p className="text-[13px] text-white mb-1.5">Drag or Upload Audio</p>
                <p className="text-[11px] text-[#888888]">Supports MP3, WAV, FLAC, OGG (max 25MB)</p>
              </div>
            </div>

            <div className="mb-5">
              <label className="text-[14px] font-bold text-white mb-2 block">Language</label>
              <div className="relative">
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full bg-[#121212] border border-[#333333] rounded-lg px-4 py-2.5 text-[13px] text-white appearance-none cursor-pointer focus:outline-none focus:border-[#A855F7] transition-colors">
                  {languages.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}
                </select>
                <svg className="w-4 h-4 text-[#888888] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>

            <div className="flex-1" />

            <div className="mt-auto pt-3 border-t border-[#333333]">
              <div className="flex items-center gap-1.5 mb-3 text-[13px] text-white">
                <svg className="w-4 h-4 text-[#A855F7]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Required credits: <span className="font-bold">3</span>
              </div>
              <button disabled={generating} className="w-full py-3 bg-gradient-to-r from-[#9333EA] to-[#C026D3] text-white font-bold text-[15px] rounded-lg hover:from-[#7C3AED] hover:to-[#A21CAF] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {generating ? "Transcribing..." : "Transcribe"}
              </button>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
          <div className="bg-[#1a1a1a] rounded-xl p-5 h-full flex flex-col">
            <h3 className="text-[14px] font-bold text-white mb-4">Transcript</h3>
            <div className="flex-1">
              {transcript ? (
                <div className="bg-[#121212] rounded-lg p-4 text-[13px] text-[#cccccc] leading-relaxed whitespace-pre-wrap">{transcript}</div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <svg className="w-16 h-16 text-[#333333] mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" /></svg>
                    <p className="text-[13px] text-[#555555]">Upload audio to transcribe</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
