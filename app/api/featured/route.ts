import { NextRequest, NextResponse } from 'next/server';
import {
  getFeaturedContent,
  getAllFeaturedContent,
  getTopSubmissions,
  submitForFeatured,
  qualifiesForFeatured,
} from '@/lib/services/featuredContentService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contentType = searchParams.get('type') as 'audio' | 'video' | 'image' | null;
    const week = searchParams.get('week') ? parseInt(searchParams.get('week')!) : undefined;
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined;
    const view = searchParams.get('view') || 'current'; // 'current' or 'all'
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    let featured;
    
    if (view === 'all') {
      featured = getAllFeaturedContent(contentType || undefined, limit);
    } else if (view === 'submissions') {
      // Get current top submissions (not yet featured)
      if (!contentType) {
        return NextResponse.json(
          { error: 'Content type required for submissions view' },
          { status: 400 }
        );
      }
      const submissions = getTopSubmissions(contentType, limit || 10);
      return NextResponse.json({
        success: true,
        submissions,
        count: submissions.length,
      });
    } else {
      featured = getFeaturedContent(contentType || undefined, week, year);
    }

    return NextResponse.json({
      success: true,
      featured,
      count: featured.length,
    });

  } catch (error) {
    console.error('Featured content error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured content' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      userHandle,
      userAvatar,
      contentType,
      title,
      description,
      fileUrl,
      thumbnailUrl,
      analysisScore,
      verseScores,
      chorusScores,
    } = body;

    // Validate required fields
    if (!userId || !userHandle || !contentType || !title || !fileUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['audio', 'video', 'image'].includes(contentType)) {
      return NextResponse.json(
        { error: 'Invalid content type' },
        { status: 400 }
      );
    }

    const submission = {
      userId,
      userHandle,
      userAvatar: userAvatar || null,
      contentType,
      title,
      description: description || '',
      fileUrl,
      thumbnailUrl,
      analysisScore,
      verseScores,
      chorusScores,
    };

    // Check if it qualifies
    const qualifies = qualifiesForFeatured(submission);

    if (!qualifies) {
      return NextResponse.json({
        success: false,
        qualifies: false,
        message: 'Content does not meet the quality threshold for featured consideration',
      });
    }

    // Submit for consideration
    const submitted = await submitForFeatured(submission);

    if (submitted) {
      return NextResponse.json({
        success: true,
        qualifies: true,
        message: 'Content submitted for featured consideration!',
      });
    }

    return NextResponse.json({
      success: false,
      qualifies: false,
      message: 'Content did not meet all criteria',
    });

  } catch (error) {
    console.error('Submit featured content error:', error);
    return NextResponse.json(
      { error: 'Failed to submit content' },
      { status: 500 }
    );
  }
}
