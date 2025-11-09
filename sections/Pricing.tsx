'use client';

import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { PRICING_PLANS } from '@/lib/constants/pricing';

const SaleRibbon = dynamic(() => import('@/components/SaleRibbon'), { ssr: false });
const ConnectedParticles = dynamic(() => import('@/components/ConnectedParticles'), { ssr: false });

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Choose Your <span className="gradient-text">Plan</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
            Start free, upgrade anytime. All plans include our core audio modules.
          </p>
          
          <div className="flex justify-center"><SaleRibbon /></div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PRICING_PLANS.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              className={`group relative bg-myai-bg-panel/40 backdrop-blur-xl border rounded-2xl p-8 transition-all duration-500 overflow-hidden ${
                plan.highlighted
                  ? 'border-myai-primary/60 shadow-[0_0_0_1px_rgba(255,255,255,0.06)] shadow-myai-primary/30 scale-105 md:scale-110'
                  : 'border-white/10 hover:border-myai-primary/40'
              } hover:shadow-2xl hover:shadow-myai-primary/20`}
            >
              {/* Animated gradient border sheen */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl border border-transparent group-hover:border-myai-primary/40">
                <div className="absolute inset-[-1px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="w-full h-full animate-[spin_8s_linear_infinite] bg-[conic-gradient(from_0deg,var(--tw-gradient-stops))] from-myai-primary via-transparent to-myai-accent opacity-30 blur-sm" />
                </div>
              </div>
              {/* Tilt / lift effect */}
              <div className="absolute inset-0 transform-gpu transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-[0.4deg]" />
              {/* Soft glow behind on hover */}
              <div className="pointer-events-none absolute -inset-8 opacity-0 group-hover:opacity-40 transition-opacity duration-500 blur-3xl bg-gradient-to-br from-myai-primary/20 via-myai-accent/10 to-transparent" />
              {plan.highlighted && (
                <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
                  <div className="absolute inset-0 opacity-70 mix-blend-screen">
                    <ConnectedParticles hue={205} pace={0.06} />
                  </div>
                </div>
              )}
              
              {/* Ribbon for Studio plan */}
              {'ribbon' in plan && plan.ribbon && (
                <div className="absolute -right-12 top-8 rotate-45 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-12 py-1">
                  {plan.ribbon}
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  <span className="text-gray-400 text-sm">/ {plan.period}</span>
                </div>
                <div className="text-sm font-semibold text-myai-accent mb-2">
                  {plan.credits.toLocaleString()} credits
                </div>
                <p className="text-gray-400 text-sm">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIdx) => (
                  <li key={featureIdx} className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
              {/* Divider above CTA for consistent button alignment */}
              <div className="border-t border-white/10 pt-6 mt-2" />
              <button
                className={`relative w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 overflow-hidden ${
                  plan.highlighted
                    ? 'bg-gradient-to-r from-myai-primary to-myai-accent text-white'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-myai-primary/30 text-white'
                } group-hover:shadow-xl group-hover:shadow-myai-primary/30 group-hover:scale-[1.02] whitespace-nowrap`}
              >
                <span className="relative z-10 inline-block align-middle">{plan.cta}</span>
                <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_60%)]" />
                <span className="pointer-events-none absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-white/10 via-transparent to-white/10 mix-blend-overlay" />
              </button>

              {plan.highlighted && (
                <p className="text-center text-xs text-gray-400 mt-4">
                  ✨ Credits roll over 30 days, cancel anytime
                </p>
              )}
            </motion.div>
          ))}
        </div>

        {/* Trust Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 text-center"
        >
          <p className="text-gray-400 mb-6">Trusted by creators worldwide</p>
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500">
            <div>🔒 SSL Encrypted</div>
            <div>💳 Secure Payments</div>
            <div>🌍 Global Access</div>
            <div>📧 Cancel Anytime</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
