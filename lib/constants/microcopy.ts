// Microcopy and UI strings used throughout the application

export const MICROCOPY = {
  // Progress step labels
  PROGRESS_STEPS: [
    'Analyze',
    'Clean',
    'Enhance',
    'Master',
    'Deliver',
  ],
  
  // Success messages
  SUCCESS_TOAST: (timeSaved: string, points: number, oldProgress: number, newProgress: number) =>
    `Done. +${timeSaved} saved. +${points} pts added. Level progress: ${oldProgress}% → ${newProgress}%.`,
  
  // Referral nudges
  REFERRAL_NUDGE: (level: number) =>
    `You're 1 invite away from Level ${level}. Get 500 pts when a friend subscribes.`,
  
  // Upgrade nudges
  UPGRADE_NUDGE: (progress: number, level: number) =>
    `You're ${progress}% to Level ${level}. Pro doubles your points on Pro Chains today.`,
  
  // Hero section
  HERO: {
    headline: 'Create faster. Show your score. Get paid in time.',
    subtitle: 'AI-powered audio/video pipeline with real QC, badges, and a public creator score.',
    ctaPrimary: 'Upload a file (free)',
    ctaSecondary: 'Try a demo (no login)',
    timeSavedLabel: 'Time Saved:',
    socialProof: (creators: number, hours: number) =>
      `${creators.toLocaleString()} creators saved ${hours.toLocaleString()} hours.`,
  },
  
  // Job status messages
  JOB_STATUS: {
    queued: 'Your job is in queue...',
    running: 'Processing your audio/video...',
    done: 'Processing complete!',
    failed: 'Processing failed. Please try again.',
  },
  
  // Badge award
  BADGE_AWARD: (badgeName: string, points: number, timeSaved: string) =>
    `🎉 ${badgeName} earned! +${points} pts, +${timeSaved} time saved`,
  
  // Level up
  LEVEL_UP: (level: number, name: string) =>
    `🎊 Level Up! You're now Level ${level}: ${name}`,
  
  // Profile
  PROFILE: {
    timeSaved: (hours: number, minutes: number) =>
      `${hours}h ${minutes}m saved`,
    viewProfile: 'View your Creator Profile',
    editProfile: 'Edit Profile',
    publicProfile: 'Public Profile',
  },
  
  // Leaderboard
  LEADERBOARD: {
    timeSaved: 'Time Saved',
    referrals: 'Referrals',
    popularity: 'Creations Popularity',
    inviteEarn: 'Invite & earn: +500 pts when a referral subscribes.',
  },
  
  // Pricing
  PRICING: {
    creditNote: 'Credits roll over 30 days, cancel anytime.',
    foundersPrice: 'Founders price — 100 seats',
  },
  
  // FAQ
  FAQ: {
    howPointsWork: 'How do points work?',
    howTimeSaved: 'How is time saved calculated?',
    antiCheat: 'What\'s your anti-cheat policy?',
  },
} as const;

// Processing module labels
export const MODULE_LABELS = {
  audio_basic: 'Basic Chain',
  audio_pro: 'Podcast Polish',
  reels: 'Reels Pack',
  stem_split: 'Stem Split',
  cleanup: 'Cleanup',
  qc: 'Quality Check',
} as const;

// Preset labels
export const PRESET_LABELS = {
  basic_chain: 'Basic Chain',
  podcast_polish: 'Podcast Polish',
  reels_pack: 'Reels Pack',
} as const;
