"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setStatus('error');
      setMessage('Please enter your email');
      return;
    }

    setStatus('loading');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          source: 'blog',
          tags: ['blog-signup'],
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage(data.message || 'Successfully subscribed!');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Subscription failed. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="mt-16 max-w-2xl mx-auto"
    >
      <div className="bg-gradient-to-br from-myai-primary/20 via-myai-bg-panel/40 to-myai-accent/20 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
        {/* Icon/Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-myai-primary/20 border border-myai-primary/30 mb-4">
            <span className="text-3xl">📬</span>
          </div>
          <h3 className="text-2xl font-bold mb-2">
            Stay in the <span className="gradient-text">Loop</span>
          </h3>
          <p className="text-gray-400">
            Get the latest articles, tips, and AI music production insights delivered to your inbox. No spam, just value.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={status === 'loading' || status === 'success'}
              className="flex-1 px-4 py-3 bg-myai-bg-panel/60 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-myai-primary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={status === 'loading' || status === 'success'}
              className="px-8 py-3 bg-gradient-to-r from-myai-primary to-myai-accent text-white font-semibold rounded-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {status === 'loading' ? 'Subscribing...' : status === 'success' ? 'Subscribed! ✓' : 'Subscribe'}
            </button>
          </div>

          {/* Status Message */}
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-sm text-center py-2 px-4 rounded-lg ${
                status === 'success'
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                  : status === 'error'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              }`}
            >
              {message}
            </motion.div>
          )}
        </form>

        {/* Privacy Note */}
        <p className="text-xs text-gray-500 text-center mt-4">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </div>
    </motion.div>
  );
}
