// Featured Content Service - Track and showcase top content weekly
import type { Creation } from '../types';
import { generateSecureId } from '../utils/secureId';

export interface FeaturedContent {
  id: string;
  userId: string;
  userHandle: string;
  userAvatar: string | null;
  contentType: 'audio' | 'video' | 'image';
  title: string;
  description: string;
  fileUrl: string;
  thumbnailUrl?: string;
  score: number;
  weekNumber: number;
  year: number;
  featuredAt: Date;
  metadata?: {
    analysisScore?: number;
    verseAvgScore?: number;
    chorusAvgScore?: number;
    views?: number;
    likes?: number;
    genre?: string;
    mood?: string;
  };
}

export interface ContentSubmission {
  userId: string;
  userHandle: string;
  userAvatar: string | null;
  contentType: 'audio' | 'video' | 'image';
  title: string;
  description: string;
  fileUrl: string;
  thumbnailUrl?: string;
  analysisScore?: number;
  verseScores?: number[];
  chorusScores?: number[];
}

// In-memory storage (replace with DB in production)
const featuredContent = new Map<string, FeaturedContent[]>();
const contentSubmissions = new Map<string, ContentSubmission>();
const weeklyScores = new Map<string, number>(); // userId -> total score for current week

/**
 * Get current week number
 */
function getCurrentWeek(): { week: number; year: number } {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  const week = Math.ceil(diff / oneWeek);
  return { week, year: now.getFullYear() };
}

/**
 * Calculate content score based on multiple factors
 */
function calculateContentScore(submission: ContentSubmission): number {
  let score = 0;

  // Analysis score (if available) - weight: 40%
  if (submission.analysisScore) {
    score += submission.analysisScore * 0.4;
  }

  // Verse scores average - weight: 25%
  if (submission.verseScores && submission.verseScores.length > 0) {
    const verseAvg = submission.verseScores.reduce((a, b) => a + b, 0) / submission.verseScores.length;
    score += verseAvg * 0.25;
  }

  // Chorus scores average - weight: 35% (chorus is more important)
  if (submission.chorusScores && submission.chorusScores.length > 0) {
    const chorusAvg = submission.chorusScores.reduce((a, b) => a + b, 0) / submission.chorusScores.length;
    score += chorusAvg * 0.35;
  }

  // If no analysis data available, return base score
  return score || 70;
}

/**
 * Submit content for featured consideration
 */
export async function submitForFeatured(submission: ContentSubmission): Promise<boolean> {
  const score = calculateContentScore(submission);
  
  // Only consider content with score >= 85 for audio, or high engagement for other types
  const threshold = submission.contentType === 'audio' ? 85 : 80;
  
  if (score < threshold) {
    return false;
  }

  const { week, year } = getCurrentWeek();
  const submissionId = generateSecureId('sub_');
  
  contentSubmissions.set(submissionId, submission);
  
  // Track weekly score for user
  const weekKey = `${submission.userId}_${year}_${week}`;
  const currentScore = weeklyScores.get(weekKey) || 0;
  
  // Only keep the highest score for the week
  if (score > currentScore) {
    weeklyScores.set(weekKey, score);
  }

  return true;
}

/**
 * Get top submissions for current week
 */
