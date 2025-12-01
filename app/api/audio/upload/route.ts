import { NextRequest, NextResponse } from 'next/server';
import { getUserBySession } from '@/lib/services/userService';
import { createJob, simulateJobProcessing } from '@/lib/services/jobService';
import { getUserCredits } from '@/lib/services/referralService';
import { checkRateLimit, RATE_LIMITS } from '@/lib/services/antiAbuseService';
import { generateSecureId } from '@/lib/utils/secureId';

// Token usage tracking
interface TokenUsageEntry {
  userId: string;
  action: string;
  tokensUsed: number;
  timestamp: Date;
  details?: Record<string, unknown>;
}

const tokenUsageLog: TokenUsageEntry[] = [];

// Log token usage (internal function)
function logTokenUsage(entry: TokenUsageEntry): void {
  tokenUsageLog.push(entry);
  console.log(`[Token Usage] User: ${entry.userId}, Action: ${entry.action}, Tokens: ${entry.tokensUsed}`);
}

// Simulated audio analysis function
// In production, this would integrate with actual audio processing libraries
function analyzeAudio(fileName: string, fileSize: number) {
  // Simulate analysis based on file properties
  const genres = ['Hip-Hop/Trap', 'Electronic', 'Pop', 'Rock', 'R&B', 'Jazz', 'Classical'];
  const moods = ['Energetic & Dark', 'Chill & Relaxing', 'Upbeat & Happy', 'Melancholic', 'Aggressive', 'Ambient'];
  
  // Use file size to create some variation in the demo
  const genreIndex = fileSize % genres.length;
  const moodIndex = (fileSize * 2) % moods.length;
  
  // Simulate duration (in practice, would be extracted from audio file)
  const durationSeconds = 150 + (fileSize % 180);
  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;
  
  return {
    title: fileName.replace(/\.[^/.]+$/, ''),
    genre: genres[genreIndex],
    mood: moods[moodIndex],
    duration: `${minutes}:${seconds.toString().padStart(2, '0')}`,
    durationSeconds,
    bpm: 120 + (fileSize % 60),
    key: ['C', 'D', 'E', 'F', 'G', 'A', 'B'][fileSize % 7] + [' Major', ' Minor'][fileSize % 2],
  };
}

// Generate platform-specific content based on audio analysis
function generateSocialContent(analysis: ReturnType<typeof analyzeAudio>) {
  return [
    {
      platform: 'Instagram',
      content: `🔥 New heat alert! Just dropped "${analysis.title}" - this one hits different 🎵\n\nGenre: ${analysis.genre}\nMood: ${analysis.mood}\nBPM: ${analysis.bpm}\n\nFull track streaming now 👆`,
      hashtags: ['#NewMusic', '#' + analysis.genre.split('/')[0].replace(/\s+/g, ''), '#Producer', '#MusicProduction', '#IndieArtist'],
    },
    {
      platform: 'Twitter/X',
      content: `New track "${analysis.title}" out now 🔊\n\n${analysis.mood} vibes at ${analysis.bpm} BPM in ${analysis.key}.\n\nStream link below 👇`,
      hashtags: ['#NewRelease', '#IndieMusic', '#MusicIsLife'],
    },
    {
      platform: 'TikTok',
      content: `POV: You just discovered your new favorite ${analysis.genre.toLowerCase()} song 🎧✨\n\n"${analysis.title}" available everywhere!\n\n${analysis.mood} | ${analysis.bpm} BPM | ${analysis.key}`,
      hashtags: ['#FYP', '#NewMusic', '#MusicTikTok', '#Viral', '#Producer', '#' + analysis.genre.split('/')[0].replace(/\s+/g, '')],
    },
    {
      platform: 'YouTube',
      content: `🎵 ${analysis.title} | Official Audio\n\nExperience the ${analysis.mood.toLowerCase()} energy of this ${analysis.genre.toLowerCase()} track. Perfect for your workout, gaming session, or just vibing.\n\n🎹 Key: ${analysis.key}\n🥁 BPM: ${analysis.bpm}\n⏱️ Duration: ${analysis.duration}\n\n🎧 Stream on all platforms\n📱 Follow for more music\n💬 Drop a comment and let me know what you think!\n\n#NewMusic #${analysis.genre.split('/')[0].replace(/\s+/g, '')} #IndieArtist #MusicProduction`,
      hashtags: [],
    },
    {
      platform: 'Facebook',
      content: `🎶 New Release Alert! 🎶\n\nI'm excited to share my latest track "${analysis.title}" with you all! This ${analysis.genre} track came together beautifully, and I can't wait for you to hear it.\n\n✨ Mood: ${analysis.mood}\n🎵 Key: ${analysis.key}\n⚡ BPM: ${analysis.bpm}\n⏱️ ${analysis.duration}\n\nLink in bio to stream everywhere! Let me know what you think in the comments.\n\n#NewMusic #${analysis.genre.split('/')[0].replace(/\s+/g, '')} #MusicProduction #IndependentArtist`,
      hashtags: [],
    },
  ];
}

