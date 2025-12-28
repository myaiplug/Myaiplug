// User and authentication service
import type { User, Profile, UserTier } from '../types';
import { getLevelFromPoints } from '../constants/gamification';
import { awardPoints } from './pointsEngine';
import { initializeUserBadges } from './badgeSystem';
import { generateSecureId, generateSessionToken } from '../utils/secureId';
import { hasActiveSubscription } from './subscriptionService';

export interface CreateUserParams {
  email: string;
  password: string;
  handle: string;
  ipAddress: string;
}

export interface AuthResult {
  user: User;
  profile: Profile;
  sessionToken: string;
}

// In-memory user storage
const usersStore = new Map<string, User>();
const profilesStore = new Map<string, Profile>();
const emailIndex = new Map<string, string>(); // email -> userId
const handleIndex = new Map<string, string>(); // handle -> userId
const sessionTokens = new Map<string, { userId: string; expiresAt: Date }>();

/**
 * Create a new user account
 */
export async function createUser(params: CreateUserParams): Promise<AuthResult> {
  const { email, password, handle, ipAddress } = params;

  // Validate uniqueness
  if (emailIndex.has(email.toLowerCase())) {
    throw new Error('Email already exists');
  }
  if (handleIndex.has(handle.toLowerCase())) {
    throw new Error('Handle already taken');
  }

  // Create user
  const userId = generateSecureId('user_');
  const user: User = {
    id: userId,
    email: email.toLowerCase(),
    emailVerifiedAt: null,
    passwordHash: await hashPassword(password), // In production, use bcrypt
    handle,
    avatarUrl: null,
    bio: null,
    tier: 'free',
    ipHash: await hashIP(ipAddress),
    createdAt: new Date(),
  };

  // Create profile
  const profile: Profile = {
    userId,
    level: 1,
    pointsTotal: 0,
    timeSavedSecTotal: 0,
    totalJobs: 0,
    badges: [],
    privacyOptOut: false,
  };

  // Store
  usersStore.set(userId, user);
  profilesStore.set(userId, profile);
  emailIndex.set(email.toLowerCase(), userId);
  handleIndex.set(handle.toLowerCase(), userId);

  // Initialize badge system
  initializeUserBadges(userId, []);

  // Award signup points
  await awardPoints({
    userId,
    eventType: 'signup',
  });

  // Update profile with points
  profile.pointsTotal = 150; // POINT_EVENTS.SIGNUP

  // Create session
  const sessionToken = createSession(userId);

  return { user, profile, sessionToken };
}

/**
 * Authenticate user
 */
export async function authenticateUser(email: string, password: string): Promise<AuthResult | null> {
  const userId = emailIndex.get(email.toLowerCase());
  if (!userId) {
    return null;
  }

  const user = usersStore.get(userId);
  if (!user) {
    return null;
  }

  // Verify password
  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return null;
  }

  const profile = profilesStore.get(userId);
  if (!profile) {
    return null;
  }

  // Create session
  const sessionToken = createSession(userId);

  return { user, profile, sessionToken };
}

/**
 * Get user by session token
 */
export async function getUserBySession(sessionToken: string): Promise<AuthResult | null> {
  const session = sessionTokens.get(sessionToken);
  if (!session) {
    return null;
  }

  // Check expiry
  if (session.expiresAt < new Date()) {
    sessionTokens.delete(sessionToken);
    return null;
  }

  const user = usersStore.get(session.userId);
  const profile = profilesStore.get(session.userId);

  if (!user || !profile) {
    return null;
  }

  return { user, profile, sessionToken };
}

/**
 * Get user by ID
 */
export function getUserById(userId: string): User | null {
  return usersStore.get(userId) || null;
}

/**
 * Get user by email
 */
export function getUserByEmail(email: string): User | null {
  const userId = emailIndex.get(email.toLowerCase());
  if (!userId) {
    return null;
  }
  return usersStore.get(userId) || null;
}

/**
 * Get user by handle
 */
export function getUserByHandle(handle: string): User | null {
  const userId = handleIndex.get(handle.toLowerCase());
  if (!userId) {
    return null;
  }
  return usersStore.get(userId) || null;
}

/**
 * Get profile by user ID
 */
