"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import Sidebar from "@/components/Sidebar";
import { useGenerationModels } from "@/hooks/useGenerationModels";

interface Task {
  id: string;
  model_id: string;
  prompt: string;
  status: string;
  output_url: string | null;
  created_at: string;
}

export default function ImageToImagePage() {
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("gpt-image-2");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [resolution, setResolution] = useState("1K");
  const [generating, setGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const { models } = useGenerationModels("image");

  const fetchRecentTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/generate");
      const data = await res.json();
      if (data.tasks) {
        setRecentTasks(data.tasks.filter((t: Task) => t.status === "completed" && t.output_url).slice(0, 4));
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
        if (task.status === "completed") {
          stopPolling(); setGenerating(false); setImageUrl(task.output_url || null); fetchRecentTasks();
        } else if (task.status === "failed") {
          stopPolling(); setGenerating(false); setErrorMsg(task.error_message || "Generation failed");
        }
      } catch {}
    }, 3000);
  }, [stopPolling, fetchRecentTasks]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true); setErrorMsg(null); setImageUrl(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model_id: selectedModel, prompt: prompt.trim(), input_params: { aspect_ratio: aspectRatio, resolution } }),
      });
      const data = await res.json();
      if (!res.ok) { setGenerating(false); setErrorMsg(data.error || "Failed to start generation"); return; }
      pollTaskStatus(data.task_id);
    } catch { setGenerating(false); setErrorMsg("Network error. Please try again."); }
  };

  const getCredits = () => models.find(m => m.id === selectedModel)?.credits || 5;
  const currentModel = models.find(m => m.id === selectedModel);

  return (
    <div className="h-[calc(100vh-56px)] flex flex-col bg-[#000000] overflow-hidden">
      <div className="flex flex-1 min-h-0">
        <Sidebar activeItem="Image to Image" />

        {/* ????? */}
        <div className="w-[420px] flex-shrink-0 overflow-y-auto p-4 scrollbar-hide">
          <div className="bg-[#1a1a1a] rounded-xl p-5 flex flex-col min-h-full">

            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-[15px] font-bold text-white">Image to Image</h2>
                <svg className="w-4 h-4 text-[#555555]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </div>
            </div>

            {/* Model */}
            <div className="mb-5">
              <label className="text-[14px] font-bold text-white mb-3 block">Model</label>
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#262626] border border-[#333333] text-[#888888] hover:text-white hover:border-[#A855F7] transition-colors flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="flex-1 relative">
                  <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} className="w-full appearance-none bg-[#121212] border border-[#333333] rounded-lg px-3 py-2.5 text-[13px] text-white focus:outline-none focus:border-[#A855F7] cursor-pointer transition-colors">
                    {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888888] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#262626] border border-[#333333] text-[#888888] hover:text-white hover:border-[#A855F7] transition-colors flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-0.5 bg-[#262626] text-[10px] text-[#888888] rounded font-medium">{currentModel?.provider || "Grsai"}</span>
                <span className="text-[11px] text-[#888888]">Cost: {getCredits()} credits</span>
              </div>
            </div>

            {/* Upload Image */}
            <div className="mb-5">
              <label className="text-[14px] font-bold text-white mb-3 block">Upload Image</label>
              <div className="border-2 border-dashed border-[#333333] rounded-xl p-6 text-center hover:border-[#A855F7]/40 transition-colors cursor-pointer">
                <svg className="w-9 h-9 text-[#555555] mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <p className="text-[13px] text-white mb-1.5">Select Image</p>
                <p className="text-[11px] text-[#888888]">Drag or upload up to 4 images</p>
              </div>
              <button className="flex items-center gap-1.5 text-[11px] text-[#A855F7] hover:text-[#C084FC] transition-colors mt-2">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Select From Your Creations
              </button>
            </div>

            {/* Prompt */}
            <div className="flex-1 flex flex-col mb-5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[14px] font-bold text-white">Prompt</label>
                <button className="flex items-center gap-1.5 text-[12px] text-[#A855F7] hover:text-[#C084FC] transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
                  Translate
                </button>
              </div>
              <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Please enter the prompt for your creation." className="flex-1 min-h-[120px] bg-[#121212] border border-[#333333] rounded-xl p-3 text-[#cccccc] placeholder:text-[#555555] focus:outline-none focus:border-[#A855F7] resize-none text-[13px] leading-relaxed transition-colors" />
              <div className="flex items-center justify-between mt-2">
                <button className="flex items-center gap-1.5 text-[12px] text-[#A855F7] hover:text-[#C084FC] transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                  Generate With AI
                </button>
              </div>
            </div>

            {/* Settings */}
            <div className="mb-5 space-y-5">
              <div>
                <div className="mb-1.5"><span className="text-[14px] font-bold text-white">Image Dimensions</span></div>
                <p className="text-[12px] text-[#888888] mb-3">Select the aspect ratio for your image.</p>
                <div className="grid grid-cols-6 gap-2">
                  {[
                    { label: "1:1", icon: "M5 5h14v14H5z" },
                    { label: "16:9", icon: "M4 6h16v12H4z" },
                    { label: "9:16", icon: "M8 4h8v16H8z" },
                    { label: "4:3", icon: "M4 6h16v12H4z" },
                    { label: "3:4", icon: "M7 4h10v16H7z" },
                    { label: "21:9", icon: "M2 7h20v10H2z" },
                  ].map((r) => (
                    <button key={r.label} onClick={() => setAspectRatio(r.label)} className={`flex flex-col items-center justify-center py-2.5 rounded-lg transition-all ${aspectRatio === r.label ? "bg-[#1a1a1a] border-2 border-[#A855F7] text-white" : "bg-[#1F1F1F] border border-[#333333] text-[#888888] hover:border-[#555555]"}`}>
                      <svg className={`w-5 h-4 mb-1 ${aspectRatio === r.label ? "text-white" : "text-[#666666]"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={r.icon} /></svg>
                      <span className="text-[10px] font-medium">{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-3"><span className="text-[14px] font-bold text-white">Resolution</span></div>
                <div className="grid grid-cols-3 gap-2">
                  {["1K", "2K", "4K"].map((r) => (
                    <button key={r} onClick={() => setResolution(r)} className={`py-2 text-[12px] font-medium rounded-lg transition-all ${resolution === r ? "bg-[#1a1a1a] border-2 border-[#A855F7] text-white" : "bg-[#1F1F1F] border border-[#333333] text-[#888888] hover:border-[#555555]"}`}>{r}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Generate */}
            <div className="mt-auto pt-3 border-t border-[#333333]">
              <div className="flex items-center gap-1.5 mb-3 text-[13px] text-white">
                <svg className="w-4 h-4 text-[#A855F7]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Required credits: <span className="font-bold">{getCredits()}</span>
              </div>
              <button onClick={handleGenerate} disabled={generating || !prompt.trim()} className="w-full py-3 bg-gradient-to-r from-[#9333EA] to-[#C026D3] text-white font-bold text-[15px] rounded-lg hover:from-[#7C3AED] hover:to-[#A21CAF] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {generating ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Generating...</> : "Generate"}
              </button>
              {errorMsg && <p className="mt-2 text-xs text-[#EF4444]">{errorMsg}</p>}
            </div>
          </div>
        </div>

        {/* ????? */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
          <div className="bg-[#1a1a1a] rounded-xl p-5 h-full flex flex-col">
            <h3 className="text-[14px] font-bold text-white mb-4">Preview</h3>
            <div className="flex-1 flex items-center justify-center">
              {imageUrl ? (
                <Image src={imageUrl} alt="Generated" width={1024} height={1024} unoptimized className="max-w-full max-h-full rounded-lg" />
              ) : (
                <div className="text-center">
                  <svg className="w-16 h-16 text-[#333333] mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <p className="text-[13px] text-[#555555]">Upload an image and generate</p>
                </div>
              )}
            </div>
            {recentTasks.length > 0 && (
              <div className="mt-4 pt-3 border-t border-[#333333]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] font-medium text-[#888888]">Recent</span>
                  <a href="/history" className="text-[12px] text-[#A855F7] hover:text-[#C084FC] transition-colors">View All</a>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {recentTasks.map((t) => (
                    <button key={t.id} onClick={() => setImageUrl(t.output_url)} className="aspect-square bg-[#262626] rounded-lg overflow-hidden hover:ring-2 hover:ring-[#A855F7] transition-all">
                      <Image src={t.output_url!} alt="" width={256} height={256} unoptimized className="w-full h-full object-cover" />
                    </button>
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
