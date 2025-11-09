// Leaderboard API
import { NextRequest, NextResponse } from 'next/server';
import { generateLeaderboard } from '@/lib/services/leaderboardService';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/services/antiAbuseService';
import type { LeaderboardType, LeaderboardPeriod } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIP = getClientIP(request.headers);

    // Rate limiting (public endpoint)
    const rateLimit = checkRateLimit(
      `leaderboard_${clientIP}`,
      RATE_LIMITS.LEADERBOARD_VIEW.max,
      RATE_LIMITS.LEADERBOARD_VIEW.window
    );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const type = (searchParams.get('type') || 'time_saved') as LeaderboardType;
    const period = (searchParams.get('period') || 'alltime') as LeaderboardPeriod;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100;
    
    // Optional: get user's rank
    const userId = searchParams.get('userId');

    // Validate type
    const validTypes: LeaderboardType[] = ['time_saved', 'referrals', 'popularity'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid leaderboard type' },
        { status: 400 }
      );
    }

    // Validate period
    const validPeriods: LeaderboardPeriod[] = ['weekly', 'alltime'];
    if (!validPeriods.includes(period)) {
      return NextResponse.json(
        { error: 'Invalid period' },
        { status: 400 }
      );
    }

    // Generate leaderboard
    const leaderboard = await generateLeaderboard({
      type,
      period,
      limit,
      userId: userId || undefined,
    });

    return NextResponse.json({
      success: true,
      type,
      period,
      entries: leaderboard.entries,
      userRank: leaderboard.userRank,
      lastUpdated: leaderboard.lastUpdated,
    });

  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
