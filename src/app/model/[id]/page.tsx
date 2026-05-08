import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

const modelsData: Record<string, {
  name: string;
  provider: string;
  icon: string;
  rating: number;
  description: string;
  longDescription: string;
  tags: string[];
  maxDuration: string;
  resolution: string;
  aspectRatio: string;
  style: string;
  features: { title: string; desc: string; icon: string }[];
  examples: { title: string }[];
}> = {
  "MiniMax-Hailuo-2.3": {
    name: "MiniMax Hailuo 2.3",
    provider: "Apimart",
    icon: "🎬",
    rating: 4.8,
    description: "Hailuo 2.3 视频生成模型",
    longDescription: "MiniMax Hailuo 2.3 是一款强大的视频生成模型，支持6秒和10秒时长，768p/1080p分辨率，以及15种运镜指令。通过 Apimart 平台提供服务。",
    tags: ["Text to Video", "Image to Video", "768p", "1080p", "运镜指令"],
    maxDuration: "10s",
    resolution: "768p / 1080p",
    aspectRatio: "16:9, 9:16, 1:1",
    style: "Cinematic, Realistic, Animation",
    features: [
      { title: "视频生成", desc: "从文本描述创建高质量视频内容。", icon: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" },
      { title: "图生视频", desc: "以图片作为起始帧生成视频。", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
      { title: "运镜指令", desc: "支持15种运镜指令，精确控制镜头运动。", icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" },
      { title: "高清输出", desc: "支持768p和1080p分辨率输出。", icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" },
    ],
    examples: [
      { title: "一只可爱的猫咪在草地上奔跑" },
      { title: "城市夜景，霓虹灯闪烁" },
      { title: "[推进]镜头缓缓推进特写" },
      { title: "海浪拍打沙滩，日落时分" },
    ],
  },
  "MiniMax-Hailuo-2.3-Fast": {
    name: "MiniMax Hailuo 2.3 Fast",
    provider: "Apimart",
    icon: "⚡",
    rating: 4.7,
    description: "Hailuo 2.3 Fast 快速视频生成",
    longDescription: "MiniMax Hailuo 2.3 Fast 是 Hailuo 2.3 的快速版本，需要提供首帧图片，生成速度更快。",
    tags: ["Image to Video", "Fast", "768p"],
    maxDuration: "10s",
    resolution: "768p / 1080p",
    aspectRatio: "16:9, 9:16, 1:1",
    style: "Cinematic, Realistic",
    features: [
      { title: "图生视频", desc: "以图片作为起始帧生成视频（必须提供）。", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
      { title: "快速生成", desc: "比标准版更快的生成速度。", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
      { title: "高清输出", desc: "支持768p和1080p分辨率输出。", icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" },
      { title: "异步API", desc: "提交任务后轮询查询结果。", icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" },
    ],
    examples: [
      { title: "以猫咪图片生成奔跑视频" },
      { title: "以风景照片生成动态视频" },
      { title: "以人物照片生成动作视频" },
      { title: "以产品图片生成展示视频" },
    ],
  },
  "nano-banana": {
    name: "Nano Banana",
    provider: "Grsai",
    icon: "🍌",
    rating: 4.7,
    description: "AI video generation model via Grsai proxy",
    longDescription: "Nano Banana is a video generation model accessible through the Grsai unified proxy API. Supports text-to-video and image-to-video generation with competitive quality.",
    tags: ["Text to Video", "Image to Video", "Fast"],
    maxDuration: "10s",
    resolution: "Up to 1280x720",
    aspectRatio: "16:9, 9:16, 1:1",
    style: "Cinematic, Realistic, Animation",
    features: [
      { title: "Video Generation", desc: "Create videos from text descriptions via Grsai proxy.", icon: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" },
      { title: "Image to Video", desc: "Animate static images into dynamic video content.", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
      { title: "Fast Processing", desc: "Quick generation times for rapid iteration.", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
      { title: "Async API", desc: "Submit and poll for results via REST API.", icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" },
    ],
    examples: [
      { title: "Cinematic landscape at golden hour" },
      { title: "Product showcase with rotation" },
      { title: "Dance performance in neon lighting" },
      { title: "Ocean waves in slow motion" },
    ],
  },
  "gpt-image-2": {
    name: "GPT Image 2",
    provider: "Grsai",
    icon: "🖼️",
    rating: 4.8,
    description: "AI image generation model via Grsai proxy",
    longDescription: "GPT Image 2 is an image generation model accessible through the Grsai unified proxy API. Creates high-quality images from text descriptions with various style options.",
    tags: ["Text to Image", "High Quality", "Versatile"],
    maxDuration: "N/A",
    resolution: "Up to 1024x1792",
    aspectRatio: "1:1, 16:9, 9:16",
    style: "Photorealistic, Digital Art, Anime, Oil Painting",
    features: [
      { title: "Image Generation", desc: "Create stunning images from text descriptions.", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
      { title: "Multiple Styles", desc: "Support for photorealistic, digital art, anime, and more.", icon: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" },
      { title: "High Resolution", desc: "Generate images up to 1024x1792 resolution.", icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" },
      { title: "Async API", desc: "Submit and poll for results via REST API.", icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" },
    ],
    examples: [
      { title: "Beautiful sunset over the ocean" },
      { title: "Futuristic city skyline" },
      { title: "Portrait in anime style" },
      { title: "Abstract digital art" },
    ],
  },
  kling: {
    name: "Kling 2.0",
    provider: "Kuaishou",
    icon: "⚡",
    rating: 4.8,
    description: "High-quality video generation with fast processing",
    longDescription: "Kling 2.0 is Kuaishou's latest video generation model, offering exceptional quality with rapid processing times. Perfect for social media content, product showcases, and creative projects.",
    tags: ["Text to Video", "Image to Video", "Fast", "High Quality"],
    maxDuration: "10s",
    resolution: "Up to 4K",
    aspectRatio: "16:9, 9:16, 1:1",
    style: "Cinematic, Realistic, Animation",
    features: [
      { title: "Video Generation", desc: "Create stunning videos from text descriptions with high fidelity.", icon: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" },
      { title: "Image Generation", desc: "Generate high-quality images from text prompts.", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
      { title: "Text to Video", desc: "Transform written descriptions into dynamic video content.", icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" },
      { title: "4K Output", desc: "Export in stunning 4K resolution for professional use.", icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" },
    ],
    examples: [
      { title: "Cinematic landscape at golden hour" },
      { title: "Product showcase with rotation" },
      { title: "Dance performance in neon lighting" },
      { title: "Ocean waves in slow motion" },
    ],
  },
  minimax: {
    name: "MiniMax",
    provider: "MiniMax",
    icon: "🎯",
    rating: 4.7,
    description: "Versatile AI model for video and image generation",
    longDescription: "MiniMax offers a comprehensive suite of AI generation capabilities, from text-to-video to image generation. Known for its versatility and consistent output quality.",
    tags: ["Text to Video", "Image to Video", "Versatile"],
    maxDuration: "6s",
    resolution: "Up to 1080p",
    aspectRatio: "16:9, 9:16, 1:1",
    style: "Realistic, Animation, 3D",
    features: [
      { title: "Video Generation", desc: "Create stunning videos from text descriptions with high fidelity.", icon: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" },
      { title: "Image Generation", desc: "Generate high-quality images from text prompts.", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
      { title: "Text to Video", desc: "Transform written descriptions into dynamic video content.", icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" },
      { title: "4K Output", desc: "Export in stunning 4K resolution for professional use.", icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" },
    ],
    examples: [
      { title: "Abstract art animation" },
      { title: "Nature documentary style" },
      { title: "Product demo video" },
      { title: "Character animation" },
    ],
  },
  hailuo: {
    name: "Hailuo 02",
    provider: "MiniMax",
    icon: "🌊",
    rating: 4.6,
    description: "Next-gen video generation with Hailuo technology",
    longDescription: "Hailuo 02 represents the cutting edge of video generation technology from MiniMax. It excels at creating natural, fluid motion with exceptional detail.",
    tags: ["Text to Video", "Natural Motion", "High Quality"],
    maxDuration: "6s",
    resolution: "Up to 1080p",
    aspectRatio: "16:9, 9:16",
    style: "Cinematic, Realistic",
    features: [
      { title: "Video Generation", desc: "Create stunning videos from text descriptions with high fidelity.", icon: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" },
      { title: "Image Generation", desc: "Generate high-quality images from text prompts.", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
      { title: "Text to Video", desc: "Transform written descriptions into dynamic video content.", icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" },
      { title: "4K Output", desc: "Export in stunning 4K resolution for professional use.", icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" },
    ],
    examples: [
      { title: "Flowing water in slow motion" },
      { title: "Person walking in park" },
      { title: "Sunset timelapse" },
      { title: "Pet playing in garden" },
    ],
  },
  veo: {
    name: "Google Veo 3",
    provider: "Google",
    icon: "🔮",
    rating: 4.9,
    description: "Google's most advanced video generation model",
    longDescription: "Google Veo 3 is Google's flagship video generation model, offering state-of-the-art quality with deep understanding of physics, lighting, and human motion.",
    tags: ["Text to Video", "Image to Video", "4K", "Advanced"],
    maxDuration: "8s",
    resolution: "Up to 4K",
    aspectRatio: "16:9, 9:16, 1:1",
    style: "Cinematic, Realistic, 3D",
    features: [
      { title: "Video Generation", desc: "Create stunning videos from text descriptions with high fidelity.", icon: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" },
      { title: "Image Generation", desc: "Generate high-quality images from text prompts.", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
      { title: "Text to Video", desc: "Transform written descriptions into dynamic video content.", icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" },
      { title: "4K Output", desc: "Export in stunning 4K resolution for professional use.", icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" },
    ],
    examples: [
      { title: "Cinematic aerial shot of city" },
      { title: "Nature documentary scene" },
      { title: "Product commercial style" },
      { title: "Artistic abstract visuals" },
    ],
  },
  wan: {
    name: "Wan 2.1",
    provider: "Alibaba",
    icon: "🌐",
    rating: 4.5,
    description: "Alibaba's powerful open-source video model",
    longDescription: "Wan 2.1 is Alibaba's open-source video generation model that delivers competitive quality with fast processing. Great for a wide range of creative applications.",
    tags: ["Text to Video", "Open Source", "Fast"],
    maxDuration: "5s",
    resolution: "Up to 1080p",
    aspectRatio: "16:9, 9:16, 1:1",
    style: "Realistic, Animation",
    features: [
      { title: "Video Generation", desc: "Create stunning videos from text descriptions with high fidelity.", icon: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" },
      { title: "Image Generation", desc: "Generate high-quality images from text prompts.", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
      { title: "Text to Video", desc: "Transform written descriptions into dynamic video content.", icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" },
      { title: "4K Output", desc: "Export in stunning 4K resolution for professional use.", icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" },
    ],
    examples: [
      { title: "Street scene with people" },
      { title: "Food preparation video" },
      { title: "Travel vlog style" },
      { title: "Dance performance" },
    ],
  },
  runway: {
    name: "Runway",
    provider: "Runway",
    icon: "🎥",
    rating: 4.8,
    description: "Cinematic-quality video generation",
    longDescription: "Runway's Gen-3 Alpha represents a significant leap in video generation technology. It offers unprecedented control over motion, camera angles, and artistic style.",
    tags: ["Text to Video", "Image to Video", "Cinematic", "Professional"],
    maxDuration: "10s",
    resolution: "Up to 4K",
    aspectRatio: "16:9, 9:16, 1:1",
    style: "Cinematic, Realistic, Artistic",
    features: [
      { title: "Video Generation", desc: "Create stunning videos from text descriptions with high fidelity.", icon: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" },
      { title: "Image Generation", desc: "Generate high-quality images from text prompts.", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
      { title: "Text to Video", desc: "Transform written descriptions into dynamic video content.", icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" },
      { title: "4K Output", desc: "Export in stunning 4K resolution for professional use.", icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" },
    ],
    examples: [
      { title: "Slow motion coffee pour" },
      { title: "Aerial cityscape at dusk" },
      { title: "Fashion editorial style" },
      { title: "Nature close-up details" },
    ],
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const model = modelsData[id];
  if (!model) return { title: "Model Not Found" };
  return {
    title: `${model.name} - AI Video Model`,
    description: model.description,
  };
}

export default async function ModelDetailPage({ params }: Props) {
  const { id } = await params;
  const model = modelsData[id];

  if (!model) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-b from-violet-500/10 via-neutral-950 to-neutral-950 pt-20 pb-12 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-neutral-500 mb-8">
            <Link href="/" className="hover:text-neutral-300 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/models" className="hover:text-neutral-300 transition-colors">Models</Link>
            <span>/</span>
            <span className="text-neutral-300">{model.name}</span>
          </nav>

          <div className="flex items-start gap-6">
            <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center text-4xl border border-violet-500/20">
              {model.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold text-white">{model.name}</h1>
                <div className="flex items-center gap-1 text-yellow-500">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.973 10.872c-.784-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="font-medium text-white">{model.rating}</span>
                </div>
              </div>
              <p className="text-neutral-500 mb-2">{model.provider}</p>
              <p className="text-neutral-400 max-w-2xl leading-relaxed">{model.longDescription}</p>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-6">
            {model.tags.map((tag) => (
              <span key={tag} className="px-3 py-1.5 bg-neutral-800/50 border border-neutral-700/50 text-neutral-300 text-sm rounded-lg">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Example Videos */}
      <section className="px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-semibold text-white mb-6">Example Videos</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {model.examples.map((ex, i) => (
              <div key={i} className="group bg-neutral-900/40 border border-neutral-800/50 rounded-xl overflow-hidden hover:border-violet-500/20 transition-colors cursor-pointer">
                <div className="aspect-video bg-gradient-to-br from-violet-500/10 to-indigo-500/10 flex items-center justify-center">
                  <svg className="w-10 h-10 text-neutral-700 group-hover:text-violet-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <div className="p-3">
                  <p className="text-xs text-neutral-400 truncate">{ex.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="px-4 py-12 bg-gradient-to-b from-neutral-950 via-neutral-900/20 to-neutral-950">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-semibold text-white mb-6">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {model.features.map((f) => (
              <div key={f.title} className="flex items-start gap-4 bg-neutral-900/40 border border-neutral-800/50 rounded-xl p-5 hover:border-violet-500/20 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-violet-500/15 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={f.icon} />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{f.title}</h3>
                  <p className="text-sm text-neutral-400">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-semibold text-white mb-6">Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {modelPricing.map((plan) => (
              <div key={plan.name} className={`bg-neutral-900/40 border rounded-xl p-6 ${plan.popular ? "border-violet-500/50 ring-1 ring-violet-500/20" : "border-neutral-800/50"}`}>
                {plan.popular && (
                  <div className="inline-block px-2 py-0.5 bg-violet-600 text-white text-xs font-medium rounded mb-3">Popular</div>
                )}
                <h3 className="text-lg font-semibold text-white mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  {plan.period && <span className="text-neutral-500 text-sm">{plan.period}</span>}
                </div>
                <ul className="space-y-2 mb-5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-neutral-300">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/login" className={`block w-full py-2.5 rounded-xl text-center text-sm font-medium transition-colors ${plan.popular ? "bg-violet-600 text-white hover:bg-violet-500" : "bg-neutral-800 text-neutral-200 hover:bg-neutral-700"}`}>
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Model Features Table */}
      <section className="px-4 py-12 bg-gradient-to-b from-neutral-950 via-neutral-900/20 to-neutral-950">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-semibold text-white mb-6">Model Features</h2>
          <div className="bg-neutral-900/40 border border-neutral-800/50 rounded-xl overflow-hidden">
            {[
              { label: "Max Duration", value: model.maxDuration },
              { label: "Resolution", value: model.resolution },
              { label: "Aspect Ratio", value: model.aspectRatio },
              { label: "Style", value: model.style },
            ].map((row, i, arr) => (
              <div key={row.label} className={`flex items-center justify-between px-6 py-4 ${i < arr.length - 1 ? "border-b border-neutral-800/50" : ""}`}>
                <span className="text-neutral-400">{row.label}</span>
                <span className="text-white font-medium">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row gap-4">
          <Link
            href={`/generate?model=${id}`}
            className="flex-1 py-3.5 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-500 transition-colors text-center"
          >
            Generate with {model.name}
          </Link>
          <Link
            href="/models"
            className="px-6 py-3.5 border border-neutral-700 text-neutral-300 rounded-xl hover:bg-neutral-800/50 transition-colors text-center"
          >
            Back to Models
          </Link>
        </div>
      </section>
    </div>
  );
}

const modelPricing = [
  {
    name: "Free",
    price: "$0",
    period: "",
    popular: false,
    features: ["50 credits/month", "720p quality", "Standard processing", "5 videos/day"],
  },
  {
    name: "Pro",
    price: "$29.99",
    period: "/mo",
    popular: true,
    features: ["2000 credits/month", "4K quality", "Priority processing", "Unlimited videos", "API access"],
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    popular: false,
    features: ["Unlimited credits", "Custom models", "Dedicated support", "SLA guarantee"],
  },
];
