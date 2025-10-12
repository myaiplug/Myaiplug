'use client';

import { motion } from 'framer-motion';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for trying out NoDAW',
    features: [
      'Access to all 6 audio modules',
      'Standard presets',
      'A/B comparison',
      'Real-time processing',
      'Community support',
    ],
    cta: 'Start Free',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$19',
    period: 'per month',
    description: 'For serious creators and professionals',
    badge: 'Most Popular',
    features: [
      'Everything in Free',
      'Custom preset save/load',
      'Advanced module parameters',
      'Export processed audio',
      'Priority support',
      '50+ premium presets',
      'No watermarks',
      'Commercial license',
    ],
    cta: 'Start Pro Trial',
    highlighted: true,
  },
  {
    name: 'Studio',
    price: '$49',
    period: 'per month',
    description: 'Ultimate power for studios',
    features: [
      'Everything in Pro',
      'Unlimited exports',
      'API access',
      'White-label options',
      'Team collaboration',
      'Custom module requests',
      'Dedicated support',
      'Early access to new features',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

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
          
          {/* Founders Pricing Badge */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="inline-block"
          >
            <span className="px-4 py-2 rounded-full bg-myai-accent-warm/20 border border-myai-accent-warm/40 text-myai-accent-warm text-sm font-semibold animate-glow-pulse">
              🔥 Founders Pricing Ends Soon
            </span>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              className={`relative bg-myai-bg-panel/40 backdrop-blur-xl border rounded-2xl p-8 transition-all duration-300 ${
                plan.highlighted
                  ? 'border-myai-primary shadow-2xl shadow-myai-primary/20 scale-105 md:scale-110'
                  : 'border-white/10 hover:border-myai-primary/30'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="px-4 py-1 bg-gradient-to-r from-myai-primary to-myai-accent text-white text-xs font-bold rounded-full">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  <span className="text-gray-400 text-sm">/ {plan.period}</span>
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

              <button
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                  plan.highlighted
                    ? 'bg-gradient-to-r from-myai-primary to-myai-accent text-white hover:scale-105 hover:shadow-2xl hover:shadow-myai-primary/50'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-myai-primary/30'
                }`}
              >
                {plan.cta}
              </button>

              {plan.highlighted && (
                <p className="text-center text-xs text-gray-400 mt-4">
                  ✨ 7-day money-back guarantee
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
