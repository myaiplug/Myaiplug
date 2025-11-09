// User Stats API
import { NextRequest, NextResponse } from 'next/server';
import { getUserBySession } from '@/lib/services/userService';
import { getUserJobStats } from '@/lib/services/jobService';
import { getUserCreationStats } from '@/lib/services/creationService';
import { getReferralStats } from '@/lib/services/referralService';
import { getUserBadges, getBadgeProgress } from '@/lib/services/badgeSystem';
import { getUserJobs } from '@/lib/services/jobService';
import { getUserCreations } from '@/lib/services/creationService';
import { getReferralHistory } from '@/lib/services/referralService';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionToken = authHeader.substring(7);
    const result = await getUserBySession(sessionToken);

    if (!result) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Get all stats
    const jobStats = getUserJobStats(result.user.id);
    const creationStats = getUserCreationStats(result.user.id);
    const referralStats = getReferralStats(result.user.id);
    
    // Get badge progress
    const jobs = getUserJobs(result.user.id);
    const creations = getUserCreations(result.user.id);
    const referrals = getReferralHistory(result.user.id);
    const badgeProgress = getBadgeProgress(
      result.user.id,
      result.profile,
      jobs,
      creations,
      referrals
    );

    return NextResponse.json({
      success: true,
      stats: {
        points: {
          total: result.profile.pointsTotal,
          level: result.profile.level,
        },
        jobs: jobStats,
        creations: creationStats,
        referrals: referralStats,
        badges: {
          earned: result.profile.badges.length,
          progress: badgeProgress,
        },
      },
    });

  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
