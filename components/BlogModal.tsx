"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useMemo } from 'react';
import DOMPurify from 'isomorphic-dompurify';

export interface BlogArticle {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  role: string;
  date: string;
  readTime: string;
  category: string;
  gradient: string;
  fullContent?: string;
}

interface BlogModalProps {
  article: BlogArticle | null;
  onClose: () => void;
}

export default function BlogModal({ article, onClose }: BlogModalProps) {
  // Sanitize HTML content to prevent XSS attacks
  const sanitizedContent = useMemo(() => {
    if (!article?.fullContent) return '';
    return DOMPurify.sanitize(article.fullContent, {
      ALLOWED_TAGS: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'strong', 'em', 'br', 'a'],
      ALLOWED_ATTR: ['class', 'href', 'target', 'rel'],
    });
  }, [article?.fullContent]);

  useEffect(() => {
    if (article) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [article]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (article) {
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [article, onClose]);

  if (!article) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-myai-bg-panel/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="sticky top-4 right-4 float-right z-20 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Article Header */}
          <div className={`relative p-8 pb-6 bg-gradient-to-br ${article.gradient} border-b border-white/10`}>
            <div className="mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-myai-primary/20 text-myai-primary border border-myai-primary/30">
                {article.category}
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {article.title}
            </h2>
            <div className="flex items-center gap-4 text-sm">
              <div>
                <div className="font-semibold text-white">{article.author}</div>
                <div className="text-gray-400">{article.role}</div>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div className="text-gray-400">{article.date}</div>
              <div className="text-myai-accent font-medium">{article.readTime}</div>
            </div>
          </div>

          {/* Article Content */}
          <div className="p-8">
            <div className="prose prose-invert prose-lg max-w-none">
              {sanitizedContent ? (
                <div
                  className="text-gray-300 leading-relaxed space-y-6"
                  dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                />
              ) : (
                <div className="text-gray-300 leading-relaxed space-y-6">
                  <p className="text-lg text-gray-400 italic">{article.excerpt}</p>
                  
                  <p>
                    This is where the full blog post content would appear. The article would provide 
                    in-depth insights, detailed explanations, and valuable information for readers 
                    interested in {article.category.toLowerCase()}.
                  </p>

                  <h3 className="text-2xl font-bold text-white mt-8 mb-4">Introduction</h3>
                  <p>
                    Welcome to this comprehensive guide. In this article, we'll explore the key concepts 
                    and provide you with actionable insights that you can apply immediately.
                  </p>

                  <h3 className="text-2xl font-bold text-white mt-8 mb-4">Key Takeaways</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-300">
                    <li>Understanding the fundamentals is crucial for success</li>
                    <li>Practical application of these concepts yields the best results</li>
                    <li>Continuous learning and adaptation are key to staying ahead</li>
                    <li>Community and collaboration enhance the creative process</li>
                  </ul>

                  <h3 className="text-2xl font-bold text-white mt-8 mb-4">Conclusion</h3>
                  <p>
                    As we've explored in this article, the landscape is constantly evolving. By staying 
                    informed and applying these principles, you'll be well-positioned to succeed in your 
                    creative journey with MyAiPlug™.
                  </p>
                </div>
              )}
            </div>

            {/* Share Section */}
            <div className="mt-12 pt-8 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Did you find this article helpful?
                </div>
                <div className="flex gap-3">
                  <button className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-semibold transition-colors">
                    Share
                  </button>
                  <button className="px-4 py-2 rounded-lg bg-myai-primary hover:bg-myai-primary/80 text-white text-sm font-semibold transition-colors">
                    Subscribe to Blog
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
