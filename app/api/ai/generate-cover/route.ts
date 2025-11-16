import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/lib/services/aiService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, type = 'single', quality = 'free' } = body;

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const result = await aiService.generateCoverArt(prompt, type, quality);

    return NextResponse.json({
      success: true,
      images: result.urls,
      provider: result.provider,
      prompt: result.prompt,
      isPlaceholder: result.provider === 'placeholder',
      message: result.provider === 'placeholder' 
        ? 'AI service not configured. Set OPENAI_API_KEY or REPLICATE_API_KEY environment variable to enable real AI generation.'
        : 'Cover art generated successfully',
    });
  } catch (error) {
    console.error('Cover art generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
