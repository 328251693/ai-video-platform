import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for AI Video Platform.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="max-w-3xl mx-auto px-4 pt-24 pb-20">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <div className="prose prose-invert prose-neutral max-w-none space-y-6 text-neutral-300 leading-relaxed">
          <p className="text-sm text-neutral-500">Last updated: May 6, 2026</p>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using AI Video Platform, you agree to be bound by these Terms of Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-3">2. Description of Service</h2>
            <p>AI Video Platform provides AI-powered video, image, and audio generation tools. We aggregate multiple AI models to provide a unified creation experience.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-3">3. User Accounts</h2>
            <p>You are responsible for maintaining the security of your account. You must provide accurate information when creating an account.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-3">4. Credits and Payments</h2>
            <p>Credits are required to generate content. Credits are non-refundable except where required by law. Prices may change with notice.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-3">5. Content Ownership</h2>
            <p>You own all content you generate using our platform. You are responsible for ensuring your content complies with applicable laws.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-3">6. Prohibited Use</h2>
            <p>You may not use our platform to generate, upload, request, or distribute content that is illegal, harmful, threatening, abusive, defamatory, deceptive, or violates the rights of others.</p>
            <p>You must not use the platform to generate NSFW content, sexually explicit content, pornography, sexualized or sexually suggestive content, or any content depicting or sexualizing minors. You must also not use the platform for sexual exploitation, non-consensual intimate imagery, impersonation, deepfakes, or face manipulation.</p>
            <p>We use automated content moderation and may block prompts, cancel generations, suspend accounts, or remove content that violates this section or our Acceptable Use Policy. Attempts to bypass moderation are prohibited.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-3">7. Limitation of Liability</h2>
            <p>Our liability is limited to the amount you paid for the service in the 12 months preceding the claim.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-3">8. Contact</h2>
            <p>For questions about these terms or our content policies, contact us at support@aividox.com.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
