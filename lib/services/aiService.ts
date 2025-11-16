/**
 * AI Service
 * Centralized service for AI-powered features
 * Primary: Google Gemini 2.5 Flash for content generation
 * Secondary: Replicate for image generation, Imagen 3/4 for advanced images
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AIConfig {
  geminiApiKey?: string;
  geminiModel?: string;
  replicateApiKey?: string;
  imagenApiKey?: string;
  imagenModel?: string;
  openaiApiKey?: string;
  enabled: boolean;
}

export interface ImageGenerationResult {
  urls: string[];
  provider: string;
  prompt: string;
}

export interface ContentGenerationResult {
  platform: string;
  content: string;
  hashtags?: string[];
}

export interface AudioAnalysisResult {
  title?: string;
  genre?: string;
  mood?: string;
  duration?: string;
  bpm?: number;
  key?: string;
}

// Configuration (in production, load from environment variables)
const config: AIConfig = {
  geminiApiKey: process.env.GOOGLE_GEMINI_API_KEY,
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp',
  replicateApiKey: process.env.REPLICATE_API_KEY,
  imagenApiKey: process.env.GOOGLE_IMAGEN_API_KEY || process.env.GOOGLE_GEMINI_API_KEY,
  imagenModel: process.env.IMAGEN_MODEL || 'imagen-3.0-generate-001',
  openaiApiKey: process.env.OPENAI_API_KEY,
  enabled: !!process.env.GOOGLE_GEMINI_API_KEY, // Main AI model
};

// Initialize Gemini AI
let genAI: GoogleGenerativeAI | null = null;
if (config.geminiApiKey) {
  genAI = new GoogleGenerativeAI(config.geminiApiKey);
}

export const aiService = {
  /**
   * Check if AI services are enabled
   */
  isEnabled: (): boolean => {
    return config.enabled && !!config.geminiApiKey;
  },

  /**
   * Generate album/single cover art
   * Uses Imagen 3/4 or Replicate for image generation
   */
  generateCoverArt: async (
    prompt: string,
    type: 'single' | 'album',
    quality: 'free' | 'pro' = 'free'
  ): Promise<ImageGenerationResult> => {
    // If AI is not enabled, return placeholder images
    if (!aiService.isEnabled()) {
      return {
        urls: [
          '/placeholder-cover-1.jpg',
          '/placeholder-cover-2.jpg',
        ],
        provider: 'placeholder',
        prompt,
      };
    }

    try {
      // Try using Imagen first (Google's image generation model)
      if (config.imagenApiKey) {
        // TODO: Implement Imagen API when available
        // For now, use Replicate as fallback
        console.log('Imagen API integration pending - using Replicate fallback');
      }

      // Use Replicate for image generation
      if (config.replicateApiKey) {
        const response = await fetch('https://api.replicate.com/v1/predictions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${config.replicateApiKey}`,
          },
          body: JSON.stringify({
            version: "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
            input: {
              prompt: `Professional ${type} cover art for music. Industry quality, minimalistic, centered composition, square format. ${prompt}`,
              num_outputs: quality === 'pro' ? 4 : 2,
              width: quality === 'pro' ? 1024 : 512,
              height: quality === 'pro' ? 1024 : 512,
            },
          }),
        });

        if (!response.ok) {
          throw new Error(`Replicate API error: ${response.statusText}`);
        }

        const prediction = await response.json();
        
        // Poll for completion (simplified - in production, use webhooks)
        let attempts = 0;
        let result = prediction;
        while (result.status !== 'succeeded' && result.status !== 'failed' && attempts < 60) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
            headers: {
              'Authorization': `Token ${config.replicateApiKey}`,
            },
          });
          result = await pollResponse.json();
          attempts++;
        }

        if (result.status === 'succeeded') {
          return {
            urls: result.output || [],
            provider: 'replicate',
            prompt,
          };
        }
      }
    } catch (error) {
      console.error('Image generation error:', error);
    }

    // Placeholder fallback
    return {
      urls: [
        '/placeholder-cover-1.jpg',
        '/placeholder-cover-2.jpg',
      ],
      provider: 'placeholder',
      prompt,
    };
  },

  /**
   * Generate social media content from YouTube video
   * Uses Gemini 2.5 Flash for content generation
   */
  generateYouTubeToSocial: async (youtubeUrl: string): Promise<ContentGenerationResult[]> => {
    // If AI is not enabled, return placeholder content
    if (!aiService.isEnabled() || !genAI) {
      return [
        {
          platform: 'Instagram',
          content: 'Check out my latest track! 🎵 Link in bio',
          hashtags: ['#NewMusic', '#HipHop', '#Trap'],
        },
        {
          platform: 'Twitter/X',
          content: 'New heat dropped! 🔥 Listen now',
          hashtags: ['#Music', '#NewRelease'],
        },
        {
          platform: 'TikTok',
          content: 'Full track on YouTube! 🎶',
          hashtags: ['#FYP', '#Music', '#Viral'],
        },
      ];
    }

    try {
      const model = genAI.getGenerativeModel({ model: config.geminiModel! });
      
      const prompt = `Generate engaging social media posts for Instagram, Twitter/X, and TikTok based on this YouTube video: ${youtubeUrl}
      
      For each platform, provide:
      1. Platform-appropriate content (length, tone, style)
      2. Relevant hashtags
      
      Return the response as a JSON array with this structure:
      [
        {
          "platform": "Instagram",
          "content": "...",
          "hashtags": ["#tag1", "#tag2"]
        },
        {
          "platform": "Twitter/X",
          "content": "...",
          "hashtags": ["#tag1", "#tag2"]
        },
        {
          "platform": "TikTok",
          "content": "...",
          "hashtags": ["#tag1", "#tag2"]
        }
      ]`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Try to parse JSON from the response
      try {
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return parsed;
        }
      } catch (parseError) {
        console.error('Failed to parse Gemini response as JSON:', parseError);
      }
      
      // Fallback if parsing fails
      return [
        {
          platform: 'Instagram',
          content: 'Check out my latest track! 🎵 Link in bio',
          hashtags: ['#NewMusic', '#HipHop', '#Trap'],
        },
        {
          platform: 'Twitter/X',
          content: 'New heat dropped! 🔥 Listen now',
          hashtags: ['#Music', '#NewRelease'],
        },
        {
          platform: 'TikTok',
          content: 'Full track on YouTube! 🎶',
          hashtags: ['#FYP', '#Music', '#Viral'],
        },
      ];
    } catch (error) {
      console.error('Gemini content generation error:', error);
      return [
        {
          platform: 'Instagram',
          content: 'Check out my latest track! 🎵 Link in bio',
          hashtags: ['#NewMusic', '#HipHop', '#Trap'],
        },
        {
          platform: 'Twitter/X',
          content: 'New heat dropped! 🔥 Listen now',
          hashtags: ['#Music', '#NewRelease'],
        },
        {
          platform: 'TikTok',
          content: 'Full track on YouTube! 🎶',
          hashtags: ['#FYP', '#Music', '#Viral'],
        },
      ];
    }
  },

  /**
   * Analyze audio file and generate social media content
   * Uses Gemini 2.5 Flash for content generation
   */
  analyzeAudioAndGenerateContent: async (audioFileName: string): Promise<{
    analysis: AudioAnalysisResult;
    content: ContentGenerationResult[];
  }> => {
    // If AI is not enabled, return placeholder data
    if (!aiService.isEnabled() || !genAI) {
      const analysis: AudioAnalysisResult = {
        title: audioFileName.replace(/\.[^/.]+$/, ''),
        genre: 'Hip-Hop/Trap',
        mood: 'Energetic & Dark',
        duration: '2:45',
        bpm: 140,
        key: 'A minor',
      };

      const content: ContentGenerationResult[] = [
        {
          platform: 'Instagram',
          content: `New track "${analysis.title}" out now! 🔥 ${analysis.genre} vibes at ${analysis.bpm} BPM`,
          hashtags: ['#NewMusic', '#Producer', '#BeatMaker'],
        },
        {
          platform: 'Twitter/X',
          content: `Just dropped "${analysis.title}" - ${analysis.mood?.toLowerCase() || 'energetic'} ${analysis.genre} 🎵`,
          hashtags: ['#MusicProduction', '#NewBeat'],
        },
        {
          platform: 'TikTok',
          content: `${analysis.title} - ${analysis.genre} 🎶 Use this sound!`,
          hashtags: ['#Producer', '#TypeBeat', '#FYP'],
        },
      ];

      return { analysis, content };
    }

    try {
      const model = genAI.getGenerativeModel({ model: config.geminiModel! });
      
      // Generate analysis and content in one call
      const prompt = `Analyze this audio file: "${audioFileName}"
      
      Based on the filename, generate:
      1. Audio analysis with: title, genre, mood, estimated duration, BPM, and key
      2. Social media posts for Instagram, Twitter/X, and TikTok
      
      Return the response as JSON:
      {
        "analysis": {
          "title": "...",
          "genre": "...",
          "mood": "...",
          "duration": "...",
          "bpm": 140,
          "key": "..."
        },
        "content": [
          {
            "platform": "Instagram",
            "content": "...",
            "hashtags": ["#tag1", "#tag2"]
          },
          {
            "platform": "Twitter/X",
            "content": "...",
            "hashtags": ["#tag1", "#tag2"]
          },
          {
            "platform": "TikTok",
            "content": "...",
            "hashtags": ["#tag1", "#tag2"]
          }
        ]
      }`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Try to parse JSON from the response
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return parsed;
        }
      } catch (parseError) {
        console.error('Failed to parse Gemini response as JSON:', parseError);
      }
    } catch (error) {
      console.error('Gemini audio analysis error:', error);
    }

    // Fallback
    const analysis: AudioAnalysisResult = {
      title: audioFileName.replace(/\.[^/.]+$/, ''),
      genre: 'Hip-Hop/Trap',
      mood: 'Energetic & Dark',
      duration: '2:45',
      bpm: 140,
      key: 'A minor',
    };

    const content: ContentGenerationResult[] = [
      {
        platform: 'Instagram',
        content: `New track "${analysis.title}" out now! 🔥`,
        hashtags: ['#NewMusic', '#Producer', '#BeatMaker'],
      },
      {
        platform: 'Twitter/X',
        content: `Just dropped "${analysis.title}" 🎵`,
        hashtags: ['#MusicProduction', '#NewBeat'],
      },
      {
        platform: 'TikTok',
        content: `${analysis.title} 🎶 Use this sound!`,
        hashtags: ['#Producer', '#TypeBeat', '#FYP'],
      },
    ];

    return { analysis, content };
  },

  /**
   * Generate blog post content with AI
   * Uses Gemini 2.5 Flash for content generation
   */
  generateBlogContent: async (
    topic: string,
    category: string,
    targetLength: 'short' | 'medium' | 'long' = 'medium'
  ): Promise<{ title: string; excerpt: string; content: string }> => {
    if (!aiService.isEnabled() || !genAI) {
      // Return template content
      return {
        title: `The Future of ${topic} in Music Production`,
        excerpt: `An in-depth exploration of ${topic} and its impact on modern music creation.`,
        content: `# The Future of ${topic} in Music Production\n\nThis is a placeholder for AI-generated content about ${topic}.\n\n## Introduction\n\nIn today's rapidly evolving music industry, ${topic} has become increasingly important.\n\n## Key Insights\n\n1. **First insight**: Details about ${topic}\n2. **Second insight**: More information\n3. **Third insight**: Additional context\n\n## Conclusion\n\nThe future of ${topic} is bright and full of possibilities.`,
      };
    }

    try {
      const model = genAI.getGenerativeModel({ model: config.geminiModel! });
      
      const lengthGuide = {
        short: '500-800 words',
        medium: '1000-1500 words',
        long: '2000-3000 words',
      };
      
      const prompt = `Write a comprehensive blog post about "${topic}" in the ${category} category.
      
      Target length: ${lengthGuide[targetLength]}
      
      Include:
      1. An engaging title
      2. A compelling excerpt (2-3 sentences)
      3. Well-structured content with sections
      4. Practical insights and examples
      5. A strong conclusion
      
      Return the response as JSON:
      {
        "title": "...",
        "excerpt": "...",
        "content": "... (use markdown formatting)"
      }`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Try to parse JSON from the response
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return parsed;
        }
      } catch (parseError) {
        console.error('Failed to parse Gemini response as JSON:', parseError);
      }
    } catch (error) {
      console.error('Gemini blog generation error:', error);
    }

    // Fallback
    return {
      title: `The Future of ${topic} in Music Production`,
      excerpt: `An in-depth exploration of ${topic} and its impact on modern music creation.`,
      content: `# The Future of ${topic} in Music Production\n\nPlaceholder content...`,
    };
  },
};
