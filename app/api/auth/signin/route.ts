// Authentication API - Sign In
import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/services/userService';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/services/antiAbuseService';

export async function POST(request: NextRequest) {
  try {
    // Get client IP
    const clientIP = getClientIP(request.headers);

    // Rate limiting
    const rateLimit = checkRateLimit(
      `signin_${clientIP}`,
      RATE_LIMITS.SIGNIN.max,
      RATE_LIMITS.SIGNIN.window
    );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many signin attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Authenticate user
    const result = await authenticateUser(email, password);

    if (!result) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Return success with session token
    return NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        email: result.user.email,
        handle: result.user.handle,
        tier: result.user.tier,
        avatarUrl: result.user.avatarUrl,
        bio: result.user.bio,
      },
      profile: {
        level: result.profile.level,
        pointsTotal: result.profile.pointsTotal,
        timeSavedSecTotal: result.profile.timeSavedSecTotal,
        badges: result.profile.badges,
      },
      sessionToken: result.sessionToken,
    });

  } catch (error) {
    console.error('Signin error:', error);
    return NextResponse.json(
      { error: 'An error occurred during signin. Please try again.' },
      { status: 500 }
    );
  }
}
