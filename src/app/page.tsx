"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import FuturisticBackground from "@/components/FuturisticBackground";

interface Task {
  id: string;
  model_id: string;
  prompt: string;
  status: string;
  output_url: string | null;
  created_at: string;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("text-to-video");
  const [selectedModel, setSelectedModel] = useState("MiniMax-Hailuo-2.3");
  const [prompt, setPrompt] = useState("");
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [activeExploreIndex, setActiveExploreIndex] = useState(0);

  useEffect(() => {
    fetch("/api/generate")
      .then(res => res.json())
      .then(data => {
        if (data.tasks) {
          setRecentTasks(data.tasks.filter((t: Task) => t.status === "completed" && t.output_url).slice(0, 6));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* ==================== Hero Section ==================== */}
      <section className="relative min-h-[80vh] flex flex-col items-center justify-center px-4 overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-40"
          >
            <source src="https://pub-0ba57c4478ad4daeab520cf5dbf4a0e3.r2.dev/system/simple.webm" type="video/webm" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/50 via-neutral-950/70 to-neutral-950" />
        </div>
        <FuturisticBackground />
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-neutral-950/20 via-neutral-950/40 to-neutral-950" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-[1.1] tracking-tight text-white">
            All-in-one AI Video
            <br />
            & Image Generator
          </h1>

          {/* Model names subtitle */}
          <p className="text-neutral-400 text-sm md:text-base max-w-3xl mx-auto mb-6 leading-relaxed">
            Hailuo 2.3 | Nano Banana 2 | GPT Image 2 | Seedance | Runway | Kling | Midjourney | GPT 4o
          </p>

          {/* Announcement badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <Link
              href="/generate"
              className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900/80 border border-neutral-700/50 rounded-full text-sm hover:border-violet-500/40 transition-colors backdrop-blur-sm"
            >
              <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 text-xs font-bold rounded">NEW</span>
              <span className="text-neutral-300">Hailuo 2.3 Officially Launched</span>
              <span className="text-violet-400 text-xs">Try Now &rarr;</span>
            </Link>
            <Link
              href="/generate"
              className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900/80 border border-neutral-700/50 rounded-full text-sm hover:border-violet-500/40 transition-colors backdrop-blur-sm"
            >
              <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-xs font-bold rounded">HOT</span>
              <span className="text-neutral-300">Create Unlimited-Length Videos</span>
              <span className="text-violet-400 text-xs">Try Now &rarr;</span>
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/generate"
              className="px-7 py-3.5 bg-gradient-to-r from-violet-600 to-pink-600 text-white font-semibold rounded-xl hover:from-violet-500 hover:to-pink-500 transition-all text-sm shadow-lg shadow-violet-600/20"
            >
              Create Video
            </Link>
            <Link
              href="/tools/image"
              className="px-7 py-3.5 bg-gradient-to-r from-violet-600 to-pink-600 text-white font-semibold rounded-xl hover:from-violet-500 hover:to-pink-500 transition-all text-sm shadow-lg shadow-violet-600/20"
            >
              Create Image
            </Link>
            <Link
              href="/generate"
              className="px-7 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-500 hover:to-indigo-500 transition-all text-sm shadow-lg shadow-blue-600/20"
            >
              One-Click Video Creator
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== Model Selector Ribbon ==================== */}
      <section className="border-y border-neutral-800/50 bg-neutral-900/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex gap-3 overflow-x-auto scrollbar-hide">
          {ribbonModels.map((model) => (
            <Link
              key={model.id}
              href={`/model/${model.id}`}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap bg-neutral-800/40 border border-neutral-700/30 text-neutral-300 hover:border-violet-500/40 hover:text-violet-400 transition-colors flex-shrink-0"
            >
              <span className="text-base">{model.icon}</span>
              {model.name}
            </Link>
          ))}
        </div>
      </section>

      {/* ==================== Main Generator Interface ==================== */}
      <section className="px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr,480px] gap-6">

            {/* Left Panel: Input & Settings */}
            <div className="bg-neutral-900/60 border border-neutral-800/50 rounded-2xl p-6 backdrop-blur-sm">
              {/* Tabs */}
              <div className="flex gap-1 mb-5 bg-neutral-950/60 p-1 rounded-xl border border-neutral-800/40">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? "bg-violet-600/20 text-violet-400 border border-violet-500/30"
                        : "text-neutral-500 hover:text-neutral-300"
                    }`}
                  >
                    {tab.name}
                  </button>
                ))}
              </div>

              {/* Model Dropdown */}
              <div className="mb-4">
                <label className="text-xs text-neutral-500 mb-1.5 block">Model</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full bg-neutral-950/80 border border-neutral-700/50 rounded-xl px-4 py-2.5 text-sm text-white appearance-none cursor-pointer focus:outline-none focus:border-violet-500/50"
                >
                  <option value="MiniMax-Hailuo-2.3">Hailuo 2.3 (Apimart)</option>
                  <option value="MiniMax-Hailuo-2.3-Fast">Hailuo 2.3 Fast (Apimart)</option>
                  <option value="nano-banana">Nano Banana (Grsai)</option>
                  <option value="gpt-image-2">GPT Image 2 (Grsai)</option>
                </select>
              </div>

              {/* Upload Media */}
              <div className="mb-4">
                <label className="text-xs text-neutral-500 mb-1.5 block">Upload Media</label>
                <div className="border-2 border-dashed border-neutral-700/50 rounded-xl p-6 text-center hover:border-violet-500/30 transition-colors cursor-pointer bg-neutral-950/40">
                  <svg className="w-8 h-8 text-neutral-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm text-neutral-400 mb-1">Drag or Upload</p>
                  <div className="flex items-center justify-center gap-4 text-xs text-neutral-600">
                    <span>image(0/9)</span>
                    <span>video(0/3)</span>
                    <span>audio(0/3)</span>
                  </div>
                </div>
              </div>

              {/* Prompt */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-neutral-500">Prompt</label>
                  <button className="text-xs text-violet-400 hover:text-violet-300">Translate</button>
                </div>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the video you want to generate... Use @image1, @image2 to reference uploaded images."
                  className="w-full h-28 bg-neutral-950/80 border border-neutral-700/50 rounded-xl p-4 text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-violet-500/50 resize-none text-sm leading-relaxed"
                />
                <div className="flex items-center gap-2 mt-2">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600/15 text-violet-400 rounded-lg text-xs hover:bg-violet-600/25 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    Generate With AI
                  </button>
                  <button className="p-1.5 text-neutral-500 hover:text-neutral-300 transition-colors" title="Copy">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setPrompt("")}
                    className="p-1.5 text-neutral-500 hover:text-neutral-300 transition-colors"
                    title="Clear"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Credits & Generate */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-neutral-500">Required credits: <span className="text-violet-400 font-medium">30</span></span>
                <Link
                  href="/generate"
                  className="px-8 py-3 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-500 transition-colors text-sm"
                >
                  Generate
                </Link>
              </div>
            </div>

            {/* Right Panel: Sample Video */}
            <div className="bg-neutral-900/60 border border-neutral-800/50 rounded-2xl overflow-hidden backdrop-blur-sm">
              <div className="p-4 pb-0">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-sm font-medium text-white">Sample Video</h3>
                  <span className="px-2 py-0.5 bg-violet-500/15 text-violet-400 text-xs rounded-full">Hailuo 2.3</span>
                </div>
              </div>
              <div className="aspect-video mx-4 rounded-xl overflow-hidden mb-4 border border-neutral-800/40">
                <video autoPlay loop muted playsInline controls className="w-full h-full object-cover">
                  <source src="https://pub-0ba57c4478ad4daeab520cf5dbf4a0e3.r2.dev/system/simple.webm" type="video/webm" />
                </video>
              </div>
              <div className="px-4 pb-4">
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Hailuo 2.3: Fast Generation, No Queue | High Quality Output
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== Newly Launched Features ==================== */}
      <section className="px-4 py-16 bg-gradient-to-b from-neutral-950 via-neutral-900/20 to-neutral-950">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-10">
            Newly Launched Feature
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {newFeatures.map((feature, i) => (
              <div
                key={i}
                className="group relative bg-neutral-900/60 border border-neutral-800/50 rounded-2xl overflow-hidden hover:border-violet-500/30 transition-all cursor-pointer"
              >
                <div className="aspect-video relative">
                  <video autoPlay loop muted playsInline className="w-full h-full object-cover"><source src="https://pub-0ba57c4478ad4daeab520cf5dbf4a0e3.r2.dev/system/simple.webm" type="video/webm" /></video>
                  {/* Tag */}
                  {feature.tag && (
                    <span className={`absolute top-3 right-3 px-2 py-0.5 text-xs font-bold rounded ${
                      feature.tag === "NEW" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                    }`}>
                      {feature.tag}
                    </span>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <h3 className="text-sm font-medium text-white group-hover:text-violet-400 transition-colors">
                    {feature.title}
                  </h3>
                  <svg className="w-4 h-4 text-neutral-600 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== Explore AI Video & Image Generator ==================== */}
      <section className="px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-3">
            Explore AI Video & Image Generator
          </h2>
          <p className="text-neutral-400 text-center mb-10 max-w-2xl mx-auto text-sm">
            Experience stunning examples of Image-to-Video, Text-to-Video, Text-to-Image.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-[200px,1fr] gap-6">
            {/* Left: Category info */}
            <div className="flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">{exploreCategories[activeExploreIndex].name}</h3>
                <p className="text-sm text-neutral-400 mb-4">{exploreCategories[activeExploreIndex].desc}</p>
                <Link
                  href="/generate"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white font-medium rounded-xl hover:bg-violet-500 transition-colors text-sm"
                >
                  Create
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setActiveExploreIndex((prev) => (prev - 1 + exploreCategories.length) % exploreCategories.length)}
                  className="w-10 h-10 rounded-lg bg-neutral-800/60 border border-neutral-700/40 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-700/60 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setActiveExploreIndex((prev) => (prev + 1) % exploreCategories.length)}
                  className="w-10 h-10 rounded-lg bg-neutral-800/60 border border-neutral-700/40 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-700/60 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Right: Carousel */}
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {exploreCategories[activeExploreIndex].samples.map((sample, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-[280px] group bg-neutral-900/60 border border-neutral-800/50 rounded-2xl overflow-hidden hover:border-violet-500/30 transition-all"
                >
                  <div className="aspect-video relative">
                    <video autoPlay loop muted playsInline className="w-full h-full object-cover"><source src="https://pub-0ba57c4478ad4daeab520cf5dbf4a0e3.r2.dev/system/simple.webm" type="video/webm" /></video>
                  </div>
                  <div className="p-3">
                    <h4 className="text-sm font-medium text-white truncate">{sample.title}</h4>
                    <p className="text-xs text-neutral-500 mt-0.5">{sample.model}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== Recent Creations (from DB) ==================== */}
      {recentTasks.length > 0 && (
        <section className="px-4 py-16 bg-gradient-to-b from-neutral-950 via-neutral-900/20 to-neutral-950">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">Recent Creations</h2>
              <Link href="/history" className="text-sm text-violet-400 hover:text-violet-300">View All &rarr;</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {recentTasks.map((task) => (
                <Link
                  key={task.id}
                  href="/history"
                  className="group aspect-video rounded-xl overflow-hidden bg-neutral-900/60 border border-neutral-800/50 hover:border-violet-500/30 transition-all"
                >
                  {task.output_url && (
                    task.model_id === "gpt-image-2" ? (
                      <Image src={task.output_url} alt="" width={320} height={180} unoptimized className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <video src={task.output_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform" muted />
                    )
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ==================== Footer ==================== */}
      <footer className="border-t border-neutral-800/50 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-white">AI Video</span>
          </div>
          <p className="text-sm text-neutral-500">&copy; 2026 AI Video Platform. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors">Terms of Service</Link>
            <Link href="/contact" className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ==================== Data ====================

const ribbonModels = [
  { id: "hailuo", name: "Hailuo 2.3", icon: "??" },
  { id: "nano-banana", name: "Nano Banana Pro", icon: "??" },
  { id: "gpt-image", name: "GPT Image 2", icon: "??" },
  { id: "kling", name: "Kling 2.0", icon: "?" },
  { id: "runway", name: "Runway", icon: "??" },
  { id: "midjourney", name: "Midjourney", icon: "??" },
  { id: "gpt4o", name: "GPT 4o", icon: "??" },
  { id: "seedance", name: "Seedance V2.0", icon: "??" },
  { id: "veo", name: "Google Veo 3", icon: "??" },
];

const tabs = [
  { id: "image-to-video", name: "Image to Video" },
  { id: "text-to-video", name: "Text to Video" },
  { id: "image-to-image", name: "Image to Image" },
  { id: "text-to-image", name: "Text to Image" },
];

const newFeatures = [
  {
    title: "Create Unlimited-length Videos",
    tag: "NEW",
    video: "/sample-video.mp4",
    color: "7c3aed",
  },
  {
    title: "Hailuo 2.3: No Queue | High Quality",
    tag: "NEW",
    video: "/sample-video.mp4",
    color: "2563eb",
  },
  {
    title: "GPT Image 2: As low as $0.011/image",
    tag: "HOT",
    video: "/sample-video.mp4",
    color: "059669",
  },
  {
    title: "Create Video From Music",
    tag: "NEW",
    video: "/sample-video.mp4",
    color: "d97706",
  },
  {
    title: "Nano Banana Pro (30s Video) Is Here",
    tag: "NEW",
    video: "/sample-video.mp4",
    color: "dc2626",
  },
  {
    title: "Generate 10-Second Video By Hailuo",
    tag: null,
    video: "/sample-video.mp4",
    color: "7c3aed",
  },
];

const exploreCategories = [
  {
    name: "Text to Video",
    desc: "Generate stunning videos from text descriptions using AI.",
    samples: [
      { title: "Cinematic Landscape", model: "Hailuo 2.3", video: "/sample-video.mp4", color: "7c3aed" },
      { title: "Urban Night Scene", model: "Hailuo 2.3", video: "/sample-video.mp4", color: "2563eb" },
      { title: "Ocean Waves", model: "Nano Banana", video: "/sample-video.mp4", color: "0891b2" },
      { title: "Mountain Sunrise", model: "Hailuo 2.3", video: "/sample-video.mp4", color: "059669" },
    ],
  },
  {
    name: "Image to Video",
    desc: "Bring your images to life with AI-powered animation.",
    samples: [
      { title: "Photo Animation", model: "Hailuo 2.3", video: "/sample-video.mp4", color: "d97706" },
      { title: "Portrait Motion", model: "Hailuo 2.3", video: "/sample-video.mp4", color: "dc2626" },
      { title: "Product Showcase", model: "Nano Banana", video: "/sample-video.mp4", color: "7c3aed" },
      { title: "Nature Breathe", model: "Hailuo 2.3", video: "/sample-video.mp4", color: "059669" },
    ],
  },
  {
    name: "Text to Image",
    desc: "Create beautiful images from text prompts.",
    samples: [
      { title: "Digital Art", model: "GPT Image 2", video: "/sample-video.mp4", color: "7c3aed" },
      { title: "Product Design", model: "GPT Image 2", video: "/sample-video.mp4", color: "2563eb" },
      { title: "Character Design", model: "GPT Image 2", video: "/sample-video.mp4", color: "d97706" },
      { title: "Abstract Art", model: "GPT Image 2", video: "/sample-video.mp4", color: "dc2626" },
    ],
  },
];
