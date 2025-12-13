// Leaderboard ranking system
import type { LeaderboardEntry, LeaderboardType, LeaderboardPeriod, Profile, Referral, Creation } from '../types';
import { hasActiveSubscription } from './subscriptionService';

export interface LeaderboardOptions {
  type: LeaderboardType;
  period: LeaderboardPeriod;
  limit?: number;
  userId?: string; // Optional: get rank for specific user
}

export interface LeaderboardResult {
  entries: LeaderboardEntry[];
  userRank?: number;
  lastUpdated: Date;
}

// In-memory storage for leaderboard cache
const leaderboardCache = new Map<string, LeaderboardResult>();

// In-memory data stores (would be replaced by DB queries in production)
const profilesStore = new Map<string, Profile>();
const referralsStore = new Map<string, Referral[]>();
const creationsStore = new Map<string, Creation[]>();
const usersStore = new Map<string, { handle: string; avatarUrl: string | null }>();

/**
 * Generate and cache leaderboard
 */
export async function generateLeaderboard(options: LeaderboardOptions): Promise<LeaderboardResult> {
  const { type, period, limit = 100, userId } = options;
  const cacheKey = `${type}_${period}`;

  // Check cache (5 minute expiry)
  const cached = leaderboardCache.get(cacheKey);
  if (cached && isLeaderboardCacheFresh(cached.lastUpdated)) {
    return addUserRank(cached, userId);
  }

  // Generate fresh leaderboard
  let entries: LeaderboardEntry[] = [];

  switch (type) {
    case 'time_saved':
      entries = await generateTimeSavedLeaderboard(period);
      break;
    case 'referrals':
      entries = await generateReferralsLeaderboard(period);
      break;
    case 'popularity':
      entries = await generatePopularityLeaderboard(period);
      break;
  }

  // Sort and rank
  entries = entries
    .sort((a, b) => b.value - a.value)
    .slice(0, limit)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));

  const result: LeaderboardResult = {
    entries,
    lastUpdated: new Date(),
  };

  // Cache the result
  leaderboardCache.set(cacheKey, result);

  return addUserRank(result, userId);
}

/**
 * Generate Time Saved leaderboard
 */
async function generateTimeSavedLeaderboard(period: LeaderboardPeriod): Promise<LeaderboardEntry[]> {
  const entries: LeaderboardEntry[] = [];
  const cutoffDate = getCutoffDate(period);

  for (const [userId, profile] of profilesStore.entries()) {
    // Skip users who opted out of leaderboards
    if (profile.privacyOptOut) {
      continue;
    }

    // Only include users with active subscriptions
    // (currently checks for active/trialing status)
    if (!hasActiveSubscription(userId)) {
      continue;
    }

    const user = usersStore.get(userId);
    if (!user) continue;

    // For weekly, we'd need to filter by date - using total for now
    const timeSaved = profile.timeSavedSecTotal;

    entries.push({
      rank: 0, // Will be set after sorting
      userId,
      handle: user.handle,
      avatarUrl: user.avatarUrl,
      value: timeSaved,
      level: profile.level,
    });
  }

  return entries;
}

/**
 * Generate Referrals leaderboard
 */
async function generateReferralsLeaderboard(period: LeaderboardPeriod): Promise<LeaderboardEntry[]> {
  const entries: LeaderboardEntry[] = [];
  const cutoffDate = getCutoffDate(period);

  for (const [userId, profile] of profilesStore.entries()) {
    if (profile.privacyOptOut) {
      continue;
    }

    const user = usersStore.get(userId);
    if (!user) continue;

    const referrals = referralsStore.get(userId) || [];
    const paidReferrals = referrals.filter(r => {
      const isPaid = r.status === 'paid';
      const inPeriod = period === 'alltime' || r.createdAt >= cutoffDate;
      return isPaid && inPeriod;
    });

    entries.push({
      rank: 0,
      userId,
      handle: user.handle,
      avatarUrl: user.avatarUrl,
      value: paidReferrals.length,
      level: profile.level,
    });
  }

  return entries;
}

/**
 * Generate Popularity leaderboard (based on portfolio views)
 */
async function generatePopularityLeaderboard(period: LeaderboardPeriod): Promise<LeaderboardEntry[]> {
  const entries: LeaderboardEntry[] = [];
  const cutoffDate = getCutoffDate(period);

  for (const [userId, profile] of profilesStore.entries()) {
    if (profile.privacyOptOut) {
      continue;
    }

    const user = usersStore.get(userId);
    if (!user) continue;

    const creations = creationsStore.get(userId) || [];
    const totalViews = creations
      .filter(c => {
        const isPublic = c.public;
        const inPeriod = period === 'alltime' || c.createdAt >= cutoffDate;
        return isPublic && inPeriod;
      })
      .reduce((sum, c) => sum + c.views, 0);

    entries.push({
      rank: 0,
      userId,
      handle: user.handle,
      avatarUrl: user.avatarUrl,
      value: totalViews,
      level: profile.level,
    });
  }

  return entries;
}

/**
 * Get cutoff date for period
 */
function getCutoffDate(period: LeaderboardPeriod): Date {
  const now = new Date();
  if (period === 'weekly') {
    return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
  return new Date(0); // Beginning of time for 'alltime'
}

/**
 * Check if leaderboard cache is fresh (< 5 minutes old)
 */
function isLeaderboardCacheFresh(lastUpdated: Date): boolean {
  const now = new Date();
  const fiveMinutes = 5 * 60 * 1000;
  return now.getTime() - lastUpdated.getTime() < fiveMinutes;
}

/**
 * Add user rank to leaderboard result
 */
function addUserRank(result: LeaderboardResult, userId?: string): LeaderboardResult {
  if (!userId) {
    return result;
  }

  const userEntry = result.entries.find(e => e.userId === userId);
  if (userEntry) {
    return {
      ...result,
      userRank: userEntry.rank,
    };
  }

  // User not in top entries, find their actual rank
  // In production, this would be a separate query
  return {
    ...result,
    userRank: undefined,
  };
}

/**
 * Get user's rank in a specific leaderboard
 */
export async function getUserRank(userId: string, type: LeaderboardType, period: LeaderboardPeriod): Promise<number | null> {
  const result = await generateLeaderboard({ type, period, userId });
  return result.userRank || null;
}

/**
 * Invalidate leaderboard cache (call when data changes)
 */
export function invalidateLeaderboardCache(type?: LeaderboardType): void {
  if (type) {
    leaderboardCache.delete(`${type}_weekly`);
    leaderboardCache.delete(`${type}_alltime`);
  } else {
    leaderboardCache.clear();
  }
}

// Data management functions (for in-memory storage)

export function setProfile(userId: string, profile: Profile): void {
  profilesStore.set(userId, profile);
  // Invalidate caches that depend on profile data
  invalidateLeaderboardCache('time_saved');
  invalidateLeaderboardCache('popularity');
}

export function setUser(userId: string, handle: string, avatarUrl: string | null): void {
  usersStore.set(userId, { handle, avatarUrl });
  invalidateLeaderboardCache();
}

export function setReferrals(userId: string, referrals: Referral[]): void {
  referralsStore.set(userId, referrals);
  invalidateLeaderboardCache('referrals');
}

export function setCreations(userId: string, creations: Creation[]): void {
  creationsStore.set(userId, creations);
  invalidateLeaderboardCache('popularity');
}

export function getAllProfiles(): Map<string, Profile> {
  return profilesStore;
}
