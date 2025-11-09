// Referral tracking and rewards system
import type { Referral, ReferralStatus, Credits } from '../types';
import { REFERRAL_MILESTONES } from '../constants/gamification';
import { awardPoints } from './pointsEngine';

export interface ReferralLink {
  code: string;
  url: string;
}

export interface ReferralStats {
  totalReferrals: number;
  signedUpCount: number;
  paidCount: number;
  pointsEarned: number;
  creditsEarned: number;
  milestones: {
    count: number;
    reward: string;
    unlocked: boolean;
    progress: number;
  }[];
}

// In-memory storage
const referralsStore = new Map<string, Referral[]>();
const referralCodesMap = new Map<string, string>(); // code -> userId
const creditsStore = new Map<string, Credits>();

/**
 * Generate referral link for a user
 */
export function generateReferralLink(userId: string, userHandle: string): ReferralLink {
  // Create a unique referral code based on user handle and ID
  const code = `${userHandle.toLowerCase()}_${userId.slice(-6)}`;
  referralCodesMap.set(code, userId);

  return {
    code,
    url: `https://myaiplug.com?ref=${code}`,
  };
}

/**
 * Track referral click
 */
export async function trackReferralClick(referralCode: string): Promise<Referral | null> {
  const referrerId = referralCodesMap.get(referralCode);
  if (!referrerId) {
    return null;
  }

  const referral: Referral = {
    id: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    referrerId,
    referredUserId: null,
    status: 'clicked',
    createdAt: new Date(),
  };

  // Store referral
  const userReferrals = referralsStore.get(referrerId) || [];
  userReferrals.push(referral);
  referralsStore.set(referrerId, userReferrals);

  return referral;
}

/**
 * Convert referral to signed up
 */
export async function convertReferralToSignup(
  referralCode: string,
  newUserId: string
): Promise<{ referral: Referral; pointsAwarded: number } | null> {
  const referrerId = referralCodesMap.get(referralCode);
  if (!referrerId) {
    return null;
  }

  // Find the referral
  const userReferrals = referralsStore.get(referrerId) || [];
  const referral = userReferrals.find(
    r => r.status === 'clicked' && !r.referredUserId
  );

  if (!referral) {
    // Create new referral if no click was tracked
    const newReferral: Referral = {
      id: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      referrerId,
      referredUserId: newUserId,
      status: 'signed_up',
      createdAt: new Date(),
    };
    userReferrals.push(newReferral);
    referralsStore.set(referrerId, userReferrals);

    // Award points
    const pointsEntry = await awardPoints({
      userId: referrerId,
      eventType: 'referral_signup',
      referralId: newReferral.id,
    });

    return {
      referral: newReferral,
      pointsAwarded: pointsEntry?.points || 0,
    };
  }

  // Update existing referral
  referral.referredUserId = newUserId;
  referral.status = 'signed_up';

  // Award points
  const pointsEntry = await awardPoints({
    userId: referrerId,
    eventType: 'referral_signup',
    referralId: referral.id,
  });

  return {
    referral,
    pointsAwarded: pointsEntry?.points || 0,
  };
}

/**
 * Convert referral to paid
 */
export async function convertReferralToPaid(
  referredUserId: string,
  referralMultiplier: number = 1
): Promise<{ referral: Referral; pointsAwarded: number; creditsAwarded: number } | null> {
  // Find the referral by referred user ID
  let referral: Referral | undefined;
  let referrerId: string | undefined;

  for (const [userId, referrals] of referralsStore.entries()) {
    const found = referrals.find(
      r => r.referredUserId === referredUserId && r.status === 'signed_up'
    );
    if (found) {
      referral = found;
      referrerId = userId;
      break;
    }
  }

  if (!referral || !referrerId) {
    return null;
  }

  // Update referral status
  referral.status = 'paid';

  // Award points (with multiplier for high-level users)
  const pointsEntry = await awardPoints({
    userId: referrerId,
    eventType: 'referral_paid',
    referralId: referral.id,
    metadata: { referralMultiplier },
  });

  // Award credits (50 credits per paid referral)
  const creditsAwarded = 50;
  addCredits(referrerId, creditsAwarded);

  // Check for milestone rewards
  await checkAndAwardMilestones(referrerId);

  return {
    referral,
    pointsAwarded: pointsEntry?.points || 0,
    creditsAwarded,
  };
}

/**
 * Get referral statistics for a user
 */
export function getReferralStats(userId: string): ReferralStats {
  const referrals = referralsStore.get(userId) || [];
  const paidCount = referrals.filter(r => r.status === 'paid').length;

  // Calculate points earned (100 per signup + 500 per paid)
  const signupPoints = referrals.filter(r => r.status !== 'clicked').length * 100;
  const paidPoints = paidCount * 500;
  const pointsEarned = signupPoints + paidPoints;

  // Calculate credits earned (50 per paid)
  const creditsEarned = paidCount * 50;

  // Calculate milestone progress
  const milestones = REFERRAL_MILESTONES.map(milestone => {
    const progress = Math.min(100, Math.floor((paidCount / milestone.count) * 100));
    return {
      count: milestone.count,
      reward: milestone.reward.description,
      unlocked: paidCount >= milestone.count,
      progress,
    };
  });

  return {
    totalReferrals: referrals.length,
    signedUpCount: referrals.filter(r => r.status !== 'clicked').length,
    paidCount,
    pointsEarned,
    creditsEarned,
    milestones,
  };
}

/**
 * Get referral history for a user
 */
export function getReferralHistory(userId: string): Referral[] {
  return referralsStore.get(userId) || [];
}

/**
 * Check and award milestone rewards
 */
async function checkAndAwardMilestones(userId: string): Promise<void> {
  const stats = getReferralStats(userId);
  
  // Check each milestone
  for (const milestone of REFERRAL_MILESTONES) {
    if (stats.paidCount === milestone.count) {
      // Milestone just achieved!
      if (milestone.reward.type === 'style_pack_credits' && milestone.reward.credits) {
        addCredits(userId, milestone.reward.credits);
      }
      // For other reward types (pro_week_pass, pro_month), would need additional handling
    }
  }
}

/**
 * Add credits to user balance
 */
function addCredits(userId: string, amount: number): void {
  const userCredits = creditsStore.get(userId) || {
    userId,
    balance: 0,
    lastResetAt: new Date(),
    rolloverExpiryAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  };

  userCredits.balance += amount;
  creditsStore.set(userId, userCredits);
}

/**
 * Get user credits
 */
export function getUserCredits(userId: string): Credits {
  return creditsStore.get(userId) || {
    userId,
    balance: 100, // Free tier starts with 100
    lastResetAt: new Date(),
    rolloverExpiryAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  };
}

/**
 * Initialize referrals for a user
 */
export function initializeReferrals(userId: string, referrals: Referral[]): void {
  referralsStore.set(userId, referrals);
}

/**
 * Set referral code mapping
 */
export function setReferralCode(code: string, userId: string): void {
  referralCodesMap.set(code, userId);
}
