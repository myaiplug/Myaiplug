// User activity logging service
import type { User, Profile } from '../types';

export type ActivityType = 'signup' | 'login' | 'logout' | 'profile_update' | 'job_completed' | 'token_grant' | 'subscription_change';

export interface ActivityLog {
  id: string;
  userId: string;
  activityType: ActivityType;
  timestamp: Date;
  ipAddress?: string;
  metadata?: Record<string, any>;
}

// In-memory activity log store (would be persisted to database in production)
const activityLogs = new Map<string, ActivityLog[]>();
let logCounter = 0;

/**
 * Log user activity
 */
export function logActivity(params: {
  userId: string;
  activityType: ActivityType;
  ipAddress?: string;
  metadata?: Record<string, any>;
}): ActivityLog {
  const { userId, activityType, ipAddress, metadata } = params;
  
  const log: ActivityLog = {
    id: `log_${Date.now()}_${logCounter++}`,
    userId,
    activityType,
    timestamp: new Date(),
    ipAddress,
    metadata,
  };

  // Store log
  const userLogs = activityLogs.get(userId) || [];
  userLogs.push(log);
  activityLogs.set(userId, userLogs);

  // Console log for server monitoring
  console.log(`[ACTIVITY] ${activityType.toUpperCase()} - User: ${userId}, IP: ${ipAddress || 'N/A'}`, metadata || '');

  return log;
}

/**
 * Get user activity logs
 */
export function getUserActivityLogs(userId: string, limit?: number): ActivityLog[] {
  const logs = activityLogs.get(userId) || [];
  if (limit) {
    return logs.slice(-limit).reverse();
  }
  return [...logs].reverse();
}

/**
 * Get all activity logs (admin function)
 */
export function getAllActivityLogs(limit?: number): ActivityLog[] {
  const allLogs: ActivityLog[] = [];
  for (const logs of activityLogs.values()) {
    allLogs.push(...logs);
  }
  
  // Sort by timestamp descending
  allLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  
  if (limit) {
    return allLogs.slice(0, limit);
  }
  return allLogs;
}

/**
 * Get activity summary for user
 */
export function getUserActivitySummary(userId: string): {
  totalLogins: number;
  lastLogin: Date | null;
  totalJobsCompleted: number;
  accountCreated: Date | null;
} {
  const logs = activityLogs.get(userId) || [];
  
  const loginLogs = logs.filter(log => log.activityType === 'login');
  const jobLogs = logs.filter(log => log.activityType === 'job_completed');
  const signupLog = logs.find(log => log.activityType === 'signup');
  
  return {
    totalLogins: loginLogs.length,
    lastLogin: loginLogs.length > 0 ? loginLogs[loginLogs.length - 1].timestamp : null,
    totalJobsCompleted: jobLogs.length,
    accountCreated: signupLog ? signupLog.timestamp : null,
  };
}

/**
 * Log user signup with full details
 */
export function logUserSignup(user: User, profile: Profile, ipAddress: string): ActivityLog {
  return logActivity({
    userId: user.id,
    activityType: 'signup',
    ipAddress,
    metadata: {
      email: user.email,
      handle: user.handle,
      tier: user.tier,
      initialPoints: profile.pointsTotal,
    },
  });
}

/**
 * Log user login with full details
 */
export function logUserLogin(user: User, profile: Profile, ipAddress: string): ActivityLog {
  return logActivity({
    userId: user.id,
    activityType: 'login',
    ipAddress,
    metadata: {
      email: user.email,
      handle: user.handle,
      tier: user.tier,
      currentPoints: profile.pointsTotal,
      totalJobs: profile.totalJobs,
      timeSavedSec: profile.timeSavedSecTotal,
    },
  });
}

/**
 * Export activity logs as JSON (for database backup/migration)
 */
export function exportActivityLogs(): string {
  const allLogs = getAllActivityLogs();
  return JSON.stringify(allLogs, null, 2);
}
