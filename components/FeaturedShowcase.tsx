"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface FeaturedItem {
  id: string;
  userId: string;
  userHandle: string;
  userAvatar: string | null;
  contentType: 'audio' | 'video' | 'image';
  title: string;
  description: string;
  fileUrl: string;
  thumbnailUrl?: string;
  score: number;
  weekNumber: number;
  year: number;
  metadata?: {
    analysisScore?: number;
    verseAvgScore?: number;
    chorusAvgScore?: number;
  };
}

export default function FeaturedShowcase() {
  const [featuredContent, setFeaturedContent] = useState<FeaturedItem[]>([]);
  const [selectedType, setSelectedType] = useState<'audio' | 'video' | 'image' | 'all'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedContent();
  }, [selectedType]);

  const fetchFeaturedContent = async () => {
    setLoading(true);
    try {
      const typeParam = selectedType !== 'all' ? `?type=${selectedType}` : '';
      const response = await fetch(`/api/featured${typeParam}`);
      const data = await response.json();
      
      if (data.success) {
        setFeaturedContent(data.featured);
      }
    } catch (error) {
      console.error('Failed to fetch featured content:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'audio':
        return '🎵';
      case 'video':
        return '🎬';
      case 'image':
        return '🖼️';
      default:
        return '✨';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'audio':
        return 'from-purple-600 to-pink-600';
      case 'video':
        return 'from-blue-600 to-cyan-600';
      case 'image':
        return 'from-orange-600 to-yellow-600';
      default:
        return 'from-gray-600 to-gray-800';
    }
  };

  return (
    <section id="featured" className="py-20 px-6 bg-gradient-to-b from-black to-myai-bg-panel/20">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Featured <span className="gradient-text">This Week</span>
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Top-quality content from our creator community
          </p>

          {/* Type Filter */}
          <div className="flex justify-center gap-3">
            {['all', 'audio', 'video', 'image'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type as any)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                  selectedType === type
                    ? 'bg-gradient-to-r from-myai-primary to-myai-accent text-white'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                {type === 'all' ? '✨ All' : `${getTypeIcon(type)} ${type.charAt(0).toUpperCase() + type.slice(1)}`}
              </button>
            ))}
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="inline-block size-12 rounded-full border-4 border-white/30 border-t-white animate-spin" />
          </div>
        ) : featuredContent.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No featured content for this week yet.</p>
            <p className="text-gray-500 text-sm mt-2">
              Create amazing content and get featured!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredContent.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="bg-myai-bg-panel/50 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden hover:border-myai-accent/50 transition-all duration-300 group"
              >
                {/* Thumbnail/Preview */}
                <div className={`relative h-48 bg-gradient-to-br ${getTypeColor(item.contentType)} flex items-center justify-center`}>
                  {item.thumbnailUrl ? (
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-6xl">{getTypeIcon(item.contentType)}</div>
                  )}
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-white/20">
                    <span className="text-xs font-bold text-yellow-300">⭐ Featured</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-xl font-bold mb-2 line-clamp-1">{item.title}</h3>
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2">{item.description}</p>

                  {/* Creator Info */}
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-myai-primary to-myai-accent flex items-center justify-center text-sm font-bold">
                      {item.userAvatar ? (
                        <img src={item.userAvatar} alt={item.userHandle} className="w-full h-full rounded-full" />
                      ) : (
                        item.userHandle[0].toUpperCase()
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">@{item.userHandle}</div>
                      <div className="text-xs text-gray-500">Week {item.weekNumber}, {item.year}</div>
                    </div>
                  </div>

                  {/* Scores */}
                  {item.metadata && (
                    <div className="space-y-2 mb-4">
                      {item.metadata.analysisScore && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">Overall Score:</span>
                          <span className="font-bold text-green-400">{item.metadata.analysisScore}/100</span>
                        </div>
                      )}
                      {item.metadata.chorusAvgScore && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">Chorus Avg:</span>
                          <span className="font-bold text-blue-400">{item.metadata.chorusAvgScore.toFixed(1)}/100</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-myai-primary to-myai-accent text-white font-semibold hover:scale-105 transition-transform duration-200">
                      View
                    </button>
                    <button className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                      👍
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <div className="p-8 rounded-2xl bg-gradient-to-r from-myai-primary/20 to-myai-accent/20 border border-myai-primary/30">
            <h3 className="text-2xl font-bold mb-3">Want to be featured?</h3>
            <p className="text-gray-300 mb-6">
              Create exceptional content with our AI tools. Score 90+ on your audio analysis or get high engagement on your creations to be automatically considered for our weekly showcase!
            </p>
            <a
              href="#demo"
              className="inline-block px-8 py-3 bg-gradient-to-r from-myai-accent-warm to-myai-accent-warm-2 text-black font-bold rounded-lg hover:scale-105 transition-transform duration-200"
            >
              Start Creating
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
