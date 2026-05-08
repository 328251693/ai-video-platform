import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for AI Video Platform.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="max-w-3xl mx-auto px-4 pt-24 pb-20">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <div className="prose prose-invert prose-neutral max-w-none space-y-6 text-neutral-300 leading-relaxed">
          <p className="text-sm text-neutral-500">Last updated: May 6, 2026</p>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly, including your email address, name, and payment information when you create an account or purchase credits.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-3">2. How We Use Your Information</h2>
            <p>We use your information to provide and improve our AI video generation services, process transactions, and communicate with you about your account.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-3">3. Content and Prompts</h2>
            <p>Prompts and generated content are processed to provide our services. We may use anonymized data to improve our AI models. You retain ownership of your generated content.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-3">4. Data Sharing</h2>
            <p>We do not sell your personal data. We share data only with service providers necessary to operate our platform, such as payment processors and cloud infrastructure providers.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-3">5. Data Security</h2>
            <p>We implement industry-standard security measures to protect your data, including encryption in transit and at rest.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-3">6. Your Rights</h2>
            <p>You can access, update, or delete your account data at any time. Contact us at privacy@aivideoplatform.com for data requests.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-3">7. Cookies</h2>
            <p>We use essential cookies to maintain your session and preferences. We do not use tracking cookies for advertising.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-3">8. Contact Us</h2>
            <p>For privacy-related questions, contact us at privacy@aivideoplatform.com.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
