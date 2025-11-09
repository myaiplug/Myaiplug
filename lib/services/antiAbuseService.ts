// Anti-abuse and security measures
import { ANTI_FARM_CAPS } from '../constants/gamification';

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

export interface AbuseDetectionResult {
  isSuspicious: boolean;
  reasons: string[];
  riskScore: number;
}

// In-memory storage for rate limiting
const rateLimitStore = new Map<string, { count: number; resetAt: Date }>();
const ipTrackingStore = new Map<string, string[]>(); // IP -> userIds
const userIpStore = new Map<string, Set<string>>(); // userId -> IPs
const suspiciousActivityLog: Array<{
  userId: string;
  action: string;
  timestamp: Date;
  reason: string;
}> = [];

/**
 * Rate limit check for API endpoints
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowMinutes: number = 60
): RateLimitResult {
  const now = new Date();
  const existing = rateLimitStore.get(identifier);

  // Check if existing window is still valid
  if (existing && existing.resetAt > now) {
    if (existing.count >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: existing.resetAt,
      };
    }

    // Increment count
    existing.count++;
    return {
      allowed: true,
      remaining: maxRequests - existing.count,
      resetAt: existing.resetAt,
    };
  }

  // Create new window
  const resetAt = new Date(now.getTime() + windowMinutes * 60 * 1000);
  rateLimitStore.set(identifier, { count: 1, resetAt });

  return {
    allowed: true,
    remaining: maxRequests - 1,
    resetAt,
  };
}

/**
 * Track IP address for a user
 */
export function trackUserIP(userId: string, ipAddress: string): void {
  // Track which users used this IP
  const usersOnIP = ipTrackingStore.get(ipAddress) || [];
  if (!usersOnIP.includes(userId)) {
    usersOnIP.push(userId);
    ipTrackingStore.set(ipAddress, usersOnIP);
  }

  // Track which IPs this user used
  const userIPs = userIpStore.get(userId) || new Set();
  userIPs.add(ipAddress);
  userIpStore.set(userId, userIPs);
}

/**
 * Detect suspicious referral activity
 */
export function detectReferralAbuse(
  referrerId: string,
  referredUserId: string,
  referredUserIP: string
): AbuseDetectionResult {
  const reasons: string[] = [];
  let riskScore = 0;

  // Check 1: Multiple referrals from same IP
  const usersOnIP = ipTrackingStore.get(referredUserIP) || [];
  const referralsByReferrerOnIP = usersOnIP.filter(uid => {
    // Would need to check if this user was referred by referrerId
    return false; // Simplified for now
  }).length;

  if (referralsByReferrerOnIP > 3) {
    reasons.push('Multiple referrals from same IP');
    riskScore += 30;
  }

  // Check 2: Referrer and referred user share IPs
  const referrerIPs = userIpStore.get(referrerId) || new Set();
  if (referrerIPs.has(referredUserIP)) {
    reasons.push('Referrer and referred user share IP address');
    riskScore += 50;
  }

  // Check 3: Too many referrals in short time
  // Would need timestamp tracking - simplified here
  riskScore += 0; // Placeholder

  return {
    isSuspicious: riskScore >= 50,
    reasons,
    riskScore,
  };
}

/**
 * Detect bot-like behavior in view counts
 */
export function validateViewIncrement(
  creationId: string,
  viewerIP: string,
  viewerUserId?: string
): boolean {
  const key = `view_${creationId}_${viewerIP}_${viewerUserId || 'anon'}`;
  
  // Check if this IP/user already viewed recently (within 1 hour)
  const existing = rateLimitStore.get(key);
  const now = new Date();

  if (existing && existing.resetAt > now) {
    // Already viewed recently, don't count
    return false;
  }

  // Mark as viewed
  const resetAt = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour
  rateLimitStore.set(key, { count: 1, resetAt });

  return true;
}

/**
 * Check for demo share farming
 */
export function validateDemoShare(userId: string, uniqueIPs: string[]): boolean {
  if (uniqueIPs.length < ANTI_FARM_CAPS.DEMO_SHARE_MIN_UNIQUE_IPS) {
    logSuspiciousActivity(userId, 'demo_share', 'Insufficient unique IPs for demo share');
    return false;
  }

  return true;
}

/**
 * Check daily referral rate
 */
export function checkDailyReferralRate(userId: string, todayReferrals: number): {
  needsReview: boolean;
  threshold: number;
} {
  const threshold = ANTI_FARM_CAPS.REFERRALS_PER_DAY_REVIEW_THRESHOLD;
  const needsReview = todayReferrals >= threshold;

  if (needsReview) {
    logSuspiciousActivity(
      userId,
      'referral_rate',
      `${todayReferrals} referrals in one day (threshold: ${threshold})`
    );
  }

  return { needsReview, threshold };
}

/**
 * Log suspicious activity
 */
function logSuspiciousActivity(userId: string, action: string, reason: string): void {
  suspiciousActivityLog.push({
    userId,
    action,
    timestamp: new Date(),
    reason,
  });
}

/**
 * Get suspicious activity log (admin function)
 */
export function getSuspiciousActivityLog(limit?: number): Array<{
  userId: string;
  action: string;
  timestamp: Date;
  reason: string;
}> {
  const sorted = [...suspiciousActivityLog].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );
  return limit ? sorted.slice(0, limit) : sorted;
}

/**
 * Get user's IP history
 */
export function getUserIPHistory(userId: string): string[] {
  const ips = userIpStore.get(userId);
  return ips ? Array.from(ips) : [];
}

/**
 * Get users on an IP
 */
export function getUsersOnIP(ipAddress: string): string[] {
  return ipTrackingStore.get(ipAddress) || [];
}

/**
 * Clear rate limit for testing
 */
export function clearRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

/**
 * API endpoint rate limits
 */
export const RATE_LIMITS = {
  // Authentication
  SIGNUP: { max: 5, window: 60 }, // 5 signups per hour per IP
  SIGNIN: { max: 10, window: 10 }, // 10 signin attempts per 10 minutes per IP
  PASSWORD_RESET: { max: 3, window: 60 }, // 3 password resets per hour per email

  // API endpoints
  JOB_CREATE: { max: 50, window: 60 }, // 50 jobs per hour per user
  CREATION_PUBLISH: { max: 20, window: 60 }, // 20 publishes per hour per user
  PROFILE_UPDATE: { max: 10, window: 60 }, // 10 profile updates per hour per user
  
  // Public endpoints
  LEADERBOARD_VIEW: { max: 100, window: 10 }, // 100 requests per 10 minutes per IP
  PROFILE_VIEW: { max: 200, window: 10 }, // 200 profile views per 10 minutes per IP
} as const;

/**
 * Get client IP from request headers
 */
export function getClientIP(headers: Headers): string {
  // Check various headers for IP (in order of preference)
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Fallback to connection remote address
  return headers.get('x-vercel-forwarded-for') || 'unknown';
}
