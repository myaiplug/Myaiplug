import { NextRequest, NextResponse } from 'next/server';
import { getUserBySession } from '@/lib/services/userService';
import { getUserCredits } from '@/lib/services/referralService';
import { getUserJobStats } from '@/lib/services/jobService';
import type { TokenUsageEntry } from '@/lib/types/tokenUsage';

// NOTE: In-memory storage for demo/development purposes
// In production, replace with persistent storage (database)
// This data will be lost on server restarts and won't work in serverless environments
// Additionally, losing this data can lead to billing discrepancies and inability to track abuse
const tokenUsageLog: TokenUsageEntry[] = [];

// Internal function to log token usage
function logTokenUsage(entry: TokenUsageEntry): void {
  tokenUsageLog.push(entry);
}

// Internal function to get token usage for a user
function getTokenUsageForUser(userId: string, limit = 20): TokenUsageEntry[] {
  return tokenUsageLog
    .filter(e => e.userId === userId)
    .slice(-limit)
    .reverse(); // Most recent first
}

/**
 * GET - Get token/credit balance and usage history
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const sessionToken = authHeader.substring(7);
    const authResult = await getUserBySession(sessionToken);

    if (!authResult) {
      return NextResponse.json(
        { success: false, error: 'Invalid session' },
        { status: 401 }
      );
    }

    const { user } = authResult;

    // Get credits balance
    const credits = getUserCredits(user.id);
    
    // Get job stats
    const jobStats = getUserJobStats(user.id);
    
    // Get recent token usage
    const recentUsage = getTokenUsageForUser(user.id);

    // Calculate totals
    const totalTokensUsed = recentUsage.reduce((sum, entry) => sum + entry.tokensUsed, 0);

    return NextResponse.json({
      success: true,
      balance: {
        credits: credits.balance,
        lastResetAt: credits.lastResetAt,
        rolloverExpiryAt: credits.rolloverExpiryAt,
      },
      usage: {
        totalTokensUsed,
        totalJobs: jobStats.totalJobs,
        completedJobs: jobStats.completedJobs,
        failedJobs: jobStats.failedJobs,
        totalTimeSaved: jobStats.totalTimeSaved,
        totalCreditsUsed: jobStats.totalCreditsUsed,
      },
      history: recentUsage.map(entry => ({
        action: entry.action,
        tokensUsed: entry.tokensUsed,
        timestamp: entry.timestamp,
        jobId: entry.jobId,
      })),
      tier: user.tier,
    });

  } catch (error) {
    console.error('Token usage error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get token usage' },
      { status: 500 }
    );
  }
}

/**
 * POST - Log token usage (internal use only)
 */
export async function POST(request: NextRequest) {
  try {
    // Require internal API key for authentication
    const internalApiKey = request.headers.get('x-internal-api-key');
    if (!process.env.INTERNAL_API_KEY) {
      console.warn('INTERNAL_API_KEY not set - this endpoint should be protected in production');
    } else if (internalApiKey !== process.env.INTERNAL_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId, action, tokensUsed, jobId, details } = body;

    if (!userId || !action || tokensUsed === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: userId, action, tokensUsed' },
        { status: 400 }
      );
    }

    // Log the usage
    logTokenUsage({
      userId,
      action,
      tokensUsed,
      timestamp: new Date(),
      jobId,
      details,
    });

    return NextResponse.json({
      success: true,
      message: 'Token usage logged',
    });

  } catch (error) {
    console.error('Log token usage error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to log token usage' },
      { status: 500 }
    );
  }
}
