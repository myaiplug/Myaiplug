'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { MICROCOPY } from '@/lib/constants/microcopy';
import { POINT_EVENTS, LEVELS, TIME_SAVED_BASELINES } from '@/lib/constants/gamification';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: MICROCOPY.FAQ.howPointsWork,
      answer: (
        <div className="space-y-3">
          <p>Points are earned through various activities on the platform:</p>
          <ul className="list-disc list-inside space-y-2 ml-4 text-gray-400">
            <li>Sign-up (email verified): <strong>+{POINT_EVENTS.SIGNUP} pts</strong></li>
            <li>Complete onboarding (first upload + download): <strong>+{POINT_EVENTS.ONBOARDING_COMPLETE} pts</strong></li>
            <li>Each successful job (≤60s processing): <strong>+{POINT_EVENTS.JOB_SHORT} pts</strong></li>
            <li>Each successful job (61-300s): <strong>+{POINT_EVENTS.JOB_MEDIUM} pts</strong></li>
            <li>Pro Chain job (advanced FX): <strong>+{POINT_EVENTS.PRO_CHAIN_BONUS} bonus pts</strong></li>
            <li>First portfolio publish per day: <strong>+{POINT_EVENTS.PORTFOLIO_PUBLISH_DAILY} pts</strong></li>
            <li>Referral sign-up: <strong>+{POINT_EVENTS.REFERRAL_SIGNUP} pts</strong></li>
            <li>Referral converts to paid: <strong>+{POINT_EVENTS.REFERRAL_PAID} pts + 50 credits</strong></li>
            <li>Weekly streak (≥3 jobs/week): <strong>+{POINT_EVENTS.WEEKLY_STREAK} pts</strong></li>
          </ul>
          <p className="text-sm text-gray-500 mt-4">
            <strong>Anti-farm protection:</strong> Points from non-paid referrals are capped at 500/week. 
            First publish points are limited to once per 24 hours.
          </p>
        </div>
      ),
    },
    {
      question: MICROCOPY.FAQ.howTimeSaved,
      answer: (
        <div className="space-y-3">
          <p>Time saved is calculated using this formula:</p>
          <div className="bg-myai-bg-dark/50 border border-white/10 rounded-lg p-4 my-4 font-mono text-sm">
            <code>
              Time Saved = (Baseline Minutes × Efficiency Factor) − Actual Processing Minutes
            </code>
          </div>
          <p><strong>Baseline times by job type:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4 text-gray-400">
            <li>Basic audio chain: {TIME_SAVED_BASELINES.audio_basic} minutes</li>
            <li>Pro audio chain: {TIME_SAVED_BASELINES.audio_pro} minutes</li>
            <li>Reels render (caption + crop): {TIME_SAVED_BASELINES.reels} minutes</li>
            <li>Stem split + cleanup: {TIME_SAVED_BASELINES.stem_split} minutes</li>
          </ul>
          <p className="mt-3"><strong>Efficiency factors by tier:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4 text-gray-400">
            <li>Free: 0.7× (conservative estimate)</li>
            <li>Pro: 0.9× (realistic estimate)</li>
            <li>Studio: 1.0× (full potential)</li>
          </ul>
          <p className="text-sm text-gray-500 mt-4">
            This ensures time saved calculations are fair and reflect real-world manual processing time.
          </p>
        </div>
      ),
    },
    {
      question: MICROCOPY.FAQ.antiCheat,
      answer: (
        <div className="space-y-3">
          <p>We take fairness seriously. Our anti-cheat system includes:</p>
          <ul className="list-disc list-inside space-y-2 ml-4 text-gray-400">
            <li><strong>Account integrity:</strong> One verified email per account. IP/device fingerprinting prevents multi-accounting.</li>
            <li><strong>Referral fraud detection:</strong> Rewards denied if device/IP overlaps or same payment method detected across accounts.</li>
            <li><strong>Point tampering prevention:</strong> All point calculations happen server-side with signed receipts and audit logs.</li>
            <li><strong>Portfolio spam protection:</strong> Daily publish caps, hash-based duplicate detection, and bot-filtered view counters.</li>
            <li><strong>Job validation:</strong> First job must meet minimum duration and unique media hash requirements.</li>
            <li><strong>Velocity limits:</strong> More than 5 referrals/day triggers soft review queue.</li>
          </ul>
          <p className="text-sm text-gray-500 mt-4">
            Violations result in point removal, temporary suspension, or permanent ban depending on severity.
            We provide a clear appeals process for false positives.
          </p>
        </div>
      ),
    },
    {
      question: 'What are levels and how do I unlock features?',
      answer: (
        <div className="space-y-3">
          <p>Levels unlock progressively better features as you earn points:</p>
          <div className="space-y-3 mt-4">
            {LEVELS.map((level) => (
              <div key={level.level} className="bg-myai-bg-dark/50 border border-white/10 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-myai-primary to-myai-accent flex items-center justify-center text-white font-bold text-sm">
                    {level.level}
                  </div>
                  <div>
                    <div className="font-bold">{level.name}</div>
                    <div className="text-sm text-gray-400">
                      {level.threshold.toLocaleString()} points
                    </div>
                  </div>
                </div>
                <ul className="list-disc list-inside text-sm text-gray-400 ml-4">
                  {level.unlocks.map((unlock, i) => (
                    <li key={i}>{unlock}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      question: 'How do credits work?',
      answer: (
        <div className="space-y-3">
          <p>Credits are used to pay for processing jobs. Here's how they work:</p>
          <ul className="list-disc list-inside space-y-2 ml-4 text-gray-400">
            <li><strong>Free tier:</strong> 100 credits on signup</li>
            <li><strong>Pro tier:</strong> 1,000 credits/month for $49</li>
            <li><strong>Studio tier:</strong> 3,500 credits/month for $149</li>
          </ul>
          <p className="mt-3"><strong>Credit costs by job type:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4 text-gray-400">
            <li>Basic audio: 20 base + 5/minute</li>
            <li>Pro audio: 35 base + 20/minute</li>
            <li>Reels pack: 60 base + 20/minute</li>
            <li>Stem split: 120 base + 30/minute</li>
          </ul>
          <p className="text-sm text-gray-500 mt-4">
            <strong>Important:</strong> Credits roll over for 30 days. You can also buy top-ups: 
            $10 = 500 credits. Cancel anytime with no penalties.
          </p>
        </div>
      ),
    },
    {
      question: 'Can I opt out of leaderboards?',
      answer: (
        <div className="space-y-3">
          <p>Yes! Privacy is important to us. You can:</p>
          <ul className="list-disc list-inside space-y-2 ml-4 text-gray-400">
            <li>Opt out of all public leaderboards at any time in your profile settings</li>
            <li>Choose which creations are public vs. private</li>
            <li>Hide your profile from public search</li>
            <li>Control who can see your badges and stats</li>
          </ul>
          <p className="text-sm text-gray-500 mt-4">
            Default is opt-in with clear privacy controls. You'll still earn points and badges privately
            even if you opt out of leaderboards.
          </p>
        </div>
      ),
    },
  ];

  return (
    <section className="py-20 px-6 bg-myai-bg-dark/50">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
          <p className="text-gray-400 text-lg">
            Everything you need to know about points, levels, and how the platform works
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-myai-bg-panel/60 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <span className="text-lg font-semibold pr-4">{faq.question}</span>
                <svg
                  className={`w-6 h-6 flex-shrink-0 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-6 pb-5 border-t border-white/10 pt-5"
                >
                  <div className="text-gray-300">{faq.answer}</div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Contact Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-gray-400 mb-4">Still have questions?</p>
          <button className="px-8 py-3 border border-white/20 rounded-xl hover:bg-white/5 hover:border-myai-accent/50 transition-all font-semibold">
            Contact Support →
          </button>
        </motion.div>
      </div>
    </section>
  );
}
