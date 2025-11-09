'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { creationApi } from '@/lib/services/api';
import { getLevelFromPoints, LEVELS } from '@/lib/constants/gamification';
import { formatTimeSaved, formatNumber } from '@/lib/utils/helpers';
import type { Creation } from '@/lib/types';

export default function ProfilePage() {
  const { user, profile, isLoading: authLoading } = useAuth();
  const [creations, setCreations] = useState<Creation[]>([]);

  const loadCreations = useCallback(async () => {
    try {
      const response = await creationApi.list({ public: true });
      setCreations(response.creations.filter(c => c.userId === user?.id));
    } catch (error) {
      console.error('Failed to load creations:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!authLoading && user) {
      loadCreations();
    }
  }, [authLoading, user, loadCreations]);

  if (authLoading || !user || !profile) {
    return (
      <div className="min-h-screen bg-myai-bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block size-8 rounded-full border-2 border-white/30 border-t-white animate-spin mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const currentLevelNum = getLevelFromPoints(profile.pointsTotal);
  const currentLevel = LEVELS.find(l => l.level === currentLevelNum) || LEVELS[0];

  const stats = [
    { label: 'Points', value: formatNumber(profile.pointsTotal), icon: '⭐' },
    { label: 'Time Saved', value: formatTimeSaved(profile.timeSavedSecTotal), icon: '⏱️' },
    { label: 'Badges', value: profile.badges.length, icon: '🎖️' },
    { label: 'Rank', value: '#3', icon: '🏆' },
  ];

  return (
    <div className="min-h-screen bg-myai-bg-dark">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-myai-bg-dark/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-myai-primary to-myai-accent flex items-center justify-center font-bold text-white text-lg">
                M
              </div>
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-myai-primary to-myai-accent opacity-50 blur-md group-hover:opacity-75 transition-opacity" />
            </div>
            <span className="font-display text-xl font-bold">
              MyAiPlug<span className="text-myai-accent">™</span>
            </span>
          </Link>

          <Link
            href="/dashboard"
            className="px-4 py-2 bg-myai-bg-panel/60 backdrop-blur-xl border border-white/10 rounded-lg hover:border-white/20 transition-colors text-sm font-medium"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 pt-24 pb-12">
        {/* Banner & Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-myai-bg-panel/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden mb-6"
        >
          {/* Banner */}
          <div className="h-48 bg-gradient-to-br from-myai-primary via-purple-600 to-myai-accent relative">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0 bg-[url('/patterns/dots.svg')] bg-repeat"></div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16 relative">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-myai-primary to-myai-accent flex items-center justify-center text-5xl font-bold text-white border-4 border-myai-bg-panel">
                  {user.handle[0].toUpperCase()}
                </div>
                {/* Level Badge */}
                <div className="absolute -bottom-2 -right-2 px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-sm font-bold text-white border-2 border-myai-bg-panel">
                  Lvl {profile.level}
                </div>
              </div>

              {/* Name & Bio */}
              <div className="flex-1">
                <h1 className="font-display text-3xl font-bold text-white mb-1">
                  @{user.handle}
                </h1>
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-sm text-purple-300 font-medium">
                    {currentLevel.name}
                  </span>
                  <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-sm text-blue-300 font-medium capitalize">
                    {user.tier}
                  </span>
                </div>
                <p className="text-gray-300 mb-4 max-w-2xl">
                  {user.bio || 'No bio yet'}
                </p>
              </div>

              {/* Edit Button (only visible to owner) */}
              <Link
                href="/settings"
                className="px-6 py-3 bg-myai-bg-dark/50 border border-white/10 rounded-lg hover:border-white/20 transition-colors text-sm font-medium"
              >
                Edit Profile
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
        >
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="bg-myai-bg-panel/60 backdrop-blur-xl border border-white/10 rounded-xl p-5 text-center"
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-myai-bg-panel/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6"
        >
          <h2 className="font-display text-xl font-bold mb-4">Badges Earned</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {profile.badges.map((badge) => (
              <div
                key={badge.id}
                className="p-4 bg-myai-bg-dark/50 rounded-xl border border-white/5 hover:border-white/10 transition-colors text-center group cursor-pointer"
              >
                <div className="text-4xl mb-2">🎖️</div>
                <div className="text-sm font-medium text-white mb-1">{badge.name}</div>
                <div className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
                  {badge.description}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Public Creations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-myai-bg-panel/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-bold">Portfolio</h2>
            <Link
              href="/dashboard/portfolio"
              className="text-myai-accent hover:underline text-sm font-medium"
            >
              Manage →
            </Link>
          </div>

          {creations.filter(c => c.public).length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {creations.filter(c => c.public).map((creation) => (
                <div
                  key={creation.id}
                  className="bg-myai-bg-dark/50 rounded-xl border border-white/5 hover:border-white/10 transition-colors overflow-hidden group"
                >
                  {/* Thumbnail */}
                  <div className="aspect-video bg-gradient-to-br from-myai-primary/20 to-myai-accent/20 flex items-center justify-center text-4xl">
                    🎵
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-white mb-2 line-clamp-1">
                      {creation.title}
                    </h3>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {creation.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-white/5 rounded text-xs text-gray-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        👁️ {creation.views}
                      </span>
                      <span className="flex items-center gap-1">
                        ⬇️ {creation.downloads}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-3">🎨</div>
              <p className="mb-4">No public creations yet</p>
              <Link
                href="/dashboard/portfolio"
                className="inline-block px-6 py-3 bg-gradient-to-r from-myai-primary to-myai-accent text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-myai-accent/30 transition-all"
              >
                Publish Your First Creation
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
