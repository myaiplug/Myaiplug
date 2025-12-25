// Core data model types based on the requirements

export type UserTier = 'free' | 'pro' | 'studio';

export type JobType = 
  | 'audio_basic'
  | 'audio_pro'
  | 'audio_processing'
  | 'reels'
  | 'stem_split'
  | 'cleanup'
  | 'qc';

export type JobStatus = 'queued' | 'running' | 'done' | 'failed';

export type ReferralStatus = 'clicked' | 'signed_up' | 'paid';

export type LeaderboardType = 'time_saved' | 'referrals' | 'popularity';

export type LeaderboardPeriod = 'weekly' | 'alltime';

export type PointEventType = 
  | 'signup'
  | 'onboarding_complete'
  | 'job_complete'
  | 'pro_chain_bonus'
  | 'portfolio_publish'
  | 'referral_signup'
  | 'referral_paid'
  | 'weekly_streak'
  | 'demo_shared';

export interface User {
  id: string;
  email: string;
  emailVerifiedAt: Date | null;
  passwordHash: string;
  handle: string;
  avatarUrl: string | null;
  bio: string | null;
  tier: UserTier;
  ipHash: string;
  createdAt: Date;
}

export interface Profile {
  userId: string;
  level: number;
  pointsTotal: number;
  timeSavedSecTotal: number;
  totalJobs: number;
  badges: Badge[];
  privacyOptOut: boolean;
  membership?: 'free' | 'pro' | 'vip';
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  tier?: number;
  awardedAt: Date;
}

export interface Credits {
  userId: string;
  balance: number;
  lastResetAt: Date;
  rolloverExpiryAt: Date;
}

export type SubscriptionStatus = 
  | 'active' 
  | 'past_due' 
  | 'canceled' 
  | 'incomplete' 
  | 'incomplete_expired' 
  | 'trialing' 
  | 'unpaid'
  | 'paused';

export interface Subscription {
  id: string;
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  priceId: string;
  status: SubscriptionStatus;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TokenGrant {
  id: string;
  userId: string;
  amount: number;
  reason: string;
  subscriptionId?: string;
  createdAt: Date;
}

export interface Referral {
  id: string;
  referrerId: string;
  referredUserId: string | null;
  status: ReferralStatus;
  createdAt: Date;
}

export interface Job {
  id: string;
  userId: string;
  type: JobType;
  inputDurationSec: number;
  creditsCharged: number;
  cpuSec: number;
  status: JobStatus;
  resultUrl: string | null;
  qcReport: Record<string, any> | null;
  baselineMin: number;
  effFactor: number;
  procMin: number;
  timeSavedSec: number;
  createdAt: Date;
}

export interface PointsLedgerEntry {
  id: string;
  userId: string;
  eventType: PointEventType;
  points: number;
  jobId?: string;
  referralId?: string;
  metadata: Record<string, any>;
  createdAt: Date;
}

export interface Creation {
  id: string;
  userId: string;
  jobId: string;
  title: string;
  tags: string[];
  mediaUrl: string;
  thumbnailUrl: string | null;
  public: boolean;
  views: number;
  downloads: number;
  createdAt: Date;
}

export interface LeaderboardCache {
  id: string;
  type: LeaderboardType;
  period: LeaderboardPeriod;
  payload: Record<string, any>;
  generatedAt: Date;
}

export interface ApiKey {
  id: string;
  userId: string;
  keyHash: string;
  status: 'active' | 'revoked';
  rateLimit: number;
  createdAt: Date;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  handle: string;
  avatarUrl: string | null;
  value: number;
  level: number;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorAvatar: string | null;
  category: string;
  tags: string[];
  imageUrl: string;
  publishedAt: Date;
  updatedAt: Date;
  views: number;
}

export type RemixFormat = 
  | 'facebook'
  | 'instagram'
  | 'twitter'
  | 'voiceover'
  | 'user_video'
  | 'short_form';

export interface UsageLog {
  id: string;
  userId: string;
  action: string;
  endpoint?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface MembershipTier {
  tier: 'free' | 'pro' | 'vip';
  limits: {
    stemSplitPerDay: number;
    halfScrewPerDay: number;
    cleanPerDay: number;
    maxFileDuration: number; // in seconds
    asyncJobQueue: boolean;
  };
  permissions: {
    twoStemModel: boolean;
    fiveStemModel: boolean;
    advancedHalfScrew: boolean;
  };
}
