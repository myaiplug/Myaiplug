'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockBlogPosts } from '@/lib/data/blogPosts';
import { BlogPost, RemixFormat } from '@/lib/types';
import Link from 'next/link';

const remixFormats: { format: RemixFormat; icon: string; label: string }[] = [
  { format: 'facebook', icon: '📘', label: 'Facebook Post' },
  { format: 'instagram', icon: '📸', label: 'Instagram Caption' },
  { format: 'twitter', icon: '🐦', label: 'X/Twitter Thread' },
  { format: 'voiceover', icon: '🎙️', label: 'Voice-over Script' },
  { format: 'user_video', icon: '🎬', label: 'User Video Script' },
  { format: 'short_form', icon: '📱', label: 'Shorts/TikTok Guide' },
];

export default function BlogPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'views'>('date');
  const [remixing, setRemixing] = useState(false);
  const [remixedContent, setRemixedContent] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<RemixFormat | null>(null);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(mockBlogPosts.map((post) => post.category));
    return ['all', ...Array.from(cats)];
  }, []);

  // Filter and sort posts
  const filteredPosts = useMemo(() => {
    let posts = mockBlogPosts;

    // Filter by search
    if (searchQuery) {
      posts = posts.filter(
        (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      posts = posts.filter((post) => post.category === selectedCategory);
    }

    // Sort
    posts = [...posts].sort((a, b) => {
      if (sortBy === 'date') {
        return b.publishedAt.getTime() - a.publishedAt.getTime();
      }
      return b.views - a.views;
    });

    return posts;
  }, [searchQuery, selectedCategory, sortBy]);

  const currentPost = filteredPosts[currentIndex] || null;

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : filteredPosts.length - 1));
    setRemixedContent(null);
    setSelectedFormat(null);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < filteredPosts.length - 1 ? prev + 1 : 0));
    setRemixedContent(null);
    setSelectedFormat(null);
  };

  const handleRemix = async (format: RemixFormat) => {
    if (!currentPost) return;

    setRemixing(true);
    setSelectedFormat(format);
    setRemixedContent(null);

    try {
      const response = await fetch('/api/blog/remix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: currentPost.content,
          format,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setRemixedContent(data.remixedContent);
      } else {
        alert('Failed to remix content: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Remix error:', error);
      alert('Failed to remix content. Please try again.');
    } finally {
      setRemixing(false);
    }
  };

  const copyToClipboard = () => {
    if (remixedContent) {
      navigator.clipboard.writeText(remixedContent);
      alert('Copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-myai-bg-dark text-white pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-display text-5xl font-bold mb-4">
            <span className="gradient-text">Blog & Resources</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Discover insights, tutorials, and tips for creators. Use AI to remix any article for your platform.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-myai-bg-panel/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentIndex(0);
                }}
                className="w-full px-4 py-2 bg-myai-bg-dark border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-myai-accent"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentIndex(0);
                }}
                className="w-full px-4 py-2 bg-myai-bg-dark border border-white/10 rounded-lg text-white focus:outline-none focus:border-myai-accent"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as 'date' | 'views');
                  setCurrentIndex(0);
                }}
                className="w-full px-4 py-2 bg-myai-bg-dark border border-white/10 rounded-lg text-white focus:outline-none focus:border-myai-accent"
              >
                <option value="date">Latest</option>
                <option value="views">Most Popular</option>
              </select>
            </div>
          </div>
        </div>

        {/* Carousel */}
        {filteredPosts.length > 0 ? (
          <div className="relative">
            {/* Navigation Arrows */}
            <button
              onClick={handlePrevious}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-20 w-12 h-12 bg-myai-bg-panel/80 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-myai-primary/20 hover:border-myai-primary transition-all shadow-lg"
              aria-label="Previous post"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={handleNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-20 w-12 h-12 bg-myai-bg-panel/80 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-myai-primary/20 hover:border-myai-primary transition-all shadow-lg"
              aria-label="Next post"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Post Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="bg-myai-bg-panel/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
              >
                {/* Category Badge */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-myai-accent/20 text-myai-accent text-sm font-medium rounded-full">
                    {currentPost.category}
                  </span>
                  <span className="text-gray-400 text-sm">
                    {currentPost.publishedAt.toLocaleDateString()} • {currentPost.views} views
                  </span>
                </div>

                <h2 className="font-display text-3xl font-bold mb-4">{currentPost.title}</h2>

                <p className="text-gray-300 text-lg mb-6">{currentPost.excerpt}</p>

                <div className="prose prose-invert max-w-none mb-6">
                  <p className="text-gray-400 whitespace-pre-line">{currentPost.content}</p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {currentPost.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-white/5 text-gray-300 text-sm rounded-full border border-white/10"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Author */}
                <div className="flex items-center gap-3 pb-6 mb-6 border-b border-white/10">
                  <div className="w-10 h-10 bg-gradient-to-br from-myai-primary to-myai-accent rounded-full flex items-center justify-center text-xl">
                    ✍️
                  </div>
                  <div>
                    <div className="font-medium">{currentPost.author}</div>
                    <div className="text-sm text-gray-400">Content Creator</div>
                  </div>
                </div>

                {/* AI Remix Section */}
                <div>
                  <h3 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                    <span>🎨</span>
                    <span>AI Remix This Article</span>
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Transform this article into different formats for your social media and content needs.
                  </p>

                  {/* Format Buttons */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                    {remixFormats.map(({ format, icon, label }) => (
                      <button
                        key={format}
                        onClick={() => handleRemix(format)}
                        disabled={remixing}
                        className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                          selectedFormat === format
                            ? 'bg-myai-primary/20 border-myai-primary text-white'
                            : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <span className="text-xl">{icon}</span>
                        <span className="text-sm font-medium">{label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Remixed Content Display */}
                  {remixing && (
                    <div className="flex items-center justify-center py-8 text-gray-400">
                      <div className="inline-block size-6 rounded-full border-2 border-white/30 border-t-white animate-spin mr-3" />
                      Remixing content with AI...
                    </div>
                  )}

                  {remixedContent && !remixing && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-myai-bg-dark/50 border border-white/10 rounded-lg p-6"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-lg">Remixed Content</h4>
                        <button
                          onClick={copyToClipboard}
                          className="px-4 py-2 bg-myai-accent/20 text-myai-accent border border-myai-accent/30 rounded-lg text-sm font-medium hover:bg-myai-accent/30 transition-colors"
                        >
                          📋 Copy
                        </button>
                      </div>
                      <div className="text-gray-300 whitespace-pre-line">{remixedContent}</div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Carousel Indicators */}
            <div className="flex justify-center gap-2 mt-6">
              {filteredPosts.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index);
                    setRemixedContent(null);
                    setSelectedFormat(null);
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? 'w-8 bg-myai-accent'
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                  aria-label={`Go to post ${index + 1}`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-400 text-lg">No posts found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
