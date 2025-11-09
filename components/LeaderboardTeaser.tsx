'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { leaderboardApi } from '@/lib/services/api';
import { MICROCOPY } from '@/lib/constants/microcopy';
import { formatTimeSaved, getInitials, getAvatarPlaceholder } from '@/lib/utils/helpers';
import type { LeaderboardEntry } from '@/lib/types';

type LeaderboardTab = 'time_saved' | 'referrals' | 'popularity';

export default function LeaderboardTeaser() {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('time_saved');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [activeTab]);

  const loadLeaderboard = async () => {
    try {
      setIsLoading(true);
      const response = await leaderboardApi.get({
        type: activeTab,
        period: 'alltime',
        limit: 5,
      });
      setEntries(response.entries);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs: { id: LeaderboardTab; label: string; icon: string }[] = [
    { id: 'time_saved', label: MICROCOPY.LEADERBOARD.timeSaved, icon: '⚡' },
    { id: 'referrals', label: MICROCOPY.LEADERBOARD.referrals, icon: '👥' },
    { id: 'popularity', label: MICROCOPY.LEADERBOARD.popularity, icon: '🔥' },
  ];

  const formatValue = (value: number, type: LeaderboardTab): string => {
    switch (type) {
      case 'time_saved':
        return formatTimeSaved(value);
      case 'referrals':
        return `${value} referrals`;
      case 'popularity':
        return `${value.toLocaleString()} views`;
      default:
        return String(value);
    }
  };

  return (
    <section id="leaderboard" className="py-20 px-6 bg-myai-bg-dark/50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Leaderboards</span> & Rewards
          </h2>
          <p className="text-gray-400 text-lg mb-4">
            Compete with creators worldwide and earn rewards
          </p>
          <p className="text-sm text-myai-accent">
            {MICROCOPY.LEADERBOARD.inviteEarn}
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-myai-primary to-myai-accent text-white'
                  : 'bg-white/5 border border-white/10 hover:bg-white/10'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Leaderboard Table */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-myai-bg-panel/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/10">
                <tr className="text-left">
                  <th className="px-6 py-4 text-sm text-gray-400 font-semibold">Rank</th>
                  <th className="px-6 py-4 text-sm text-gray-400 font-semibold">Creator</th>
                  <th className="px-6 py-4 text-sm text-gray-400 font-semibold">Level</th>
                  <th className="px-6 py-4 text-sm text-gray-400 font-semibold text-right">
                    {tabs.find(t => t.id === activeTab)?.label}
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                      <div className="inline-block size-6 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    </td>
                  </tr>
                ) : entries.length > 0 ? (
                  entries.map((entry) => (
                    <motion.tr
                      key={entry.userId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: entry.rank * 0.1 }}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-lg font-bold ${
                              entry.rank === 1
                                ? 'text-yellow-400'
                                : entry.rank === 2
                                ? 'text-gray-300'
                                : entry.rank === 3
                                ? 'text-orange-400'
                                : 'text-gray-500'
                            }`}
                          >
                            #{entry.rank}
                          </span>
                          {entry.rank <= 3 && (
                            <span className="text-xl">
                              {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full ${getAvatarPlaceholder(
                              entry.handle
                            )} flex items-center justify-center text-white font-bold text-sm`}
                          >
                            {getInitials(entry.handle)}
                          </div>
                          <span className="font-semibold">@{entry.handle}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-myai-primary/20 to-myai-accent/20 border border-myai-primary/30 rounded-full">
                          <span className="text-xs font-bold">Lv {entry.level}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-semibold text-myai-accent">
                          {formatValue(entry.value, activeTab)}
                        </span>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                      No entries yet. Be the first!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* View Full Leaderboard CTA */}
          <div className="border-t border-white/10 p-6 text-center">
            <button className="px-8 py-3 bg-gradient-to-r from-myai-primary to-myai-accent text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-myai-primary/50 transition-all">
              View Full Leaderboard →
            </button>
          </div>
        </motion.div>

        {/* Referral Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6 text-center"
        >
          <h3 className="text-xl font-bold mb-2">🎁 Referral Rewards</h3>
          <p className="text-gray-300 mb-4">
            Invite friends and earn rewards for every paid referral
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div>
              <div className="text-2xl font-bold text-myai-accent">+100 pts</div>
              <div className="text-gray-400">Per sign-up</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-myai-accent">+500 pts</div>
              <div className="text-gray-400">Per paid referral</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-myai-accent">+50 credits</div>
              <div className="text-gray-400">Bonus</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
