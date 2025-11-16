import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { BLOG_CONTENT_COSTS, BLOG_GENERATION_POINTS } from '@/lib/constants/pricing';

export async function POST(req: NextRequest) {
  try {
    const { content, format, tone, demographic, includeGraphic } = await req.json();

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

    // Calculate token cost
    const tokenCost = BLOG_CONTENT_COSTS[format as keyof typeof BLOG_CONTENT_COSTS] || 25;
    const pointsReward = BLOG_GENERATION_POINTS[format as keyof typeof BLOG_GENERATION_POINTS] || 5;

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

    // Build tone and demographic modifiers
    const toneModifier = tone ? `Use a ${tone} tone. ` : '';
    const demographicModifier = demographic ? `Target this content for ${demographic}. ` : '';
    const personalityModifier = 'Make it authentic and personal. ';
    const originalityNote = 'Completely rewrite the content - no copy-paste plagiarism. ';

    // Create prompts based on format with customization
    const prompts: Record<string, string> = {
      facebook: `${originalityNote}${toneModifier}${demographicModifier}${personalityModifier}Rewrite the following article as an engaging Facebook post. Make it conversational, use emojis where appropriate, and include a call-to-action. Keep it under 300 words:\n\n${content}`,
      instagram: `${originalityNote}${toneModifier}${demographicModifier}${personalityModifier}Create an Instagram caption from this article. Make it punchy, use relevant hashtags, and include emojis. Focus on the key message and keep it under 150 words:\n\n${content}`,
      twitter: `${originalityNote}${toneModifier}${demographicModifier}${personalityModifier}Convert this article into a compelling Twitter/X thread. Create 3-5 tweets that tell the story. Each tweet should be under 280 characters. Use thread numbering (1/5, 2/5, etc.):\n\n${content}`,
      voiceover: `${originalityNote}${toneModifier}${demographicModifier}${personalityModifier}Transform this article into a voice-over script for a video. Make it natural and conversational, add pauses indicated by [...], and keep the tone engaging. Aim for about 60-90 seconds of reading time:\n\n${content}`,
      user_video: `${originalityNote}${toneModifier}${demographicModifier}${personalityModifier}Create a step-by-step script for a user-read video based on this article. Include:\n- Opening hook\n- Main talking points with tips\n- B-roll suggestions in [brackets]\n- Closing call-to-action\n\nArticle:\n${content}`,
      short_form: `${originalityNote}${toneModifier}${demographicModifier}${personalityModifier}Create a script for YouTube Shorts / TikTok based on this article. Include:\n- Attention-grabbing hook (first 3 seconds)\n- Key points (15-30 seconds)\n- Visual cues in [brackets]\n- Call-to-action\nKeep it under 60 seconds total:\n\n${content}`,
      full_article: `${originalityNote}${toneModifier}${demographicModifier}${personalityModifier}Completely rewrite this article in your own words. Make it engaging, well-structured with clear sections, and authentic. Do not copy any sentences directly. Expand on key points and add insights:\n\n${content}`,
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
    let remixedContent = response.text();

    // Generate graphic suggestion if requested
    let graphicSuggestion = null;
    if (includeGraphic) {
      const graphicPrompt = `Based on this content, suggest a specific graphic or image description that would pair well with it. Be specific about colors, style, and elements. Keep it to 2-3 sentences:\n\n${remixedContent}`;
      const graphicResult = await model.generateContent(graphicPrompt);
      const graphicResponse = await graphicResult.response;
      graphicSuggestion = graphicResponse.text();
    }

    return NextResponse.json({
      success: true,
      remixedContent,
      graphicSuggestion,
      format,
      tokenCost,
      pointsReward,
      isFirstGeneration: false, // This should be determined by checking user history
    });
  } catch (error: any) {
    console.error('Gemini API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to remix content' },
      { status: 500 }
    );
  }
}
