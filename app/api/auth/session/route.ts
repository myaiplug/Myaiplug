// Authentication API - Get Session
import { NextRequest, NextResponse } from 'next/server';
import { getUserBySession } from '@/lib/services/userService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get session token from Authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No session token provided' },
        { status: 401 }
      );
    }

    const sessionToken = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Get user by session
    const result = await getUserBySession(sessionToken);

    if (!result) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    // Return user and profile data
    return NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        email: result.user.email,
        handle: result.user.handle,
        tier: result.user.tier,
        avatarUrl: result.user.avatarUrl,
        bio: result.user.bio,
        createdAt: result.user.createdAt,
      },
      profile: {
        level: result.profile.level,
        pointsTotal: result.profile.pointsTotal,
        timeSavedSecTotal: result.profile.timeSavedSecTotal,
        totalJobs: result.profile.totalJobs,
        badges: result.profile.badges,
      },
    });

  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { error: 'An error occurred while checking session' },
      { status: 500 }
    );
  }
}
