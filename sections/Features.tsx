'use client';

import React from 'react';
import { motion } from 'framer-motion';

type Feature = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

const PremiumIcons = {
  quality: (
    <svg width="28" height="28" viewBox="0 0 48 48" className="text-myai-accent">
      <defs>
        <linearGradient id="grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgb(56,189,248)" />
          <stop offset="100%" stopColor="rgb(168,85,247)" />
        </linearGradient>
      </defs>
      <path d="M24 4l6.18 12.52L44 18.26l-10 9.74L36.36 44 24 36.54 11.64 44 14 28 4 18.26l13.82-1.74L24 4z" fill="url(#grad-1)" opacity="0.9" />
    </svg>
  ),
  realtime: (
    <svg width="28" height="28" viewBox="0 0 48 48" className="text-myai-accent">
      <defs>
        <linearGradient id="grad-2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgb(99,102,241)" />
          <stop offset="100%" stopColor="rgb(56,189,248)" />
        </linearGradient>
      </defs>
      <path d="M8 32h4l4-16 6 24 4-12h10" stroke="url(#grad-2)" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="8" cy="32" r="3" fill="currentColor" opacity="0.8" />
      <circle cx="40" cy="28" r="3" fill="currentColor" opacity="0.8" />
    </svg>
  ),
  modules: (
    <svg width="28" height="28" viewBox="0 0 48 48" className="text-myai-accent">
      <defs>
        <linearGradient id="grad-3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgb(34,197,94)" />
          <stop offset="100%" stopColor="rgb(56,189,248)" />
        </linearGradient>
      </defs>
      <rect x="6" y="6" width="12" height="12" rx="3" fill="url(#grad-3)" opacity="0.9" />
      <rect x="30" y="6" width="12" height="12" rx="3" fill="url(#grad-3)" opacity="0.6" />
      <rect x="6" y="30" width="12" height="12" rx="3" fill="url(#grad-3)" opacity="0.6" />
      <rect x="30" y="30" width="12" height="12" rx="3" fill="url(#grad-3)" opacity="0.9" />
    </svg>
  ),
  ui: (
    <svg width="28" height="28" viewBox="0 0 48 48" className="text-myai-accent">
      <defs>
        <linearGradient id="grad-4" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgb(168,85,247)" />
          <stop offset="100%" stopColor="rgb(236,72,153)" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="10" stroke="url(#grad-4)" strokeWidth="4" fill="none" />
      <path d="M24 8v8M24 32v8M8 24h8M32 24h8" stroke="url(#grad-4)" strokeWidth="4" strokeLinecap="round" />
    </svg>
  ),
  presets: (
    <svg width="28" height="28" viewBox="0 0 48 48" className="text-myai-accent">
      <defs>
        <linearGradient id="grad-5" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgb(236,72,153)" />
          <stop offset="100%" stopColor="rgb(99,102,241)" />
        </linearGradient>
      </defs>
      <path d="M10 14h28v6H10zM10 24h28v10H10z" fill="url(#grad-5)" opacity="0.85" />
      <circle cx="16" cy="29" r="2" fill="#fff" />
      <circle cx="24" cy="29" r="2" fill="#fff" />
      <circle cx="32" cy="29" r="2" fill="#fff" />
    </svg>
  ),
  cloud: (
    <svg width="28" height="28" viewBox="0 0 48 48" className="text-myai-accent">
      <defs>
        <linearGradient id="grad-6" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgb(56,189,248)" />
          <stop offset="100%" stopColor="rgb(34,197,94)" />
        </linearGradient>
      </defs>
      <path d="M18 36h16a8 8 0 100-16 10 10 0 10-16 8H10a6 6 0 100 12h8" stroke="url(#grad-6)" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

const features: Feature[] = [
  {
    icon: PremiumIcons.quality,
    title: 'Studio-Grade Quality',
    description: 'Professional audio processing that rivals industry-standard plugins from Waves, FabFilter, and iZotope.',
  },
  {
    icon: PremiumIcons.realtime,
    title: 'Real-Time Processing',
    description: 'Ultra-low latency Web Audio API engine for instant feedback and seamless workflow.',
  },
  {
    icon: PremiumIcons.modules,
    title: '6 Premium Modules',
    description: 'Warmth, Stereo Widener, HalfScrew, reTUNE 432, 3-Band EQ, and Reverb — all in one suite.',
  },
  {
    icon: PremiumIcons.ui,
    title: 'Intuitive Interface',
    description: 'Clean, dark UI with precision knob controls and instant A/B comparison.',
  },
  {
    icon: PremiumIcons.presets,
    title: 'Preset System',
    description: 'Curated presets for instant results, plus the ability to save your own custom settings.',
  },
  {
    icon: PremiumIcons.cloud,
    title: 'No Installation',
    description: 'Browser-based technology means instant access from any device, anywhere.',
  },
];

export default function Features() {
  return (
    <section className="relative py-24 px-6">
      {/* background accents */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.07] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(147,51,234,0.35),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(59,130,246,0.35),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_24px,rgba(255,255,255,0.06)_25px),linear-gradient(90deg,transparent_24px,rgba(255,255,255,0.06)_25px)] bg-[size:26px_26px]" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Why Choose <span className="gradient-text">NoDAW</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Professional audio tools designed for modern creators who demand quality without compromise.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.06 }}
              className="group relative overflow-hidden rounded-2xl p-[1px] bg-gradient-to-b from-white/10 via-white/5 to-transparent hover:from-myai-primary/40 hover:via-white/10 hover:to-transparent transition-colors duration-500"
            >
              <div className="relative h-full rounded-2xl bg-myai-bg-panel/40 backdrop-blur-xl border border-white/10 p-6">
                {/* glow */}
                <div className="absolute -inset-20 opacity-0 group-hover:opacity-100 blur-3xl transition-opacity duration-500" aria-hidden>
                  <div className="size-full bg-[conic-gradient(from_180deg_at_50%_50%,rgba(56,189,248,0.15),rgba(147,51,234,0.15),rgba(236,72,153,0.15),rgba(56,189,248,0.15))]" />
                </div>

                <div className="relative z-10 flex items-start gap-4">
                  <div className="shrink-0 p-3 rounded-xl bg-white/5 ring-1 ring-white/10 shadow-inner shadow-black/20 group-hover:shadow-black/40 transition-all">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold tracking-wide">{feature.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed mt-1">{feature.description}</p>
                  </div>
                </div>

                {/* bottom accent */}
                <div className="relative z-10 mt-6 flex items-center gap-2 text-[11px] text-gray-400">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 ring-1 ring-white/10">
                    <span className="size-1.5 rounded-full bg-myai-accent animate-pulse" />
                    Optimized Engine
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 ring-1 ring-white/10">
                    <span className="size-1.5 rounded-full bg-myai-primary/80" />
                    Pro Workflow
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
