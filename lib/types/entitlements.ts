/**
 * Entitlement System Types
 * Platform-wide capability-based authorization
 */

export type MembershipTier = 'free' | 'pro' | 'vip';

export type UsageUnit = 'jobs' | 'seconds' | 'renders' | 'requests';

/**
 * Capability definition - represents a tool or feature
 */
export interface Capability {
  id: string;
  key: string; // e.g., 'stem_split', 'audio_clean', 'half_screw'
  name: string;
  description: string;
  usageUnit: UsageUnit;
  createdAt: Date;
}

/**
 * Tier capability limits - defines what each tier can do
 */
export interface TierCapability {
  id: string;
  tier: MembershipTier;
  capabilityKey: string;
  dailyLimit: number; // -1 for unlimited
  modelVariant?: string; // e.g., '2-stem', '5-stem', 'advanced'
  maxDuration?: number; // in seconds, for audio processing
  allowAsync: boolean;
  createdAt: Date;
}

/**
 * Membership record - user's current tier
 */
export interface Membership {
  id: string;
  userId: string;
  tier: MembershipTier;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Usage ledger entry - append-only log
 */
export interface UsageLedgerEntry {
  id: string;
  userId: string;
  capabilityKey: string;
  usageAmount: number;
  usageUnit: UsageUnit;
  metadata?: Record<string, any>;
  timestamp: Date;
}

/**
 * Authorization result
 */
export interface AuthorizationResult {
  allowed: boolean;
  tier: MembershipTier;
  remainingUsage: number;
  modelVariant?: string;
  allowAsync: boolean;
  error?: string;
  upgradeUrl?: string;
  capabilityName?: string;
}

/**
 * Authorization request
 */
export interface AuthorizationRequest {
  userId: string;
  capabilityKey: string;
  usageAmount: number;
}
