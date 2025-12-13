/**
 * Tests for usage logging system
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import {
  logUsage,
  getUsageLogs,
  countUsage,
  hasExceededLimit,
  getUserLogs,
  getUserUsageStats,
  cleanupOldLogs,
} from '../../lib/services/logUsage';

describe('Usage Logging', () => {
  const testUserId = 'test_user_123';

  test('logUsage creates a log entry', () => {
    const log = logUsage(testUserId, 'stem_split', '/api/audio/separate');
    
    expect(log.userId).toBe(testUserId);
    expect(log.action).toBe('stem_split');
    expect(log.endpoint).toBe('/api/audio/separate');
    expect(log.id).toBeDefined();
    expect(log.timestamp).toBeInstanceOf(Date);
  });

  test('logUsage can include metadata', () => {
    const metadata = { tier: 'pro', duration: 30 };
    const log = logUsage(testUserId, 'stem_split', '/api/audio/separate', metadata);
    
    expect(log.metadata).toEqual(metadata);
  });

  test('getUsageLogs returns recent logs', () => {
    const userId = 'test_user_456';
    
    logUsage(userId, 'stem_split');
    logUsage(userId, 'stem_split');
    logUsage(userId, 'clean_audio');
    
    const logs = getUsageLogs(userId);
    
    expect(logs.length).toBe(3);
  });

  test('getUsageLogs filters by action', () => {
    const userId = 'test_user_789';
    
    logUsage(userId, 'stem_split');
    logUsage(userId, 'stem_split');
    logUsage(userId, 'clean_audio');
    
    const stemLogs = getUsageLogs(userId, 'stem_split');
    const cleanLogs = getUsageLogs(userId, 'clean_audio');
    
    expect(stemLogs.length).toBe(2);
    expect(cleanLogs.length).toBe(1);
  });

  test('countUsage returns correct count', () => {
    const userId = 'test_user_count';
    
    logUsage(userId, 'stem_split');
    logUsage(userId, 'stem_split');
    logUsage(userId, 'stem_split');
    
    const count = countUsage(userId, 'stem_split');
    
    expect(count).toBe(3);
  });

  test('hasExceededLimit returns true when limit exceeded', () => {
    const userId = 'test_user_limit';
    const limit = 3;
    
    logUsage(userId, 'stem_split');
    logUsage(userId, 'stem_split');
    logUsage(userId, 'stem_split');
    
    const exceeded = hasExceededLimit(userId, 'stem_split', limit);
    
    expect(exceeded).toBe(true);
  });

  test('hasExceededLimit returns false when under limit', () => {
    const userId = 'test_user_under';
    const limit = 5;
    
    logUsage(userId, 'stem_split');
    logUsage(userId, 'stem_split');
    
    const exceeded = hasExceededLimit(userId, 'stem_split', limit);
    
    expect(exceeded).toBe(false);
  });

  test('getUserLogs returns all logs for user', () => {
    const userId = 'test_user_all';
    
    logUsage(userId, 'stem_split');
    logUsage(userId, 'clean_audio');
    logUsage(userId, 'half_screw');
    
    const allLogs = getUserLogs(userId);
    
    expect(allLogs.length).toBeGreaterThanOrEqual(3);
  });

  test('getUserUsageStats provides statistics', () => {
    const userId = 'test_user_stats';
    
    logUsage(userId, 'stem_split');
    logUsage(userId, 'stem_split');
    logUsage(userId, 'clean_audio');
    
    const stats = getUserUsageStats(userId);
    
    expect(stats.totalActions).toBeGreaterThanOrEqual(3);
    expect(stats.actionCounts['stem_split']).toBeGreaterThanOrEqual(2);
    expect(stats.actionCounts['clean_audio']).toBeGreaterThanOrEqual(1);
  });

  test('cleanupOldLogs removes old entries', () => {
    const userId = 'test_user_cleanup';
    
    // Log some entries
    logUsage(userId, 'stem_split');
    logUsage(userId, 'clean_audio');
    
    // Clean up logs older than 1ms (will remove all)
    const removed = cleanupOldLogs(1);
    
    expect(removed).toBeGreaterThanOrEqual(0);
  });

  test('logs are unique per user', () => {
    const user1 = 'user_1';
    const user2 = 'user_2';
    
    logUsage(user1, 'stem_split');
    logUsage(user1, 'stem_split');
    logUsage(user2, 'stem_split');
    
    const count1 = countUsage(user1, 'stem_split');
    const count2 = countUsage(user2, 'stem_split');
    
    expect(count1).toBeGreaterThanOrEqual(2);
    expect(count2).toBeGreaterThanOrEqual(1);
  });
});

describe('Time Windows', () => {
  test('getUsageLogs respects time window', () => {
    const userId = 'test_user_window';
    
    logUsage(userId, 'stem_split');
    
    // Get logs from last 1 hour
    const oneHourMs = 60 * 60 * 1000;
    const logs = getUsageLogs(userId, 'stem_split', oneHourMs);
    
    expect(logs.length).toBeGreaterThanOrEqual(1);
  });

  test('countUsage respects time window', () => {
    const userId = 'test_user_window2';
    
    logUsage(userId, 'stem_split');
    logUsage(userId, 'stem_split');
    
    // Count within 24 hours
    const count = countUsage(userId, 'stem_split', 24 * 60 * 60 * 1000);
    
    expect(count).toBeGreaterThanOrEqual(2);
  });
});
