"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { MICROCOPY } from '@/lib/constants/microcopy';
import { getMockSocialProof } from '@/lib/utils/mockData';

// Sweeping gradient background animation
function SweepingGradient() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(124, 77, 255, 0.2) 0%, rgba(56, 189, 248, 0.2) 50%, rgba(168, 85, 247, 0.2) 100%)',
        }}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-myai-bg-dark/50 via-transparent to-myai-bg-dark" />
    </div>
  );
}

export default function Hero() {
  const socialProof = getMockSocialProof();
  
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Sweeping gradient background */}
      <SweepingGradient />
      
      {/* Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Headline & CTA */}
          <div className="text-left">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="font-display text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
              >
                {MICROCOPY.HERO.headline.split('.').map((part, i, arr) => (
                  <span key={i}>
                    {part}
                    {i < arr.length - 1 && '.'}
                    {i < arr.length - 1 && <br className="hidden md:block" />}
                  </span>
                ))}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl leading-relaxed"
              >
                {MICROCOPY.HERO.subtitle}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 mb-8"
              >
                <Link href="#funnel">
                  <button className="group relative px-8 py-4 bg-gradient-to-r from-myai-primary to-myai-accent text-white font-bold rounded-xl text-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-myai-primary/50">
                    <span className="relative z-10">{MICROCOPY.HERO.ctaPrimary}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-myai-accent to-myai-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </button>
                </Link>

                <Link href="#playground">
                  <button className="px-8 py-4 border-2 border-white/20 text-white font-semibold rounded-xl text-lg hover:bg-white/5 hover:border-myai-primary/50 transition-all duration-300">
                    {MICROCOPY.HERO.ctaSecondary}
                  </button>
                </Link>
              </motion.div>

              {/* Social Proof */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="flex items-center gap-4"
              >
                <div className="flex -space-x-2">
                  {socialProof.avatars.map((avatar, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-myai-primary to-myai-accent border-2 border-myai-bg-dark flex items-center justify-center text-white text-sm font-bold"
                    >
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-400">
                  {MICROCOPY.HERO.socialProof(socialProof.creatorsCount, socialProof.hoursSaved)}
                </p>
              </motion.div>
            </motion.div>
          </div>

          {/* Right: AI Visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="relative"
          >
            <div className="relative w-full max-w-md mx-auto aspect-square bg-gradient-to-br from-myai-primary/20 to-myai-accent/20 rounded-2xl backdrop-blur-xl border border-white/10 p-8 shadow-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,77,255,0.3),transparent_70%)] rounded-2xl" />
              <div className="relative z-10 h-full flex items-center justify-center">
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                    rotate: [0, 2, -2, 0],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="text-6xl"
                >
                  🎵
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1, repeat: Infinity, repeatType: 'reverse' }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-gray-400 uppercase tracking-wider">Scroll to explore</span>
          <svg className="w-6 h-6 text-myai-accent animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </motion.div>
    </section>
  );
}
