// Seed leaderboard with demo data
import { initializeUser } from './userService';
import { setProfile, setUser } from './leaderboardService';
import { upsertSubscription } from './subscriptionService';
import type { User, Profile } from '../types';

interface SeedUser {
  email: string;
  handle: string;
  timeSavedSec: number;
  totalJobs: number;
  isPro: boolean;
}

const SEED_USERS: SeedUser[] = [
  {
    email: 'myaiplug.com@gmail.com',
    handle: 'TheBeatMob',
    timeSavedSec: 15000, // ~4.2 hours
    totalJobs: 85,
    isPro: true,
  },
  {
    email: 'producer1@example.com',
    handle: 'AudioWizard',
    timeSavedSec: 12000,
    totalJobs: 68,
    isPro: true,
  },
  {
    email: 'producer2@example.com',
    handle: 'BeatMaster',
    timeSavedSec: 10500,
    totalJobs: 62,
    isPro: true,
  },
  {
    email: 'producer3@example.com',
    handle: 'MixPro',
    timeSavedSec: 9800,
    totalJobs: 57,
    isPro: true,
  },
  {
    email: 'producer4@example.com',
    handle: 'StudioGuru',
    timeSavedSec: 8900,
    totalJobs: 51,
    isPro: true,
  },
  {
    email: 'producer5@example.com',
    handle: 'SoundCraft',
    timeSavedSec: 8200,
    totalJobs: 48,
    isPro: true,
  },
  {
    email: 'producer6@example.com',
    handle: 'TrackEngineer',
    timeSavedSec: 7500,
    totalJobs: 44,
    isPro: true,
  },
  {
    email: 'producer7@example.com',
    handle: 'VocalMaster',
    timeSavedSec: 6800,
    totalJobs: 40,
    isPro: true,
  },
  {
    email: 'producer8@example.com',
    handle: 'MixGenius',
    timeSavedSec: 6200,
    totalJobs: 36,
    isPro: true,
  },
  {
    email: 'producer9@example.com',
    handle: 'BeatCrafter',
    timeSavedSec: 5500,
    totalJobs: 32,
    isPro: true,
  },
  {
    email: 'producer10@example.com',
    handle: 'AudioAlchemist',
    timeSavedSec: 5000,
    totalJobs: 29,
    isPro: true,
  },
  {
    email: 'producer11@example.com',
    handle: 'SonicArtist',
    timeSavedSec: 4500,
    totalJobs: 26,
    isPro: true,
  },
  {
    email: 'producer12@example.com',
    handle: 'WaveShaper',
    timeSavedSec: 4000,
    totalJobs: 23,
    isPro: true,
  },
  {
    email: 'producer13@example.com',
    handle: 'FreqMaster',
    timeSavedSec: 3500,
    totalJobs: 20,
    isPro: true,
  },
  {
    email: 'producer14@example.com',
    handle: 'BassBuilder',
    timeSavedSec: 3200,
    totalJobs: 18,
    isPro: false,
  },
  {
    email: 'producer15@example.com',
    handle: 'MelodyMaker',
    timeSavedSec: 2900,
    totalJobs: 16,
    isPro: false,
  },
  {
    email: 'producer16@example.com',
    handle: 'RhythmRider',
    timeSavedSec: 2600,
    totalJobs: 14,
    isPro: false,
  },
  {
    email: 'producer17@example.com',
    handle: 'HarmonyHero',
    timeSavedSec: 2300,
    totalJobs: 12,
    isPro: false,
  },
  {
    email: 'producer18@example.com',
    handle: 'ToneTracker',
    timeSavedSec: 2000,
    totalJobs: 10,
    isPro: false,
  },
  {
    email: 'producer19@example.com',
    handle: 'SynthSeeker',
    timeSavedSec: 1700,
    totalJobs: 8,
    isPro: false,
  },
];

let isSeeded = false;

/**
 * Seed the leaderboard with demo users
 */
export async function seedLeaderboard(): Promise<void> {
  if (isSeeded) {
    console.log('Leaderboard already seeded');
    return;
  }

  console.log('Seeding leaderboard with demo users...');

  for (const seedUser of SEED_USERS) {
    const userId = `seed_${seedUser.handle.toLowerCase()}`;
    
    // Create user object
    const user: User = {
      id: userId,
      email: seedUser.email,
      emailVerifiedAt: new Date(),
      passwordHash: 'seeded_account',
      handle: seedUser.handle,
      avatarUrl: null,
      bio: null,
      tier: seedUser.isPro ? 'pro' : 'free',
      ipHash: 'seeded',
      createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Random date in last 90 days
    };

    // Create profile object
    const profile: Profile = {
      userId,
      level: Math.floor(seedUser.totalJobs / 5) + 1,
      pointsTotal: seedUser.totalJobs * 50 + Math.floor(seedUser.timeSavedSec / 100),
      timeSavedSecTotal: seedUser.timeSavedSec,
      totalJobs: seedUser.totalJobs,
      badges: [],
      privacyOptOut: false,
    };

    // Initialize user in userService
    initializeUser(user, profile);

    // Set data in leaderboard service
    setProfile(userId, profile);
    setUser(userId, user.handle, user.avatarUrl);

    // Create Pro subscription for Pro users
    if (seedUser.isPro) {
      upsertSubscription({
        userId,
        stripeCustomerId: `cus_seed_${userId}`,
        stripeSubscriptionId: `sub_seed_${userId}`,
        priceId: 'price_seed_pro',
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        cancelAtPeriodEnd: false,
      });
    }
  }

  isSeeded = true;
  console.log(`✅ Seeded ${SEED_USERS.length} users to leaderboard`);
}

/**
 * Check if leaderboard is seeded
 */
export function isLeaderboardSeeded(): boolean {
  return isSeeded;
}
