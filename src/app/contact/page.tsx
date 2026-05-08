import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the AI Video Platform team.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="max-w-2xl mx-auto px-4 pt-24 pb-20">
        <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
        <p className="text-neutral-400 mb-10">
          Have questions or feedback? We&apos;d love to hear from you.
        </p>

        <div className="bg-neutral-900/40 border border-neutral-800/50 rounded-2xl p-8">
          <form className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Name</label>
              <input
                type="text"
                placeholder="Your name"
                className="w-full bg-neutral-950/80 border border-neutral-800/50 rounded-xl px-4 py-3 text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-violet-500/50 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full bg-neutral-950/80 border border-neutral-800/50 rounded-xl px-4 py-3 text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-violet-500/50 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Subject</label>
              <select className="w-full bg-neutral-950/80 border border-neutral-800/50 rounded-xl px-4 py-3 text-neutral-200 appearance-none focus:outline-none focus:border-violet-500/50 text-sm">
                <option>General Inquiry</option>
                <option>Technical Support</option>
                <option>Billing Question</option>
                <option>Partnership</option>
                <option>Bug Report</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Message</label>
              <textarea
                placeholder="How can we help?"
                className="w-full h-36 bg-neutral-950/80 border border-neutral-800/50 rounded-xl p-4 text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-violet-500/50 resize-none text-sm leading-relaxed"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-500 transition-colors"
            >
              Send Message
            </button>
          </form>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-sm font-semibold text-white mb-1">Email</div>
            <div className="text-sm text-neutral-400">support@aivideoplatform.com</div>
          </div>
          <div>
            <div className="text-sm font-semibold text-white mb-1">Discord</div>
            <div className="text-sm text-neutral-400">Join our community</div>
          </div>
          <div>
            <div className="text-sm font-semibold text-white mb-1">Response Time</div>
            <div className="text-sm text-neutral-400">Within 24 hours</div>
          </div>
        </div>
      </div>
    </div>
  );
}
