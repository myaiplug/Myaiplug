// Gamification constants: Points, Levels, Badges, Time Saved

export const POINT_EVENTS = {
  SIGNUP: 150,
  ONBOARDING_COMPLETE: 250,
  JOB_SHORT: 100, // ≤60s proc
  JOB_MEDIUM: 200, // 61-300s
  PRO_CHAIN_BONUS: 75,
  PORTFOLIO_PUBLISH_DAILY: 50,
  REFERRAL_SIGNUP: 100,
  REFERRAL_PAID: 500,
  WEEKLY_STREAK: 300,
  DEMO_SHARED: 50,
} as const;

export const ANTI_FARM_CAPS = {
  NON_PAID_REFERRALS_PER_WEEK: 500,
  REFERRALS_PER_DAY_REVIEW_THRESHOLD: 5,
  DEMO_SHARE_MIN_UNIQUE_IPS: 3,
} as const;

// Time saved baselines by job type (in minutes)
export const TIME_SAVED_BASELINES = {
  audio_basic: 6,
  audio_pro: 15,
  reels: 20,
  stem_split: 25,
  cleanup: 12,
  qc: 3,
} as const;

// Efficiency factors by tier
export const EFFICIENCY_FACTORS = {
  free: 0.7,
  pro: 0.9,
  studio: 1.0,
} as const;

// Level thresholds and unlocks
export const LEVELS = [
  {
    level: 1,
    name: 'Rookie',
    threshold: 0,
    unlocks: ['Base features'],
  },
  {
    level: 2,
    name: 'Pro Converter',
    threshold: 2500,
    unlocks: ['Pro Chains preview (30s)', 'Profile banner'],
  },
  {
    level: 3,
    name: 'Workflow Smith',
    threshold: 7500,
    unlocks: ['5% credit bonus on top-ups', 'Caption style pack #1'],
  },
  {
    level: 4,
    name: 'Vault Runner',
    threshold: 15000,
    unlocks: ['Artifact Doctor lite', 'Delivery Guard detailed report'],
  },
  {
    level: 5,
    name: 'Creator Coach',
    threshold: 30000,
    unlocks: ['Referral multiplier 1.2×', 'Portfolio sections (Custom Workflows)'],
  },
  {
    level: 6,
    name: 'Studio Pilot',
    threshold: 60000,
    unlocks: ['Priority queue bursts', 'Caption style pack #2', 'API key (rate-limited)'],
  },
  {
    level: 7,
    name: 'Hall of Fame',
    threshold: 120000,
    unlocks: ['Beta access', 'Badge frame', 'Creator Spotlight on homepage'],
  },
] as const;

// Badge definitions
export const BADGE_DEFINITIONS = {
  UPLOAD_HERO_I: {
    id: 'upload_hero_1',
    name: 'Upload Hero I',
    description: 'Complete 10 jobs',
    requirement: 10,
  },
  UPLOAD_HERO_II: {
    id: 'upload_hero_2',
    name: 'Upload Hero II',
    description: 'Complete 100 jobs',
    requirement: 100,
  },
  UPLOAD_HERO_III: {
    id: 'upload_hero_3',
    name: 'Upload Hero III',
    description: 'Complete 500 jobs',
    requirement: 500,
  },
  TIME_BANDIT: {
    id: 'time_bandit',
    name: 'Time Bandit',
    description: 'Save 10 hours total',
    requirement: 36000, // seconds
  },
  TIME_LORD: {
    id: 'time_lord',
    name: 'Time Lord',
    description: 'Save 50 hours total',
    requirement: 180000,
  },
  CHRONOMANCER: {
    id: 'chronomancer',
    name: 'Chronomancer',
    description: 'Save 200 hours total',
    requirement: 720000,
  },
  WORD_OF_MOUTH: {
    id: 'word_of_mouth',
    name: 'Word of Mouth',
    description: '3 paid referrals',
    requirement: 3,
  },
  RAINMAKER: {
    id: 'rainmaker',
    name: 'Rainmaker',
    description: '10 paid referrals',
    requirement: 10,
  },
  TYCOON: {
    id: 'tycoon',
    name: 'Tycoon',
    description: '50 paid referrals',
    requirement: 50,
  },
  CLEAN_CUT: {
    id: 'clean_cut',
    name: 'Clean Cut',
    description: '50 QC-passed deliveries in a row',
    requirement: 50,
  },
  TASTE_MAKER: {
    id: 'taste_maker',
    name: 'Taste Maker',
    description: '10 published creations with ≥100 views',
    requirement: 10,
  },
} as const;

// Referral milestones
export const REFERRAL_MILESTONES = [
  {
    count: 3,
    reward: { type: 'pro_week_pass', description: 'Pro week pass' },
  },
  {
    count: 10,
    reward: { type: 'style_pack_credits', description: 'Style pack + 200 credits', credits: 200 },
  },
  {
    count: 25,
    reward: { type: 'pro_month', description: '1 month Pro' },
  },
] as const;

// Utility function to get current level from points
export function getLevelFromPoints(points: number): number {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i].threshold) {
      return LEVELS[i].level;
    }
  }
  return 1;
}

// Utility function to get next level info
export function getNextLevelInfo(points: number): { 
  currentLevel: number; 
  nextLevel: number | null; 
  pointsToNext: number | null;
  progressPercent: number;
} {
  const currentLevel = getLevelFromPoints(points);
  const currentLevelData = LEVELS.find(l => l.level === currentLevel);
  const nextLevelData = LEVELS.find(l => l.level === currentLevel + 1);
  
  if (!nextLevelData) {
    return {
      currentLevel,
      nextLevel: null,
      pointsToNext: null,
      progressPercent: 100,
    };
  }
  
  const pointsSinceLevel = points - (currentLevelData?.threshold || 0);
  const pointsNeededForNext = nextLevelData.threshold - (currentLevelData?.threshold || 0);
  const progressPercent = Math.floor((pointsSinceLevel / pointsNeededForNext) * 100);
  
  return {
    currentLevel,
    nextLevel: nextLevelData.level,
    pointsToNext: nextLevelData.threshold - points,
    progressPercent,
  };
}

// Utility function to calculate time saved
export function calculateTimeSaved(
  jobType: keyof typeof TIME_SAVED_BASELINES,
  tier: keyof typeof EFFICIENCY_FACTORS,
  processingMinutes: number
): number {
  const baseline = TIME_SAVED_BASELINES[jobType];
  const effFactor = EFFICIENCY_FACTORS[tier];
  const timeSavedMinutes = (baseline * effFactor) - processingMinutes;
  return Math.max(0, Math.floor(timeSavedMinutes * 60)); // Convert to seconds
}
