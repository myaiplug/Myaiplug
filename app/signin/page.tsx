'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function SignIn() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    // Mock authentication - in production, this would call an API
    setTimeout(() => {
      console.log('Sign in attempt:', formData);
      // For now, redirect to dashboard
      setIsSubmitting(false);
      router.push('/dashboard');
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

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
            Welcome Back
          </h1>
          <p className="text-gray-400">
            Sign in to continue your creator journey
          </p>
        </div>

        {/* Sign In Form */}
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
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-myai-bg-dark/50 border ${
                  errors.email ? 'border-red-500' : 'border-white/10'
                } rounded-lg focus:outline-none focus:border-myai-accent transition-colors text-white`}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  Password
                </label>
                <Link href="/forgot-password" className="text-sm text-myai-accent hover:underline">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-myai-bg-dark/50 border ${
                  errors.password ? 'border-red-500' : 'border-white/10'
                } rounded-lg focus:outline-none focus:border-myai-accent transition-colors text-white`}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-myai-primary to-myai-accent text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-myai-accent/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center text-gray-400 text-sm mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-myai-accent hover:underline">
              Create one now
            </Link>
          </p>
        </div>

        {/* Benefits Reminder */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-myai-bg-panel/40 backdrop-blur-xl border border-white/10 rounded-lg">
            <div className="text-2xl mb-1">⚡</div>
            <div className="text-xs text-gray-400">Lightning Fast</div>
          </div>
          <div className="text-center p-3 bg-myai-bg-panel/40 backdrop-blur-xl border border-white/10 rounded-lg">
            <div className="text-2xl mb-1">🎯</div>
            <div className="text-xs text-gray-400">Quality Guaranteed</div>
          </div>
          <div className="text-center p-3 bg-myai-bg-panel/40 backdrop-blur-xl border border-white/10 rounded-lg">
            <div className="text-2xl mb-1">🏆</div>
            <div className="text-xs text-gray-400">Earn Rewards</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
