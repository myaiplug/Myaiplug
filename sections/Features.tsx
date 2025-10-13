'use client';

import { motion } from 'framer-motion';

const features = [
  {
    icon: '🎵',
    title: 'Studio-Grade Quality',
    description: 'Professional audio processing that rivals industry-standard plugins from Waves, FabFilter, and iZotope.',
  },
  {
    icon: '⚡',
    title: 'Real-Time Processing',
    description: 'Ultra-low latency Web Audio API engine for instant feedback and seamless workflow.',
  },
  {
    icon: '🎛️',
    title: '6 Premium Modules',
    description: 'Warmth, Stereo Widener, HalfScrew, reTUNE 432, 3-Band EQ, and Reverb — all in one suite.',
  },
  {
    icon: '🎨',
    title: 'Intuitive Interface',
    description: 'Clean, dark UI with precision knob controls and instant A/B comparison.',
  },
  {
    icon: '💾',
    title: 'Preset System',
    description: 'Curated presets for instant results, plus the ability to save your own custom settings.',
  },
  {
    icon: '🚀',
    title: 'No Installation',
    description: 'Browser-based technology means instant access from any device, anywhere.',
  },
];

export default function Features() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
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
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="group bg-myai-bg-panel/30 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-myai-primary/50 hover:bg-myai-bg-panel/50 transition-all duration-300"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
