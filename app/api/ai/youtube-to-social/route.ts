import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/lib/services/aiService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { youtubeUrl } = body;

    if (!youtubeUrl) {
      return NextResponse.json(
        { success: false, error: 'YouTube URL is required' },
        { status: 400 }
      );
    }

    // Basic YouTube URL validation
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    if (!youtubeRegex.test(youtubeUrl)) {
      return NextResponse.json(
        { success: false, error: 'Invalid YouTube URL' },
        { status: 400 }
      );
    }

    const content = await aiService.generateYouTubeToSocial(youtubeUrl);

    return NextResponse.json({
      success: true,
      content,
      isPlaceholder: !aiService.isEnabled(),
      message: !aiService.isEnabled()
        ? 'AI service not configured. Set OPENAI_API_KEY environment variable to enable real AI generation.'
        : 'Social media content generated successfully',
    });
  } catch (error) {
    console.error('YouTube to social generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
