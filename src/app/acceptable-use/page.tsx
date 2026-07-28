import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acceptable Use Policy",
  description: "Acceptable Use Policy for FrameForge.",
};

export default function AcceptableUsePage() {
  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="max-w-3xl mx-auto px-4 pt-24 pb-20">
        <h1 className="text-4xl font-bold mb-8">Acceptable Use Policy</h1>
        <div className="prose prose-invert prose-neutral max-w-none space-y-6 text-neutral-300 leading-relaxed">
          <p className="text-sm text-neutral-500">Last updated: July 28, 2026</p>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-3">1. Purpose</h2>
            <p>This policy explains the content and activities that are not allowed when using FrameForge. It applies to prompts, uploaded media, generated content, and all image and video generation features.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-3">2. Prohibited Content</h2>
            <p>You must not use FrameForge to generate, upload, or distribute illegal, harmful, abusive, threatening, hateful, deceptive, or rights-infringing content.</p>
            <p>NSFW content, pornography, sexually explicit content, sexually suggestive content, sexual exploitation, and any content that depicts or sexualizes minors are strictly prohibited.</p>
            <p>Non-consensual intimate imagery, impersonation, deepfakes, face swaps, and face manipulation are also prohibited.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-3">3. Moderation and Enforcement</h2>
            <p>Prompts submitted to image and video generation features are screened before they are sent to an AI model. We may block or flag requests, remove generated content, suspend accounts, and cooperate with lawful requests when necessary to enforce this policy.</p>
            <p>Do not attempt to evade, disable, or circumvent content moderation or other platform safeguards.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-3">4. Reporting and Contact</h2>
            <p>To report prohibited content or ask questions about this policy, contact us at support@aividox.com.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
