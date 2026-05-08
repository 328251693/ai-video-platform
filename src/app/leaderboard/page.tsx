import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leaderboard",
  description: "Top-ranked AI video generation models.",
};

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-neutral-950">
      <section className="pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Leaderboard</h1>
          <p className="text-neutral-400 text-lg mb-8">
            Top-ranked AI video generation models
          </p>

          <div className="flex gap-1 bg-neutral-900/60 border border-neutral-800/50 p-1 rounded-xl w-fit mb-8">
            <button className="px-5 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium">Text to Video</button>
            <button className="px-5 py-2 text-neutral-400 hover:text-neutral-200 rounded-lg text-sm">Image to Video</button>
          </div>

          <div className="bg-neutral-900/40 border border-neutral-800/50 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-800/50">
                    <th className="text-left p-4 text-xs font-medium text-neutral-500">Rank</th>
                    <th className="text-left p-4 text-xs font-medium text-neutral-500">Model</th>
                    <th className="text-left p-4 text-xs font-medium text-neutral-500">Provider</th>
                    <th className="text-center p-4 text-xs font-medium text-neutral-500">Quality</th>
                    <th className="text-center p-4 text-xs font-medium text-neutral-500">Prompt</th>
                    <th className="text-center p-4 text-xs font-medium text-neutral-500">Motion</th>
                    <th className="text-center p-4 text-xs font-medium text-neutral-500">Popularity</th>
                    <th className="text-right p-4 text-xs font-medium text-neutral-500">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((item) => (
                    <tr key={item.rank} className="border-b border-neutral-800/50 last:border-0 hover:bg-neutral-800/20">
                      <td className="p-4 text-sm font-medium text-neutral-300">#{item.rank}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{item.icon}</span>
                          <span className="text-sm font-medium text-neutral-200">{item.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-neutral-400">{item.provider}</td>
                      <td className="p-4 text-center">
                        <div className="inline-flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-yellow-500 fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.973 10.872c-.784-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-sm">{item.quality}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center text-sm text-neutral-300">{item.prompt}</td>
                      <td className="p-4 text-center text-sm text-neutral-300">{item.motion}</td>
                      <td className="p-4 text-center text-sm text-neutral-300">{item.popularity}</td>
                      <td className="p-4 text-right">
                        <Link href={`/model/${item.id}`} className="text-xs text-violet-400 hover:underline">Review →</Link>
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

const leaderboard = [
  { rank: 1, id: "veo", name: "Google Veo 3", provider: "Google", icon: "🔮", quality: 9.8, prompt: 9.5, motion: 9.6, popularity: 10 },
  { rank: 2, id: "kling", name: "Kling 2.0", provider: "Kuaishou", icon: "⚡", quality: 9.5, prompt: 9.2, motion: 9.3, popularity: 9.8 },
  { rank: 3, id: "runway", name: "Runway", provider: "Runway", icon: "🎥", quality: 9.4, prompt: 9.1, motion: 9.2, popularity: 9.6 },
  { rank: 4, id: "minimax", name: "MiniMax", provider: "MiniMax", icon: "🎯", quality: 9.3, prompt: 9.0, motion: 9.1, popularity: 9.4 },
  { rank: 5, id: "hailuo", name: "Hailuo 02", provider: "MiniMax", icon: "🌊", quality: 9.2, prompt: 8.9, motion: 9.0, popularity: 9.2 },
  { rank: 6, id: "wan", name: "Wan 2.1", provider: "Alibaba", icon: "🌐", quality: 9.0, prompt: 8.8, motion: 8.9, popularity: 9.0 },
];
