'use client';

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const TrustIconLock = () => (
  <svg width="56" height="56" viewBox="0 0 48 48" aria-hidden>
    <defs>
      <linearGradient id="tgrad-lock" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="rgb(56,189,248)" />
        <stop offset="100%" stopColor="rgb(168,85,247)" />
      </linearGradient>
    </defs>
    <rect x="10" y="20" width="28" height="20" rx="4" fill="none" stroke="url(#tgrad-lock)" strokeWidth="3" />
    <path d="M16 20v-4a8 8 0 0116 0v4" fill="none" stroke="url(#tgrad-lock)" strokeWidth="3" />
    <circle cx="24" cy="30" r="2" fill="currentColor" className="text-white" />
  </svg>
);

const TrustIconCard = () => (
  <svg width="56" height="56" viewBox="0 0 48 48" aria-hidden>
    <defs>
      <linearGradient id="tgrad-card" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="rgb(99,102,241)" />
        <stop offset="100%" stopColor="rgb(56,189,248)" />
      </linearGradient>
    </defs>
    <rect x="6" y="10" width="36" height="24" rx="4" fill="none" stroke="url(#tgrad-card)" strokeWidth="3" />
    <rect x="10" y="16" width="20" height="4" rx="2" fill="url(#tgrad-card)" />
    <rect x="10" y="26" width="12" height="4" rx="2" fill="url(#tgrad-card)" opacity="0.8" />
  </svg>
);

const TrustIconGlobe = () => (
  <svg width="56" height="56" viewBox="0 0 48 48" aria-hidden>
    <defs>
      <linearGradient id="tgrad-globe" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="rgb(34,197,94)" />
        <stop offset="100%" stopColor="rgb(56,189,248)" />
      </linearGradient>
    </defs>
    <circle cx="24" cy="24" r="18" fill="none" stroke="url(#tgrad-globe)" strokeWidth="3" />
    <path d="M6 24h36M24 6c6 6 6 30 0 36M24 6c-6 6-6 30 0 36" stroke="url(#tgrad-globe)" strokeWidth="3" fill="none" />
  </svg>
);

const TrustIconCancel = () => (
  <svg width="56" height="56" viewBox="0 0 48 48" aria-hidden>
    <defs>
      <linearGradient id="tgrad-cancel" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="rgb(236,72,153)" />
        <stop offset="100%" stopColor="rgb(168,85,247)" />
      </linearGradient>
    </defs>
    <rect x="8" y="12" width="32" height="24" rx="4" fill="none" stroke="url(#tgrad-cancel)" strokeWidth="3" />
    <path d="M14 18h20" stroke="url(#tgrad-cancel)" strokeWidth="3" />
    <circle cx="36" cy="14" r="8" fill="none" stroke="url(#tgrad-cancel)" strokeWidth="3" />
    <path d="M31 9l10 10M41 9L31 19" stroke="url(#tgrad-cancel)" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

type TrustItem = {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
};

const TRUST_ITEMS: TrustItem[] = [
  { icon: <TrustIconLock />, title: 'SSL Encrypted', subtitle: 'End-to-end security' },
  { icon: <TrustIconCard />, title: 'Secure Payments', subtitle: 'Protected checkout' },
  { icon: <TrustIconGlobe />, title: 'Global Access', subtitle: 'Works anywhere' },
  { icon: <TrustIconCancel />, title: 'Cancel Anytime', subtitle: 'No lock-in' },
];

export default function Trust() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 600], [0, -40]);
  const y2 = useTransform(scrollY, [0, 600], [0, 50]);

  return (
    <section className="relative py-24 px-6">
      {/* Parallax background accents */}
      <motion.div style={{ y: y1 }} className="pointer-events-none absolute -top-24 -right-24 size-[420px] rounded-full blur-3xl opacity-30" aria-hidden>
        <div className="size-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.25),transparent_60%)]" />
      </motion.div>
      <motion.div style={{ y: y2 }} className="pointer-events-none absolute -bottom-24 -left-24 size-[420px] rounded-full blur-3xl opacity-30" aria-hidden>
        <div className="size-full bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.25),transparent_60%)]" />
      </motion.div>

      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            Trusted by creators worldwide
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TRUST_ITEMS.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="group relative rounded-2xl p-[1px] bg-gradient-to-b from-white/10 via-white/5 to-transparent hover:from-myai-primary/60 hover:via-white/10 hover:to-transparent transition-colors duration-500"
            >
              <div
                className="relative rounded-2xl h-full bg-myai-bg-panel/40 backdrop-blur-xl border border-white/10 p-6 md:p-7 shadow-[0_10px_35px_-15px_rgba(0,0,0,0.7)]"
              >
                {/* glow + sheen */}
                <div className="absolute -inset-24 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500" aria-hidden>
                  <div className="size-full bg-[conic-gradient(from_180deg_at_50%_50%,rgba(56,189,248,0.18),rgba(147,51,234,0.18),rgba(236,72,153,0.18),rgba(56,189,248,0.18))]" />
                </div>
                <div className="pointer-events-none absolute inset-0 before:absolute before:inset-0 before:bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.08),transparent)] before:translate-x-[-120%] group-hover:before:translate-x-[120%] before:transition-transform before:duration-700" />

                {/* content */}
                <div className="relative z-10 flex flex-col items-center text-center gap-4">
                  <div className="translate-z-0 will-change-transform transform-gpu group-hover:scale-105 group-hover:-rotate-1 transition-transform duration-300">
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-lg font-semibold tracking-wide">{item.title}</div>
                    <div className="text-gray-400 text-sm mt-1">{item.subtitle}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
