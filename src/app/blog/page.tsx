import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Latest news, tutorials, and insights about AI video generation.",
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-neutral-950">
      <section className="text-center pt-24 pb-12 px-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog</h1>
        <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
          Latest news, tutorials, and insights about AI video generation.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <article key={post.title} className="bg-neutral-900/40 border border-neutral-800/50 rounded-2xl overflow-hidden hover:border-violet-500/20 transition-colors cursor-pointer group">
              <div className="aspect-video bg-gradient-to-br from-violet-500/10 to-indigo-500/10 flex items-center justify-center">
                <span className="text-xs text-neutral-400 bg-neutral-800/50 px-3 py-1 rounded-full">{post.category}</span>
              </div>
              <div className="p-6">
                <div className="text-xs text-neutral-500 mb-2">{post.date}</div>
                <h2 className="text-lg font-semibold text-white mb-2 group-hover:text-violet-400 transition-colors">
                  {post.title}
                </h2>
                <p className="text-sm text-neutral-400 line-clamp-2">{post.excerpt}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

const posts = [
  {
    title: "Getting Started with AI Video Generation",
    excerpt: "Learn the basics of creating stunning videos using AI models. We cover prompt writing, style selection, and best practices.",
    category: "Tutorial",
    date: "May 1, 2026",
  },
  {
    title: "Comparing Top AI Video Models in 2026",
    excerpt: "A detailed comparison of Kling 2.0, Google Veo 3, Runway, and other leading video generation models.",
    category: "Comparison",
    date: "April 25, 2026",
  },
  {
    title: "How to Create Viral Social Media Content with AI",
    excerpt: "Tips and tricks for generating scroll-stopping video content for TikTok, Instagram, and YouTube using AI tools.",
    category: "Guide",
    date: "April 18, 2026",
  },
  {
    title: "The Future of AI in Video Production",
    excerpt: "Exploring how AI is transforming the video production industry and what creators can expect in the coming years.",
    category: "Insights",
    date: "April 10, 2026",
  },
];
