'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockBlogPosts } from '@/lib/data/blogPosts';
import { BlogPost, RemixFormat } from '@/lib/types';
import { BLOG_CONTENT_COSTS, BLOG_GENERATION_POINTS, BLOG_BADGES } from '@/lib/constants/pricing';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const toneOptions = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual & Friendly' },
  { value: 'enthusiastic', label: 'Enthusiastic' },
  { value: 'educational', label: 'Educational' },
  { value: 'inspiring', label: 'Inspiring' },
];

const demographicOptions = [
  { value: 'musicians', label: 'Musicians & Producers' },
  { value: 'content creators', label: 'Content Creators' },
  { value: 'podcasters', label: 'Podcasters' },
  { value: 'video creators', label: 'Video Creators' },
  { value: 'general audience', label: 'General Audience' },
];

const remixFormats: { format: RemixFormat; icon: string; label: string }[] = [
  { format: 'facebook', icon: '📘', label: 'Facebook Post' },
  { format: 'instagram', icon: '📸', label: 'Instagram Caption' },
  { format: 'twitter', icon: '🐦', label: 'X/Twitter Thread' },
  { format: 'voiceover', icon: '🎙️', label: 'Voice-over Script' },
  { format: 'user_video', icon: '🎬', label: 'User Video Script' },
  { format: 'short_form', icon: '📱', label: 'Shorts/TikTok Guide' },
];

