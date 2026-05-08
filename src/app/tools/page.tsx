import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Toolbox",
  description: "Powerful AI tools for video editing and enhancement.",
};

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-neutral-950">
      <section className="text-center pt-24 pb-12 px-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">AI Toolbox</h1>
        <p className="text-neutral-400 text-lg mb-8 max-w-2xl mx-auto">
          Powerful AI tools for video editing and enhancement
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tools.map((tool) => (
            <div key={tool.name} className="bg-neutral-900/40 border border-neutral-800/50 rounded-2xl p-6 hover:border-violet-500/20 transition-all cursor-pointer group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center text-2xl mb-5 group-hover:from-violet-500/30 group-hover:to-indigo-500/30 transition-colors">
                {tool.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{tool.name}</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">{tool.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const tools = [
  { name: "Video Upscaler", icon: "🔍", description: "Enhance video resolution up to 4K using AI-powered upscaling technology." },
  { name: "Background Remover", icon: "✂️", description: "Remove or replace video backgrounds automatically with precision." },
  { name: "Style Transfer", icon: "🎨", description: "Apply artistic styles to your videos, transforming them into unique visual experiences." },
  { name: "Motion Interpolation", icon: "⏱️", description: "Increase video frame rate smoothly for buttery-smooth playback." },
  { name: "Color Grading", icon: "🎭", description: "AI-powered color correction and grading for professional-looking results." },
  { name: "Audio Sync", icon: "🎵", description: "Synchronize audio with video automatically for perfect lip-sync." },
];
