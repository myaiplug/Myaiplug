'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function SignUp() {
  const router = useRouter();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    handle: '',
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

    if (!formData.handle) {
      newErrors.handle = 'Handle is required';
    } else if (formData.handle.length < 3) {
      newErrors.handle = 'Handle must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.handle)) {
      newErrors.handle = 'Handle can only contain letters, numbers, and underscores';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      await signup(formData.email, formData.password, formData.handle);
      router.push('/dashboard');
    } catch (error: any) {
      setErrors({ general: error.message || 'Sign up failed. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
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
            Create Your Account
          </h1>
          <p className="text-gray-400">
            Start earning points and climbing the leaderboard
          </p>
        </div>

        {/* Sign Up Form */}
        <div className="bg-myai-bg-panel/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          {errors.general && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
              {errors.general}
            </div>
          )}
          
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

            {/* Handle */}
            <div>
              <label htmlFor="handle" className="block text-sm font-medium text-gray-300 mb-2">
                Handle
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">@</span>
                <input
                  type="text"
                  id="handle"
                  name="handle"
                  value={formData.handle}
                  onChange={handleChange}
                  className={`w-full pl-8 pr-4 py-3 bg-myai-bg-dark/50 border ${
                    errors.handle ? 'border-red-500' : 'border-white/10'
                  } rounded-lg focus:outline-none focus:border-myai-accent transition-colors text-white`}
                  placeholder="your_handle"
                />
              </div>
              {errors.handle && (
                <p className="text-red-500 text-sm mt-1">{errors.handle}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                Your public username (letters, numbers, underscores only)
              </p>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
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

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-myai-bg-dark/50 border ${
                  errors.confirmPassword ? 'border-red-500' : 'border-white/10'
                } rounded-lg focus:outline-none focus:border-myai-accent transition-colors text-white`}
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-myai-primary to-myai-accent text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-myai-accent/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* Bonus Info */}
          <div className="mt-6 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-sm text-yellow-200/90 flex items-center gap-2">
              <span className="text-xl">🎁</span>
              <span>
                <strong>+150 points</strong> for signing up + <strong>100 free credits</strong>
              </span>
            </p>
          </div>

          {/* Sign In Link */}
          <p className="text-center text-gray-400 text-sm mt-6">
            Already have an account?{' '}
            <Link href="/signin" className="text-myai-accent hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        {/* Terms */}
        <p className="text-center text-gray-500 text-xs mt-6">
          By creating an account, you agree to our{' '}
          <a href="#" className="text-myai-accent hover:underline">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-myai-accent hover:underline">Privacy Policy</a>
        </p>
      </motion.div>
    </div>
  );
}
