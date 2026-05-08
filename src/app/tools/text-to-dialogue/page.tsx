"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";

export default function TextToDialoguePage() {
  const [dialogue, setDialogue] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("Rachel");
  const [generating, setGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const voices = ["Rachel", "Adam", "Domi", "Elli", "Josh", "Arnold", "Sam", "Clyde", "Dave", "Fin"];

  return (
    <div className="h-[calc(100vh-56px)] flex flex-col bg-[#000000] overflow-hidden">
      <div className="flex flex-1 min-h-0">
        <Sidebar activeItem="Text to Dialogue" />
        <div className="w-[420px] flex-shrink-0 overflow-y-auto p-4 scrollbar-hide">
          <div className="bg-[#1a1a1a] rounded-xl p-5 flex flex-col min-h-full">
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-[15px] font-bold text-white">Text to Dialogue</h2>
                <svg className="w-4 h-4 text-[#555555]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </div>
            </div>

            <div className="mb-5">
              <label className="text-[14px] font-bold text-white mb-2 block">Voice</label>
              <div className="relative">
                <select value={selectedVoice} onChange={(e) => setSelectedVoice(e.target.value)} className="w-full bg-[#121212] border border-[#333333] rounded-lg px-4 py-2.5 text-[13px] text-white appearance-none cursor-pointer focus:outline-none focus:border-[#A855F7] transition-colors">
                  {voices.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
                <svg className="w-4 h-4 text-[#888888] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>

            <div className="flex-1 flex flex-col mb-5">
              <label className="text-[14px] font-bold text-white mb-2 block">Dialogue Script</label>
              <p className="text-[12px] text-[#888888] mb-2">Use [Speaker 1] and [Speaker 2] tags to alternate voices.</p>
              <textarea value={dialogue} onChange={(e) => setDialogue(e.target.value)} placeholder="[Speaker 1] Hello, how are you today?\n[Speaker 2] I'm doing great, thanks for asking!" className="flex-1 min-h-[140px] bg-[#121212] border border-[#333333] rounded-xl p-3 text-[#cccccc] placeholder:text-[#555555] focus:outline-none focus:border-[#A855F7] resize-none text-[13px] leading-relaxed transition-colors" />
              <div className="text-right mt-1"><span className="text-[11px] text-[#555555]">{dialogue.length}/5000</span></div>
            </div>

            <div className="mt-auto pt-3 border-t border-[#333333]">
              <div className="flex items-center gap-1.5 mb-3 text-[13px] text-white">
                <svg className="w-4 h-4 text-[#A855F7]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Required credits: <span className="font-bold">10</span>
              </div>
              <button disabled={generating || !dialogue.trim()} className="w-full py-3 bg-gradient-to-r from-[#9333EA] to-[#C026D3] text-white font-bold text-[15px] rounded-lg hover:from-[#7C3AED] hover:to-[#A21CAF] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {generating ? "Generating..." : "Generate"}
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
                  <svg className="w-16 h-16 text-[#333333] mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h8z" /></svg>
                  <p className="text-[13px] text-[#555555]">Enter dialogue and generate</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
