'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/lib/contexts/AuthContext';
import { referralApi } from '@/lib/services/api';
import { REFERRAL_MILESTONES } from '@/lib/constants/gamification';

interface ReferralData {
  referralCode: string;
  referralUrl: string;
  stats: {
    total: number;
    signedUp: number;
    paid: number;
    creditsEarned: number;
  };
  history: Array<{
    id: string;
    status: string;
    createdAt: Date;
    signedUpAt: Date | null;
    paidAt: Date | null;
  }>;
  milestones: Array<{
    threshold: number;
    reward: string;
    claimed: boolean;
  }>;
}

export default function ReferralsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadReferralData();
    }
  }, [authLoading, isAuthenticated]);

  const loadReferralData = async () => {
    try {
      setIsLoading(true);
      const response = await referralApi.get();
      setReferralData(response);
    } catch (error) {
      console.error('Failed to load referral data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (referralData) {
      navigator.clipboard.writeText(referralData.referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (authLoading || isLoading) {
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

  if (!referralData) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <p className="text-gray-400">Failed to load referral data</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-3xl font-bold mb-2">Referrals</h1>
          <p className="text-gray-400">
            Invite friends and earn rewards when they sign up
          </p>
        </motion.div>

        {/* Referral Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🔗</span>
            <div>
              <h2 className="font-display text-xl font-bold text-white">Your Referral Link</h2>
              <p className="text-purple-300/80 text-sm">Share this link with your friends</p>
            </div>
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              value={referralData.referralUrl}
              readOnly
              className="flex-1 px-4 py-3 bg-myai-bg-dark/50 border border-white/10 rounded-lg text-white"
            />
            <button
              onClick={handleCopy}
              className="px-6 py-3 bg-gradient-to-r from-myai-primary to-myai-accent text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-myai-accent/30 transition-all"
            >
              {copied ? '✓ Copied!' : '📋 Copy'}
            </button>
          </div>

          <div className="mt-4 p-4 bg-white/5 rounded-lg">
            <div className="text-sm text-gray-300">
              <strong className="text-white">How it works:</strong>
              <ul className="mt-2 space-y-1 list-disc list-inside text-gray-400">
                <li><strong>+100 points</strong> when someone signs up with your link</li>
                <li><strong>+500 points + 50 credits</strong> when they make their first paid purchase</li>
                <li>Unlock special rewards at 3, 10, and 25 paid referrals</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4"
        >
          <div className="bg-myai-bg-panel/60 backdrop-blur-xl border border-white/10 rounded-xl p-5 text-center">
            <div className="text-3xl mb-2">👥</div>
            <div className="text-2xl font-bold text-white mb-1">{referralData.stats.total}</div>
            <div className="text-sm text-gray-400">Total Referrals</div>
          </div>

          <div className="bg-myai-bg-panel/60 backdrop-blur-xl border border-white/10 rounded-xl p-5 text-center">
            <div className="text-3xl mb-2">✍️</div>
            <div className="text-2xl font-bold text-white mb-1">{referralData.stats.signedUp}</div>
            <div className="text-sm text-gray-400">Signed Up</div>
          </div>

          <div className="bg-myai-bg-panel/60 backdrop-blur-xl border border-white/10 rounded-xl p-5 text-center">
            <div className="text-3xl mb-2">💳</div>
            <div className="text-2xl font-bold text-white mb-1">{referralData.stats.paid}</div>
            <div className="text-sm text-gray-400">Paid Users</div>
          </div>

          <div className="bg-myai-bg-panel/60 backdrop-blur-xl border border-white/10 rounded-xl p-5 text-center">
            <div className="text-3xl mb-2">💰</div>
            <div className="text-2xl font-bold text-white mb-1">{referralData.stats.creditsEarned}</div>
            <div className="text-sm text-gray-400">Credits Earned</div>
          </div>

          <div className="bg-myai-bg-panel/60 backdrop-blur-xl border border-white/10 rounded-xl p-5 text-center">
            <div className="text-3xl mb-2">⭐</div>
            <div className="text-2xl font-bold text-white mb-1">{(referralData.stats.signedUp * 100) + (referralData.stats.paid * 500)}</div>
            <div className="text-sm text-gray-400">Points Earned</div>
          </div>
        </motion.div>

        {/* Milestones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-myai-bg-panel/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <h2 className="font-display text-xl font-bold mb-4">Referral Milestones</h2>
          
          <div className="space-y-4">
            {REFERRAL_MILESTONES.map((milestone, index) => {
              const isAchieved = referralData.stats.paid >= milestone.count;
              return (
                <div
                  key={index}
                  className={`flex items-center justify-between p-5 rounded-lg border ${
                    isAchieved
                      ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30'
                      : 'bg-myai-bg-dark/50 border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                      isAchieved
                        ? 'bg-green-500/20 border-2 border-green-500/50'
                        : 'bg-white/5 border-2 border-white/10'
                    }`}>
                      {isAchieved ? '✓' : milestone.count}
                    </div>
                    <div>
                      <div className={`font-semibold ${isAchieved ? 'text-green-300' : 'text-white'}`}>
                        {milestone.count} Paid Referrals
                      </div>
                      <div className="text-sm text-gray-400">
                        Reward: {milestone.reward.description}
                      </div>
                    </div>
                  </div>
                  {isAchieved && (
                    <div className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300 text-sm font-medium">
                      Unlocked! 🎉
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div className="text-sm text-blue-300/90">
                <strong className="text-blue-200">Pro Tip:</strong> Share your referral link on social media, 
                in Discord servers, or with fellow creators to maximize your earnings!
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent Referrals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-myai-bg-panel/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <h2 className="font-display text-xl font-bold mb-4">Recent Referrals</h2>

          <div className="space-y-3">
            {referralData.history.slice(0, 10).map((referral) => (
              <div
                key={referral.id}
                className="flex items-center justify-between p-4 bg-myai-bg-dark/50 rounded-lg border border-white/5"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-myai-primary to-myai-accent flex items-center justify-center font-bold text-white">
                    R
                  </div>
                  <div>
                    <div className="font-medium text-white">Referral #{referral.id.substring(0, 8)}</div>
                    <div className="text-sm text-gray-400">
                      {new Date(referral.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Earned</div>
                    <div className="text-white font-medium">
                      {referral.status === 'paid' ? '500 pts + 50 credits' : referral.status === 'signed_up' ? '100 pts' : '0 pts'}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    referral.status === 'paid'
                      ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                      : referral.status === 'signed_up'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                  }`}>
                    {referral.status === 'paid' ? '💳 Paid' : referral.status === 'signed_up' ? '✍️ Signed Up' : '🔗 Clicked'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {referralData.history.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <div className="text-4xl mb-2">🤝</div>
              <p>No referrals yet. Start sharing your link!</p>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
