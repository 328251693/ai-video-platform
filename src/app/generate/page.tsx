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

export default function GeneratePage() {
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("MiniMax-Hailuo-2.3");
  const [channel, setChannel] = useState<"ver1" | "ver2">("ver1");
  const [referenceType, setReferenceType] = useState("Reference");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [resolution, setResolution] = useState("720p");
  const [duration, setDuration] = useState(5);
  const [webSearch, setWebSearch] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [currentTaskStatus, setCurrentTaskStatus] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const models = [
    { id: "MiniMax-Hailuo-2.3", name: "Hailuo 2.3", provider: "Apimart", credits: 30 },
    { id: "MiniMax-Hailuo-2.3-Fast", name: "Hailuo 2.3 Fast", provider: "Apimart", credits: 25 },
    { id: "nano-banana", name: "Nano Banana", provider: "Grsai", credits: 20 },
    { id: "gpt-image-2", name: "GPT Image 2", provider: "Grsai", credits: 5 },
  ];

  const fetchRecentTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/generate");
      const data = await res.json();
      if (data.tasks) {
        setRecentTasks(data.tasks.filter((t: Task) => t.status === "completed" && t.output_url).slice(0, 4));
        const processingTasks = data.tasks.filter((t: Task) => t.status === "processing");
        for (const task of processingTasks) {
          try { await fetch(`/api/generate/${task.id}`); } catch {}
        }
      }
    } catch {}
  }, []);

  useEffect(() => { fetchRecentTasks(); }, [fetchRecentTasks]);

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
          stopPolling(); setGenerating(false); setVideoUrl(task.output_url || null); fetchRecentTasks();
        } else if (task.status === "failed") {
          stopPolling(); setGenerating(false); setErrorMsg(task.error_message || "Generation failed");
        }
      } catch {}
    }, 3000);
  }, [stopPolling, fetchRecentTasks]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true); setErrorMsg(null); setVideoUrl(null); setCurrentTaskStatus("pending");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model_id: selectedModel, prompt: prompt.trim(), input_params: { duration, resolution, aspect_ratio: aspectRatio } }),
      });
      const data = await res.json();
      if (!res.ok) { setGenerating(false); setErrorMsg(data.error || "Failed to start generation"); return; }
      pollTaskStatus(data.task_id);
    } catch { setGenerating(false); setErrorMsg("Network error. Please try again."); }
  };

  const getCredits = () => models.find(m => m.id === selectedModel)?.credits || 20;
  const currentModel = models.find(m => m.id === selectedModel);

  return (
    <div className="h-[calc(100vh-56px)] flex flex-col bg-[#000000] overflow-hidden">
      {/* ==================== 主体区域 ==================== */}
      <div className="flex flex-1 min-h-0">

        <Sidebar activeItem="Text to Video" />

        {/* ========== 中间配置区 ========== */}
        <div className="w-[420px] flex-shrink-0 overflow-y-auto p-4 scrollbar-hide">
          <div className="bg-[#1a1a1a] rounded-xl p-5 flex flex-col min-h-full">

            {/* Text to Video + 频道选择 */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-[15px] font-bold text-white">Text to Video</h2>
                <svg className="w-4 h-4 text-[#555555]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 bg-[#262626] border border-[#333333] rounded-md text-[11px] text-[#888888] font-medium">Apimart</span>
                <span className="px-2.5 py-1 bg-[#262626] border border-[#333333] rounded-md text-[11px] text-[#888888]">Ver.1 (Not Support Real People)</span>
                <svg className="w-3.5 h-3.5 text-[#555555]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              {channel === "ver2" && (
                <div className="mt-1 px-3 py-2 bg-[#2D1B33] border border-[#A855F7]/40 rounded-lg text-[11px] text-[#cccccc] leading-relaxed">
                  Ver.2 supports real people video generation. Cost is <span className="text-[#A855F7] font-medium">30% higher</span> than Ver.1.
                </div>
              )}
            </div>

            {/* Model 选择 */}
            <div className="mb-5">
              <label className="text-[14px] font-bold text-white mb-3 block">Model</label>
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#262626] border border-[#333333] text-[#888888] hover:text-white hover:border-[#A855F7] transition-colors flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="flex-1 relative">
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full appearance-none bg-[#121212] border border-[#333333] rounded-lg px-3 py-2.5 text-[13px] text-white focus:outline-none focus:border-[#A855F7] cursor-pointer transition-colors"
                  >
                    {models.map(m => (
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
                <span className="px-2 py-0.5 bg-[#262626] text-[10px] text-[#888888] rounded font-medium">{currentModel?.provider || "Apimart"}</span>
                <span className="text-[11px] text-[#888888]">Cost: {getCredits()} credits</span>
              </div>
            </div>

            {/* Upload Media */}
            <div className="mb-5">
              <label className="text-[14px] font-bold text-white mb-3 block">Upload Media</label>
              <div className="flex items-center gap-4 mb-3 border-b border-[#333333] pb-2">
                {["Reference", "Character", "Style"].map((ref) => (
                  <button
                    key={ref}
                    onClick={() => setReferenceType(ref)}
                    className={`text-[12px] font-medium pb-1 border-b-2 transition-colors ${
                      referenceType === ref
                        ? "text-[#A855F7] border-[#A855F7]"
                        : "text-[#888888] border-transparent hover:text-[#cccccc]"
                    }`}
                  >
                    {ref}
                  </button>
                ))}
              </div>
              <div className="border-2 border-dashed border-[#333333] rounded-xl p-6 text-center hover:border-[#A855F7]/40 transition-colors cursor-pointer">
                <svg className="w-9 h-9 text-[#555555] mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                <p className="text-[13px] text-white mb-1.5">Drag or Upload</p>
                <div className="flex items-center justify-center gap-4 text-[11px] text-[#888888]">
                  <span>image(0/9)</span>
                  <span>video(0/3)</span>
                  <span>audio(0/3)</span>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-2">
                <button className="flex items-center gap-1.5 text-[11px] text-[#A855F7] hover:text-[#C084FC] transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Select Creations
                </button>
                <button className="flex items-center gap-1.5 text-[11px] text-[#A855F7] hover:text-[#C084FC] transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  AI Quick Upload
                </button>
              </div>
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
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder='Reference Mode: Upload media and use @image1, @video1, @audio1 in your prompt.
First & Last Frame Mode: Upload two images, and AI will generate a video transitioning between them.'
                className="flex-1 min-h-[140px] bg-[#121212] border border-[#333333] rounded-xl p-3 text-[#cccccc] placeholder:text-[#555555] focus:outline-none focus:border-[#A855F7] resize-none text-[13px] leading-relaxed transition-colors"
              />
              <div className="flex items-center justify-between mt-2">
                <button className="flex items-center gap-1.5 text-[12px] text-[#A855F7] hover:text-[#C084FC] transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                  Generate With AI
                </button>
                <div className="flex items-center gap-1">
                  <button className="p-1.5 text-[#555555] hover:text-[#cccccc] transition-colors" title="Copy"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg></button>
                  <button onClick={() => setPrompt("")} className="p-1.5 text-[#555555] hover:text-[#cccccc] transition-colors" title="Delete"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                  <button className="p-1.5 text-[#555555] hover:text-[#cccccc] transition-colors" title="History"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></button>
                </div>
              </div>
            </div>

            {/* 设置项 */}
            <div className="mb-5 space-y-5">
              {/* Video Ratio */}
              <div>
                <div className="mb-1.5">
                  <span className="text-[14px] font-bold text-white">Video Ratio</span>
                </div>
                <p className="text-[12px] text-[#888888] mb-3">Select the aspect ratio for your Video.</p>
                <div className="grid grid-cols-6 gap-2">
                  {[
                    { label: "16:9", icon: "M4 6h16v12H4z" },
                    { label: "9:16", icon: "M8 4h8v16H8z" },
                    { label: "4:3", icon: "M4 6h16v12H4z" },
                    { label: "3:4", icon: "M7 4h10v16H7z" },
                    { label: "1:1", icon: "M5 5h14v14H5z" },
                    { label: "21:9", icon: "M2 7h20v10H2z" },
                  ].map((r) => (
                    <button
                      key={r.label}
                      onClick={() => setAspectRatio(r.label)}
                      className={`flex flex-col items-center justify-center py-2.5 rounded-lg transition-all ${
                        aspectRatio === r.label
                          ? "bg-[#1a1a1a] border-2 border-[#A855F7] text-white"
                          : "bg-[#1F1F1F] border border-[#333333] text-[#888888] hover:border-[#555555]"
                      }`}
                    >
                      <svg className={`w-5 h-4 mb-1 ${aspectRatio === r.label ? "text-white" : "text-[#666666]"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={r.icon} />
                      </svg>
                      <span className="text-[10px] font-medium">{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Resolution */}
              <div>
                <div className="mb-3">
                  <span className="text-[14px] font-bold text-white">Resolution</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {["480p", "720p", "1080p"].map((r) => (
                    <button
                      key={r}
                      onClick={() => setResolution(r)}
                      className={`py-2 text-[12px] font-medium rounded-lg transition-all ${
                        resolution === r
                          ? "bg-[#1a1a1a] border-2 border-[#A855F7] text-white"
                          : "bg-[#1F1F1F] border border-[#333333] text-[#888888] hover:border-[#555555]"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Video Length */}
              <div>
                <div className="mb-3">
                  <span className="text-[14px] font-bold text-white">Video Length</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={1}
                    max={15}
                    step={1}
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="flex-1 h-1.5 appearance-none bg-[#333333] rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#A855F7] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                  />
                  <span className="text-[12px] text-[#888888] w-8 text-right">{duration}s</span>
                </div>
              </div>

              {/* Web Search */}
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[14px] font-bold text-white">Web Search</span>
                    <p className="text-[11px] text-[#888888] mt-0.5">Enable Web Search to generate creations based on real-time information</p>
                  </div>
                  <button
                    onClick={() => setWebSearch(!webSearch)}
                    className={`relative w-10 h-[22px] rounded-full transition-colors flex-shrink-0 ml-3 ${
                      webSearch ? "bg-[#A855F7]" : "bg-[#333333]"
                    }`}
                  >
                    <div className={`absolute top-[3px] w-4 h-4 rounded-full bg-white transition-transform ${
                      webSearch ? "left-[22px]" : "left-[3px]"
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            {/* 底部：积分 + 生成按钮 */}
            <div className="mt-auto pt-3 border-t border-[#333333]">
              <div className="flex items-center gap-1.5 mb-3 text-[13px] text-white">
                <svg className="w-4 h-4 text-[#A855F7]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Required credits: <span className="font-bold">{getCredits()}</span>
              </div>
              <button
                onClick={handleGenerate}
                disabled={generating || !prompt.trim()}
                className="w-full py-3 bg-gradient-to-r from-[#9333EA] to-[#C026D3] text-white font-bold text-[15px] rounded-lg hover:from-[#7C3AED] hover:to-[#A21CAF] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {generating ? (
                  <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Generating...</>
                ) : "Generate"}
              </button>
              {errorMsg && (
                <p className="mt-2 text-xs text-[#EF4444]">{errorMsg}</p>
              )}
            </div>
          </div>
        </div>

        {/* ========== 右侧预览区 ========== */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
          <div className="bg-[#1a1a1a] rounded-xl p-5 h-full flex flex-col">
            {/* Video Preview */}
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-[15px] font-bold text-white">Video Preview</h2>
              <div className="flex-1 h-px bg-[#333333]" />
            </div>

            {/* 视频播放器 */}
            <div className="flex-1 min-h-0 bg-[#000000] rounded-xl overflow-hidden relative">
              {videoUrl ? (
                <video controls autoPlay loop className="w-full h-full object-contain" src={videoUrl} />
              ) : generating ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-14 h-14 border-4 border-[#A855F7]/20 border-t-[#A855F7] rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-white text-sm font-medium">{currentTaskStatus === "pending" ? "Submitting..." : "Generating video..."}</p>
                    <p className="text-[#555555] text-xs mt-1">This may take 1-3 minutes</p>
                  </div>
                </div>
              ) : errorMsg ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-12 h-12 text-[#EF4444]/40 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    <p className="text-[#EF4444] text-sm">{errorMsg}</p>
                  </div>
                </div>
              ) : (
                <video autoPlay loop muted playsInline controls className="w-full h-full object-cover">
                  <source src="https://pub-0ba57c4478ad4daeab520cf5dbf4a0e3.r2.dev/system/simple.webm" type="video/webm" />
                </video>
              )}
              {/* 底部品牌标签 */}
              {videoUrl && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="flex items-center justify-between">
                    <div className="px-3 py-1 bg-black/60 rounded-full text-[11px] text-[#cccccc] backdrop-blur-sm">
                      {currentModel?.name} x AI Video Platform
                    </div>
                    <div className="flex gap-2">
                      <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-1.5 bg-[#A855F7] text-white text-[11px] font-medium rounded-lg hover:bg-[#9333EA] transition-colors">Download</a>
                      <button onClick={() => { setVideoUrl(null); setCurrentTaskStatus(null); }} className="px-4 py-1.5 bg-[#333333] text-white text-[11px] rounded-lg hover:bg-[#444444] transition-colors">New</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 操作按钮（生成完成后显示） */}
            {videoUrl && (
              <div className="flex gap-2 mt-3">
                <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="flex-1 py-2 bg-[#A855F7] text-white text-[12px] font-medium rounded-lg hover:bg-[#9333EA] transition-colors text-center">
                  Download
                </a>
                <button onClick={() => { setVideoUrl(null); setCurrentTaskStatus(null); }} className="flex-1 py-2 bg-[#333333] text-white text-[12px] rounded-lg hover:bg-[#444444] transition-colors">
                  New
                </button>
              </div>
            )}

            {/* 最近创作 */}
            {recentTasks.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] text-[#888888] font-medium">Recent</span>
                  <a href="/history" className="text-[12px] text-[#A855F7] hover:text-[#C084FC] transition-colors">View All</a>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {recentTasks.map((task) => (
                    <div
                      key={task.id}
                      className="aspect-video rounded-lg overflow-hidden bg-[#121212] border border-[#333333] cursor-pointer hover:border-[#A855F7]/40 transition-colors"
                      onClick={() => { if (task.output_url) { setVideoUrl(task.output_url); setCurrentTaskStatus("completed"); setPrompt(task.prompt); } }}
                    >
                      {task.output_url && (task.model_id === "gpt-image-2" ? <img src={task.output_url} alt="" className="w-full h-full object-cover" /> : <video src={task.output_url} className="w-full h-full object-cover" muted />)}
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
