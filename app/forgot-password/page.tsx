'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email is required');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    // Mock password reset - in production, this would call an API
    setTimeout(() => {
      console.log('Password reset request for:', email);
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1000);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-myai-bg-dark flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <div className="relative">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-myai-primary to-myai-accent flex items-center justify-center font-bold text-white text-xl">
                  M
                </div>
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-myai-primary to-myai-accent opacity-50 blur-md group-hover:opacity-75 transition-opacity" />
              </div>
              <span className="font-display text-2xl font-bold">
                MyAiPlug<span className="text-myai-accent">™</span>
              </span>
            </Link>
          </div>

          {/* Success Message */}
          <div className="bg-myai-bg-panel/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="font-display text-2xl font-bold mb-2">Check Your Email</h1>
            <p className="text-gray-400 mb-6">
              We&apos;ve sent a password reset link to <strong className="text-white">{email}</strong>
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Click the link in the email to reset your password. The link will expire in 1 hour.
            </p>
            <Link
              href="/signin"
              className="inline-block px-6 py-3 bg-gradient-to-r from-myai-primary to-myai-accent text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-myai-accent/30 transition-all"
            >
              Back to Sign In
            </Link>
            <p className="text-sm text-gray-500 mt-6">
              Didn&apos;t receive the email?{' '}
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail('');
                }}
                className="text-myai-accent hover:underline"
              >
                Try again
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-myai-bg-dark flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="relative">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-myai-primary to-myai-accent flex items-center justify-center font-bold text-white text-xl">
                M
              </div>
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-myai-primary to-myai-accent opacity-50 blur-md group-hover:opacity-75 transition-opacity" />
            </div>
            <span className="font-display text-2xl font-bold">
              MyAiPlug<span className="text-myai-accent">™</span>
            </span>
          </Link>
          <h1 className="font-display text-3xl font-bold mt-6 mb-2">
            Reset Password
          </h1>
          <p className="text-gray-400">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        {/* Reset Form */}
        <div className="bg-myai-bg-panel/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                className={`w-full px-4 py-3 bg-myai-bg-dark/50 border ${
                  error ? 'border-red-500' : 'border-white/10'
                } rounded-lg focus:outline-none focus:border-myai-accent transition-colors text-white`}
                placeholder="you@example.com"
              />
              {error && (
                <p className="text-red-500 text-sm mt-1">{error}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-myai-primary to-myai-accent text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-myai-accent/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          {/* Back to Sign In */}
          <p className="text-center text-gray-400 text-sm mt-6">
            Remember your password?{' '}
            <Link href="/signin" className="text-myai-accent hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
