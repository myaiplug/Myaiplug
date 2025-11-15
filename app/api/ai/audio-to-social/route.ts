import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/lib/services/aiService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { audioFileName } = body;

    if (!audioFileName) {
      return NextResponse.json(
        { success: false, error: 'Audio file name is required' },
        { status: 400 }
      );
    }

    const result = await aiService.analyzeAudioAndGenerateContent(audioFileName);

    return NextResponse.json({
      success: true,
      analysis: result.analysis,
      content: result.content,
      isPlaceholder: !aiService.isEnabled(),
      message: !aiService.isEnabled()
        ? 'AI service not configured. Set OPENAI_API_KEY environment variable to enable real AI generation.'
        : 'Content generated successfully',
    });
  } catch (error) {
    console.error('Audio content generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
