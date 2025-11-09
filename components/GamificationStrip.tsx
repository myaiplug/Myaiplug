'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getNextLevelInfo } from '@/lib/constants/gamification';
import { formatTimeSaved } from '@/lib/utils/helpers';

export default function GamificationStrip() {
  const { profile, isAuthenticated } = useAuth();
  
  if (!isAuthenticated || !profile) {
    return null; // Don't show if user is not logged in
  }
  
  const levelInfo = getNextLevelInfo(profile.pointsTotal);
  
  const monthlyTimeSaved = profile.timeSavedSecTotal; // Using total for now, could calculate monthly if we had timestamps

  return (
    <section className="py-12 px-6 bg-gradient-to-r from-myai-primary/10 to-myai-accent/10 border-y border-white/10">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center"
        >
          {/* Level Progress */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-myai-primary to-myai-accent flex items-center justify-center text-white font-bold text-lg">
                {levelInfo.currentLevel}
              </div>
              <div>
                <div className="text-sm text-gray-400">Level {levelInfo.currentLevel}</div>
                <div className="text-lg font-bold">
                  {levelInfo.pointsToNext?.toLocaleString()} pts to Level {levelInfo.nextLevel}
                </div>
              </div>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${levelInfo.progressPercent}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.3 }}
                className="h-full bg-gradient-to-r from-myai-primary to-myai-accent"
              />
            </div>
            <div className="text-xs text-gray-400 mt-1">{levelInfo.progressPercent}% complete</div>
          </div>

          {/* Badges Carousel */}
          <div>
            <div className="text-sm text-gray-400 mb-3">Your Badges</div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {profile.badges.map((badge) => (
                <div
                  key={badge.id}
                  className="group relative flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
                  title={badge.description}
                >
                  <span className="text-2xl">🏆</span>
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-myai-bg-panel border border-white/10 rounded-lg p-2 whitespace-nowrap text-xs pointer-events-none z-10">
                    <div className="font-bold">{badge.name}</div>
                    <div className="text-gray-400">{badge.description}</div>
                  </div>
                </div>
              ))}
              <div className="flex-shrink-0 w-16 h-16 rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center text-gray-500">
                <span className="text-2xl">+</span>
              </div>
            </div>
          </div>

          {/* Monthly Stats */}
          <div className="text-right">
            <div className="text-sm text-gray-400 mb-1">This Month You Saved</div>
            <div className="text-3xl font-bold bg-gradient-to-r from-myai-primary to-myai-accent bg-clip-text text-transparent mb-3">
              {formatTimeSaved(monthlyTimeSaved)}
            </div>
            <Link href="/profile">
              <button className="px-6 py-2.5 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 hover:border-myai-accent/50 transition-all text-sm font-semibold">
                View Your Creator Profile →
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
