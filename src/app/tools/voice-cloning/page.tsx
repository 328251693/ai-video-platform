"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";

export default function VoiceCloningPage() {
  const [voiceName, setVoiceName] = useState("");
  const [generating] = useState(false);

  return (
    <div className="h-[calc(100vh-56px)] flex flex-col bg-[#000000] overflow-hidden">
      <div className="flex flex-1 min-h-0">
        <Sidebar activeItem="Voice Cloning" />
        <div className="w-[420px] flex-shrink-0 overflow-y-auto p-4 scrollbar-hide">
          <div className="bg-[#1a1a1a] rounded-xl p-5 flex flex-col min-h-full">
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-[15px] font-bold text-white">Voice Cloning</h2>
                <svg className="w-4 h-4 text-[#555555]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </div>
            </div>

            <div className="mb-5">
              <label className="text-[14px] font-bold text-white mb-3 block">Voice Name</label>
              <input value={voiceName} onChange={(e) => setVoiceName(e.target.value)} placeholder="Enter a name for your cloned voice" className="w-full bg-[#121212] border border-[#333333] rounded-lg px-3 py-2.5 text-[13px] text-white placeholder:text-[#555555] focus:outline-none focus:border-[#A855F7] transition-colors" />
            </div>

            <div className="mb-5">
              <label className="text-[14px] font-bold text-white mb-3 block">Upload Audio Sample</label>
              <div className="border-2 border-dashed border-[#333333] rounded-xl p-6 text-center hover:border-[#A855F7]/40 transition-colors cursor-pointer">
                <svg className="w-9 h-9 text-[#555555] mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                <p className="text-[13px] text-white mb-1.5">Upload Audio Sample</p>
                <p className="text-[11px] text-[#888888]">Upload at least 30 seconds of clear speech</p>
              </div>
            </div>

            <div className="mb-5">
              <label className="text-[14px] font-bold text-white mb-3 block">Description (Optional)</label>
              <textarea placeholder="Describe the voice characteristics..." className="flex-1 min-h-[80px] bg-[#121212] border border-[#333333] rounded-xl p-3 text-[#cccccc] placeholder:text-[#555555] focus:outline-none focus:border-[#A855F7] resize-none text-[13px] leading-relaxed transition-colors" />
            </div>

            <div className="mt-auto pt-3 border-t border-[#333333]">
              <div className="flex items-center gap-1.5 mb-3 text-[13px] text-white">
                <svg className="w-4 h-4 text-[#A855F7]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Required credits: <span className="font-bold">50</span>
              </div>
              <button disabled={generating || !voiceName.trim()} className="w-full py-3 bg-gradient-to-r from-[#9333EA] to-[#C026D3] text-white font-bold text-[15px] rounded-lg hover:from-[#7C3AED] hover:to-[#A21CAF] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                Clone Voice
              </button>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
          <div className="bg-[#1a1a1a] rounded-xl p-5 h-full flex flex-col">
            <h3 className="text-[14px] font-bold text-white mb-4">Preview</h3>
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <svg className="w-16 h-16 text-[#333333] mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                <p className="text-[13px] text-[#555555]">Upload audio to clone a voice</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
