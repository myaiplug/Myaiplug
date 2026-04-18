// Seed data service - Create demo users with badges and points
import { generateSecureId } from '../utils/secureId';
import type { Profile, Badge } from '../types';
import { BADGE_DEFINITIONS } from '../constants/gamification';

export interface SeedUser {
  id: string;
  handle: string;
  email: string;
  avatarUrl: string | null;
  profile: Profile;
  memberSince: Date;
}

// Cool avatar URLs for demo users
function getAvatarUrl(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=256&background=7C4DFF&color=fff&bold=true`;
}

// Generate demo badges
function generateBadges(stats: { jobs: number; timeSaved: number; referrals: number }): Badge[] {
  const badges: Badge[] = [];
  
  // Upload Hero
  if (stats.jobs >= 10) {
    badges.push({
      id: BADGE_DEFINITIONS.UPLOAD_HERO_I.id,
      name: BADGE_DEFINITIONS.UPLOAD_HERO_I.name,
      description: BADGE_DEFINITIONS.UPLOAD_HERO_I.description,
      awardedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    });
  }
  if (stats.jobs >= 100) {
    badges.push({
      id: BADGE_DEFINITIONS.UPLOAD_HERO_II.id,
      name: BADGE_DEFINITIONS.UPLOAD_HERO_II.name,
      description: BADGE_DEFINITIONS.UPLOAD_HERO_II.description,
      awardedAt: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000),
    });
  }
  if (stats.jobs >= 500) {
    badges.push({
      id: BADGE_DEFINITIONS.UPLOAD_HERO_III.id,
      name: BADGE_DEFINITIONS.UPLOAD_HERO_III.name,
      description: BADGE_DEFINITIONS.UPLOAD_HERO_III.description,
      awardedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    });
  }

  // Time Saved
  const timeSavedHours = stats.timeSaved / 3600;
  if (timeSavedHours >= 10) {
    badges.push({
      id: BADGE_DEFINITIONS.TIME_BANDIT.id,
      name: BADGE_DEFINITIONS.TIME_BANDIT.name,
      description: BADGE_DEFINITIONS.TIME_BANDIT.description,
      awardedAt: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000),
    });
  }
  if (timeSavedHours >= 50) {
    badges.push({
      id: BADGE_DEFINITIONS.TIME_LORD.id,
      name: BADGE_DEFINITIONS.TIME_LORD.name,
      description: BADGE_DEFINITIONS.TIME_LORD.description,
      awardedAt: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000),
    });
  }
  if (timeSavedHours >= 200) {
    badges.push({
      id: BADGE_DEFINITIONS.CHRONOMANCER.id,
      name: BADGE_DEFINITIONS.CHRONOMANCER.name,
      description: BADGE_DEFINITIONS.CHRONOMANCER.description,
      awardedAt: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000),
    });
  }

  // Referrals
  if (stats.referrals >= 3) {
    badges.push({
      id: BADGE_DEFINITIONS.WORD_OF_MOUTH.id,
      name: BADGE_DEFINITIONS.WORD_OF_MOUTH.name,
      description: BADGE_DEFINITIONS.WORD_OF_MOUTH.description,
      awardedAt: new Date(Date.now() - Math.random() * 25 * 24 * 60 * 60 * 1000),
    });
  }
  if (stats.referrals >= 10) {
    badges.push({
      id: BADGE_DEFINITIONS.RAINMAKER.id,
      name: BADGE_DEFINITIONS.RAINMAKER.name,
      description: BADGE_DEFINITIONS.RAINMAKER.description,
      awardedAt: new Date(Date.now() - Math.random() * 12 * 24 * 60 * 60 * 1000),
    });
  }
  if (stats.referrals >= 50) {
    badges.push({
      id: BADGE_DEFINITIONS.TYCOON.id,
      name: BADGE_DEFINITIONS.TYCOON.name,
      description: BADGE_DEFINITIONS.TYCOON.description,
      awardedAt: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000),
    });
  }

  return badges;
}

/**
 * Generate 10+ demo users with varying levels of achievement
 */
export function generateDemoUsers(): SeedUser[] {
  const userConfigs = [
    { handle: 'beatmaker_pro', points: 125000, level: 7, timeSaved: 250, days: 180 },
    { handle: 'studio_wizard', points: 85000, level: 6, timeSaved: 180, days: 150 },
    { handle: 'audio_ninja', points: 65000, level: 5, timeSaved: 120, days: 120 },
    { handle: 'vox_master', points: 45000, level: 5, timeSaved: 90, days: 90 },
    { handle: 'mix_engineer', points: 32000, level: 4, timeSaved: 65, days: 75 },
    { handle: 'producer_life', points: 25000, level: 4, timeSaved: 55, days: 60 },
    { handle: 'content_creator', points: 15000, level: 3, timeSaved: 35, days: 45 },
    { handle: 'podcast_host', points: 12000, level: 3, timeSaved: 28, days: 40 },
    { handle: 'indie_artist', points: 8500, level: 3, timeSaved: 20, days: 30 },
    { handle: 'video_editor', points: 5000, level: 2, timeSaved: 15, days: 25 },
    { handle: 'sound_designer', points: 3500, level: 2, timeSaved: 12, days: 20 },
    { handle: 'music_lover', points: 1200, level: 1, timeSaved: 5, days: 15 },
  ];

  return userConfigs.map((config, idx) => {
    const userId = generateSecureId('user_');
    const jobs = Math.floor(config.points / 100);
    const referrals = Math.floor(idx / 2);
    
    const profile: Profile = {
      userId,
      pointsTotal: config.points,
      level: config.level,
      timeSavedSecTotal: config.timeSaved * 3600,
      totalJobs: jobs,
      badges: generateBadges({ 
        jobs, 
        timeSaved: config.timeSaved * 3600, 
        referrals 
      }),
      privacyOptOut: false,
    };

    return {
      id: userId,
      handle: config.handle,
      email: `${config.handle}@demo.local`,
      avatarUrl: getAvatarUrl(config.handle.replace('_', ' ')),
      profile,
      memberSince: new Date(Date.now() - config.days * 24 * 60 * 60 * 1000),
    };
  });
}

/**
 * Get formatted leaderboard data from demo users
 */
export function getDemoLeaderboard() {
  const users = generateDemoUsers();
  
  return {
    timeSaved: users
      .sort((a, b) => b.profile.timeSavedSecTotal - a.profile.timeSavedSecTotal)
      .slice(0, 10)
      .map((user, idx) => ({
        rank: idx + 1,
        handle: user.handle,
        avatar: user.avatarUrl,
        value: user.profile.timeSavedSecTotal,
        level: user.profile.level,
        badges: user.profile.badges.length,
      })),
    points: users
      .sort((a, b) => b.profile.pointsTotal - a.profile.pointsTotal)
      .slice(0, 10)
      .map((user, idx) => ({
        rank: idx + 1,
        handle: user.handle,
        avatar: user.avatarUrl,
        value: user.profile.pointsTotal,
        level: user.profile.level,
        badges: user.profile.badges.length,
      })),
  };
}
