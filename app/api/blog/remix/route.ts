import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const { content, format } = await req.json();

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    if (!format) {
      return NextResponse.json(
        { error: 'Format is required' },
        { status: 400 }
      );
    }

    // Get API key from environment
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Create prompts based on format
    const prompts: Record<string, string> = {
      facebook: `Rewrite the following article as an engaging Facebook post. Make it conversational, use emojis where appropriate, and include a call-to-action. Keep it under 300 words:\n\n${content}`,
      instagram: `Create an Instagram caption from this article. Make it punchy, use relevant hashtags, and include emojis. Focus on the key message and keep it under 150 words:\n\n${content}`,
      twitter: `Convert this article into a compelling Twitter/X thread. Create 3-5 tweets that tell the story. Each tweet should be under 280 characters. Use thread numbering (1/5, 2/5, etc.):\n\n${content}`,
      voiceover: `Transform this article into a voice-over script for a video. Make it natural and conversational, add pauses indicated by [...], and keep the tone engaging. Aim for about 60-90 seconds of reading time:\n\n${content}`,
      user_video: `Create a step-by-step script for a user-read video based on this article. Include:\n- Opening hook\n- Main talking points with tips\n- B-roll suggestions in [brackets]\n- Closing call-to-action\n\nArticle:\n${content}`,
      short_form: `Create a script for YouTube Shorts / TikTok based on this article. Include:\n- Attention-grabbing hook (first 3 seconds)\n- Key points (15-30 seconds)\n- Visual cues in [brackets]\n- Call-to-action\nKeep it under 60 seconds total:\n\n${content}`,
    };

    const prompt = prompts[format];
    if (!prompt) {
      return NextResponse.json(
        { error: 'Invalid format specified' },
        { status: 400 }
      );
    }

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const remixedContent = response.text();

    return NextResponse.json({
      success: true,
      remixedContent,
      format,
    });
  } catch (error: any) {
    console.error('Gemini API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to remix content' },
      { status: 500 }
    );
  }
}
