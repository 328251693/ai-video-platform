import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Outpainting",
  description: "Extend your video frames beyond the original boundaries.",
};

export default function OutpaintingPage() {
  return (
    <div className="min-h-screen bg-neutral-950">
      <section className="text-center pt-24 pb-12 px-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">AI Outpainting</h1>
        <p className="text-neutral-400 text-lg mb-8 max-w-2xl mx-auto">
          Extend your video frames beyond the original boundaries
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-neutral-900/40 border border-neutral-800/50 rounded-2xl p-6">
            <h3 className="font-medium text-white mb-4">Original Video</h3>
            <div className="aspect-video bg-neutral-950/80 rounded-xl border border-neutral-800/50 flex items-center justify-center">
              <div className="text-center">
                <svg className="w-10 h-10 text-neutral-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-neutral-600 text-sm">Upload video</p>
              </div>
            </div>
          </div>
          <div className="bg-neutral-900/40 border border-neutral-800/50 rounded-2xl p-6">
            <h3 className="font-medium text-white mb-4">Expanded Result</h3>
            <div className="aspect-video bg-neutral-950/80 rounded-xl border border-neutral-800/50 flex items-center justify-center">
              <p className="text-neutral-600 text-sm">Result preview</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
