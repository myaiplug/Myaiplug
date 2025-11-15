"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import NewsletterSignup from './NewsletterSignup';

const blogArticles = [
  {
    id: 1,
    title: "The Rise of AI in Music Production: A New Era of Creativity",
    excerpt: "Discover how AI-powered tools are revolutionizing the music production landscape, empowering creators to produce studio-quality tracks without expensive hardware or years of training.",
    author: "Sarah Mitchell",
    role: "Audio Engineer & AI Specialist",
    date: "Jan 15, 2025",
    readTime: "5 min read",
    category: "AI & Innovation",
    gradient: "from-purple-500/20 to-blue-500/20",
  },
  {
    id: 2,
    title: "From Bedroom to Billboard: Success Stories of Independent Artists",
    excerpt: "Learn how modern creators are leveraging AI audio tools to compete with major labels. Real stories from artists who transformed their bedroom setups into chart-topping production studios.",
    author: "Marcus Chen",
    role: "Music Producer & Industry Analyst",
    date: "Jan 12, 2025",
    readTime: "7 min read",
    category: "Success Stories",
    gradient: "from-pink-500/20 to-orange-500/20",
  },
  {
    id: 3,
    title: "Mastering the Art of Social Media for Musicians",
    excerpt: "A comprehensive guide to building your online presence, growing your fanbase, and maximizing engagement across Instagram, TikTok, YouTube, and beyond. Learn the strategies that work in 2025.",
    author: "Zara Johnson",
    role: "Social Media Strategist",
    date: "Jan 10, 2025",
    readTime: "6 min read",
    category: "Marketing & Growth",
    gradient: "from-green-500/20 to-teal-500/20",
  },
  {
    id: 4,
    title: "Quality Control in the Age of AI: Ensuring Professional Sound",
    excerpt: "Dive deep into the world of audio QC. Understand LUFS, peak detection, clipping prevention, and how AI-powered quality control ensures your tracks meet industry standards every time.",
    author: "Dr. Alex Rodriguez",
    role: "Audio Technology Researcher",
    date: "Jan 8, 2025",
    readTime: "8 min read",
    category: "Technical Deep-Dive",
    gradient: "from-blue-500/20 to-indigo-500/20",
  },
];

export default function BlogSection() {
  return (
    <section id="blog" className="py-24 px-6 bg-gradient-to-b from-transparent via-myai-bg-panel/20 to-transparent">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Latest from the <span className="gradient-text">Blog</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Insights, tutorials, and stories from the world of AI-powered music creation
          </p>
        </motion.div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {blogArticles.map((article, idx) => (
            <motion.article
              key={article.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="group relative bg-myai-bg-panel/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-myai-primary/40 transition-all duration-500 hover:shadow-2xl hover:shadow-myai-primary/20"
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${article.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              {/* Content */}
              <div className="relative z-10 p-6">
                {/* Category Badge */}
                <div className="inline-block mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-myai-primary/20 text-myai-primary border border-myai-primary/30">
                    {article.category}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-myai-accent transition-colors duration-300">
                  {article.title}
                </h3>

                {/* Excerpt */}
                <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                  {article.excerpt}
                </p>

                {/* Author & Meta */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-white">{article.author}</div>
                    <div className="text-xs text-gray-500">{article.role}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400">{article.date}</div>
                    <div className="text-xs text-myai-accent font-medium">{article.readTime}</div>
                  </div>
                </div>

                {/* Read More Link */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <Link 
                    href={`#blog-${article.id}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-myai-primary group-hover:text-myai-accent transition-colors duration-300"
                  >
                    Read Full Article
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Decorative corner gradient */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-myai-accent/20 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.article>
          ))}
        </div>

        {/* View All Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-12"
        >
          <Link href="#blog">
            <button className="px-8 py-3 bg-white/5 border border-white/10 text-white font-semibold rounded-lg hover:bg-white/10 hover:border-myai-primary/40 transition-all duration-300 group">
              <span className="flex items-center gap-2">
                View All Articles
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </button>
          </Link>
        </motion.div>

        {/* Newsletter Signup Component */}
        <NewsletterSignup />
      </div>
    </section>
  );
}
