/**
 * Tests for membership verification system
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import {
  verifyMembership,
  getMembershipConfig,
  hasPermission,
  getRemainingUsage,
  clearMembershipCache,
  generateLimitExceededMessage,
} from '../../lib/services/verifyMembership';
import { createUser } from '../../lib/services/userService';
import { logUsage, countUsage } from '../../lib/services/logUsage';

describe('Membership Verification', () => {
  beforeEach(() => {
    // Clear cache before each test
    clearMembershipCache();
  });

  test('getMembershipConfig returns correct free tier configuration', () => {
    const config = getMembershipConfig('free');
    
    expect(config.tier).toBe('free');
    expect(config.limits.stemSplitPerDay).toBe(5);
    expect(config.limits.halfScrewPerDay).toBe(10);
    expect(config.limits.cleanPerDay).toBe(10);
    expect(config.limits.maxFileDuration).toBe(180);
    expect(config.limits.asyncJobQueue).toBe(false);
    expect(config.permissions.twoStemModel).toBe(true);
    expect(config.permissions.fiveStemModel).toBe(false);
    expect(config.permissions.advancedHalfScrew).toBe(false);
  });

  test('getMembershipConfig returns correct pro tier configuration', () => {
    const config = getMembershipConfig('pro');
    
    expect(config.tier).toBe('pro');
    expect(config.limits.stemSplitPerDay).toBe(50);
    expect(config.limits.halfScrewPerDay).toBe(100);
    expect(config.limits.cleanPerDay).toBe(100);
    expect(config.limits.maxFileDuration).toBe(600);
    expect(config.limits.asyncJobQueue).toBe(true);
    expect(config.permissions.twoStemModel).toBe(true);
    expect(config.permissions.fiveStemModel).toBe(true);
    expect(config.permissions.advancedHalfScrew).toBe(true);
  });

  test('getMembershipConfig returns correct vip tier configuration', () => {
    const config = getMembershipConfig('vip');
    
    expect(config.tier).toBe('vip');
    expect(config.limits.stemSplitPerDay).toBe(999999);
    expect(config.limits.halfScrewPerDay).toBe(999999);
    expect(config.limits.cleanPerDay).toBe(999999);
    expect(config.limits.maxFileDuration).toBe(3600);
    expect(config.limits.asyncJobQueue).toBe(true);
    expect(config.permissions.twoStemModel).toBe(true);
    expect(config.permissions.fiveStemModel).toBe(true);
    expect(config.permissions.advancedHalfScrew).toBe(true);
  });

  test('verifyMembership returns free tier for new user', async () => {
    const user = await createUser({
      email: 'test@example.com',
      password: 'testpass123',
      handle: 'testuser',
      ipAddress: '127.0.0.1',
    });

    const membership = await verifyMembership(user.user.id);
    
    expect(membership.tier).toBe('free');
    expect(membership.permissions.fiveStemModel).toBe(false);
  });

  test('hasPermission checks fiveStemModel correctly', async () => {
    const user = await createUser({
      email: 'test2@example.com',
      password: 'testpass123',
      handle: 'testuser2',
      ipAddress: '127.0.0.1',
    });

    const hasFiveStem = await hasPermission(user.user.id, 'fiveStemModel');
    expect(hasFiveStem).toBe(false); // Free tier

    const hasAdvancedHalfScrew = await hasPermission(user.user.id, 'advancedHalfScrew');
    expect(hasAdvancedHalfScrew).toBe(false); // Free tier
  });

  test('getRemainingUsage calculates correctly', async () => {
    const user = await createUser({
      email: 'test3@example.com',
      password: 'testpass123',
      handle: 'testuser3',
      ipAddress: '127.0.0.1',
    });

    // Log some usage
    logUsage(user.user.id, 'stem_split');
    logUsage(user.user.id, 'stem_split');
    logUsage(user.user.id, 'stem_split');

    const currentUsage = countUsage(user.user.id, 'stem_split');
    const remaining = await getRemainingUsage(user.user.id, 'stemSplitPerDay', currentUsage);
    
    expect(currentUsage).toBe(3);
    expect(remaining).toBe(2); // Free tier has 5 per day
  });

  test('generateLimitExceededMessage creates helpful message', () => {
    const freeTier = getMembershipConfig('free');
    const message = generateLimitExceededMessage(freeTier, 'stem_split');
    
    expect(message).toContain('StemSplit');
    expect(message).toContain('FREE');
    expect(message).toContain('5 per day');
    expect(message).toContain('upgrade');
  });

  test('membership verification caches results', async () => {
    const user = await createUser({
      email: 'test4@example.com',
      password: 'testpass123',
      handle: 'testuser4',
      ipAddress: '127.0.0.1',
    });

    // First call
    const membership1 = await verifyMembership(user.user.id);
    
    // Second call should use cache
    const membership2 = await verifyMembership(user.user.id);
    
    expect(membership1.tier).toBe(membership2.tier);
  });

  test('clearMembershipCache clears specific user', async () => {
    const user = await createUser({
      email: 'test5@example.com',
      password: 'testpass123',
      handle: 'testuser5',
      ipAddress: '127.0.0.1',
    });

    // Populate cache
    await verifyMembership(user.user.id);
    
    // Clear specific user
    clearMembershipCache(user.user.id);
    
    // Should fetch again
    const membership = await verifyMembership(user.user.id);
    expect(membership.tier).toBe('free');
  });
});

describe('Error Messages', () => {
  test('stem_split limit message is clear', () => {
    const config = getMembershipConfig('free');
    const message = generateLimitExceededMessage(config, 'stem_split');
    
    expect(message).toContain('Daily StemSplit limit reached');
    expect(message).toContain('FREE tier');
  });

  test('half_screw limit message is clear', () => {
    const config = getMembershipConfig('pro');
    const message = generateLimitExceededMessage(config, 'half_screw');
    
    expect(message).toContain('Daily HalfScrew limit reached');
    expect(message).toContain('PRO tier');
    expect(message).toContain('100 per day');
  });

  test('clean_audio limit message is clear', () => {
    const config = getMembershipConfig('vip');
    const message = generateLimitExceededMessage(config, 'clean_audio');
    
    expect(message).toContain('Daily Audio Cleaning limit reached');
    expect(message).toContain('VIP tier');
  });
});