export async function POST(request: NextRequest) {
  try {
    // Validate content type
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { success: false, error: 'Invalid content type. Expected multipart/form-data.' },
        { status: 400 }
      );
    }

    let formData;
    try {
      formData = await request.formData();
    } catch (parseError) {
      console.error('Form data parse error:', parseError);
      return NextResponse.json(
        { success: false, error: 'Failed to parse form data. Ensure the request is properly formatted.' },
        { status: 400 }
      );
    }

    const file = formData.get('audio') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No audio file provided. Use "audio" field in form data.' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/mp4', 'audio/x-m4a', 'audio/ogg', 'audio/webm'];
    const validExtensions = /\.(mp3|wav|flac|m4a|ogg|webm)$/i;
    
    if (!validTypes.includes(file.type) && !file.name.match(validExtensions)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Supported formats: MP3, WAV, FLAC, M4A, OGG, WebM' },
        { status: 400 }
      );
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 50MB.' },
        { status: 400 }
      );
    }

    // Check for authentication (optional - for token tracking)
    // Generate cryptographically secure guest ID to prevent prediction
    let userId = generateSecureId('guest_');
    let isAuthenticated = false;
    const authHeader = request.headers.get('authorization');
    
    if (authHeader?.startsWith('Bearer ')) {
      const sessionToken = authHeader.substring(7);
      const authResult = await getUserBySession(sessionToken);
      if (authResult) {
        userId = authResult.user.id;
        isAuthenticated = true;

        // Rate limiting for authenticated users
        const rateLimit = checkRateLimit(
          `audio_upload_${userId}`,
          RATE_LIMITS.JOB_CREATE.max,
          RATE_LIMITS.JOB_CREATE.window
        );

        if (!rateLimit.allowed) {
          return NextResponse.json(
            { success: false, error: 'Rate limit exceeded. Please wait before uploading more files.' },
            { status: 429 }
          );
        }
      }
    }

    // Calculate token cost for analysis (10 tokens base)
    const analysisCost = 10;

    // Log token usage
    logTokenUsage({
      userId,
      action: 'audio_analysis',
      tokensUsed: analysisCost,
      timestamp: new Date(),
      details: {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      },
    });

    // Simulate processing delay (in production, this would be actual audio processing)
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Analyze audio and generate content
    const audioAnalysis = analyzeAudio(file.name, file.size);
    const generatedContent = generateSocialContent(audioAnalysis);

    // Create a job record for tracking
    let job = null;
    if (isAuthenticated) {
      try {
        job = await createJob({
          userId,
          type: 'audio_basic',
          inputDurationSec: audioAnalysis.durationSeconds,
          tier: 'free',
          inputUrl: file.name,
        });
        
        // Simulate job completion
        await simulateJobProcessing(job.id);
      } catch (jobError) {
        console.error('Job creation error:', jobError);
        // Continue without job - not critical for upload
      }
    }

    // Generate download URL
    const processedId = generateSecureId('upload_');
    const downloadUrl = `/api/audio/download/${processedId}`;

    // Get credits info if authenticated
    let credits = null;
    if (isAuthenticated) {
      const userCredits = getUserCredits(userId);
      credits = {
        used: analysisCost,
        remaining: userCredits.balance - analysisCost,
      };
    }

    return NextResponse.json({
      success: true,
      audioAnalysis,
      generatedContent,
      job: job ? {
        id: job.id,
        status: 'done',
      } : null,
      download: {
        url: downloadUrl,
        fileName: `${audioAnalysis.title}_processed.wav`,
        expiresIn: '24 hours',
      },
      tokens: {
        used: analysisCost,
        credits,
      },
      message: 'Audio processed successfully',
    });

  } catch (error) {
    console.error('Audio processing error:', error);
    
    // Always return valid JSON
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to process audio file',
        hint: 'Ensure the file is a valid audio format and under 50MB.'
      },
      { status: 500 }
    );
  }
}

// GET endpoint for testing and status
export async function GET() {
  // Return API info
  return NextResponse.json({
    success: true,
    message: 'Audio upload API endpoint',
    methods: ['POST'],
    accepts: 'multipart/form-data with "audio" field',
    supportedFormats: ['MP3', 'WAV', 'FLAC', 'M4A', 'OGG', 'WebM'],
    maxSize: '50MB',
    features: [
      'Audio analysis (genre, mood, BPM, key)',
      'Social media content generation',
      'Token usage tracking',
      'Job creation for authenticated users',
      'Download URL generation',
    ],
  });
}
