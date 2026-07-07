import { useState } from 'react';
import { motion } from 'framer-motion';

const PLANS = [
  {
    name: "Starter Brain",
    badge: "Free Forever",
    monthlyPrice: 0,
    annualPrice: 0,
    description: "Essential AI shopping assistant for casual online shoppers looking for quick price comparisons.",
    credits: "60 AI Search Credits / mo",
    features: [
      "Live Multi-Store Price Comparison (5 Stores)",
      "Amazon, Flipkart, Croma & Reliance search",
      "Standard 5G Mobile & Laptop spec analysis",
      "Weekly Price Drop Email Alerts",
      "Standard Indian English Voice Synthesis",
    ],
    cta: "Current Plan",
    popular: false,
    gradient: "bg-surface/40 border-stroke/40 hover:border-white/20",
    buttonStyle: "bg-white/10 hover:bg-white/20 text-white border border-white/20",
  },
  {
    name: "Pro Shopper",
    badge: "Most Popular",
    monthlyPrice: 199,
    annualPrice: 159,
    description: "Advanced shopping intelligence for power buyers, tech enthusiasts, and bargain hunters.",
    credits: "450 AI Search Credits / mo",
    features: [
      "Powered by Google Gemini 2.5 Pro & Live SerpAPI",
      "Real-Time WhatsApp & SMS Flash Sale Alerts",
      "Multimodal File Attachments (Upload Specs & Receipts)",
      "Voice Search & Instant Hindi/English Audio Synthesis",
      "Strict 100% Budget Enforcement Guarantee",
      "Priority Bank Coupon & Cashback Finder",
    ],
    cta: "Upgrade to Pro Shopper",
    popular: true,
    gradient: "bg-surface/80 border-white/30 shadow-[0_0_40px_rgba(255,255,255,0.05)]",
    buttonStyle: "bg-white hover:bg-zinc-200 text-black font-bold shadow-md",
  },
  {
    name: "Power Shopper",
    badge: "Enterprise & Bulk",
    monthlyPrice: 499,
    annualPrice: 399,
    description: "Ultimate AI procurement engine for bulk buyers, agencies, and e-commerce resellers.",
    credits: "Unlimited AI Search Credits",
    features: [
      "Everything in Pro Shopper Plan",
      "Custom API Access to ShopBot Comparison Engine",
      "Dedicated 24/7 Personal Shopping AI Agent",
      "Bulk Price Tracking across 100+ Indian Stores",
      "Early Access to Beta Features (Video Review Summarizer)",
      "VIP Dedicated Support & Custom Product Scraping",
    ],
    cta: "Contact Sales ↗",
    popular: false,
    gradient: "bg-surface/40 border-stroke/40 hover:border-white/20",
    buttonStyle: "bg-white/10 hover:bg-white/20 text-white border border-white/20",
  },
];

export default function PlansSection() {
  const [isAnnual, setIsAnnual] = useState(false);

  const handlePlanClick = (plan) => {
    if (plan.monthlyPrice === 0) {
      alert("You are currently on the Free Starter plan! Explore categories or launch the AI assistant to begin shopping.");
      return;
    }
    // Launch AI chatbot with pre-filled upgrade prompt
    localStorage.setItem('shopbot_initial_prompt', `Hi ShopBot! I would like to upgrade my account to the **${plan.name}** plan (${isAnnual ? `₹${plan.annualPrice}/mo billed annually` : `₹${plan.monthlyPrice}/mo`}). Can you guide me through the activation and payment offers?`);
    window.history.pushState({}, '', '/chatbot');
    window.dispatchEvent(new Event('navigate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section id="plans" className="bg-bg py-20 md:py-32 relative overflow-hidden border-t border-stroke/20">
      
      {/* Subtle Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-white/[0.02] blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="flex flex-col gap-4 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="w-8 h-px bg-stroke" />
              <span className="text-[10px] sm:text-xs text-muted uppercase tracking-[0.3em] font-body font-semibold">
                Flexible AI Subscriptions
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-body text-text-primary tracking-tight leading-[1.05] font-medium">
              Choose Your <span className="font-display italic text-text-primary/95">AI Shopping Power.</span>
            </h2>
            <p className="text-sm sm:text-base text-muted font-light leading-relaxed">
              Unlock deeper price analytics, real-time WhatsApp price drop alerts, multimodal file attachments, and unlimited Google Gemini 2.5 Pro searches across 50+ Indian e-commerce stores.
            </p>
          </div>

          {/* Billing Toggle (Monthly / Annual) */}
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-1.5 rounded-full backdrop-blur-md self-start md:self-end">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer ${
                !isAnnual
                  ? 'bg-white text-black shadow-sm'
                  : 'text-muted hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer ${
                isAnnual
                  ? 'bg-white text-black shadow-sm'
                  : 'text-muted hover:text-white'
              }`}
            >
              Annual Billing
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {PLANS.map((plan, idx) => {
            const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className={`relative flex flex-col justify-between rounded-3xl p-8 border backdrop-blur-xl transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl ${plan.gradient}`}
              >
                {/* Top Badge */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-xl font-display italic font-bold text-white">
                      {plan.name}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                      plan.popular
                        ? 'bg-white text-black font-semibold'
                        : 'bg-white/10 text-zinc-300 border border-white/10'
                    }`}>
                      {plan.badge}
                    </span>
                  </div>

                  {/* Price Display */}
                  <div className="mb-6 flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-display font-extrabold text-white tracking-tight">
                      ₹{price}
                    </span>
                    <span className="text-xs text-muted font-body">
                      / month {isAnnual && price > 0 ? '(billed yearly)' : ''}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed mb-6 border-b border-white/10 pb-6">
                    {plan.description}
                  </p>

                  {/* Credits Highlight Box */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-3 mb-6 flex items-center gap-2 text-xs font-semibold text-white">
                    <span>⚡</span>
                    <span>{plan.credits}</span>
                  </div>

                  {/* Features List */}
                  <div className="space-y-3 mb-8">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-muted mb-2">
                      What's included:
                    </div>
                    {plan.features.map((feature, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-300 font-light leading-snug">
                        <span className="text-white font-bold mt-0.5 flex-shrink-0">✓</span>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handlePlanClick(plan)}
                  className={`w-full py-3.5 px-6 rounded-2xl text-xs sm:text-sm transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 mt-4 ${plan.buttonStyle}`}
                >
                  <span>{plan.cta}</span>
                </button>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
