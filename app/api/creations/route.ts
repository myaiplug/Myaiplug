// Creations/Portfolio API
import { NextRequest, NextResponse } from 'next/server';
import { getUserBySession } from '@/lib/services/userService';
import {
  createCreation,
  getUserCreations,
  updateCreation,
  deleteCreation,
  publishCreation,
  getPublicCreations,
} from '@/lib/services/creationService';
import { checkRateLimit, RATE_LIMITS } from '@/lib/services/antiAbuseService';

// GET - List creations (user's own or public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const publicOnly = searchParams.get('public') === 'true';

    // If userId specified, get that user's public creations
    if (userId) {
      const creations = getUserCreations(userId, true);
      return NextResponse.json({
        success: true,
        creations,
      });
    }

    // If no auth and public=true, return all public creations
    if (publicOnly) {
      const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
      const creations = getPublicCreations(limit);
      return NextResponse.json({
        success: true,
        creations,
      });
    }

    // Otherwise, require auth and return user's creations
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionToken = authHeader.substring(7);
    const result = await getUserBySession(sessionToken);

    if (!result) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const creations = getUserCreations(result.user.id, false);

    return NextResponse.json({
      success: true,
      creations,
    });

  } catch (error) {
    console.error('Get creations error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new creation
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { jobId, title, tags, mediaUrl, thumbnailUrl, isPublic } = body;

    // Validate required fields
    if (!jobId || !title || !mediaUrl) {
      return NextResponse.json(
        { error: 'Job ID, title, and media URL are required' },
        { status: 400 }
      );
    }

    // Create creation
    const creation = await createCreation({
      userId: result.user.id,
      jobId,
      title,
      tags: tags || [],
      mediaUrl,
      thumbnailUrl,
      isPublic: isPublic || false,
    });

    // If publishing, award points
    let pointsAwarded = 0;
    if (isPublic) {
      const publishResult = await publishCreation(creation.id, result.user.id);
      if (publishResult) {
        pointsAwarded = publishResult.pointsAwarded;
      }
    }

    return NextResponse.json({
      success: true,
      creation,
      pointsAwarded,
      message: 'Creation added to portfolio',
    });

  } catch (error) {
    console.error('Create creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update creation
export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const { creationId, title, tags, public: isPublic } = body;

    if (!creationId) {
      return NextResponse.json(
        { error: 'Creation ID is required' },
        { status: 400 }
      );
    }

    // Update creation
    const creation = await updateCreation(creationId, result.user.id, {
      title,
      tags,
      public: isPublic,
    });

    if (!creation) {
      return NextResponse.json(
        { error: 'Creation not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      creation,
      message: 'Creation updated',
    });

  } catch (error) {
    console.error('Update creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete creation
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const creationId = searchParams.get('id');

    if (!creationId) {
      return NextResponse.json(
        { error: 'Creation ID is required' },
        { status: 400 }
      );
    }

    // Delete creation
    const success = await deleteCreation(creationId, result.user.id);

    if (!success) {
      return NextResponse.json(
        { error: 'Creation not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Creation deleted',
    });

  } catch (error) {
    console.error('Delete creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
