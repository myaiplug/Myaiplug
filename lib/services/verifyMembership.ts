/**
 * Membership Verification Service
 * Manages membership tiers, limits, and permissions for audio processing features
 */

import type { MembershipTier } from '../types';
import { getUserById, getProfile } from './userService';

// Membership tier configurations
const TIER_CONFIGS: Record<'free' | 'pro' | 'vip', MembershipTier> = {
  free: {
    tier: 'free',
    limits: {
      stemSplitPerDay: 5,
      halfScrewPerDay: 10,
      cleanPerDay: 10,
      maxFileDuration: 180, // 3 minutes
      asyncJobQueue: false,
    },
    permissions: {
      twoStemModel: true,
      fiveStemModel: false,
      advancedHalfScrew: false,
    },
  },
  pro: {
    tier: 'pro',
    limits: {
      stemSplitPerDay: 50,
      halfScrewPerDay: 100,
      cleanPerDay: 100,
      maxFileDuration: 600, // 10 minutes
      asyncJobQueue: true,
    },
    permissions: {
      twoStemModel: true,
      fiveStemModel: true,
      advancedHalfScrew: true,
    },
  },
  vip: {
    tier: 'vip',
    limits: {
      stemSplitPerDay: 999999, // Unlimited
      halfScrewPerDay: 999999,
      cleanPerDay: 999999,
      maxFileDuration: 3600, // 1 hour
      asyncJobQueue: true,
    },
    permissions: {
      twoStemModel: true,
      fiveStemModel: true,
      advancedHalfScrew: true,
    },
  },
};

// In-memory cache for membership verification (60s TTL)
interface MembershipCache {
  data: MembershipTier;
  expiresAt: number;
}
const membershipCache = new Map<string, MembershipCache>();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

/**
 * Verify user's membership tier and get their limits/permissions
 * @param userId - The user ID to verify
 * @returns Membership tier configuration with limits and permissions
 */
export async function verifyMembership(userId: string): Promise<MembershipTier> {
  // Check cache first
  const cached = membershipCache.get(userId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  // Get user data
  const user = getUserById(userId);
  const profile = getProfile(userId);

  // Determine tier from profile membership, fallback to user tier, then default to free
  let tier: 'free' | 'pro' | 'vip' = 'free';
  
  if (profile?.membership) {
    tier = profile.membership;
  } else if (user?.tier) {
    // Map UserTier to membership tier
    if (user.tier === 'pro' || user.tier === 'studio') {
      tier = 'pro';
    }
  }

  const membershipTier = TIER_CONFIGS[tier];

  // Cache the result
  membershipCache.set(userId, {
    data: membershipTier,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });

  return membershipTier;
}

/**
 * Get membership configuration for a specific tier
 * @param tier - The tier to get configuration for
 */
export function getMembershipConfig(tier: 'free' | 'pro' | 'vip'): MembershipTier {
  return TIER_CONFIGS[tier];
}

/**
 * Check if user has permission for a specific feature
 * @param userId - The user ID
 * @param feature - The feature to check (e.g., 'fiveStemModel', 'advancedHalfScrew')
 */
export async function hasPermission(
  userId: string,
  feature: keyof MembershipTier['permissions']
): Promise<boolean> {
  const membership = await verifyMembership(userId);
  return membership.permissions[feature];
}

/**
 * Get remaining daily usage for a specific action
 * @param userId - The user ID
 * @param actionType - The action type (e.g., 'stemSplitPerDay')
 * @param currentUsage - Current usage count for the action
 */
export async function getRemainingUsage(
  userId: string,
  actionType: keyof MembershipTier['limits'],
  currentUsage: number
): Promise<number> {
  const membership = await verifyMembership(userId);
  const limit = membership.limits[actionType];
  
  if (typeof limit !== 'number') {
    return 0;
  }
  
  return Math.max(0, limit - currentUsage);
}

/**
 * Clear membership cache for a user (useful after tier upgrade)
 * @param userId - The user ID to clear cache for
 */
export function clearMembershipCache(userId?: string): void {
  if (userId) {
    membershipCache.delete(userId);
  } else {
    membershipCache.clear();
  }
}

/**
 * Get cache statistics (for monitoring)
 */
export function getMembershipCacheStats(): {
  size: number;
  entries: string[];
} {
  return {
    size: membershipCache.size,
    entries: Array.from(membershipCache.keys()),
  };
}

/**
 * Generate helpful error message when limit is exceeded
 * @param membership - The user's membership tier
 * @param action - The action that was limited
 */
export function generateLimitExceededMessage(
  membership: MembershipTier,
  action: 'stem_split' | 'half_screw' | 'clean_audio'
): string {
  const actionMap = {
    stem_split: { limit: membership.limits.stemSplitPerDay, name: 'StemSplit' },
    half_screw: { limit: membership.limits.halfScrewPerDay, name: 'HalfScrew' },
    clean_audio: { limit: membership.limits.cleanPerDay, name: 'Audio Cleaning' },
  };

  const actionInfo = actionMap[action];
  const tierName = membership.tier.toUpperCase();

  return `Daily ${actionInfo.name} limit reached for ${tierName} tier (${actionInfo.limit} per day). Please upgrade your membership or wait until tomorrow to continue processing.`;
}
