// Mock data providers for development (until backend is implemented)

import type { User, Profile, Badge, Creation, LeaderboardEntry, Job } from '../types';
import { BADGE_DEFINITIONS } from '../constants/gamification';

// Mock user for development
export const mockUser: User = {
  id: 'user_123',
  email: 'creator@example.com',
  emailVerifiedAt: new Date(),
  passwordHash: '',
  handle: 'procreator',
  avatarUrl: '/avatars/default.png',
  bio: 'Audio enthusiast and content creator',
  tier: 'pro',
  ipHash: '',
  createdAt: new Date('2024-01-15'),
};

// Mock profile
export const mockProfile: Profile = {
  userId: 'user_123',
  level: 4,
  pointsTotal: 18750,
  timeSavedSecTotal: 54000, // 15 hours
  badges: [
    {
      id: BADGE_DEFINITIONS.UPLOAD_HERO_I.id,
      name: BADGE_DEFINITIONS.UPLOAD_HERO_I.name,
      description: BADGE_DEFINITIONS.UPLOAD_HERO_I.description,
      tier: 1,
      awardedAt: new Date('2024-02-01'),
    },
    {
      id: BADGE_DEFINITIONS.TIME_BANDIT.id,
      name: BADGE_DEFINITIONS.TIME_BANDIT.name,
      description: BADGE_DEFINITIONS.TIME_BANDIT.description,
      awardedAt: new Date('2024-03-15'),
    },
    {
      id: BADGE_DEFINITIONS.WORD_OF_MOUTH.id,
      name: BADGE_DEFINITIONS.WORD_OF_MOUTH.name,
      description: BADGE_DEFINITIONS.WORD_OF_MOUTH.description,
      awardedAt: new Date('2024-04-20'),
    },
  ],
  privacyOptOut: false,
};

// Mock creations
export const mockCreations: Creation[] = [
  {
    id: 'creation_1',
    userId: 'user_123',
    jobId: 'job_1',
    title: 'Podcast Episode 42 - Mastered',
    tags: ['podcast', 'audio', 'master'],
    mediaUrl: '/media/sample1.mp3',
    thumbnailUrl: '/thumbnails/sample1.jpg',
    public: true,
    views: 247,
    downloads: 82,
    createdAt: new Date('2024-04-15'),
  },
  {
    id: 'creation_2',
    userId: 'user_123',
    jobId: 'job_2',
    title: 'Instagram Reel - Cinematic',
    tags: ['reel', 'video', 'cinematic'],
    mediaUrl: '/media/sample2.mp4',
    thumbnailUrl: '/thumbnails/sample2.jpg',
    public: true,
    views: 1523,
    downloads: 341,
    createdAt: new Date('2024-04-10'),
  },
];

// Mock leaderboard data
export const mockLeaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    userId: 'user_456',
    handle: 'audiomaster',
    avatarUrl: '/avatars/user1.png',
    value: 720000, // 200 hours
    level: 7,
  },
  {
    rank: 2,
    userId: 'user_789',
    handle: 'soundwizard',
    avatarUrl: '/avatars/user2.png',
    value: 360000, // 100 hours
    level: 6,
  },
  {
    rank: 3,
    userId: 'user_123',
    handle: 'procreator',
    avatarUrl: '/avatars/default.png',
    value: 54000, // 15 hours
    level: 4,
  },
  {
    rank: 4,
    userId: 'user_234',
    handle: 'mixmaster',
    avatarUrl: '/avatars/user3.png',
    value: 36000, // 10 hours
    level: 3,
  },
  {
    rank: 5,
    userId: 'user_345',
    handle: 'beatmaker',
    avatarUrl: '/avatars/user4.png',
    value: 21600, // 6 hours
    level: 3,
  },
];

// Mock recent jobs
export const mockJobs: Job[] = [
  {
    id: 'job_1',
    userId: 'user_123',
    type: 'audio_pro',
    inputDurationSec: 1800, // 30 minutes
    creditsCharged: 135,
    cpuSec: 45,
    status: 'done',
    resultUrl: '/results/job_1.mp3',
    qcReport: { peaks: 'ok', clipping: 'none', lufs: -14 },
    baselineMin: 15,
    effFactor: 0.9,
    procMin: 0.75,
    timeSavedSec: 765, // ~12.75 min
    createdAt: new Date('2024-04-15T10:30:00'),
  },
  {
    id: 'job_2',
    userId: 'user_123',
    type: 'reels',
    inputDurationSec: 60,
    creditsCharged: 80,
    cpuSec: 20,
    status: 'done',
    resultUrl: '/results/job_2.mp4',
    qcReport: { resolution: '1080x1920', fps: 30, bitrate: 'optimal' },
    baselineMin: 20,
    effFactor: 0.9,
    procMin: 0.33,
    timeSavedSec: 1060, // ~17.7 min
    createdAt: new Date('2024-04-14T15:20:00'),
  },
];

// Utility to generate mock social proof data
export function getMockSocialProof() {
  return {
    creatorsCount: 4287,
    hoursSaved: 18234,
    avatars: [
      '/avatars/avatar1.png',
      '/avatars/avatar2.png',
      '/avatars/avatar3.png',
      '/avatars/avatar4.png',
      '/avatars/avatar5.png',
    ],
  };
}

// Utility to check if user is authenticated (mock)
export function isAuthenticated(): boolean {
  // In real implementation, check JWT or session
  return false;
}

// Utility to get current user (mock)
export function getCurrentUser(): User | null {
  // In real implementation, decode JWT or fetch from session
  return isAuthenticated() ? mockUser : null;
}

// Utility to get user profile (mock)
export function getUserProfile(userId: string): Profile | null {
  // In real implementation, fetch from API
  if (userId === mockUser.id) {
    return mockProfile;
  }
  return null;
}
