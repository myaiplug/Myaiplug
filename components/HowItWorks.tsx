'use client';

import { motion } from 'framer-motion';

export default function HowItWorks() {
  const steps = [
    {
      number: 1,
      icon: '📤',
      title: 'Upload Your Content',
      description: 'Drag and drop your audio or video file. We support all major formats.',
      detail: 'Files are processed securely and never stored longer than necessary.',
    },
    {
      number: 2,
      icon: '⚙️',
      title: 'Choose Your Workflow',
      description: 'Select from presets like Basic Chain, Podcast Polish, or Reels Pack.',
      detail: 'Each preset is optimized for specific use cases with professional-grade processing.',
    },
    {
      number: 3,
      icon: '⚡',
      title: 'AI Processing',
      description: 'Our AI analyzes, cleans, enhances, masters, and delivers your content.',
      detail: 'Real-time progress updates show exactly what\'s happening at each stage.',
    },
    {
      number: 4,
      icon: '🎉',
      title: 'Download & Earn',
      description: 'Get your processed content, earn points, and save time.',
      detail: 'Track your time saved, level up, earn badges, and climb the leaderboards.',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            From upload to download in minutes. Simple, fast, and rewarding.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-myai-accent to-transparent" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative"
              >
                {/* Step Card */}
                <div className="relative bg-myai-bg-panel/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-myai-accent/50 transition-all duration-300 h-full">
                  {/* Step Number Badge */}
                  <div className="absolute -top-4 left-6 w-8 h-8 rounded-full bg-gradient-to-r from-myai-primary to-myai-accent flex items-center justify-center text-white font-bold text-sm shadow-lg z-10">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="text-5xl mb-4 mt-2">{step.icon}</div>

                  {/* Title */}
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>

                  {/* Description */}
                  <p className="text-gray-400 mb-3">{step.description}</p>

                  {/* Detail */}
                  <p className="text-sm text-gray-500">{step.detail}</p>
                </div>

                {/* Arrow for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-24 -right-4 text-myai-accent text-2xl z-20">
                    →
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-center"
        >
          <div className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl">
            <div className="text-3xl mb-2">⚡</div>
            <div className="text-xl font-bold mb-2">Lightning Fast</div>
            <div className="text-sm text-gray-400">
              Processing times measured in minutes, not hours
            </div>
          </div>
          <div className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl">
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-xl font-bold mb-2">Quality Guaranteed</div>
            <div className="text-sm text-gray-400">
              Every output includes QC reports and delivery guard checks
            </div>
          </div>
          <div className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl">
            <div className="text-3xl mb-2">🏆</div>
            <div className="text-xl font-bold mb-2">Get Rewarded</div>
            <div className="text-sm text-gray-400">
              Earn points, badges, and climb leaderboards with every job
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
