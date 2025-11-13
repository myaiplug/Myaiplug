"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import BlogModal, { type BlogArticle } from './BlogModal';

const blogArticles: BlogArticle[] = [
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
    fullContent: `
      <p class="text-lg text-gray-400 italic mb-6">The music production industry is undergoing a transformation that rivals the shift from analog to digital. AI-powered tools are not just augmenting traditional workflows—they're completely reimagining what's possible for creators at every level.</p>
      
      <h3 class="text-2xl font-bold text-white mt-8 mb-4">The Democratization of Music Production</h3>
      <p>For decades, professional music production was gatekept by expensive equipment and years of technical training. A basic home studio could easily cost tens of thousands of dollars, and mastering the craft required extensive apprenticeship. Today, AI is breaking down these barriers in unprecedented ways.</p>
      
      <p>Modern AI tools can analyze your raw recordings and apply professional-grade processing in seconds. What once required intimate knowledge of compressors, EQs, and effect chains can now be achieved through intelligent automation that understands the sonic characteristics you're aiming for.</p>
      
      <h3 class="text-2xl font-bold text-white mt-8 mb-4">Beyond Automation: Creative Partnership</h3>
      <p>The most exciting development isn't just automation—it's the emergence of AI as a creative partner. Tools like MyAiPlug™ don't just process your audio; they understand musical context, genre conventions, and emotional impact.</p>
      
      <ul class="list-disc list-inside space-y-2 text-gray-300 my-6">
        <li>Intelligent mixing that adapts to your genre and style</li>
        <li>Real-time quality control that catches issues before distribution</li>
        <li>Automated mastering that matches industry standards</li>
        <li>Creative effects that understand musical theory</li>
      </ul>
      
      <h3 class="text-2xl font-bold text-white mt-8 mb-4">The Future is Accessible</h3>
      <p>As AI continues to evolve, we're moving toward a future where the only limit to music production is imagination, not budget or technical expertise. This doesn't diminish the value of traditional skills—rather, it amplifies the potential of every creator to realize their vision.</p>
      
      <p>The bedroom producer of today has access to tools that would have been science fiction just a decade ago. And we're just getting started.</p>
    `,
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
    fullContent: `
      <p class="text-lg text-gray-400 italic mb-6">The music industry has fundamentally changed. You no longer need a major label deal to produce chart-quality music. Here are real stories from independent artists who proved it.</p>
      
      <h3 class="text-2xl font-bold text-white mt-8 mb-4">The New Independent Artist</h3>
      <p>Meet Alex Torres, a 24-year-old producer from Miami who released his debut album entirely from his bedroom. Using AI-powered mixing and mastering tools, his tracks competed with major label releases on Spotify's Top 50 charts.</p>
      
      <p>"I couldn't afford a professional studio, but with tools like MyAiPlug™, I didn't need to," Alex explains. "The AI understood what I was going for and helped me achieve that sound without the $10,000 mixing bill."</p>
      
      <h3 class="text-2xl font-bold text-white mt-8 mb-4">The Power of Speed</h3>
      <p>Another crucial advantage is speed. While traditional production might take weeks of back-and-forth with engineers, AI tools enable rapid iteration. Sarah Kim, a pop artist from Seoul, releases a new single every two weeks—a pace that would be impossible with traditional workflows.</p>
      
      <blockquote class="border-l-4 border-myai-primary pl-6 my-8 italic text-gray-300">
        "The game has changed. If you have talent and vision, the technology is there to support you. You don't need permission from anyone anymore." — Marcus Chen
      </blockquote>
      
      <h3 class="text-2xl font-bold text-white mt-8 mb-4">Key Success Factors</h3>
      <ul class="list-disc list-inside space-y-2 text-gray-300 my-6">
        <li>Quality production accessible at any budget</li>
        <li>Rapid iteration and release cycles</li>
        <li>Direct connection with fans through social media</li>
        <li>Data-driven insights into what resonates</li>
        <li>Global distribution through streaming platforms</li>
      </ul>
      
      <p>These artists represent a new generation of creators who are rewriting the rules. The bedroom is the new studio, and AI is the great equalizer.</p>
    `,
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
    fullContent: `
      <p class="text-lg text-gray-400 italic mb-6">Creating great music is only half the battle. In 2025, your social media presence can make or break your career. Here's how to do it right.</p>
      
      <h3 class="text-2xl font-bold text-white mt-8 mb-4">Platform-Specific Strategies</h3>
      <p>Each platform requires a different approach. What works on TikTok won't necessarily work on Instagram, and YouTube demands its own unique strategy.</p>
      
      <h4 class="text-xl font-bold text-white mt-6 mb-3">TikTok: The Discovery Engine</h4>
      <p>TikTok's algorithm is unmatched for discovery. Focus on:</p>
      <ul class="list-disc list-inside space-y-2 text-gray-300 my-4">
        <li>Short, hook-focused clips (15-30 seconds)</li>
        <li>Behind-the-scenes content that feels authentic</li>
        <li>Trending sounds and challenges adapted to your style</li>
        <li>Consistent posting (1-3 times daily)</li>
      </ul>
      
      <h4 class="text-xl font-bold text-white mt-6 mb-3">Instagram: Building Community</h4>
      <p>Instagram is about cultivating a loyal following:</p>
      <ul class="list-disc list-inside space-y-2 text-gray-300 my-4">
        <li>High-quality visuals and cohesive aesthetic</li>
        <li>Stories for daily engagement</li>
        <li>Reels for reach (aim for 30-60 seconds)</li>
        <li>Carousel posts for deeper content</li>
      </ul>
      
      <h4 class="text-xl font-bold text-white mt-6 mb-3">YouTube: Long-Form Value</h4>
      <p>YouTube rewards sustained viewing:</p>
      <ul class="list-disc list-inside space-y-2 text-gray-300 my-4">
        <li>Music videos with strong narratives</li>
        <li>Production tutorials and behind-the-scenes</li>
        <li>Vlogs that build personal connection</li>
        <li>Consistent upload schedule</li>
      </ul>
      
      <h3 class="text-2xl font-bold text-white mt-8 mb-4">Content Creation at Scale</h3>
      <p>The secret? Tools like MyAiPlug™ that help you generate platform-optimized content from a single audio file. Record once, distribute everywhere—with content tailored to each platform's unique requirements.</p>
      
      <h3 class="text-2xl font-bold text-white mt-8 mb-4">Engagement is Everything</h3>
      <p>Don't just post and ghost. Respond to comments, engage with your community, and build genuine relationships. The artists who succeed are those who treat their followers as collaborators in their journey.</p>
    `,
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
    fullContent: `
      <p class="text-lg text-gray-400 italic mb-6">Professional audio quality isn't just about sounding good—it's about meeting specific technical standards that ensure your music performs well across all platforms and playback systems.</p>
      
      <h3 class="text-2xl font-bold text-white mt-8 mb-4">Understanding LUFS</h3>
      <p>LUFS (Loudness Units Full Scale) is the industry standard for measuring loudness. Different platforms have different requirements:</p>
      
      <ul class="list-disc list-inside space-y-2 text-gray-300 my-6">
        <li><strong>Spotify:</strong> -14 LUFS integrated loudness</li>
        <li><strong>Apple Music:</strong> -16 LUFS integrated loudness</li>
        <li><strong>YouTube:</strong> -13 to -15 LUFS</li>
        <li><strong>Tidal:</strong> -14 LUFS</li>
      </ul>
      
      <p>AI-powered tools analyze your track and automatically adjust levels to meet these standards, ensuring your music sounds consistent across platforms without manual intervention.</p>
      
      <h3 class="text-2xl font-bold text-white mt-8 mb-4">Peak Detection and Clipping</h3>
      <p>Digital clipping occurs when audio levels exceed 0 dBFS, resulting in harsh distortion. Traditional limiters can prevent clipping, but they often sacrifice dynamics and introduce artifacts.</p>
      
      <p>Modern AI approaches use predictive analysis to prevent clipping before it occurs, maintaining the energy and impact of your track while ensuring technical compliance.</p>
      
      <h3 class="text-2xl font-bold text-white mt-8 mb-4">Frequency Balance and EQ</h3>
      <p>Professional tracks maintain careful frequency balance:</p>
      
      <ul class="list-disc list-inside space-y-2 text-gray-300 my-6">
        <li><strong>Sub-bass (20-60 Hz):</strong> Felt more than heard, requires careful control</li>
        <li><strong>Bass (60-250 Hz):</strong> Foundation of most tracks</li>
        <li><strong>Midrange (250 Hz-4 kHz):</strong> Where most musical content lives</li>
        <li><strong>Presence (4-8 kHz):</strong> Clarity and definition</li>
        <li><strong>Brilliance (8-20 kHz):</strong> Air and sparkle</li>
      </ul>
      
      <h3 class="text-2xl font-bold text-white mt-8 mb-4">Automated QC Reports</h3>
      <p>MyAiPlug™ generates comprehensive QC reports for every track, including:</p>
      
      <ul class="list-disc list-inside space-y-2 text-gray-300 my-6">
        <li>Peak levels and true peak analysis</li>
        <li>LUFS measurements (integrated, short-term, and momentary)</li>
        <li>Frequency spectrum analysis</li>
        <li>Dynamic range metrics</li>
        <li>Phase correlation for stereo compatibility</li>
        <li>Clipping detection and counts</li>
      </ul>
      
      <h3 class="text-2xl font-bold text-white mt-8 mb-4">The Future of Audio QC</h3>
      <p>As streaming platforms continue to evolve their requirements, AI-powered QC tools will adapt automatically. What once required deep technical expertise is now accessible to every creator, ensuring professional-quality releases regardless of experience level.</p>
    `,
  },
];

export default function BlogSection() {
  const [selectedArticle, setSelectedArticle] = useState<BlogArticle | null>(null);
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
                  <button
                    onClick={() => setSelectedArticle(article)}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-myai-primary group-hover:text-myai-accent transition-colors duration-300"
                  >
                    Read Full Article
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
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

        {/* Newsletter Signup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 bg-gradient-to-br from-myai-primary/10 to-myai-accent/10 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center"
        >
          <h3 className="text-2xl font-bold mb-3">
            Never Miss an Update
          </h3>
          <p className="text-gray-400 mb-6 max-w-lg mx-auto">
            Get the latest articles, tips, and music production insights delivered straight to your inbox
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg bg-black/40 border border-white/10 focus:border-myai-primary outline-none text-white placeholder-gray-500"
            />
            <button className="px-6 py-3 bg-gradient-to-r from-myai-primary to-myai-accent text-white font-semibold rounded-lg hover:scale-105 transition-transform duration-200 whitespace-nowrap">
              Subscribe
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Join 10,000+ creators. Unsubscribe anytime.
          </p>
        </motion.div>
      </div>

      {/* Blog Modal */}
      <BlogModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />
    </section>
  );
}