export function getTopSubmissions(
  contentType: 'audio' | 'video' | 'image',
  limit: number = 10
): ContentSubmission[] {
  const { week, year } = getCurrentWeek();
  
  return Array.from(contentSubmissions.values())
    .filter(s => s.contentType === contentType)
    .map(submission => ({
      ...submission,
      score: calculateContentScore(submission),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Feature top content for the week (admin/cron job)
 */
export async function featureWeeklyContent(): Promise<void> {
  const { week, year } = getCurrentWeek();
  
  const audioTop = getTopSubmissions('audio', 1);
  const videoTop = getTopSubmissions('video', 1);
  const imageTop = getTopSubmissions('image', 1);

  const weekKey = `${year}_${week}`;
  const weeklyFeatured: FeaturedContent[] = [];

  // Feature audio
  if (audioTop.length > 0) {
    const submission = audioTop[0];
    weeklyFeatured.push({
      id: generateSecureId('feat_'),
      userId: submission.userId,
      userHandle: submission.userHandle,
      userAvatar: submission.userAvatar,
      contentType: 'audio',
      title: submission.title,
      description: submission.description,
      fileUrl: submission.fileUrl,
      thumbnailUrl: submission.thumbnailUrl,
      score: calculateContentScore(submission),
      weekNumber: week,
      year,
      featuredAt: new Date(),
      metadata: {
        analysisScore: submission.analysisScore,
        verseAvgScore: submission.verseScores 
          ? submission.verseScores.reduce((a, b) => a + b, 0) / submission.verseScores.length
          : undefined,
        chorusAvgScore: submission.chorusScores
          ? submission.chorusScores.reduce((a, b) => a + b, 0) / submission.chorusScores.length
          : undefined,
      },
    });
  }

  // Feature video
  if (videoTop.length > 0) {
    const submission = videoTop[0];
    weeklyFeatured.push({
      id: generateSecureId('feat_'),
      userId: submission.userId,
      userHandle: submission.userHandle,
      userAvatar: submission.userAvatar,
      contentType: 'video',
      title: submission.title,
      description: submission.description,
      fileUrl: submission.fileUrl,
      thumbnailUrl: submission.thumbnailUrl,
      score: calculateContentScore(submission),
      weekNumber: week,
      year,
      featuredAt: new Date(),
    });
  }

  // Feature image
  if (imageTop.length > 0) {
    const submission = imageTop[0];
    weeklyFeatured.push({
      id: generateSecureId('feat_'),
      userId: submission.userId,
      userHandle: submission.userHandle,
      userAvatar: submission.userAvatar,
      contentType: 'image',
      title: submission.title,
      description: submission.description,
      fileUrl: submission.fileUrl,
      thumbnailUrl: submission.thumbnailUrl,
      score: calculateContentScore(submission),
      weekNumber: week,
      year,
      featuredAt: new Date(),
    });
  }

  featuredContent.set(weekKey, weeklyFeatured);
}

/**
 * Get featured content for a specific week
 */
export function getFeaturedContent(
  contentType?: 'audio' | 'video' | 'image',
  week?: number,
  year?: number
): FeaturedContent[] {
  const current = getCurrentWeek();
  const targetWeek = week || current.week;
  const targetYear = year || current.year;
  const weekKey = `${targetYear}_${targetWeek}`;

  const featured = featuredContent.get(weekKey) || [];
  
  if (contentType) {
    return featured.filter(f => f.contentType === contentType);
  }
  
  return featured;
}

/**
 * Get all featured content (history)
 */
export function getAllFeaturedContent(
  contentType?: 'audio' | 'video' | 'image',
  limit?: number
): FeaturedContent[] {
  const allFeatured: FeaturedContent[] = [];
  
  for (const weeklyContent of featuredContent.values()) {
    allFeatured.push(...weeklyContent);
  }

  let filtered = contentType 
    ? allFeatured.filter(f => f.contentType === contentType)
    : allFeatured;

  // Sort by featured date (newest first)
  filtered.sort((a, b) => b.featuredAt.getTime() - a.featuredAt.getTime());

  return limit ? filtered.slice(0, limit) : filtered;
}

/**
 * Check if content qualifies for featured consideration
 */
export function qualifiesForFeatured(submission: ContentSubmission): boolean {
  const score = calculateContentScore(submission);
  const threshold = submission.contentType === 'audio' ? 85 : 80;
  return score >= threshold;
}

/**
 * Get user's featured content count
 */
export function getUserFeaturedCount(userId: string): number {
  let count = 0;
  
  for (const weeklyContent of featuredContent.values()) {
    count += weeklyContent.filter(f => f.userId === userId).length;
  }
  
  return count;
}

/**
 * Initialize featured content from storage
 */
export function initializeFeaturedContent(content: Map<string, FeaturedContent[]>): void {
  content.forEach((value, key) => {
    featuredContent.set(key, value);
  });
}
