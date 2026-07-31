"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";

export default function MusicPage() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("pop");
  const [instrumental, setInstrumental] = useState(false);
  const [generating] = useState(false);
  const [audioUrl] = useState<string | null>(null);

  const styles = ["Pop", "Rock", "Jazz", "Electronic", "Classical", "Hip Hop", "R&B", "Country", "Lo-fi", "Ambient"];

  return (
    <div className="h-[calc(100vh-56px)] flex flex-col bg-[#000000] overflow-hidden">
      <div className="flex flex-1 min-h-0">
        <Sidebar activeItem="Suno" />
        <div className="w-[420px] flex-shrink-0 overflow-y-auto p-4 scrollbar-hide">
          <div className="bg-[#1a1a1a] rounded-xl p-5 flex flex-col min-h-full">
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-[15px] font-bold text-white">Suno Music</h2>
                <svg className="w-4 h-4 text-[#555555]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </div>
              <p className="text-[12px] text-[#888888]">Generate music and songs using AI.</p>
            </div>

            <div className="flex-1 flex flex-col mb-5">
              <label className="text-[14px] font-bold text-white mb-2 block">Describe Your Song</label>
              <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="A chill lo-fi beat for studying, with soft piano and rain sounds..." className="flex-1 min-h-[100px] bg-[#121212] border border-[#333333] rounded-xl p-3 text-[#cccccc] placeholder:text-[#555555] focus:outline-none focus:border-[#A855F7] resize-none text-[13px] leading-relaxed transition-colors" />
            </div>

            <div className="mb-5">
              <label className="text-[14px] font-bold text-white mb-3 block">Music Style</label>
              <div className="flex flex-wrap gap-2">
                {styles.map((s) => (
                  <button key={s} onClick={() => setStyle(s.toLowerCase())} className={`px-3 py-1.5 text-[12px] font-medium rounded-lg transition-all ${style === s.toLowerCase() ? "bg-[#A855F7] text-white" : "bg-[#262626] text-[#888888] hover:bg-[#333333] hover:text-white"}`}>{s}</button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[14px] font-bold text-white block">Instrumental</span>
                  <span className="text-[12px] text-[#888888]">Generate music without vocals</span>
                </div>
                <button onClick={() => setInstrumental(!instrumental)} className={`w-11 h-6 rounded-full transition-colors ${instrumental ? "bg-[#A855F7]" : "bg-[#333333]"}`}>
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${instrumental ? "translate-x-5.5" : "translate-x-0.5"}`} />
                </button>
              </div>
            </div>

            <div className="mt-auto pt-3 border-t border-[#333333]">
              <div className="flex items-center gap-1.5 mb-3 text-[13px] text-white">
                <svg className="w-4 h-4 text-[#A855F7]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Required credits: <span className="font-bold">15</span>
              </div>
              <button disabled={generating || !prompt.trim()} className="w-full py-3 bg-gradient-to-r from-[#9333EA] to-[#C026D3] text-white font-bold text-[15px] rounded-lg hover:from-[#7C3AED] hover:to-[#A21CAF] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {generating ? "Generating..." : "Generate Music"}
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
                  <svg className="w-16 h-16 text-[#333333] mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" /></svg>
                  <p className="text-[13px] text-[#555555]">Describe your song and generate</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
