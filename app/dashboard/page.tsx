'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/lib/contexts/AuthContext';
import { jobApi } from '@/lib/services/api';
import { getLevelFromPoints, getNextLevelInfo, LEVELS } from '@/lib/constants/gamification';
import { formatTimeSaved, formatNumber } from '@/lib/utils/helpers';
import type { Job } from '@/lib/types';

export default function Dashboard() {
  const { user, profile, isLoading: authLoading } = useAuth();
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);

  const loadJobs = useCallback(async () => {
    try {
      const response = await jobApi.list(5);
      setRecentJobs(response.jobs);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      loadJobs();
    }
  }, [authLoading, user, loadJobs]);

  if (authLoading || !user || !profile) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block size-8 rounded-full border-2 border-white/30 border-t-white animate-spin mb-4" />
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const currentLevelNum = getLevelFromPoints(profile.pointsTotal);
  const currentLevel = LEVELS.find(l => l.level === currentLevelNum) || LEVELS[0];
  const levelInfo = getNextLevelInfo(profile.pointsTotal);
  const nextLevel = levelInfo.nextLevel ? LEVELS.find(l => l.level === levelInfo.nextLevel) : null;
  const progressPercent = levelInfo.progressPercent;

  const stats = [
    {
      label: 'Points',
      value: formatNumber(profile.pointsTotal),
      icon: '⭐',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      label: 'Level',
      value: currentLevel.name,
      icon: '🏆',
      color: 'from-purple-500 to-pink-500',
    },
    {
      label: 'Time Saved',
      value: formatTimeSaved(profile.timeSavedSecTotal),
      icon: '⏱️',
      color: 'from-cyan-500 to-blue-500',
    },
    {
      label: 'Badges',
      value: profile.badges.length.toString(),
      icon: '🎖️',
      color: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-myai-bg-panel/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <h1 className="font-display text-3xl font-bold mb-2">
            Welcome back, <span className="gradient-text">@{user.handle}</span>
          </h1>
          <p className="text-gray-400">
            Here&apos;s what&apos;s happening with your account today.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-myai-bg-panel/60 backdrop-blur-xl border border-white/10 rounded-xl p-5 hover:border-white/20 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-xl`}>
                  {stat.icon}
                </div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Level Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-myai-bg-panel/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-xl font-bold">Level Progress</h2>
              <p className="text-gray-400 text-sm mt-1">
                Current: <span className="text-white font-medium">{currentLevel.name}</span>
              </p>
            </div>
            {nextLevel && (
              <div className="text-right">
                <div className="text-sm text-gray-400">Next Level</div>
                <div className="text-white font-semibold">{nextLevel.name}</div>
              </div>
            )}
          </div>
          
          {nextLevel ? (
            <>
              <div className="relative h-4 bg-myai-bg-dark/50 rounded-full overflow-hidden mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-myai-primary to-myai-accent rounded-full"
                />
              </div>
              <p className="text-sm text-gray-400">
                {formatNumber(levelInfo.pointsToNext || 0)} points to next level
              </p>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-xl">🎉</p>
              <p className="text-gray-400 text-sm mt-2">You&apos;ve reached the maximum level!</p>
            </div>
          )}
        </motion.div>

        {/* Recent Jobs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-myai-bg-panel/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-bold">Recent Jobs</h2>
            <Link
              href="/dashboard/jobs"
              className="text-myai-accent hover:underline text-sm font-medium"
            >
              View all →
            </Link>
          </div>

          <div className="space-y-3">
            {recentJobs.length > 0 ? (
              recentJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-4 bg-myai-bg-dark/50 rounded-lg border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
                      job.status === 'done' ? 'bg-green-500/20' : 'bg-yellow-500/20'
                    }`}>
                      {job.status === 'done' ? '✅' : '⏳'}
                    </div>
                    <div>
                      <div className="font-medium text-white capitalize">
                        {job.type.replace('_', ' ')}
                      </div>
                      <div className="text-sm text-gray-400">
                        {new Date(job.createdAt).toLocaleDateString()} • Saved {formatTimeSaved(job.timeSavedSec)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-white">
                      {job.creditsCharged} credits
                    </div>
                    <div className="text-xs text-gray-400 capitalize">
                      {job.status}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <div className="text-4xl mb-2">📂</div>
                <p>No jobs yet. Upload your first file to get started!</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <Link
            href="/dashboard/portfolio"
            className="p-6 bg-myai-bg-panel/60 backdrop-blur-xl border border-white/10 rounded-xl hover:border-white/20 transition-colors group"
          >
            <div className="text-3xl mb-3">🎨</div>
            <h3 className="font-semibold text-white mb-1 group-hover:text-myai-accent transition-colors">
              Manage Portfolio
            </h3>
            <p className="text-sm text-gray-400">
              Showcase your best work
            </p>
          </Link>

          <Link
            href="/blog"
            className="p-6 bg-myai-bg-panel/60 backdrop-blur-xl border border-white/10 rounded-xl hover:border-white/20 transition-colors group"
          >
            <div className="text-3xl mb-3">📝</div>
            <h3 className="font-semibold text-white mb-1 group-hover:text-myai-accent transition-colors">
              Browse Blog
            </h3>
            <p className="text-sm text-gray-400">
              Learn tips and AI remix tools
            </p>
          </Link>

          <Link
            href="/profile"
            className="p-6 bg-myai-bg-panel/60 backdrop-blur-xl border border-white/10 rounded-xl hover:border-white/20 transition-colors group"
          >
            <div className="text-3xl mb-3">👤</div>
            <h3 className="font-semibold text-white mb-1 group-hover:text-myai-accent transition-colors">
              View Profile
            </h3>
            <p className="text-sm text-gray-400">
              See your public profile
            </p>
          </Link>

          <Link
            href="/dashboard/referrals"
            className="p-6 bg-myai-bg-panel/60 backdrop-blur-xl border border-white/10 rounded-xl hover:border-white/20 transition-colors group"
          >
            <div className="text-3xl mb-3">🤝</div>
            <h3 className="font-semibold text-white mb-1 group-hover:text-myai-accent transition-colors">
              Earn Referrals
            </h3>
            <p className="text-sm text-gray-400">
              Invite friends, earn rewards
            </p>
          </Link>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
