/**
 * Platform-Wide Entitlement Service
 * Capability-based authorization with usage tracking
 */

import type {
  AuthorizationResult,
  AuthorizationRequest,
} from '../types/entitlements';
import {
  getCapability,
  getTierCapability,
  getMembership,
  logUsageToLedger,
  getUsageInWindow,
} from './database';

// Cache for authorization results (1 minute TTL)
interface CacheEntry {
  tier: string;
  modelVariant?: string;
  allowAsync: boolean;
  capabilityName: string;
  expiresAt: number;
}
const authCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 1000; // 1 minute

/**
 * Authorize and consume capability
 * @param request - Authorization request with userId, capabilityKey, usageAmount
 * @returns Authorization result with allowed status, tier, remaining usage, model variant
 */
export async function authorizeAndConsume(
  request: AuthorizationRequest
): Promise<AuthorizationResult> {
  const { userId, capabilityKey, usageAmount } = request;

  // Get capability definition
  const capability = await getCapability(capabilityKey);
  if (!capability) {
    return {
      allowed: false,
      tier: 'free',
      remainingUsage: 0,
      allowAsync: false,
      error: `Unknown capability: ${capabilityKey}`,
    };
  }

  // Get user's membership tier
  const membership = await getMembership(userId);
  if (!membership) {
    return {
      allowed: false,
      tier: 'free',
      remainingUsage: 0,
      allowAsync: false,
      error: 'Membership not found',
    };
  }

  // Check cache for tier capability
  const cacheKey = `${membership.tier}_${capabilityKey}`;
  let cachedEntry = authCache.get(cacheKey);
  
  if (!cachedEntry || cachedEntry.expiresAt < Date.now()) {
    // Get tier capability configuration
    const tierCapability = await getTierCapability(membership.tier, capabilityKey);
    if (!tierCapability) {
      return {
        allowed: false,
        tier: membership.tier,
        remainingUsage: 0,
        allowAsync: false,
        error: `Capability '${capability.name}' not available for ${membership.tier} tier`,
        capabilityName: capability.name,
        upgradeUrl: '/pricing',
      };
    }

    // Cache the tier capability info
    cachedEntry = {
      tier: membership.tier,
      modelVariant: tierCapability.modelVariant,
      allowAsync: tierCapability.allowAsync,
      capabilityName: capability.name,
      expiresAt: Date.now() + CACHE_TTL_MS,
    };
    authCache.set(cacheKey, cachedEntry);
  }

  // Get current usage in 24-hour window
  const currentUsage = await getUsageInWindow(userId, capabilityKey);

  // Get daily limit from tier capability
  const tierCapability = await getTierCapability(membership.tier, capabilityKey);
  const dailyLimit = tierCapability!.dailyLimit;

  // Check if unlimited (dailyLimit = -1)
  if (dailyLimit === -1) {
    return {
      allowed: true,
      tier: membership.tier as any,
      remainingUsage: Number.MAX_SAFE_INTEGER,
      modelVariant: cachedEntry.modelVariant,
      allowAsync: cachedEntry.allowAsync,
      capabilityName: cachedEntry.capabilityName,
    };
  }

  // Calculate remaining usage
  const remainingUsage = Math.max(0, dailyLimit - currentUsage);

  // Check if usage would exceed limit
  if (currentUsage + usageAmount > dailyLimit) {
    return {
      allowed: false,
      tier: membership.tier as any,
      remainingUsage,
      modelVariant: cachedEntry.modelVariant,
      allowAsync: cachedEntry.allowAsync,
      error: `Daily ${capability.name} limit reached for ${membership.tier.toUpperCase()} tier (${dailyLimit} per day). Please upgrade your membership or wait until tomorrow.`,
      upgradeUrl: '/pricing',
      capabilityName: cachedEntry.capabilityName,
    };
  }

  // Authorization successful - log the usage
  await logUsageToLedger(
    userId,
    capabilityKey,
    usageAmount,
    capability.usageUnit,
    { tier: membership.tier }
  );

  return {
    allowed: true,
    tier: membership.tier as any,
    remainingUsage: remainingUsage - usageAmount,
    modelVariant: cachedEntry.modelVariant,
    allowAsync: cachedEntry.allowAsync,
    capabilityName: cachedEntry.capabilityName,
  };
}

/**
 * Check authorization without consuming
 * Useful for pre-flight checks
 */
export async function checkAuthorization(
  userId: string,
  capabilityKey: string
): Promise<Omit<AuthorizationResult, 'remainingUsage'> & { dailyLimit: number; currentUsage: number }> {
  const capability = await getCapability(capabilityKey);
  if (!capability) {
    return {
      allowed: false,
      tier: 'free',
      allowAsync: false,
      dailyLimit: 0,
      currentUsage: 0,
      error: `Unknown capability: ${capabilityKey}`,
    };
  }

  const membership = await getMembership(userId);
  if (!membership) {
    return {
      allowed: false,
      tier: 'free',
      allowAsync: false,
      dailyLimit: 0,
      currentUsage: 0,
      error: 'Membership not found',
    };
  }

  const tierCapability = await getTierCapability(membership.tier, capabilityKey);
  if (!tierCapability) {
    return {
      allowed: false,
      tier: membership.tier as any,
      allowAsync: false,
      dailyLimit: 0,
      currentUsage: 0,
      error: `Capability not available for ${membership.tier} tier`,
      capabilityName: capability.name,
      upgradeUrl: '/pricing',
    };
  }

  const currentUsage = await getUsageInWindow(userId, capabilityKey);
  const dailyLimit = tierCapability.dailyLimit;

  return {
    allowed: dailyLimit === -1 || currentUsage < dailyLimit,
    tier: membership.tier as any,
    modelVariant: tierCapability.modelVariant,
    allowAsync: tierCapability.allowAsync,
    dailyLimit,
    currentUsage,
    capabilityName: capability.name,
  };
}

/**
 * Clear authorization cache
 */
export function clearAuthCache(cacheKey?: string): void {
  if (cacheKey) {
    authCache.delete(cacheKey);
  } else {
    authCache.clear();
  }
}

/**
 * Get user's tier from database
 */
export async function getUserTier(userId: string): Promise<string> {
  const membership = await getMembership(userId);
  return membership?.tier || 'free';
}

/**
 * Log successful operation
 * Should be called after processing completes successfully
 */
export async function logSuccessfulOperation(
  userId: string,
  capabilityKey: string,
  usageAmount: number,
  metadata?: Record<string, any>
): Promise<void> {
  const capability = await getCapability(capabilityKey);
  if (!capability) {
    console.warn(`Attempted to log unknown capability: ${capabilityKey}`);
    return;
  }

  await logUsageToLedger(
    userId,
    capabilityKey,
    usageAmount,
    capability.usageUnit,
    metadata
  );
}
