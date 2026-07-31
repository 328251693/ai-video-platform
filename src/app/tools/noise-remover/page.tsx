"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";

export default function NoiseRemoverPage() {
  const [generating] = useState(false);
  const [audioUrl] = useState<string | null>(null);

  return (
    <div className="h-[calc(100vh-56px)] flex flex-col bg-[#000000] overflow-hidden">
      <div className="flex flex-1 min-h-0">
        <Sidebar activeItem="Noise Remover" />
        <div className="w-[420px] flex-shrink-0 overflow-y-auto p-4 scrollbar-hide">
          <div className="bg-[#1a1a1a] rounded-xl p-5 flex flex-col min-h-full">
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-[15px] font-bold text-white">Noise Remover</h2>
                <svg className="w-4 h-4 text-[#555555]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </div>
              <p className="text-[12px] text-[#888888]">Remove background noise from your audio files using AI.</p>
            </div>

            <div className="mb-5">
              <label className="text-[14px] font-bold text-white mb-3 block">Upload Audio</label>
              <div className="border-2 border-dashed border-[#333333] rounded-xl p-6 text-center hover:border-[#A855F7]/40 transition-colors cursor-pointer">
                <svg className="w-9 h-9 text-[#555555] mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                <p className="text-[13px] text-white mb-1.5">Drag or Upload Audio</p>
                <p className="text-[11px] text-[#888888]">Supports MP3, WAV, FLAC, OGG</p>
              </div>
            </div>

            <div className="flex-1" />

            <div className="mt-auto pt-3 border-t border-[#333333]">
              <div className="flex items-center gap-1.5 mb-3 text-[13px] text-white">
                <svg className="w-4 h-4 text-[#A855F7]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Required credits: <span className="font-bold">5</span>
              </div>
              <button disabled={generating} className="w-full py-3 bg-gradient-to-r from-[#9333EA] to-[#C026D3] text-white font-bold text-[15px] rounded-lg hover:from-[#7C3AED] hover:to-[#A21CAF] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {generating ? "Processing..." : "Remove Noise"}
              </button>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
          <div className="bg-[#1a1a1a] rounded-xl p-5 h-full flex flex-col">
            <h3 className="text-[14px] font-bold text-white mb-4">Preview</h3>
            <div className="flex-1 flex items-center justify-center">
              {audioUrl ? (
                <audio controls className="w-full"><source src={audioUrl} type="audio/mpeg" /></audio>
              ) : (
                <div className="text-center">
                  <svg className="w-16 h-16 text-[#333333] mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                  <p className="text-[13px] text-[#555555]">Upload audio to remove noise</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
