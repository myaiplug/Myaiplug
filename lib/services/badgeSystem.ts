// Badge award system - handles badge evaluation and awarding
import type { Badge, Profile, Job, Creation, Referral } from '../types';
import { BADGE_DEFINITIONS } from '../constants/gamification';

export interface BadgeEvaluation {
  badgeId: string;
  earned: boolean;
  progress: number;
  requirement: number;
}

// In-memory storage for user badges (replace with DB in production)
const userBadges = new Map<string, Badge[]>();

/**
 * Evaluate and award badges for a user
 */
export async function evaluateAndAwardBadges(
  userId: string,
  profile: Profile,
  jobs: Job[],
  creations: Creation[],
  referrals: Referral[]
): Promise<Badge[]> {
  const newBadges: Badge[] = [];
  const existingBadges = getUserBadges(userId);
  const existingBadgeIds = new Set(existingBadges.map(b => b.id));

  // Evaluate each badge type
  const evaluations = [
    evaluateUploadHeroBadges(jobs, existingBadgeIds),
    evaluateTimeSavedBadges(profile.timeSavedSecTotal, existingBadgeIds),
    evaluateReferralBadges(referrals, existingBadgeIds),
    evaluateCleanCutBadge(jobs, existingBadgeIds),
    evaluateTasteMakerBadge(creations, existingBadgeIds),
  ].flat();

  // Award new badges
  for (const evaluation of evaluations) {
    if (evaluation.earned && !existingBadgeIds.has(evaluation.badgeId)) {
      const badge = createBadge(evaluation.badgeId);
      if (badge) {
        newBadges.push(badge);
        existingBadges.push(badge);
      }
    }
  }

  // Update storage
  userBadges.set(userId, existingBadges);

  return newBadges;
}

/**
 * Evaluate Upload Hero badges (job completion count)
 */
function evaluateUploadHeroBadges(jobs: Job[], existingBadgeIds: Set<string>): BadgeEvaluation[] {
  const completedJobs = jobs.filter(j => j.status === 'done').length;

  return [
    {
      badgeId: BADGE_DEFINITIONS.UPLOAD_HERO_I.id,
      earned: completedJobs >= BADGE_DEFINITIONS.UPLOAD_HERO_I.requirement,
      progress: completedJobs,
      requirement: BADGE_DEFINITIONS.UPLOAD_HERO_I.requirement,
    },
    {
      badgeId: BADGE_DEFINITIONS.UPLOAD_HERO_II.id,
      earned: completedJobs >= BADGE_DEFINITIONS.UPLOAD_HERO_II.requirement,
      progress: completedJobs,
      requirement: BADGE_DEFINITIONS.UPLOAD_HERO_II.requirement,
    },
    {
      badgeId: BADGE_DEFINITIONS.UPLOAD_HERO_III.id,
      earned: completedJobs >= BADGE_DEFINITIONS.UPLOAD_HERO_III.requirement,
      progress: completedJobs,
      requirement: BADGE_DEFINITIONS.UPLOAD_HERO_III.requirement,
    },
  ];
}

/**
 * Evaluate Time Saved badges
 */
function evaluateTimeSavedBadges(timeSavedSec: number, existingBadgeIds: Set<string>): BadgeEvaluation[] {
  return [
    {
      badgeId: BADGE_DEFINITIONS.TIME_BANDIT.id,
      earned: timeSavedSec >= BADGE_DEFINITIONS.TIME_BANDIT.requirement,
      progress: timeSavedSec,
      requirement: BADGE_DEFINITIONS.TIME_BANDIT.requirement,
    },
    {
      badgeId: BADGE_DEFINITIONS.TIME_LORD.id,
      earned: timeSavedSec >= BADGE_DEFINITIONS.TIME_LORD.requirement,
      progress: timeSavedSec,
      requirement: BADGE_DEFINITIONS.TIME_LORD.requirement,
    },
    {
      badgeId: BADGE_DEFINITIONS.CHRONOMANCER.id,
      earned: timeSavedSec >= BADGE_DEFINITIONS.CHRONOMANCER.requirement,
      progress: timeSavedSec,
      requirement: BADGE_DEFINITIONS.CHRONOMANCER.requirement,
    },
  ];
}

/**
 * Evaluate Referral badges
 */
