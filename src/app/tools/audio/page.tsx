"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Sidebar from "@/components/Sidebar";

interface Task {
  id: string;
  model_id: string;
  prompt: string;
  status: string;
  output_url: string | null;
  created_at: string;
}

type SliderControlProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
};

function SliderControl({ label, value, onChange, min = 0, max = 1, step = 0.01 }: SliderControlProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[13px] text-white font-medium">{label}</span>
        <span className="text-[12px] text-[#888888]">{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 appearance-none bg-[#333333] rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#A855F7] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(168,85,247,0.5)]"
      />
    </div>
  );
}

export default function AudioGenerationPage() {
  const [text, setText] = useState("");
  const [selectedEngine, setSelectedEngine] = useState("elevenlabs-multilingual");
  const [selectedVoice, setSelectedVoice] = useState("Rachel");
  const [stability, setStability] = useState(0.5);
  const [similarityBoost, setSimilarityBoost] = useState(0.75);
  const [style, setStyle] = useState(0);
  const [speed, setSpeed] = useState(1.0);
  const [generating, setGenerating] = useState(false);
  const [currentTaskStatus, setCurrentTaskStatus] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const engines = [
    { id: "elevenlabs-multilingual", name: "Elevenlabs Text To Speech Multilingual", provider: "Elevenlabs", credits: 5 },
  ];

  const voices = ["Rachel", "Adam", "Domi", "Elli", "Josh", "Arnold", "Sam", "Clyde", "Dave", "Fin"];

  const fetchRecentTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/generate");
      const data = await res.json();
      if (data.tasks) {
        setRecentTasks(data.tasks.filter((t: Task) => t.status === "completed" && t.output_url && t.model_id === "elevenlabs-tts").slice(0, 4));
      }
    } catch {}
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void fetchRecentTasks(); }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchRecentTasks]);

  const stopPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }, []);

  const pollTaskStatus = useCallback((tid: string) => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/generate/${tid}`);
        if (!res.ok) return;
        const data = await res.json();
        const task = data.task;
        if (!task) return;
        setCurrentTaskStatus(task.status);
        if (task.status === "completed") {
          stopPolling(); setGenerating(false); setAudioUrl(task.output_url || null); fetchRecentTasks();
        } else if (task.status === "failed") {
          stopPolling(); setGenerating(false); setErrorMsg(task.error_message || "Generation failed");
        }
      } catch {}
    }, 3000);
  }, [stopPolling, fetchRecentTasks]);

  const handleGenerate = async () => {
    if (!text.trim()) return;
    setGenerating(true); setErrorMsg(null); setAudioUrl(null); setCurrentTaskStatus("pending");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model_id: "elevenlabs-tts",
          prompt: text.trim(),
          input_params: { voice: selectedVoice, stability, similarity_boost: similarityBoost, style, speed },
        }),
      });
      const data = await res.json();
      if (!res.ok) { setGenerating(false); setErrorMsg(data.error || "Failed to start generation"); return; }
      pollTaskStatus(data.task_id);
    } catch { setGenerating(false); setErrorMsg("Network error. Please try again."); }
  };

  const getCredits = () => engines.find(m => m.id === selectedEngine)?.credits || 5;

  return (
    <div className="h-[calc(100vh-56px)] flex flex-col bg-[#000000] overflow-hidden">

      {/* ==================== ???? ==================== */}
      <div className="flex flex-1 min-h-0">

        <Sidebar activeItem="Text to Speech" />

        {/* ========== ????? ========== */}
        <div className="w-[420px] flex-shrink-0 overflow-y-auto p-4 scrollbar-hide">
          <div className="bg-[#1a1a1a] rounded-xl p-5 flex flex-col min-h-full">

            {/* Text to Speech */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-[15px] font-bold text-white">Text to Speech</h2>
                <svg className="w-4 h-4 text-[#555555]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-[#262626] border border-[#333333] rounded-md text-[11px] text-[#888888] font-medium">Elevenlabs</span>
              </div>
            </div>

            {/* Model ?? */}
            <div className="mb-5">
              <label className="text-[14px] font-bold text-white mb-3 block">Model</label>
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#262626] border border-[#333333] text-[#888888] hover:text-white hover:border-[#A855F7] transition-colors flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="flex-1 relative">
                  <select
                    value={selectedEngine}
                    onChange={(e) => setSelectedEngine(e.target.value)}
                    className="w-full appearance-none bg-[#121212] border border-[#333333] rounded-lg px-3 py-2.5 text-[13px] text-white focus:outline-none focus:border-[#A855F7] cursor-pointer transition-colors"
                  >
                    {engines.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888888] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#262626] border border-[#333333] text-[#888888] hover:text-white hover:border-[#A855F7] transition-colors flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-0.5 bg-[#262626] text-[10px] text-[#888888] rounded font-medium">{engines.find(m => m.id === selectedEngine)?.provider || "Elevenlabs"}</span>
                <span className="text-[11px] text-[#888888]">Cost: {getCredits()} credits</span>
              </div>
            </div>

            {/* Text ?? */}
            <div className="flex-1 flex flex-col mb-5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[14px] font-bold text-white">Text</label>
              </div>
              <p className="text-[12px] text-[#888888] mb-2">The text to convert to speech.</p>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter the text you want to convert to speech..."
                className="flex-1 min-h-[120px] bg-[#121212] border border-[#333333] rounded-xl p-3 text-[#cccccc] placeholder:text-[#555555] focus:outline-none focus:border-[#A855F7] resize-none text-[13px] leading-relaxed transition-colors"
              />
              <div className="text-right mt-1">
                <span className="text-[11px] text-[#555555]">{text.length}/5000</span>
              </div>
            </div>

            {/* Voice ?? */}
            <div className="mb-5">
              <label className="text-[14px] font-bold text-white mb-2 block">Voice</label>
              <div className="relative">
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="w-full bg-[#121212] border border-[#333333] rounded-lg px-4 py-2.5 text-[13px] text-white appearance-none cursor-pointer focus:outline-none focus:border-[#A855F7] transition-colors"
                >
                  {voices.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
                <svg className="w-4 h-4 text-[#888888] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>

            {/* ?????? */}
            <div className="mb-5 space-y-4">
              <SliderControl label="Stability" value={stability} onChange={setStability} />
              <SliderControl label="Similarity Boost" value={similarityBoost} onChange={setSimilarityBoost} />
              <SliderControl label="Style" value={style} onChange={setStyle} />
              <SliderControl label="Speed" value={speed} onChange={setSpeed} min={0.5} max={2.0} step={0.05} />
            </div>

            {/* ????? + ???? */}
            <div className="mt-auto pt-3 border-t border-[#333333]">
              <div className="flex items-center gap-1.5 mb-3 text-[13px] text-white">
                <svg className="w-4 h-4 text-[#A855F7]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Required credits: <span className="font-bold">{getCredits()}</span>
              </div>
              <button
                onClick={handleGenerate}
                disabled={generating || !text.trim()}
                className="w-full py-3 bg-gradient-to-r from-[#9333EA] to-[#C026D3] text-white font-bold text-[15px] rounded-lg hover:from-[#7C3AED] hover:to-[#A21CAF] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {generating ? (
                  <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Generating...</>
                ) : "Generate"}
              </button>
              {errorMsg && <p className="mt-2 text-xs text-[#EF4444]">{errorMsg}</p>}
            </div>
          </div>
        </div>

        {/* ========== ????? ========== */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
          <div className="bg-[#1a1a1a] rounded-xl p-5 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-[15px] font-bold text-white">Sample Audio</h2>
              <div className="flex-1 h-px bg-[#333333]" />
            </div>

            <div className="flex-1 min-h-0 bg-[#000000] rounded-xl overflow-hidden relative flex items-center justify-center">
              {audioUrl ? (
                <div className="w-full px-8">
                  <div className="text-center mb-6">
                    <svg className="w-16 h-16 text-[#A855F7] mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                    <p className="text-white text-sm font-medium">Audio Generated</p>
                  </div>
                  <audio controls className="w-full" src={audioUrl}>
                    Your browser does not support the audio element.
                  </audio>
                </div>
              ) : generating ? (
                <div className="text-center">
                  <div className="w-14 h-14 border-4 border-[#A855F7]/20 border-t-[#A855F7] rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-white text-sm font-medium">{currentTaskStatus === "pending" ? "Submitting..." : "Generating audio..."}</p>
                  <p className="text-[#555555] text-xs mt-1">This may take a few seconds</p>
                </div>
              ) : errorMsg ? (
                <div className="text-center">
                  <svg className="w-12 h-12 text-[#EF4444]/40 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  <p className="text-[#EF4444] text-sm">{errorMsg}</p>
                </div>
              ) : (
                <div className="text-center">
                  <svg className="w-16 h-16 text-[#333333] mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                  <p className="text-[#555555] text-sm">Your generated audio will appear here</p>
                </div>
              )}
            </div>

            {audioUrl && (
              <div className="flex gap-2 mt-3">
                <a href={audioUrl} target="_blank" rel="noopener noreferrer" className="flex-1 py-2 bg-[#A855F7] text-white text-[12px] font-medium rounded-lg hover:bg-[#9333EA] transition-colors text-center">Download</a>
                <button onClick={() => { setAudioUrl(null); setCurrentTaskStatus(null); }} className="flex-1 py-2 bg-[#333333] text-white text-[12px] rounded-lg hover:bg-[#444444] transition-colors">New</button>
              </div>
            )}

            {recentTasks.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] text-[#888888] font-medium">Recent</span>
                  <a href="/history" className="text-[12px] text-[#A855F7] hover:text-[#C084FC] transition-colors">View All</a>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {recentTasks.map((task) => (
                    <div key={task.id} className="aspect-video rounded-lg overflow-hidden bg-[#121212] border border-[#333333] cursor-pointer hover:border-[#A855F7]/40 transition-colors flex items-center justify-center" onClick={() => { if (task.output_url) { setAudioUrl(task.output_url); setCurrentTaskStatus("completed"); setText(task.prompt); } }}>
                      <svg className="w-6 h-6 text-[#555555]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" /></svg>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
