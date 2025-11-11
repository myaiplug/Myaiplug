"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AlbumArtAI from './AlbumArtAI';
import YouTubeToSocialAI from './YouTubeToSocialAI';
import AudioToSocialContent from './AudioToSocialContent';

interface AIModel {
  id: string;
  name: string;
  component: React.ComponentType;
}

const AI_MODELS: AIModel[] = [
  { id: 'albumart', name: 'Single/AlbumArt AI', component: AlbumArtAI },
  { id: 'youtube', name: 'YouTube to Social Content', component: YouTubeToSocialAI },
  { id: 'audio', name: 'Audio Upload to Social Content', component: AudioToSocialContent },
];

export default function AIPlayground() {
  const [currentModelIndex, setCurrentModelIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const handlePrevious = () => {
    setDirection(-1);
    setCurrentModelIndex((prev) => (prev - 1 + AI_MODELS.length) % AI_MODELS.length);
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentModelIndex((prev) => (prev + 1) % AI_MODELS.length);
  };

  const CurrentComponent = AI_MODELS[currentModelIndex].component;

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -1000 : 1000,
      opacity: 0,
    }),
  };

  return (
    <section id="playground" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            AI <span className="gradient-text">Playground</span>
          </h2>
          <p className="text-gray-400">
            Explore our AI-powered tools for content creation
          </p>
        </div>

        <div className="relative">
          {/* Navigation Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handlePrevious}
              className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200 group"
              aria-label="Previous model"
            >
              <svg className="w-6 h-6 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="text-center flex-1 mx-4">
              <h3 className="text-xl font-bold text-white">
                {AI_MODELS[currentModelIndex].name}
              </h3>
              <div className="flex justify-center gap-2 mt-3">
                {AI_MODELS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setDirection(idx > currentModelIndex ? 1 : -1);
                      setCurrentModelIndex(idx);
                    }}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === currentModelIndex
                        ? 'bg-myai-accent w-8'
                        : 'bg-gray-600 w-2 hover:bg-gray-500'
                    }`}
                    aria-label={`Go to ${AI_MODELS[idx].name}`}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={handleNext}
              className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200 group"
              aria-label="Next model"
            >
              <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Model Content */}
          <div className="relative overflow-hidden rounded-2xl">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentModelIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: 'spring', stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
              >
                <CurrentComponent />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
