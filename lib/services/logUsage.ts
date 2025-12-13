/**
 * Usage Logging Service
 * Tracks user actions for membership tier enforcement and analytics
 */

import type { UsageLog } from '../types';
import { generateSecureId } from '../utils/secureId';

// In-memory storage for usage logs
const usageLogsStore = new Map<string, UsageLog[]>();

/**
 * Log a user action
 * @param userId - The user ID
 * @param action - The action being performed (e.g., 'stem_split', 'half_screw', 'clean_audio')
 * @param endpoint - Optional API endpoint that was called
 * @param metadata - Optional additional data
 */
export function logUsage(
  userId: string,
  action: string,
  endpoint?: string,
  metadata?: Record<string, any>
): UsageLog {
  const log: UsageLog = {
    id: generateSecureId('log_'),
    userId,
    action,
    endpoint,
    timestamp: new Date(),
    metadata,
  };

  // Get or create user's log array
  const userLogs = usageLogsStore.get(userId) || [];
  userLogs.push(log);
  usageLogsStore.set(userId, userLogs);

  return log;
}

/**
 * Get usage logs for a user within a time window
 * @param userId - The user ID
 * @param action - Optional filter by action type
 * @param windowMs - Time window in milliseconds (default: 24 hours)
 */
export function getUsageLogs(
  userId: string,
  action?: string,
  windowMs: number = 24 * 60 * 60 * 1000
): UsageLog[] {
  const userLogs = usageLogsStore.get(userId) || [];
  const cutoffTime = new Date(Date.now() - windowMs);

  return userLogs.filter(log => {
    const isRecent = log.timestamp >= cutoffTime;
    const matchesAction = !action || log.action === action;
    return isRecent && matchesAction;
  });
}

/**
 * Count usage within a time window
 * @param userId - The user ID
 * @param action - The action to count
 * @param windowMs - Time window in milliseconds (default: 24 hours)
 */
export function countUsage(
  userId: string,
  action: string,
  windowMs: number = 24 * 60 * 60 * 1000
): number {
  return getUsageLogs(userId, action, windowMs).length;
}

/**
 * Check if user has exceeded usage limit
 * @param userId - The user ID
 * @param action - The action to check
 * @param limit - Maximum allowed within time window
 * @param windowMs - Time window in milliseconds (default: 24 hours)
 */
export function hasExceededLimit(
  userId: string,
  action: string,
  limit: number,
  windowMs: number = 24 * 60 * 60 * 1000
): boolean {
  const count = countUsage(userId, action, windowMs);
  return count >= limit;
}

/**
 * Get all logs for a user (for admin/debugging)
 * @param userId - The user ID
 */
export function getUserLogs(userId: string): UsageLog[] {
  return usageLogsStore.get(userId) || [];
}

/**
 * Clear old logs (cleanup function to prevent memory bloat)
 * @param olderThanMs - Remove logs older than this (default: 30 days)
 */
export function cleanupOldLogs(olderThanMs: number = 30 * 24 * 60 * 60 * 1000): number {
  const cutoffTime = new Date(Date.now() - olderThanMs);
  let removedCount = 0;

  for (const [userId, logs] of usageLogsStore.entries()) {
    const recentLogs = logs.filter(log => log.timestamp >= cutoffTime);
    removedCount += logs.length - recentLogs.length;
    
    if (recentLogs.length === 0) {
      usageLogsStore.delete(userId);
    } else {
      usageLogsStore.set(userId, recentLogs);
    }
  }

  return removedCount;
}

/**
 * Get usage statistics for a user
 * @param userId - The user ID
 */
export function getUserUsageStats(userId: string): {
  totalActions: number;
  actionCounts: Record<string, number>;
  last24Hours: Record<string, number>;
} {
  const allLogs = getUserLogs(userId);
  const recent24h = getUsageLogs(userId);

  const actionCounts: Record<string, number> = {};
  const last24Hours: Record<string, number> = {};

  allLogs.forEach(log => {
    actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
  });

  recent24h.forEach(log => {
    last24Hours[log.action] = (last24Hours[log.action] || 0) + 1;
  });

  return {
    totalActions: allLogs.length,
    actionCounts,
    last24Hours,
  };
}
