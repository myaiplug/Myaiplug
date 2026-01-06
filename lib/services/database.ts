/**
 * Database Service
 * Abstraction layer for database operations
 * In production, replace with actual Supabase client
 */

import type {
  Capability,
  TierCapability,
  Membership,
  UsageLedgerEntry,
  MembershipTier,
} from '../types/entitlements';

// In-memory storage for development
// In production, replace with Supabase queries
const capabilitiesStore = new Map<string, Capability>();
const tierCapabilitiesStore = new Map<string, TierCapability[]>();
const membershipsStore = new Map<string, Membership>();
const usageLedgerStore: UsageLedgerEntry[] = [];

/**
 * Initialize default capabilities
 */
function initializeCapabilities() {
  const capabilities: Capability[] = [
    {
      id: 'cap_stem_split',
      key: 'stem_split',
      name: 'Stem Separation',
      description: 'Separate audio into individual stems',
      usageUnit: 'jobs',
      createdAt: new Date(),
    },
    {
      id: 'cap_audio_clean',
      key: 'audio_clean',
      name: 'Audio Cleaning',
      description: 'Clean audio for HalfScrew pre-FX processing',
      usageUnit: 'jobs',
      createdAt: new Date(),
    },
    {
      id: 'cap_audio_enhance',
      key: 'audio_enhance',
      name: 'Audio Enhancement',
      description: 'Enhance audio for NoDAW polish',
      usageUnit: 'jobs',
      createdAt: new Date(),
    },
    {
      id: 'cap_half_screw',
      key: 'half_screw',
      name: 'HalfScrew Effects',
      description: 'Apply HalfScrew time-stretching effects',
      usageUnit: 'jobs',
      createdAt: new Date(),
    },
  ];

  capabilities.forEach(cap => capabilitiesStore.set(cap.key, cap));
}

/**
 * Initialize default tier capabilities
 */
function initializeTierCapabilities() {
  const tierCapabilities: TierCapability[] = [
    // Free tier
    {
      id: 'tc_free_stem_split',
      tier: 'free',
      capabilityKey: 'stem_split',
      dailyLimit: 5,
      modelVariant: '2-stem',
      maxDuration: 180,
      allowAsync: false,
      createdAt: new Date(),
    },
    {
      id: 'tc_free_audio_clean',
      tier: 'free',
      capabilityKey: 'audio_clean',
      dailyLimit: 10,
      maxDuration: 180,
      allowAsync: false,
      createdAt: new Date(),
    },
    {
      id: 'tc_free_audio_enhance',
      tier: 'free',
      capabilityKey: 'audio_enhance',
      dailyLimit: 10,
      maxDuration: 180,
      allowAsync: false,
      createdAt: new Date(),
    },
    {
      id: 'tc_free_half_screw',
      tier: 'free',
      capabilityKey: 'half_screw',
      dailyLimit: 10,
      maxDuration: 180,
      allowAsync: false,
      createdAt: new Date(),
    },
    // Pro tier
    {
      id: 'tc_pro_stem_split',
      tier: 'pro',
      capabilityKey: 'stem_split',
      dailyLimit: 50,
      modelVariant: '5-stem',
      maxDuration: 600,
      allowAsync: true,
      createdAt: new Date(),
    },
    {
      id: 'tc_pro_audio_clean',
      tier: 'pro',
      capabilityKey: 'audio_clean',
      dailyLimit: 100,
      maxDuration: 600,
      allowAsync: true,
      createdAt: new Date(),
    },
    {
      id: 'tc_pro_audio_enhance',
      tier: 'pro',
      capabilityKey: 'audio_enhance',
      dailyLimit: 100,
      maxDuration: 600,
      allowAsync: true,
      createdAt: new Date(),
    },
    {
      id: 'tc_pro_half_screw',
      tier: 'pro',
      capabilityKey: 'half_screw',
      dailyLimit: 100,
      modelVariant: 'advanced',
      maxDuration: 600,
      allowAsync: true,
      createdAt: new Date(),
    },
    // VIP tier
    {
      id: 'tc_vip_stem_split',
      tier: 'vip',
      capabilityKey: 'stem_split',
      dailyLimit: -1, // unlimited
      modelVariant: '5-stem',
      maxDuration: 3600,
      allowAsync: true,
      createdAt: new Date(),
    },
    {
      id: 'tc_vip_audio_clean',
      tier: 'vip',
      capabilityKey: 'audio_clean',
      dailyLimit: -1,
      maxDuration: 3600,
      allowAsync: true,
      createdAt: new Date(),
    },
    {
      id: 'tc_vip_audio_enhance',
      tier: 'vip',
      capabilityKey: 'audio_enhance',
      dailyLimit: -1,
      maxDuration: 3600,
      allowAsync: true,
      createdAt: new Date(),
    },
    {
      id: 'tc_vip_half_screw',
      tier: 'vip',
      capabilityKey: 'half_screw',
      dailyLimit: -1,
      modelVariant: 'advanced',
      maxDuration: 3600,
      allowAsync: true,
      createdAt: new Date(),
    },
  ];

  tierCapabilities.forEach(tc => {
    const key = `${tc.tier}_${tc.capabilityKey}`;
    const existing = tierCapabilitiesStore.get(key) || [];
    existing.push(tc);
    tierCapabilitiesStore.set(key, existing);
  });
}

