/**
 * Tests for platform-wide entitlement system
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import {
  authorizeAndConsume,
  checkAuthorization,
  clearAuthCache,
  getUserTier,
} from '../../lib/services/entitlements';
import {
  getMembership,
  updateMembership,
  getCapability,
  getTierCapability,
} from '../../lib/services/database';

describe('Entitlement System', () => {
  beforeEach(() => {
    clearAuthCache();
  });

  test('authorizeAndConsume allows free tier with limits', async () => {
    const userId = 'test_user_free_ent';
    
    const result1 = await authorizeAndConsume({
      userId,
      capabilityKey: 'stem_split',
      usageAmount: 1,
    });

    expect(result1.allowed).toBe(true);
    expect(result1.tier).toBe('free');
    expect(result1.modelVariant).toBe('2-stem');
    expect(result1.allowAsync).toBe(false);
  });

  test('pro tier gets 5-stem model', async () => {
    const userId = 'test_user_pro_ent';
    
    await updateMembership(userId, 'pro');

    const result = await authorizeAndConsume({
      userId,
      capabilityKey: 'stem_split',
      usageAmount: 1,
    });

    expect(result.allowed).toBe(true);
    expect(result.tier).toBe('pro');
    expect(result.modelVariant).toBe('5-stem');
    expect(result.allowAsync).toBe(true);
  });

  test('vip tier has unlimited usage', async () => {
    const userId = 'test_user_vip_ent';
    
    await updateMembership(userId, 'vip');

    const result = await authorizeAndConsume({
      userId,
      capabilityKey: 'stem_split',
      usageAmount: 1,
    });

    expect(result.allowed).toBe(true);
    expect(result.tier).toBe('vip');
    expect(result.modelVariant).toBe('5-stem');
    expect(result.remainingUsage).toBe(Number.MAX_SAFE_INTEGER);
  });

  test('getUserTier returns correct tier', async () => {
    const userId1 = 'test_tier_ent_1';
    const userId2 = 'test_tier_ent_2';

    const tier1 = await getUserTier(userId1);
    expect(tier1).toBe('free');

    await updateMembership(userId2, 'pro');
    const tier2 = await getUserTier(userId2);
    expect(tier2).toBe('pro');
  });
});

describe('Database Layer', () => {
  test('getCapability returns capability info', async () => {
    const capability = await getCapability('stem_split');

    expect(capability).not.toBeNull();
    expect(capability!.key).toBe('stem_split');
    expect(capability!.name).toBe('Stem Separation');
    expect(capability!.usageUnit).toBe('jobs');
  });

  test('getTierCapability returns tier-specific config', async () => {
    const freeConfig = await getTierCapability('free', 'stem_split');
    const proConfig = await getTierCapability('pro', 'stem_split');

    expect(freeConfig!.dailyLimit).toBe(5);
    expect(freeConfig!.modelVariant).toBe('2-stem');
    expect(freeConfig!.allowAsync).toBe(false);

    expect(proConfig!.dailyLimit).toBe(50);
    expect(proConfig!.modelVariant).toBe('5-stem');
    expect(proConfig!.allowAsync).toBe(true);
  });

  test('getMembership defaults to free tier', async () => {
    const membership = await getMembership('new_user_ent_12345');

    expect(membership).not.toBeNull();
    expect(membership!.tier).toBe('free');
  });

  test('updateMembership changes tier', async () => {
    const userId = 'test_update_user_ent';

    const before = await getMembership(userId);
    expect(before!.tier).toBe('free');

    await updateMembership(userId, 'pro', {
      customerId: 'cus_123',
      subscriptionId: 'sub_123',
    });

    const after = await getMembership(userId);
    expect(after!.tier).toBe('pro');
    expect(after!.stripeCustomerId).toBe('cus_123');
    expect(after!.stripeSubscriptionId).toBe('sub_123');
  });
});
