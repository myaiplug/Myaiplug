'use client';

import { motion } from 'framer-motion';
import { mockProfile, mockUser, mockCreations } from '@/lib/utils/mockData';
import { formatTimeSaved, getInitials, getAvatarPlaceholder } from '@/lib/utils/helpers';
import { LEVELS } from '@/lib/constants/gamification';

export default function CreatorProfilePreview() {
  const user = mockUser;
  const profile = mockProfile;
  const creations = mockCreations.slice(0, 3); // Show first 3

  const currentLevel = LEVELS.find((l) => l.level === profile.level);

  return (
    <section id="gallery" className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Public <span className="gradient-text">Creator Profiles</span>
          </h2>
          <p className="text-gray-400 text-lg">
            Showcase your work, earn badges, and build your reputation
          </p>
        </motion.div>

        {/* Profile Card Preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto bg-myai-bg-panel/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden"
        >
          {/* Profile Header */}
          <div className="relative h-32 bg-gradient-to-r from-myai-primary to-myai-accent">
            <div className="absolute inset-0 opacity-30">
              <div className="absolute inset-0 bg-[url('/pattern.svg')] bg-repeat opacity-20" />
            </div>
          </div>

          <div className="relative px-8 pb-8">
            {/* Avatar */}
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-16 mb-6">
              <div
                className={`w-32 h-32 rounded-2xl ${getAvatarPlaceholder(
                  user.handle
                )} border-4 border-myai-bg-dark flex items-center justify-center text-white font-bold text-4xl shadow-2xl`}
              >
                {getInitials(user.handle)}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-bold">@{user.handle}</h3>
                  <div className="px-3 py-1 bg-gradient-to-r from-myai-primary/20 to-myai-accent/20 border border-myai-primary/30 rounded-full text-xs font-bold">
                    Level {profile.level} • {currentLevel?.name}
                  </div>
                </div>
                <p className="text-gray-400 mb-4">{user.bio}</p>

                {/* Stats */}
                <div className="flex flex-wrap gap-6 text-sm">
                  <div>
                    <div className="text-2xl font-bold text-myai-accent">
                      {profile.pointsTotal.toLocaleString()}
                    </div>
                    <div className="text-gray-400">Points</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-myai-accent">
                      {formatTimeSaved(profile.timeSavedSecTotal)}
                    </div>
                    <div className="text-gray-400">Time Saved</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-myai-accent">
                      {profile.badges.length}
                    </div>
                    <div className="text-gray-400">Badges</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-myai-accent">#3</div>
                    <div className="text-gray-400">Leaderboard Rank</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Badges Display */}
            <div className="mb-8">
              <h4 className="text-sm font-semibold text-gray-400 mb-3">Badges Earned</h4>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {profile.badges.map((badge) => (
                  <div
                    key={badge.id}
                    className="group relative flex-shrink-0 p-4 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-xl hover:scale-105 transition-transform cursor-pointer"
                  >
                    <div className="text-3xl mb-2">🏆</div>
                    <div className="text-xs font-bold">{badge.name}</div>
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-myai-bg-panel border border-white/10 rounded-lg p-3 whitespace-nowrap text-xs pointer-events-none z-10 shadow-xl">
                      <div className="font-bold mb-1">{badge.name}</div>
                      <div className="text-gray-400">{badge.description}</div>
                      <div className="text-gray-500 mt-1">
                        Earned {new Date(badge.awardedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Public Creations Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-gray-400">Public Creations</h4>
                <button className="text-xs text-myai-accent hover:underline">View all →</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {creations.map((creation) => (
                  <div
                    key={creation.id}
                    className="group relative bg-white/5 rounded-xl overflow-hidden hover:bg-white/10 transition-all cursor-pointer"
                  >
                    {/* Thumbnail */}
                    <div className="aspect-video bg-gradient-to-br from-myai-primary/20 to-myai-accent/20 flex items-center justify-center">
                      <span className="text-4xl">
                        {creation.mediaUrl.endsWith('.mp3') ? '🎵' : '🎬'}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <h5 className="font-semibold mb-2 truncate">{creation.title}</h5>
                      <div className="flex gap-2 mb-3 flex-wrap">
                        {creation.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-1 bg-white/10 rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>👁️ {creation.views}</span>
                        <span>⬇️ {creation.downloads}</span>
                      </div>
                    </div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4">
                      <div className="flex gap-2">
                        <button className="px-4 py-2 bg-myai-accent rounded-lg text-sm font-semibold">
                          Play
                        </button>
                        <button className="px-4 py-2 bg-white/20 rounded-lg text-sm font-semibold">
                          Share
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="mt-8 text-center">
              <button className="px-8 py-3 bg-gradient-to-r from-myai-primary to-myai-accent text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-myai-primary/50 transition-all">
                Create Your Profile →
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
