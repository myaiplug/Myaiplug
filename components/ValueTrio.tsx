'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

export default function ValueTrio() {
  const [activeDemo, setActiveDemo] = useState<number | null>(null);

  const values = [
    {
      icon: '⚡',
      title: 'Faster',
      subtitle: 'Actual time saved',
      description: 'Our AI processes your content in minutes, not hours. Track every second saved.',
      demo: '12m 37s saved today',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      icon: '✨',
      title: 'Cleaner',
      subtitle: 'QC & Delivery Guard',
      description: 'Real quality checks at every stage. Detailed reports on peaks, clipping, and LUFS.',
      demo: 'QC Score: 98/100',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: '🚀',
      title: 'Louder Online',
      subtitle: 'Reels & Caption Packs',
      description: 'Ready for Instagram, TikTok, YouTube. Multiple aspect ratios with hardburned captions.',
      demo: '3 formats exported',
      color: 'from-purple-500 to-pink-500',
    },
  ];

  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Why Creators <span className="gradient-text">Choose Us</span>
          </h2>
          <p className="text-gray-400 text-lg">
            Three core benefits that save you time and boost your content quality
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="group relative bg-myai-bg-panel/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:border-myai-accent/50 transition-all duration-300"
            >
              {/* Icon */}
              <div className={`inline-block p-4 rounded-2xl bg-gradient-to-br ${value.color} mb-6`}>
                <span className="text-4xl">{value.icon}</span>
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold mb-2">{value.title}</h3>
              <p className="text-sm text-myai-accent mb-4">{value.subtitle}</p>
              <p className="text-gray-400 mb-6">{value.description}</p>

              {/* Mini Demo */}
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <div className={`text-2xl font-bold bg-gradient-to-r ${value.color} bg-clip-text text-transparent`}>
                  {value.demo}
                </div>
              </div>

              {/* Try Button */}
              <button
                onClick={() => setActiveDemo(index)}
                className="w-full mt-6 px-6 py-3 border border-white/20 rounded-lg hover:bg-white/5 hover:border-myai-accent/50 transition-all text-sm font-semibold"
              >
                Try it now →
              </button>

              {/* Hover Glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl bg-gradient-to-br from-myai-primary/5 to-myai-accent/5 -z-10 blur-xl" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
