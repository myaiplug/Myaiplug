// Points calculation engine - handles all point awarding logic
import type { PointEventType, PointsLedgerEntry, Job } from '../types';
import { POINT_EVENTS, ANTI_FARM_CAPS } from '../constants/gamification';

export interface AwardPointsParams {
  userId: string;
  eventType: PointEventType;
  jobId?: string;
  referralId?: string;
  metadata?: Record<string, any>;
}

export interface PointsValidation {
  allowed: boolean;
  reason?: string;
}

// In-memory storage for points ledger (replace with DB in production)
const pointsLedger: PointsLedgerEntry[] = [];
const userPointsCache = new Map<string, number>();

/**
 * Award points to a user for a specific event
 */
export async function awardPoints(params: AwardPointsParams): Promise<PointsLedgerEntry | null> {
  const { userId, eventType, jobId, referralId, metadata = {} } = params;

  // Validate the award
  const validation = await validatePointsAward(userId, eventType, metadata);
  if (!validation.allowed) {
    console.warn(`Points award rejected: ${validation.reason}`);
    return null;
  }

  // Calculate points for the event
  const points = calculatePointsForEvent(eventType, metadata);
  if (points === 0) {
    return null;
  }

  // Create ledger entry
  const entry: PointsLedgerEntry = {
    id: `pts_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    eventType,
    points,
    jobId,
    referralId,
    metadata,
    createdAt: new Date(),
  };

  // Store in ledger
  pointsLedger.push(entry);

  // Update cache
  const currentPoints = userPointsCache.get(userId) || 0;
  userPointsCache.set(userId, currentPoints + points);

  return entry;
}

/**
 * Calculate points for a specific event type
 */
function calculatePointsForEvent(eventType: PointEventType, metadata: Record<string, any>): number {
  switch (eventType) {
    case 'signup':
      return POINT_EVENTS.SIGNUP;
    
    case 'onboarding_complete':
      return POINT_EVENTS.ONBOARDING_COMPLETE;
    
    case 'job_complete':
      // Points based on processing time
      const procSec = metadata.processingSeconds || 0;
      if (procSec <= 60) {
        return POINT_EVENTS.JOB_SHORT;
      } else {
        return POINT_EVENTS.JOB_MEDIUM;
      }
    
    case 'pro_chain_bonus':
      return POINT_EVENTS.PRO_CHAIN_BONUS;
    
    case 'portfolio_publish':
      return POINT_EVENTS.PORTFOLIO_PUBLISH_DAILY;
    
    case 'referral_signup':
      return POINT_EVENTS.REFERRAL_SIGNUP;
    
    case 'referral_paid':
      // Apply multiplier if user is Creator Coach level or higher
      const multiplier = metadata.referralMultiplier || 1;
      return Math.floor(POINT_EVENTS.REFERRAL_PAID * multiplier);
    
    case 'weekly_streak':
      return POINT_EVENTS.WEEKLY_STREAK;
    
    case 'demo_shared':
      return POINT_EVENTS.DEMO_SHARED;
    
    default:
      return 0;
  }
}

/**
 * Validate if a points award is allowed (anti-abuse)
 */
async function validatePointsAward(
  userId: string,
  eventType: PointEventType,
  metadata: Record<string, any>
): Promise<PointsValidation> {
  // Check for duplicate events (e.g., signup can only happen once)
  if (eventType === 'signup' || eventType === 'onboarding_complete') {
    const existing = pointsLedger.find(
      entry => entry.userId === userId && entry.eventType === eventType
    );
    if (existing) {
      return { allowed: false, reason: `${eventType} already awarded` };
    }
  }

  // Check referral limits
  if (eventType === 'referral_signup') {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentReferrals = pointsLedger.filter(
      entry => 
        entry.userId === userId && 
        entry.eventType === 'referral_signup' &&
        entry.createdAt >= weekAgo
    );
    
    if (recentReferrals.length >= ANTI_FARM_CAPS.NON_PAID_REFERRALS_PER_WEEK) {
      return { allowed: false, reason: 'Weekly referral limit reached' };
    }
  }

  // Check daily portfolio publish limit
  if (eventType === 'portfolio_publish') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayPublishes = pointsLedger.filter(
      entry =>
        entry.userId === userId &&
        entry.eventType === 'portfolio_publish' &&
        entry.createdAt >= today
    );
    
    if (todayPublishes.length >= 1) {
      return { allowed: false, reason: 'Daily portfolio publish limit reached' };
    }
  }

  return { allowed: true };
}

/**
 * Get total points for a user
 */
export function getUserPoints(userId: string): number {
  // Try cache first
  if (userPointsCache.has(userId)) {
    return userPointsCache.get(userId)!;
  }

  // Calculate from ledger
  const total = pointsLedger
    .filter(entry => entry.userId === userId)
    .reduce((sum, entry) => sum + entry.points, 0);

  // Update cache
  userPointsCache.set(userId, total);
  return total;
}

/**
 * Get points history for a user
 */
export function getUserPointsHistory(userId: string, limit?: number): PointsLedgerEntry[] {
  const entries = pointsLedger
    .filter(entry => entry.userId === userId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return limit ? entries.slice(0, limit) : entries;
}

/**
 * Get all points ledger entries (admin/debugging)
 */
export function getAllPointsLedger(): PointsLedgerEntry[] {
  return [...pointsLedger];
}

/**
 * Clear cache for a user (useful when recalculating)
 */
export function clearUserPointsCache(userId: string): void {
  userPointsCache.delete(userId);
}

/**
 * Calculate points for job completion
 */
export function calculateJobPoints(job: Job): number {
  const metadata = { processingSeconds: job.cpuSec };
  return calculatePointsForEvent('job_complete', metadata);
}
