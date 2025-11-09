// Referrals API
import { NextRequest, NextResponse } from 'next/server';
import { getUserBySession } from '@/lib/services/userService';
import {
  generateReferralLink,
  getReferralStats,
  getReferralHistory,
} from '@/lib/services/referralService';

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

    // Get referral link
    const referralLink = generateReferralLink(result.user.id, result.user.handle);

    // Get referral stats
    const stats = getReferralStats(result.user.id);

    // Get referral history
    const history = getReferralHistory(result.user.id);

    return NextResponse.json({
      success: true,
      referralLink,
      stats,
      history: history.slice(0, 20), // Limit to recent 20
    });

  } catch (error) {
    console.error('Get referrals error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
