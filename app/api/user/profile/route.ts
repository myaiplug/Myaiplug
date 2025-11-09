// User Profile API
import { NextRequest, NextResponse } from 'next/server';
import { getUserBySession, updateUserProfile, updateProfilePrivacy } from '@/lib/services/userService';
import { checkRateLimit, RATE_LIMITS } from '@/lib/services/antiAbuseService';

// GET - Get user profile
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

    return NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        email: result.user.email,
        handle: result.user.handle,
        avatarUrl: result.user.avatarUrl,
        bio: result.user.bio,
        tier: result.user.tier,
      },
      profile: {
        level: result.profile.level,
        pointsTotal: result.profile.pointsTotal,
        timeSavedSecTotal: result.profile.timeSavedSecTotal,
        badges: result.profile.badges,
        privacyOptOut: result.profile.privacyOptOut,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionToken = authHeader.substring(7);
    const authResult = await getUserBySession(sessionToken);

    if (!authResult) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Rate limiting
    const rateLimit = checkRateLimit(
      `profile_update_${authResult.user.id}`,
      RATE_LIMITS.PROFILE_UPDATE.max,
      RATE_LIMITS.PROFILE_UPDATE.window
    );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many update requests' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { handle, bio, avatarUrl, privacyOptOut } = body;

    // Update user profile
    if (handle !== undefined || bio !== undefined || avatarUrl !== undefined) {
      const updates: any = {};
      if (handle !== undefined) updates.handle = handle;
      if (bio !== undefined) updates.bio = bio;
      if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;

      await updateUserProfile(authResult.user.id, updates);
    }

    // Update privacy settings
    if (privacyOptOut !== undefined) {
      updateProfilePrivacy(authResult.user.id, privacyOptOut);
    }

    // Get updated profile
    const updatedResult = await getUserBySession(sessionToken);

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedResult!.user.id,
        email: updatedResult!.user.email,
        handle: updatedResult!.user.handle,
        avatarUrl: updatedResult!.user.avatarUrl,
        bio: updatedResult!.user.bio,
      },
      profile: {
        privacyOptOut: updatedResult!.profile.privacyOptOut,
      },
    });

  } catch (error: any) {
    console.error('Update profile error:', error);
    
    if (error.message === 'Handle already taken') {
      return NextResponse.json({ error: 'Handle already taken' }, { status: 409 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