function evaluateReferralBadges(referrals: Referral[], existingBadgeIds: Set<string>): BadgeEvaluation[] {
  const paidReferrals = referrals.filter(r => r.status === 'paid').length;

  return [
    {
      badgeId: BADGE_DEFINITIONS.WORD_OF_MOUTH.id,
      earned: paidReferrals >= BADGE_DEFINITIONS.WORD_OF_MOUTH.requirement,
      progress: paidReferrals,
      requirement: BADGE_DEFINITIONS.WORD_OF_MOUTH.requirement,
    },
    {
      badgeId: BADGE_DEFINITIONS.RAINMAKER.id,
      earned: paidReferrals >= BADGE_DEFINITIONS.RAINMAKER.requirement,
      progress: paidReferrals,
      requirement: BADGE_DEFINITIONS.RAINMAKER.requirement,
    },
    {
      badgeId: BADGE_DEFINITIONS.TYCOON.id,
      earned: paidReferrals >= BADGE_DEFINITIONS.TYCOON.requirement,
      progress: paidReferrals,
      requirement: BADGE_DEFINITIONS.TYCOON.requirement,
    },
  ];
}

/**
 * Evaluate Clean Cut badge (consecutive QC passes)
 */
function evaluateCleanCutBadge(jobs: Job[], existingBadgeIds: Set<string>): BadgeEvaluation[] {
  // Sort jobs by creation date
  const sortedJobs = [...jobs]
    .filter(j => j.status === 'done')
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  // Count consecutive QC passes
  let consecutivePasses = 0;
  let maxConsecutivePasses = 0;

  for (const job of sortedJobs) {
    // Check if job has QC report and passed
    const qcPassed = job.qcReport && !job.qcReport.hasIssues;
    
    if (qcPassed) {
      consecutivePasses++;
      maxConsecutivePasses = Math.max(maxConsecutivePasses, consecutivePasses);
    } else if (job.qcReport) {
      // Only reset if QC was performed and failed
      consecutivePasses = 0;
    }
  }

  return [
    {
      badgeId: BADGE_DEFINITIONS.CLEAN_CUT.id,
      earned: maxConsecutivePasses >= BADGE_DEFINITIONS.CLEAN_CUT.requirement,
      progress: maxConsecutivePasses,
      requirement: BADGE_DEFINITIONS.CLEAN_CUT.requirement,
    },
  ];
}

/**
 * Evaluate Taste Maker badge (published creations with views)
 */
function evaluateTasteMakerBadge(creations: Creation[], existingBadgeIds: Set<string>): BadgeEvaluation[] {
  const qualifyingCreations = creations.filter(
    c => c.public && c.views >= 100
  ).length;

  return [
    {
      badgeId: BADGE_DEFINITIONS.TASTE_MAKER.id,
      earned: qualifyingCreations >= BADGE_DEFINITIONS.TASTE_MAKER.requirement,
      progress: qualifyingCreations,
      requirement: BADGE_DEFINITIONS.TASTE_MAKER.requirement,
    },
  ];
}

/**
 * Create a badge object from a badge ID
 */
function createBadge(badgeId: string): Badge | null {
  const definition = Object.values(BADGE_DEFINITIONS).find(d => d.id === badgeId);
  
  if (!definition) {
    return null;
  }

  return {
    id: definition.id,
    name: definition.name,
    description: definition.description,
    awardedAt: new Date(),
  };
}

/**
 * Get all badges for a user
 */
export function getUserBadges(userId: string): Badge[] {
  return userBadges.get(userId) || [];
}

/**
 * Check if user has a specific badge
 */
export function hasBadge(userId: string, badgeId: string): boolean {
  const badges = getUserBadges(userId);
  return badges.some(b => b.id === badgeId);
}

/**
 * Get badge progress for a user
 */
export function getBadgeProgress(
  userId: string,
  profile: Profile,
  jobs: Job[],
  creations: Creation[],
  referrals: Referral[]
): BadgeEvaluation[] {
  const existingBadges = getUserBadges(userId);
  const existingBadgeIds = new Set(existingBadges.map(b => b.id));

  return [
    ...evaluateUploadHeroBadges(jobs, existingBadgeIds),
    ...evaluateTimeSavedBadges(profile.timeSavedSecTotal, existingBadgeIds),
    ...evaluateReferralBadges(referrals, existingBadgeIds),
    ...evaluateCleanCutBadge(jobs, existingBadgeIds),
    ...evaluateTasteMakerBadge(creations, existingBadgeIds),
  ];
}

/**
 * Initialize badges for a user from stored data
 */
export function initializeUserBadges(userId: string, badges: Badge[]): void {
  userBadges.set(userId, badges);
}