export function getProfile(userId: string): Profile | null {
  return profilesStore.get(userId) || null;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<Pick<User, 'handle' | 'bio' | 'avatarUrl'>>
): Promise<User | null> {
  const user = usersStore.get(userId);
  if (!user) {
    return null;
  }

  // Handle change - check uniqueness
  if (updates.handle && updates.handle !== user.handle) {
    if (handleIndex.has(updates.handle.toLowerCase())) {
      throw new Error('Handle already taken');
    }
    // Update index
    handleIndex.delete(user.handle.toLowerCase());
    handleIndex.set(updates.handle.toLowerCase(), userId);
    user.handle = updates.handle;
  }

  // Update other fields
  if (updates.bio !== undefined) {
    user.bio = updates.bio;
  }
  if (updates.avatarUrl !== undefined) {
    user.avatarUrl = updates.avatarUrl;
  }

  return user;
}

/**
 * Update profile privacy settings
 */
export function updateProfilePrivacy(userId: string, privacyOptOut: boolean): Profile | null {
  const profile = profilesStore.get(userId);
  if (!profile) {
    return null;
  }

  profile.privacyOptOut = privacyOptOut;
  return profile;
}

/**
 * Update user tier
 */
export function updateUserTier(userId: string, tier: UserTier): User | null {
  const user = usersStore.get(userId);
  if (!user) {
    return null;
  }

  user.tier = tier;
  return user;
}

/**
 * Update user tier based on subscription status
 */
export function syncUserTierWithSubscription(userId: string): User | null {
  const user = usersStore.get(userId);
  if (!user) {
    return null;
  }

  const isActive = hasActiveSubscription(userId);
  const newTier: UserTier = isActive ? 'pro' : 'free';
  
  if (user.tier !== newTier) {
    user.tier = newTier;
  }
  
  return user;
}

/**
 * Update profile stats (points, time saved, jobs)
 */
export function updateProfileStats(
  userId: string,
  updates: Partial<Pick<Profile, 'pointsTotal' | 'timeSavedSecTotal' | 'totalJobs'>>
): Profile | null {
  const profile = profilesStore.get(userId);
  if (!profile) {
    return null;
  }

  if (updates.pointsTotal !== undefined) {
    profile.pointsTotal = updates.pointsTotal;
    profile.level = getLevelFromPoints(updates.pointsTotal);
  }

  if (updates.timeSavedSecTotal !== undefined) {
    profile.timeSavedSecTotal = updates.timeSavedSecTotal;
  }

  if (updates.totalJobs !== undefined) {
    profile.totalJobs = updates.totalJobs;
  }

  return profile;
}

/**
 * Increment job count and time saved for user
 */
export function incrementJobStats(userId: string, timeSavedSec: number): Profile | null {
  const profile = profilesStore.get(userId);
  if (!profile) {
    return null;
  }

  profile.totalJobs += 1;
  profile.timeSavedSecTotal += timeSavedSec;

  // Invalidate leaderboard cache when stats change
  try {
    const { invalidateLeaderboardCache } = require('./leaderboardService');
    invalidateLeaderboardCache('time_saved');
  } catch (error) {
    // Leaderboard service not available, ignore
  }

  return profile;
}

/**
 * Logout user
 */
export function logout(sessionToken: string): void {
  sessionTokens.delete(sessionToken);
}

// Helper functions

async function hashPassword(password: string): Promise<string> {
  // In production, use bcrypt or similar
  // For now, just a simple mock
  return `hashed_${password}`;
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // In production, use bcrypt.compare
  return hash === `hashed_${password}`;
}

async function hashIP(ip: string): Promise<string> {
  // In production, use proper hashing
  return `hashed_${ip}`;
}

function createSession(userId: string): string {
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  sessionTokens.set(token, { userId, expiresAt });
  return token;
}

/**
 * Initialize user data (for loading from DB)
 */
export function initializeUser(user: User, profile: Profile): void {
  usersStore.set(user.id, user);
  profilesStore.set(user.id, profile);
  emailIndex.set(user.email.toLowerCase(), user.id);
  handleIndex.set(user.handle.toLowerCase(), user.id);
}

/**
 * Get all users (admin function)
 */
export function getAllUsers(): User[] {
  return Array.from(usersStore.values());
}

/**
 * Get all profiles (admin function)
 */
export function getAllProfiles(): Profile[] {
  return Array.from(profilesStore.values());
}
