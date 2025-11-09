// Portfolio/Creations management service
import type { Creation } from '../types';
import { awardPoints } from './pointsEngine';
import { validateViewIncrement } from './antiAbuseService';

export interface CreateCreationParams {
  userId: string;
  jobId: string;
  title: string;
  tags?: string[];
  mediaUrl: string;
  thumbnailUrl?: string;
  isPublic?: boolean;
}

export interface UpdateCreationParams {
  title?: string;
  tags?: string[];
  public?: boolean;
}

// In-memory storage
const creationsStore = new Map<string, Creation[]>();
const creationIdIndex = new Map<string, Creation>();

/**
 * Create a new creation/portfolio item
 */
export async function createCreation(params: CreateCreationParams): Promise<Creation> {
  const {
    userId,
    jobId,
    title,
    tags = [],
    mediaUrl,
    thumbnailUrl = null,
    isPublic = false,
  } = params;

  const creation: Creation = {
    id: `creation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    jobId,
    title,
    tags,
    mediaUrl,
    thumbnailUrl,
    public: isPublic,
    views: 0,
    downloads: 0,
    createdAt: new Date(),
  };

  // Store creation
  const userCreations = creationsStore.get(userId) || [];
  userCreations.push(creation);
  creationsStore.set(userId, userCreations);
  creationIdIndex.set(creation.id, creation);

  return creation;
}

/**
 * Publish a creation (make public)
 */
export async function publishCreation(
  creationId: string,
  userId: string
): Promise<{ creation: Creation; pointsAwarded: number } | null> {
  const creation = creationIdIndex.get(creationId);
  
  if (!creation || creation.userId !== userId) {
    return null;
  }

  // Check if already public
  if (creation.public) {
    return { creation, pointsAwarded: 0 };
  }

  // Make public
  creation.public = true;

  // Award points for portfolio publish (once per day)
  const pointsEntry = await awardPoints({
    userId,
    eventType: 'portfolio_publish',
    metadata: { creationId },
  });

  return {
    creation,
    pointsAwarded: pointsEntry?.points || 0,
  };
}

/**
 * Update a creation
 */
export async function updateCreation(
  creationId: string,
  userId: string,
  updates: UpdateCreationParams
): Promise<Creation | null> {
  const creation = creationIdIndex.get(creationId);
  
  if (!creation || creation.userId !== userId) {
    return null;
  }

  // Update fields
  if (updates.title !== undefined) {
    creation.title = updates.title;
  }
  if (updates.tags !== undefined) {
    creation.tags = updates.tags;
  }
  if (updates.public !== undefined) {
    creation.public = updates.public;
  }

  return creation;
}

/**
 * Delete a creation
 */
export async function deleteCreation(creationId: string, userId: string): Promise<boolean> {
  const creation = creationIdIndex.get(creationId);
  
  if (!creation || creation.userId !== userId) {
    return false;
  }

  // Remove from user's creations
  const userCreations = creationsStore.get(userId) || [];
  const filteredCreations = userCreations.filter(c => c.id !== creationId);
  creationsStore.set(userId, filteredCreations);

  // Remove from index
  creationIdIndex.delete(creationId);

  return true;
}

/**
 * Get a specific creation
 */
export function getCreation(creationId: string): Creation | null {
  return creationIdIndex.get(creationId) || null;
}

/**
 * Get user's creations
 */
export function getUserCreations(
  userId: string,
  publicOnly: boolean = false
): Creation[] {
  const creations = creationsStore.get(userId) || [];
  
  if (publicOnly) {
    return creations.filter(c => c.public);
  }
  
  return creations;
}

/**
 * Get all public creations (for gallery)
 */
export function getPublicCreations(limit?: number): Creation[] {
  const allPublic: Creation[] = [];
  
  for (const creations of creationsStore.values()) {
    allPublic.push(...creations.filter(c => c.public));
  }

  // Sort by views (most popular first)
  allPublic.sort((a, b) => b.views - a.views);

  return limit ? allPublic.slice(0, limit) : allPublic;
}

/**
 * Increment view count
 */
export function incrementViewCount(
  creationId: string,
  viewerIP: string,
  viewerUserId?: string
): boolean {
  const creation = creationIdIndex.get(creationId);
  
  if (!creation || !creation.public) {
    return false;
  }

  // Validate view (anti-bot)
  const isValid = validateViewIncrement(creationId, viewerIP, viewerUserId);
  
  if (isValid) {
    creation.views++;
    return true;
  }

  return false;
}

/**
 * Increment download count
 */
export function incrementDownloadCount(creationId: string): boolean {
  const creation = creationIdIndex.get(creationId);
  
  if (!creation || !creation.public) {
    return false;
  }

  creation.downloads++;
  return true;
}

/**
 * Get creation statistics for a user
 */
export function getUserCreationStats(userId: string): {
  totalCreations: number;
  publicCreations: number;
  totalViews: number;
  totalDownloads: number;
  popularCreations: Creation[];
} {
  const creations = creationsStore.get(userId) || [];
  const publicCreations = creations.filter(c => c.public);

  return {
    totalCreations: creations.length,
    publicCreations: publicCreations.length,
    totalViews: publicCreations.reduce((sum, c) => sum + c.views, 0),
    totalDownloads: publicCreations.reduce((sum, c) => sum + c.downloads, 0),
    popularCreations: [...publicCreations]
      .sort((a, b) => b.views - a.views)
      .slice(0, 5),
  };
}

/**
 * Search creations by tags
 */
export function searchCreationsByTags(tags: string[], limit?: number): Creation[] {
  const allPublic = getPublicCreations();
  const tagSet = new Set(tags.map(t => t.toLowerCase()));

  const matches = allPublic.filter(creation => {
    const creationTags = creation.tags.map(t => t.toLowerCase());
    return creationTags.some(tag => tagSet.has(tag));
  });

  // Sort by relevance (number of matching tags) then by views
  matches.sort((a, b) => {
    const aMatches = a.tags.filter(t => tagSet.has(t.toLowerCase())).length;
    const bMatches = b.tags.filter(t => tagSet.has(t.toLowerCase())).length;
    
    if (aMatches !== bMatches) {
      return bMatches - aMatches;
    }
    
    return b.views - a.views;
  });

  return limit ? matches.slice(0, limit) : matches;
}

/**
 * Get trending creations (most views in last 7 days)
 */
export function getTrendingCreations(limit: number = 10): Creation[] {
  // In production, would filter by date
  // For now, just return most viewed
  return getPublicCreations(limit);
}

/**
 * Initialize user creations (for loading from DB)
 */
export function initializeUserCreations(userId: string, creations: Creation[]): void {
  creationsStore.set(userId, creations);
  creations.forEach(creation => {
    creationIdIndex.set(creation.id, creation);
  });
}

/**
 * Get all creations (admin function)
 */
export function getAllCreations(): Creation[] {
  const all: Creation[] = [];
  for (const creations of creationsStore.values()) {
    all.push(...creations);
  }
  return all;
}
