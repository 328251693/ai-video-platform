import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Models",
  description: "Choose from 10+ cutting-edge AI video models for your creative projects.",
};

export default function ModelsPage() {
  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Hero */}
      <section className="text-center pt-24 pb-12 px-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          AI Models
        </h1>
        <p className="text-neutral-400 text-lg mb-8 max-w-2xl mx-auto">
          Choose from 10+ cutting-edge AI video models, each optimized for different styles and use cases.
        </p>

        {/* Filter */}
        <div className="flex justify-center gap-2 flex-wrap">
          {["All", "Video", "Image", "Audio"].map((filter, i) => (
            <button
              key={filter}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                i === 0
                  ? "bg-violet-600 text-white"
                  : "bg-neutral-800/50 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700/50"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </section>

      {/* Model Grid */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {models.map((model) => (
            <Link
              key={model.id}
              href={`/model/${model.id}`}
              className="group bg-neutral-900/40 border border-neutral-800/50 rounded-2xl overflow-hidden hover:border-violet-500/20 transition-all"
            >
              {/* Thumbnail */}
              <div className="aspect-video bg-gradient-to-br from-violet-500/10 to-indigo-500/10 flex items-center justify-center relative">
                <div className="text-5xl">{model.icon}</div>
                <div className="absolute top-3 right-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    model.status === "online"
                      ? "bg-green-500/15 text-green-400"
                      : "bg-neutral-700/50 text-neutral-400"
                  }`}>
                    {model.status}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-white group-hover:text-violet-400 transition-colors">
                    {model.name}
                  </h3>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.973 10.872c-.784-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm">{model.rating}</span>
                  </div>
                </div>

                <p className="text-sm text-neutral-500 mb-2">{model.provider}</p>
                <p className="text-sm text-neutral-400 mb-4 line-clamp-2">
                  {model.description}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {model.tags.map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-neutral-800/50 border border-neutral-700/50 text-neutral-400 text-xs rounded-lg">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-neutral-800/50">
                  <span className="text-sm text-neutral-500">{model.pricing}</span>
                  <span className="text-sm text-violet-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Try now
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

const models = [
  {
    id: "MiniMax-Hailuo-2.3",
    name: "MiniMax Hailuo 2.3",
    provider: "Apimart",
    icon: "🎬",
    rating: 4.8,
    description: "Hailuo 2.3 视频生成模型，支持6秒和10秒，768p/1080p分辨率，15种运镜指令。",
    tags: ["Text to Video", "Image to Video", "768p", "1080p"],
    status: "online",
    pricing: "From 30 credits",
  },
  {
    id: "MiniMax-Hailuo-2.3-Fast",
    name: "MiniMax Hailuo 2.3 Fast",
    provider: "Apimart",
    icon: "⚡",
    rating: 4.7,
    description: "Hailuo 2.3 Fast 快速视频生成模型，需要提供首帧图片。",
    tags: ["Image to Video", "Fast", "768p"],
    status: "online",
    pricing: "From 25 credits",
  },
  {
    id: "nano-banana",
    name: "Nano Banana",
    provider: "Grsai",
    icon: "🍌",
    rating: 4.6,
    description: "AI video generation model via Grsai proxy.",
    tags: ["Text to Video", "Image to Video"],
    status: "online",
    pricing: "From 20 credits",
  },
  {
    id: "gpt-image-2",
    name: "GPT Image 2",
    provider: "Grsai",
    icon: "🖼️",
    rating: 4.7,
    description: "AI image generation model via Grsai proxy.",
    tags: ["Text to Image", "High Quality"],
    status: "online",
    pricing: "From 5 credits",
  },
  {
    id: "kling",
    name: "Kling 2.0",
    provider: "Kuaishou",
    icon: "⚡",
    rating: 4.8,
    description: "High-quality video generation with fast processing. Perfect for social media content.",
    tags: ["Text to Video", "Image to Video", "4K"],
    status: "coming_soon",
    pricing: "From 2 credits",
  },
  {
    id: "veo",
    name: "Google Veo 3",
    provider: "Google",
    icon: "🔮",
    rating: 4.9,
    description: "Google's most advanced video generation model with state-of-the-art quality.",
    tags: ["Text to Video", "4K", "Advanced"],
    status: "coming_soon",
    pricing: "From 5 credits",
  },
  {
    id: "wan",
    name: "Wan 2.1",
    provider: "Alibaba",
    icon: "🌐",
    rating: 4.5,
    description: "Alibaba's powerful open-source video model with competitive quality.",
    tags: ["Text to Video", "Open Source"],
    status: "coming_soon",
    pricing: "From 2 credits",
  },
  {
    id: "runway",
    name: "Runway",
    provider: "Runway",
    icon: "🎥",
    rating: 4.8,
    description: "Cinematic-quality video generation with unprecedented control over motion and style.",
    tags: ["Text to Video", "Cinematic", "Professional"],
    status: "coming_soon",
    pricing: "From 4 credits",
  },
];