function BlogPageContent() {
  const searchParams = useSearchParams();
  const articleId = searchParams.get('article');
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'views'>('date');
  const [remixing, setRemixing] = useState(false);
  const [remixedContent, setRemixedContent] = useState<string | null>(null);
  const [graphicSuggestion, setGraphicSuggestion] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<RemixFormat | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);
  
  // Customization options
  const [selectedTone, setSelectedTone] = useState('professional');
  const [selectedDemographic, setSelectedDemographic] = useState('content creators');
  const [includeGraphic, setIncludeGraphic] = useState(true);
  
  // Badge and points state
  const [showBadgeReward, setShowBadgeReward] = useState(false);
  const [earnedBadge, setEarnedBadge] = useState<any>(null);
  const [generationCount, setGenerationCount] = useState(0);

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

  // Set initial article if articleId is in URL
  useEffect(() => {
    if (articleId) {
      const index = filteredPosts.findIndex(post => post.id === articleId);
      if (index !== -1) {
        setCurrentIndex(index);
      }
    }
  }, [articleId, filteredPosts]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : filteredPosts.length - 1));
    setRemixedContent(null);
    setGraphicSuggestion(null);
    setSelectedFormat(null);
    setShowModal(false);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < filteredPosts.length - 1 ? prev + 1 : 0));
    setRemixedContent(null);
    setGraphicSuggestion(null);
    setSelectedFormat(null);
    setShowModal(false);
  };

  const handleRemix = async (format: RemixFormat) => {
    if (!currentPost) return;

    const tokenCost = BLOG_CONTENT_COSTS[format as keyof typeof BLOG_CONTENT_COSTS] || 25;
    
    // Show confirmation with token cost
    const confirmed = confirm(
      `Generate ${format} content?\n\nCost: ${tokenCost} tokens\nReward: ${BLOG_GENERATION_POINTS[format as keyof typeof BLOG_GENERATION_POINTS]} points\n\nProceed?`
    );
    
    if (!confirmed) return;

    setRemixing(true);
    setSelectedFormat(format);
    setRemixedContent(null);
    setGraphicSuggestion(null);

    try {
      const response = await fetch('/api/blog/remix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: currentPost.content,
          format,
          tone: selectedTone,
          demographic: selectedDemographic,
          includeGraphic,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setRemixedContent(data.remixedContent);
        setGraphicSuggestion(data.graphicSuggestion);
        setShowModal(true);
        
        // Check for badge rewards
        const newCount = generationCount + 1;
        setGenerationCount(newCount);
        
        if (newCount === 1) {
          setEarnedBadge(BLOG_BADGES.first_generation);
          setShowBadgeReward(true);
        } else if (newCount === 10) {
          setEarnedBadge(BLOG_BADGES.content_specialist);
          setShowBadgeReward(true);
        } else if (newCount === 50) {
          setEarnedBadge(BLOG_BADGES.content_master);
          setShowBadgeReward(true);
        }
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

  const openInNewTab = () => {
    if (remixedContent) {
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Generated Content - ${selectedFormat}</title>
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                  max-width: 800px;
                  margin: 40px auto;
                  padding: 20px;
                  background: #1a1a1a;
                  color: #fff;
                  line-height: 1.6;
                }
                h1 {
                  color: #7C4DFF;
                  border-bottom: 2px solid #7C4DFF;
                  padding-bottom: 10px;
                }
                .content {
                  white-space: pre-wrap;
                  background: #2a2a2a;
                  padding: 20px;
                  border-radius: 8px;
                  margin: 20px 0;
                }
                .graphic {
                  background: #333;
                  padding: 15px;
                  border-radius: 8px;
                  border-left: 4px solid #7C4DFF;
                  margin: 20px 0;
                }
                button {
                  background: #7C4DFF;
                  color: white;
                  border: none;
                  padding: 10px 20px;
                  border-radius: 6px;
                  cursor: pointer;
                  font-size: 14px;
                  margin-right: 10px;
                }
                button:hover {
                  background: #6C3EEF;
                }
              </style>
            </head>
            <body>
              <h1>Generated ${selectedFormat} Content</h1>
              <div class="content">${remixedContent.replace(/\n/g, '<br>')}</div>
              ${graphicSuggestion ? `
                <div class="graphic">
                  <h3>🎨 Graphic Suggestion</h3>
                  <p>${graphicSuggestion}</p>
                </div>
              ` : ''}
              <button onclick="navigator.clipboard.writeText(document.querySelector('.content').innerText).then(() => alert('Copied!'))">
                📋 Copy Content
              </button>
              <button onclick="window.print()">🖨️ Print</button>
            </body>
          </html>
        `);
      }
    }
  };

  return (
    <div className="min-h-screen bg-myai-bg-dark text-white pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Back to Home Link */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-myai-accent transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>

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

                  {/* Customization Toggle */}
                  <button
                    onClick={() => setShowCustomization(!showCustomization)}
                    className="mb-4 text-sm text-myai-accent hover:text-myai-primary transition-colors flex items-center gap-2"
                  >
                    ⚙️ {showCustomization ? 'Hide' : 'Show'} Customization Options
                  </button>

                  {/* Customization Options */}
                  <AnimatePresence>
                    {showCustomization && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6 p-4 bg-myai-bg-dark/50 rounded-lg border border-white/10"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          {/* Tone Selection */}
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Content Tone
                            </label>
                            <select
                              value={selectedTone}
                              onChange={(e) => setSelectedTone(e.target.value)}
                              className="w-full px-3 py-2 bg-myai-bg-dark border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-myai-accent"
                            >
                              {toneOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Demographic Selection */}
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Target Audience
                            </label>
                            <select
                              value={selectedDemographic}
                              onChange={(e) => setSelectedDemographic(e.target.value)}
                              className="w-full px-3 py-2 bg-myai-bg-dark border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-myai-accent"
                            >
                              {demographicOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Graphic Option */}
                        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={includeGraphic}
                            onChange={(e) => setIncludeGraphic(e.target.checked)}
                            className="w-4 h-4 rounded border-white/10 bg-myai-bg-dark text-myai-accent focus:ring-myai-accent"
                          />
                          Generate graphic suggestion for the content
                        </label>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Format Buttons with Token Costs */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                    {remixFormats.map(({ format, icon, label }) => {
                      const cost = BLOG_CONTENT_COSTS[format as keyof typeof BLOG_CONTENT_COSTS];
                      const points = BLOG_GENERATION_POINTS[format as keyof typeof BLOG_GENERATION_POINTS];
                      return (
                        <button
                          key={format}
                          onClick={() => handleRemix(format)}
                          disabled={remixing}
                          className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                            selectedFormat === format
                              ? 'bg-myai-primary/20 border-myai-primary text-white'
                              : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <span className="text-xl">{icon}</span>
                          <span className="text-sm font-medium text-center">{label}</span>
                          <span className="text-xs text-myai-accent">
                            💎 {cost} | ⭐ +{points}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Remixed Content Display - Inline */}
                  {remixing && (
                    <div className="flex items-center justify-center py-8 text-gray-400">
                      <div className="inline-block size-6 rounded-full border-2 border-white/30 border-t-white animate-spin mr-3" />
                      Remixing content with AI...
                    </div>
                  )}

                  {remixedContent && !remixing && !showModal && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-myai-bg-dark/50 border border-white/10 rounded-lg p-6"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-lg">Remixed Content</h4>
                        <div className="flex gap-2">
                          <button
                            onClick={copyToClipboard}
                            className="px-4 py-2 bg-myai-accent/20 text-myai-accent border border-myai-accent/30 rounded-lg text-sm font-medium hover:bg-myai-accent/30 transition-colors"
                          >
                            📋 Copy
                          </button>
                          <button
                            onClick={openInNewTab}
                            className="px-4 py-2 bg-myai-primary/20 text-myai-primary border border-myai-primary/30 rounded-lg text-sm font-medium hover:bg-myai-primary/30 transition-colors"
                          >
                            🔗 Open in Tab
                          </button>
                        </div>
                      </div>
                      <div className="text-gray-300 whitespace-pre-line mb-4">{remixedContent}</div>
                      {graphicSuggestion && (
                        <div className="mt-4 p-4 bg-myai-primary/10 border border-myai-primary/30 rounded-lg">
                          <h5 className="font-semibold text-sm mb-2 flex items-center gap-2">
                            <span>🎨</span>
                            <span>Graphic Suggestion</span>
                          </h5>
                          <p className="text-sm text-gray-300">{graphicSuggestion}</p>
                        </div>
                      )}
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

        {/* Modal for Generated Content */}
        <AnimatePresence>
          {showModal && remixedContent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-myai-bg-panel border border-white/20 rounded-2xl p-8 max-w-3xl w-full max-h-[80vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display text-2xl font-bold">
                    Generated {selectedFormat} Content
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="bg-myai-bg-dark/50 rounded-lg p-6 mb-6">
                  <div className="text-gray-300 whitespace-pre-line">{remixedContent}</div>
                </div>

                {graphicSuggestion && (
                  <div className="mb-6 p-4 bg-myai-primary/10 border border-myai-primary/30 rounded-lg">
                    <h5 className="font-semibold mb-2 flex items-center gap-2">
                      <span>🎨</span>
                      <span>Graphic Suggestion</span>
                    </h5>
                    <p className="text-sm text-gray-300">{graphicSuggestion}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={copyToClipboard}
                    className="flex-1 px-6 py-3 bg-myai-accent/20 text-myai-accent border border-myai-accent/30 rounded-lg font-medium hover:bg-myai-accent/30 transition-colors"
                  >
                    📋 Copy to Clipboard
                  </button>
                  <button
                    onClick={openInNewTab}
                    className="flex-1 px-6 py-3 bg-myai-primary/20 text-myai-primary border border-myai-primary/30 rounded-lg font-medium hover:bg-myai-primary/30 transition-colors"
                  >
                    🔗 Open in New Tab
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Badge Reward Notification */}
        <AnimatePresence>
          {showBadgeReward && earnedBadge && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-8 right-8 z-50 bg-gradient-to-br from-myai-primary to-myai-accent p-6 rounded-2xl shadow-2xl max-w-sm border border-white/20"
            >
              <div className="flex items-start gap-4">
                <div className="text-5xl">🏆</div>
                <div className="flex-1">
                  <h4 className="font-bold text-xl mb-1">Badge Earned!</h4>
                  <p className="font-semibold text-lg mb-1">{earnedBadge.name}</p>
                  <p className="text-sm text-white/80 mb-2">{earnedBadge.description}</p>
                  <p className="text-sm font-bold">+{earnedBadge.points} Points</p>
                </div>
                <button
                  onClick={() => setShowBadgeReward(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function BlogPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-myai-bg-dark text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block size-8 rounded-full border-2 border-white/30 border-t-white animate-spin mb-4" />
          <p className="text-gray-400">Loading blog...</p>
        </div>
      </div>
    }>
      <BlogPageContent />
    </Suspense>
  );
}
