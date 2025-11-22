"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FixedAudioPlayerProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onStop: () => void;
  fileName?: string;
  currentEffect?: string;
  duration?: number; // Audio duration in seconds for progress bar
}

export default function FixedAudioPlayer({
  isPlaying,
  onPlayPause,
  onStop,
  fileName,
  currentEffect,
  duration = 30 // Default to 30 seconds if not provided
}: FixedAudioPlayerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show player when there's a file
    if (fileName) {
      setIsVisible(true);
    }
  }, [fileName]);

  if (!isVisible || !fileName) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-myai-bg-panel/95 to-myai-bg-panel/98 backdrop-blur-xl border-t border-white/10 shadow-2xl"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-6">
            {/* File Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-myai-primary to-myai-accent flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white truncate">
                    {fileName}
                  </div>
                  {currentEffect && (
                    <div className="text-xs text-gray-400 flex items-center gap-1">
                      <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                      {currentEffect}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={onPlayPause}
                className="group relative w-14 h-14 rounded-full bg-gradient-to-br from-myai-primary to-myai-accent hover:shadow-lg hover:shadow-myai-primary/50 transition-all duration-200 hover:scale-105"
              >
                {isPlaying ? (
                  <svg className="w-6 h-6 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                )}
              </button>

              <button
                onClick={onStop}
                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-red-500/50 transition-all duration-200 flex items-center justify-center"
                title="Stop"
              >
                <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                </svg>
              </button>

              <button
                onClick={() => setIsVisible(false)}
                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200 flex items-center justify-center ml-2"
                title="Hide player"
              >
                <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Waveform visualization placeholder */}
          <div className="mt-3 h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-myai-primary to-myai-accent"
              initial={{ width: "0%" }}
              animate={{ width: isPlaying ? "100%" : "0%" }}
              transition={{ duration: duration, ease: "linear" }}
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
