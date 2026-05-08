import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Clips",
  description: "Generate short video clips from text prompts.",
};

export default function ClipsPage() {
  return (
    <div className="min-h-screen bg-neutral-950">
      <section className="text-center pt-24 pb-12 px-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">AI Clips</h1>
        <p className="text-neutral-400 text-lg mb-8 max-w-2xl mx-auto">
          Generate short video clips from text prompts
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-neutral-900/40 border border-neutral-800/50 rounded-2xl overflow-hidden group hover:border-violet-500/20 transition-all">
              <div className="aspect-video bg-gradient-to-br from-violet-500/10 to-indigo-500/10 flex items-center justify-center">
                <svg className="w-12 h-12 text-neutral-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-white mb-1">Sample Clip {i}</h3>
                <p className="text-sm text-neutral-500">AI-generated video clip</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
