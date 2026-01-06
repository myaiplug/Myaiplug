// Credit costing and pricing constants

import { JobType } from '../types';

// 1 credit ≈ 3 seconds CPU wall time on standard tier
export const CREDIT_VALUE_SECONDS = 3;

// Base costs and per-minute multipliers by job type
export const JOB_COSTS = {
  audio_basic: {
    base: 20,
    perMinute: 5,
  },
  audio_pro: {
    base: 35, // 20 + 15 for advanced
    perMinute: 20, // 5 + 15 for advanced
  },
  audio_processing: {
    base: 50,
    perMinute: 0, // Flat rate for effects processing
  },
  reels: {
    base: 60,
    perMinute: 20,
  },
  stem_split: {
    base: 120,
    perMinute: 30,
  },
  cleanup: {
    base: 40,
    perMinute: 10,
  },
  qc: {
    base: 10,
    perMinute: 2,
  },
} as const;

// Blog content generation costs (tokens)
// Pricing: 4-5x profit markup based on estimated AI API usage
export const BLOG_CONTENT_COSTS = {
  facebook: 25,        // ~500 words, base cost ~5 tokens, 5x markup
  instagram: 20,       // ~150 words, base cost ~4 tokens, 5x markup  
  twitter: 30,         // Thread creation, base cost ~6 tokens, 5x markup
  voiceover: 35,       // Script formatting, base cost ~7 tokens, 5x markup
  user_video: 40,      // Detailed script, base cost ~8 tokens, 5x markup
  short_form: 30,      // Quick script, base cost ~6 tokens, 5x markup
  full_article: 50,    // Complete rewrite, base cost ~10 tokens, 5x markup
} as const;

// Badge rewards for blog content generation
export const BLOG_BADGES = {
  first_generation: {
    id: 'content_creator_rookie',
    name: 'Content Creator Rookie',
    description: 'Generated your first AI-powered content',
    points: 50,
  },
  content_specialist: {
    id: 'content_specialist',
    name: 'Content Specialist',
    description: 'Generated 10 pieces of content',
    points: 100,
    requirement: 10,
  },
  content_master: {
    id: 'content_master',
    name: 'Content Master',
    description: 'Generated 50 pieces of content',
    points: 250,
    requirement: 50,
  },
} as const;

// Points awarded per generation by format
export const BLOG_GENERATION_POINTS = {
  facebook: 5,
  instagram: 5,
  twitter: 8,          // Thread creation is more valuable
  voiceover: 10,       // Script creation is more valuable
  user_video: 12,      // Most detailed, highest points
  short_form: 8,
  full_article: 15,    // Complete article rewrite
} as const;

// Tier-based credit allocations
export const TIER_CREDITS = {
  free: {
    monthly: 100,
    signup: 100,
  },
  pro: {
    monthly: 1000,
    price: 49,
  },
  studio: {
    monthly: 3500,
    price: 149,
  },
} as const;

// Top-up pricing
export const CREDIT_TOPUP = {
  price: 10, // USD
  credits: 500,
} as const;

// Credit rollover period (days)
export const CREDIT_ROLLOVER_DAYS = 30;

// Calculate job cost
export function calculateJobCost(jobType: JobType, durationMinutes: number): number {
  const costs = JOB_COSTS[jobType];
  if (!costs) return 0;
  
  return costs.base + Math.ceil(durationMinutes * costs.perMinute);
}

// Plans for pricing page
export const PRICING_PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    credits: 100,
    description: 'Perfect for trying out the platform',
    features: [
      '100 credits on signup',
      'Basic audio chains',
      'Profile & badges',
      'Public portfolio',
      'Community support',
    ],
    cta: 'Start Free',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$49',
    period: 'per month',
    credits: 1000,
    badge: 'Most Popular',
    description: 'For serious creators and professionals',
    features: [
      '1,000 credits/month',
      'Pro Chains',
      'Caption styles',
      'Leaderboard eligibility',
      'Priority support',
      'Credits roll over 30 days',
      'Cancel anytime',
    ],
    cta: 'Start Pro',
    highlighted: true,
  },
  {
    name: 'Studio',
    price: '$149',
    period: 'per month',
    credits: 3500,
    ribbon: 'Founders price — 73 left',
    description: 'Ultimate power for studios',
    features: [
      '3,500 credits/month',
      'Priority queue',
      'Custom workflows',
      'API access (Lv6+)',
      'Dedicated support',
      'Early feature access',
      'Team collaboration',
      'White-label options',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
] as const;