// Initialize on module load
initializeCapabilities();
initializeTierCapabilities();

/**
 * Get capability by key
 */
export async function getCapability(key: string): Promise<Capability | null> {
  // In production: SELECT * FROM capabilities WHERE key = $1
  return capabilitiesStore.get(key) || null;
}

/**
 * Get tier capability
 */
export async function getTierCapability(
  tier: MembershipTier,
  capabilityKey: string
): Promise<TierCapability | null> {
  // In production: SELECT * FROM tier_capabilities WHERE tier = $1 AND capability_key = $2
  const key = `${tier}_${capabilityKey}`;
  const capabilities = tierCapabilitiesStore.get(key);
  return capabilities?.[0] || null;
}

/**
 * Get membership for user
 */
export async function getMembership(userId: string): Promise<Membership | null> {
  // In production: SELECT * FROM memberships WHERE user_id = $1
  let membership = membershipsStore.get(userId);
  
  // Default to free tier if no membership found
  if (!membership) {
    membership = {
      id: `mem_${userId}`,
      userId,
      tier: 'free',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    membershipsStore.set(userId, membership);
  }
  
  return membership;
}

/**
 * Update membership (for Stripe webhooks)
 */
export async function updateMembership(
  userId: string,
  tier: MembershipTier,
  stripeData?: { customerId?: string; subscriptionId?: string }
): Promise<Membership> {
  // In production: UPDATE memberships SET tier = $2, stripe_customer_id = $3, ... WHERE user_id = $1
  const existing = await getMembership(userId);
  const membership: Membership = {
    ...existing!,
    tier,
    stripeCustomerId: stripeData?.customerId,
    stripeSubscriptionId: stripeData?.subscriptionId,
    updatedAt: new Date(),
  };
  
  membershipsStore.set(userId, membership);
  return membership;
}

/**
 * Log usage to ledger
 */
export async function logUsageToLedger(
  userId: string,
  capabilityKey: string,
  usageAmount: number,
  usageUnit: string,
  metadata?: Record<string, any>
): Promise<UsageLedgerEntry> {
  // In production: INSERT INTO usage_ledger (user_id, capability_key, usage_amount, ...) VALUES (...)
  const entry: UsageLedgerEntry = {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    capabilityKey,
    usageAmount,
    usageUnit: usageUnit as any,
    metadata,
    timestamp: new Date(),
  };
  
  usageLedgerStore.push(entry);
  return entry;
}

/**
 * Get usage for user in time window
 */
export async function getUsageInWindow(
  userId: string,
  capabilityKey: string,
  windowMs: number = 24 * 60 * 60 * 1000
): Promise<number> {
  // In production: SELECT SUM(usage_amount) FROM usage_ledger WHERE user_id = $1 AND capability_key = $2 AND timestamp > NOW() - INTERVAL '24 hours'
  const cutoff = new Date(Date.now() - windowMs);
  
  const total = usageLedgerStore
    .filter(entry => 
      entry.userId === userId &&
      entry.capabilityKey === capabilityKey &&
      entry.timestamp >= cutoff
    )
    .reduce((sum, entry) => sum + entry.usageAmount, 0);
  
  return total;
}

/**
 * Get all capabilities
 */
export async function getAllCapabilities(): Promise<Capability[]> {
  // In production: SELECT * FROM capabilities
  return Array.from(capabilitiesStore.values());
}

/**
 * Get all tier capabilities for a tier
 */
export async function getTierCapabilities(tier: MembershipTier): Promise<TierCapability[]> {
  // In production: SELECT * FROM tier_capabilities WHERE tier = $1
  const capabilities: TierCapability[] = [];
  
  for (const [key, value] of tierCapabilitiesStore.entries()) {
    if (key.startsWith(`${tier}_`)) {
      capabilities.push(...value);
    }
  }
  
  return capabilities;
}

/**
 * Find membership by Stripe subscription ID
 * PHASE 2: For webhook handlers
 */
export async function getMembershipBySubscriptionId(
  subscriptionId: string
): Promise<Membership | null> {
  // In production: SELECT * FROM memberships WHERE stripe_subscription_id = $1
  for (const membership of membershipsStore.values()) {
    if (membership.stripeSubscriptionId === subscriptionId) {
      return membership;
    }
  }
  return null;
}

/**
 * Find membership by Stripe customer ID
 * PHASE 2: For webhook handlers
 */
export async function getMembershipByCustomerId(
  customerId: string
): Promise<Membership | null> {
  // In production: SELECT * FROM memberships WHERE stripe_customer_id = $1
  for (const membership of membershipsStore.values()) {
    if (membership.stripeCustomerId === customerId) {
      return membership;
    }
  }
  return null;
}

// Initialize on module load
initializeCapabilities();
initializeTierCapabilities();
