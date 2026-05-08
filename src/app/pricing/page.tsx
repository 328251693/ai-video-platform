import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple, transparent pricing. Start free, upgrade as you grow.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Hero */}
      <section className="text-center pt-24 pb-16 px-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-neutral-400 text-lg mb-8">
          Start free, upgrade as you grow
        </p>

        {/* Toggle */}
        <div className="inline-flex items-center gap-3 bg-neutral-900/60 border border-neutral-800/50 rounded-xl p-1">
          <button className="px-5 py-2 text-sm font-medium rounded-lg bg-neutral-800 text-white">
            Monthly
          </button>
          <button className="px-5 py-2 text-sm font-medium rounded-lg text-neutral-400 hover:text-neutral-200 transition-colors">
            Annually
            <span className="ml-1.5 text-xs text-green-400">Save 20%</span>
          </button>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-neutral-900/40 border rounded-2xl p-6 flex flex-col ${
                plan.popular
                  ? "border-violet-500/50 ring-1 ring-violet-500/20"
                  : "border-neutral-800/50"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-violet-600 text-white text-xs font-medium rounded-full">
                  Most Popular
                </div>
              )}

              <h3 className="text-lg font-semibold text-white mb-1">{plan.name}</h3>
              <p className="text-sm text-neutral-500 mb-5">{plan.desc}</p>

              <div className="mb-5">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  {plan.period && <span className="text-neutral-500 text-sm">{plan.period}</span>}
                </div>
                <p className="text-sm text-neutral-500 mt-1">{plan.credits}</p>
              </div>

              <ul className="space-y-3 mb-6 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-neutral-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`block w-full py-2.5 rounded-xl text-center text-sm font-medium transition-colors ${
                  plan.popular
                    ? "bg-violet-600 text-white hover:bg-violet-500"
                    : "bg-neutral-800 text-neutral-200 hover:bg-neutral-700"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Enterprise CTA */}
      <section className="max-w-4xl mx-auto px-4 pb-20">
        <div className="bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border border-violet-500/20 rounded-2xl p-8 md:p-12 text-center">
          <h3 className="text-2xl font-bold text-white mb-3">
            Need a Custom Solution?
          </h3>
          <p className="text-neutral-400 mb-6 max-w-lg mx-auto">
            Contact our sales team for custom pricing, dedicated support, and enterprise-grade features.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-neutral-950 font-medium rounded-xl hover:bg-neutral-200 transition-colors"
          >
            Contact Sales
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 pb-24">
        <h2 className="text-2xl font-bold text-white text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <details key={i} className="group bg-neutral-900/40 border border-neutral-800/50 rounded-xl overflow-hidden">
              <summary className="flex items-center justify-between p-5 cursor-pointer list-none hover:bg-neutral-800/20 transition-colors">
                <span className="font-medium text-white pr-4">{faq.q}</span>
                <svg className="w-5 h-5 text-neutral-400 group-open:rotate-180 transition-transform flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-5 pb-5 text-neutral-400 text-sm leading-relaxed">{faq.a}</div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}

const plans = [
  {
    name: "Free",
    desc: "Perfect for trying out",
    price: "$0",
    period: "",
    credits: "50 credits/month",
    popular: false,
    href: "/login",
    cta: "Get Started",
    features: [
      "Access to basic models",
      "720p video quality",
      "5 videos per day",
      "Standard processing",
      "Community support",
    ],
  },
  {
    name: "Starter",
    desc: "For individual creators",
    price: "$9.99",
    period: "/mo",
    credits: "500 credits/month",
    popular: false,
    href: "/login",
    cta: "Subscribe",
    features: [
      "Access to all models",
      "1080p video quality",
      "50 videos per day",
      "Priority processing",
      "Email support",
    ],
  },
  {
    name: "Pro",
    desc: "For professional creators",
    price: "$29.99",
    period: "/mo",
    credits: "2000 credits/month",
    popular: true,
    href: "/login",
    cta: "Subscribe",
    features: [
      "Everything in Starter",
      "4K video quality",
      "Unlimited videos",
      "Fastest processing",
      "API access",
      "Priority support",
    ],
  },
  {
    name: "Enterprise",
    desc: "For teams and businesses",
    price: "Custom",
    period: "",
    credits: "Unlimited credits",
    popular: false,
    href: "/contact",
    cta: "Contact Sales",
    features: [
      "Everything in Pro",
      "Custom models",
      "Dedicated support",
      "SLA guarantee",
      "Custom integrations",
      "Team management",
    ],
  },
];

const faqs = [
  { q: "What payment methods do you accept?", a: "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and cryptocurrency payments through our secure payment processor." },
  { q: "Can I cancel my subscription anytime?", a: "Yes, you can cancel your subscription at any time. Your access will continue until the end of your current billing period. No cancellation fees." },
  { q: "Do unused credits roll over?", a: "Credits reset monthly with your subscription. We recommend choosing a plan that matches your typical monthly usage for the best value." },
  { q: "Is there a free trial?", a: "Yes! Our Free plan gives you 50 credits per month to try out the platform. No credit card required to get started." },
  { q: "What happens if I exceed my credit limit?", a: "You can purchase additional credit packs at any time, or upgrade to a higher plan for better rates. We'll notify you when you're running low." },
  { q: "Do you offer refunds?", a: "We offer a 7-day money-back guarantee for new subscriptions. If you're not satisfied, contact our support team for a full refund." },
];
