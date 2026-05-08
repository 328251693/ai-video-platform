import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare Video AI",
  description: "Compare different AI video generation models side by side.",
};

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-neutral-950">
      <section className="text-center pt-24 pb-12 px-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Compare Video AI</h1>
        <p className="text-neutral-400 text-lg mb-8 max-w-2xl mx-auto">
          Compare different AI video generation models side by side
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="aspect-video bg-neutral-900/40 border border-neutral-800/50 rounded-2xl flex items-center justify-center">
            <div className="text-center">
              <svg className="w-16 h-16 text-neutral-700 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-neutral-600 text-sm">Select models to compare</p>
            </div>
          </div>

          <div className="bg-neutral-900/40 border border-neutral-800/50 rounded-2xl overflow-hidden">
            <div className="p-4">
              <button className="w-full py-2.5 bg-violet-600 text-white font-medium rounded-xl hover:bg-violet-500 transition-colors mb-4">
                Compare Now
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-800/50">
                    <th className="text-left p-3 text-xs font-medium text-neutral-500 w-10">
                      <input type="checkbox" className="w-4 h-4 accent-violet-500" />
                    </th>
                    <th className="text-left p-3 text-xs font-medium text-neutral-500">Model</th>
                    <th className="text-left p-3 text-xs font-medium text-neutral-500">Provider</th>
                    <th className="text-left p-3 text-xs font-medium text-neutral-500">Resolution</th>
                    <th className="text-left p-3 text-xs font-medium text-neutral-500">Max Duration</th>
                    <th className="text-left p-3 text-xs font-medium text-neutral-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {compareModels.map((model) => (
                    <tr key={model.name} className="border-b border-neutral-800/50 last:border-0 hover:bg-neutral-800/20">
                      <td className="p-3"><input type="checkbox" className="w-4 h-4 accent-violet-500" /></td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{model.icon}</span>
                          <span className="text-sm font-medium text-neutral-200">{model.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-neutral-400">{model.provider}</td>
                      <td className="p-3 text-sm text-neutral-400">{model.resolution}</td>
                      <td className="p-3 text-sm text-neutral-400">{model.maxDuration}</td>
                      <td className="p-3">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/15 text-green-400">{model.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const compareModels = [
  { name: "Kling 2.0", provider: "Kuaishou", icon: "⚡", resolution: "1920x1080", maxDuration: "10s", status: "online" },
  { name: "MiniMax", provider: "MiniMax", icon: "🎯", resolution: "1280x720", maxDuration: "6s", status: "online" },
  { name: "Hailuo 02", provider: "MiniMax", icon: "🌊", resolution: "1280x720", maxDuration: "6s", status: "online" },
  { name: "Google Veo 3", provider: "Google", icon: "🔮", resolution: "1920x1080", maxDuration: "8s", status: "online" },
  { name: "Wan 2.1", provider: "Alibaba", icon: "🌐", resolution: "1920x1080", maxDuration: "5s", status: "online" },
  { name: "Runway", provider: "Runway", icon: "🎥", resolution: "1920x1080", maxDuration: "10s", status: "online" },
];
