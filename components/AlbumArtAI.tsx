"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GeneratedImage {
  url: string;
  isPro: boolean;
}

export default function AlbumArtAI() {
  const [artType, setArtType] = useState<'single' | 'album'>('single');
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setGenerating(true);
    
    try {
      const response = await fetch('/api/ai/generate-cover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          type: artType,
          quality: 'free', // Can be upgraded to 'pro' based on user tier
        }),
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedImages(
          data.images.map((url: string, idx: number) => ({
            url,
            isPro: idx > 0, // First image is free, rest are pro
          }))
        );
      } else {
        console.error('Generation failed:', data.error);
        // Fallback to placeholder on error
        setGeneratedImages([
          { url: '/placeholder-cover-1.jpg', isPro: false },
          { url: '/placeholder-cover-2.jpg', isPro: true },
        ]);
      }
    } catch (error) {
      console.error('Generation error:', error);
      // Fallback to placeholder on error
      setGeneratedImages([
        { url: '/placeholder-cover-1.jpg', isPro: false },
        { url: '/placeholder-cover-2.jpg', isPro: true },
      ]);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bg-myai-bg-panel/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
      <div className="mb-6">
        <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <span className="gradient-text">Single/AlbumArt AI</span>
          <span className="text-sm text-gray-400">🎨</span>
        </h3>
        <p className="text-gray-400 text-sm">Generate professional hip-hop cover art</p>
      </div>

      {/* Type Selection */}
      <div className="flex gap-4 mb-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="artType"
            value="single"
            checked={artType === 'single'}
            onChange={(e) => setArtType(e.target.value as 'single' | 'album')}
            className="w-4 h-4 accent-myai-primary"
          />
          <span className={`text-sm font-semibold ${artType === 'single' ? 'text-white' : 'text-gray-400'}`}>
            Single Cover
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="artType"
            value="album"
            checked={artType === 'album'}
            onChange={(e) => setArtType(e.target.value as 'single' | 'album')}
            className="w-4 h-4 accent-myai-primary"
          />
          <span className={`text-sm font-semibold ${artType === 'album' ? 'text-white' : 'text-gray-400'}`}>
            Album Cover
          </span>
        </label>
      </div>

      {/* Prompt Input */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2">
          Describe your {artType} (title, vibe, theme, etc.)
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={`e.g., "Dark trap vibes, neon city lights, artist name: LilDreamer"`}
          className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/10 focus:border-myai-primary outline-none text-white placeholder-gray-500 resize-none"
          rows={3}
          disabled={generating}
        />
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={!prompt.trim() || generating}
        className={`w-full py-3 rounded-lg font-bold text-lg transition-all duration-300 ${
          generating || !prompt.trim()
            ? 'bg-gray-600 cursor-not-allowed'
            : 'bg-gradient-to-r from-myai-primary to-myai-accent hover:scale-[1.02] hover:shadow-lg hover:shadow-myai-primary/50'
        }`}
      >
        {generating ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block size-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            Generating...
          </span>
        ) : (
          'Generate Cover Art'
        )}
      </button>

      {/* Generated Images */}
      <AnimatePresence>
        {generatedImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {generatedImages.map((img, idx) => (
              <div key={idx} className="relative group">
                <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden border border-white/10">
                  {/* Placeholder for actual image */}
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🎵</div>
                      <div className="text-sm">Cover Art {idx + 1}</div>
                      {img.isPro && (
                        <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-myai-accent-warm to-myai-accent-warm-2 text-black text-xs font-bold">
                          🔌 Pro
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {img.isPro && (
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-sm text-xs font-bold text-myai-accent-warm border border-myai-accent-warm/30">
                    Higher Quality
                  </div>
                )}
                <div className="mt-3 flex gap-2">
                  <button className="flex-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-sm font-semibold transition-colors">
                    Download
                  </button>
                  {img.isPro && (
                    <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-myai-accent-warm to-myai-accent-warm-2 text-black text-sm font-bold hover:scale-105 transition-transform">
                      Upgrade for Pro
                    </button>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info */}
      <div className="mt-6 p-4 rounded-lg bg-black/20 border border-white/5">
        <p className="text-xs text-gray-400">
          <span className="font-semibold text-white">Note:</span> All covers are generated in square format (1:1 aspect ratio) 
          optimized for streaming platforms. Pro versions include watermark removal and enhanced quality.
        </p>
      </div>
    </div>
  );
}
