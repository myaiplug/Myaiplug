// Authentication API - Sign Up
import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/services/userService';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/services/antiAbuseService';
import { trackUserIP } from '@/lib/services/antiAbuseService';

export async function POST(request: NextRequest) {
  try {
    // Get client IP
    const clientIP = getClientIP(request.headers);

    // Rate limiting
    const rateLimit = checkRateLimit(
      `signup_${clientIP}`,
      RATE_LIMITS.SIGNUP.max,
      RATE_LIMITS.SIGNUP.window
    );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many signup attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { email, password, handle } = body;

    // Validate required fields
    if (!email || !password || !handle) {
      return NextResponse.json(
        { error: 'Email, password, and handle are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate handle format
    const handleRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!handleRegex.test(handle)) {
      return NextResponse.json(
        { error: 'Handle must be 3-20 characters (alphanumeric and underscore only)' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Create user
    const result = await createUser({
      email,
      password,
      handle,
      ipAddress: clientIP,
    });

    // Track IP
    trackUserIP(result.user.id, clientIP);

    // Return success with session token
    return NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        email: result.user.email,
        handle: result.user.handle,
        tier: result.user.tier,
      },
      profile: {
        level: result.profile.level,
        pointsTotal: result.profile.pointsTotal,
        timeSavedSecTotal: result.profile.timeSavedSecTotal,
        badges: result.profile.badges,
      },
      sessionToken: result.sessionToken,
      message: 'Account created successfully! You earned 150 points and 100 credits.',
    });

  } catch (error: any) {
    console.error('Signup error:', error);
    
    // Handle specific errors
    if (error.message === 'Email already exists') {
      return NextResponse.json(
        { error: 'This email is already registered' },
        { status: 409 }
      );
    }
    
    if (error.message === 'Handle already taken') {
      return NextResponse.json(
        { error: 'This handle is already taken' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'An error occurred during signup. Please try again.' },
      { status: 500 }
    );
  }
}
