"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GeneratedContent {
  platform: string;
  content: string;
  hashtags?: string[];
}

export default function YouTubeToSocialAI() {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);

  const handleGenerate = async () => {
    if (!youtubeUrl.trim()) return;
    
    setGenerating(true);
    
    // TODO: Replace with actual API call
    // For now, simulate generation
    setTimeout(() => {
      setGeneratedContent([
        {
          platform: 'Instagram',
          content: 'Check out my latest track! 🎵 Link in bio',
          hashtags: ['#NewMusic', '#HipHop', '#Trap'],
        },
        {
          platform: 'Twitter/X',
          content: 'New heat dropped! 🔥 Listen now',
          hashtags: ['#Music', '#NewRelease'],
        },
        {
          platform: 'TikTok',
          content: 'Full track on YouTube! 🎶',
          hashtags: ['#FYP', '#Music', '#Viral'],
        },
      ]);
      setGenerating(false);
    }, 2500);
  };

  return (
    <div className="bg-myai-bg-panel/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
      <div className="mb-6">
        <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <span className="gradient-text">YouTube to Social Content</span>
          <span className="text-sm text-gray-400">📱</span>
        </h3>
        <p className="text-gray-400 text-sm">Auto-generate social media posts from your YouTube video</p>
      </div>

      {/* URL Input */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2">
          YouTube Video URL
        </label>
        <input
          type="url"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          placeholder="https://youtube.com/watch?v=..."
          className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/10 focus:border-myai-primary outline-none text-white placeholder-gray-500"
          disabled={generating}
        />
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={!youtubeUrl.trim() || generating}
        className={`w-full py-3 rounded-lg font-bold text-lg transition-all duration-300 ${
          generating || !youtubeUrl.trim()
            ? 'bg-gray-600 cursor-not-allowed'
            : 'bg-gradient-to-r from-myai-primary to-myai-accent hover:scale-[1.02] hover:shadow-lg hover:shadow-myai-primary/50'
        }`}
      >
        {generating ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block size-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            Generating Posts...
          </span>
        ) : (
          'Generate Social Posts'
        )}
      </button>

      {/* Generated Content */}
      <AnimatePresence>
        {generatedContent.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-8 space-y-4"
          >
            {generatedContent.map((item, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-black/30 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold text-myai-accent">{item.platform}</div>
                  <button className="px-3 py-1 rounded-md bg-white/10 hover:bg-white/20 text-xs font-semibold transition-colors">
                    Copy
                  </button>
                </div>
                <p className="text-white mb-2">{item.content}</p>
                {item.hashtags && (
                  <div className="flex flex-wrap gap-2">
                    {item.hashtags.map((tag, tagIdx) => (
                      <span key={tagIdx} className="text-xs text-myai-primary">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info */}
      <div className="mt-6 p-4 rounded-lg bg-black/20 border border-white/5">
        <p className="text-xs text-gray-400">
          <span className="font-semibold text-white">Pro Tip:</span> Content is optimized for each platform's 
          best practices, character limits, and trending hashtags.
        </p>
      </div>
    </div>
  );
}
