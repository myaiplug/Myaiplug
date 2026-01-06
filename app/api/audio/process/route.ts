import { NextRequest, NextResponse } from 'next/server';
import { getUserBySession } from '@/lib/services/userService';
import { createJob, simulateJobProcessing } from '@/lib/services/jobService';
import { getUserCredits } from '@/lib/services/referralService';
import { checkRateLimit, RATE_LIMITS } from '@/lib/services/antiAbuseService';
import { calculateJobCost } from '@/lib/constants/pricing';
import type { JobType } from '@/lib/types';
import { generateSecureId } from '@/lib/utils/secureId';

// NOTE: In-memory storage for demo/development purposes
// In production, replace with persistent storage (database, cloud storage)
// This data will be lost on server restarts and won't work in serverless environments
const processedFilesStore = new Map<string, {
  originalFileName: string;
  processedAt: Date;
  downloadUrl: string;
  preset: string;
  userId: string;
  jobId: string;
  tokensUsed: number;
}>();

// Token usage log (demo only - use database in production)
const tokenUsageLog: Array<{
  userId: string;
  jobId: string;
  tokensUsed: number;
  jobType: JobType;
  timestamp: Date;
  preset?: string;
}> = [];

// Preset configurations for one-click processing
const PRESET_CONFIGS: Record<string, {
  name: string;
  jobType: JobType;
  description: string;
  modules: string[];
}> = {
  'warmth-master': {
    name: 'Warmth Master',
    jobType: 'audio_basic',
    description: 'Professional warmth and clarity',
    modules: ['Warmth', 'HalfScrew', 'EQ3'],
  },
  'vocal-polish': {
    name: 'Vocal Polish',
    jobType: 'audio_pro',
    description: 'Perfect for vocals and podcasts',
    modules: ['Warmth', 'Stereo Widener', 'EQ3', 'Reverb Lite'],
  },
  'bass-heavy': {
    name: 'Bass Heavy',
    jobType: 'audio_basic',
    description: 'Deep bass with controlled highs',
    modules: ['Warmth', 'EQ3'],
  },
  'stereo-wide': {
    name: 'Stereo Wide',
    jobType: 'audio_basic',
    description: 'Maximum stereo width',
    modules: ['Stereo Widener', 'EQ3', 'Reverb Lite'],
  },
  'lo-fi-vibe': {
    name: 'Lo-Fi Vibe',
    jobType: 'audio_basic',
    description: 'Vintage tape aesthetics',
    modules: ['Warmth', 'HalfScrew', 'EQ3'],
  },
  'broadcast-ready': {
    name: 'Broadcast Ready',
    jobType: 'audio_pro',
    description: 'Radio-ready professional sound',
    modules: ['Warmth', 'Stereo Widener', 'reTUNE 432', 'EQ3'],
  },
};

/**
 * Process audio with a preset chain
 */
export async function POST(request: NextRequest) {
  try {
    // Get content type to determine how to parse the request
    const contentType = request.headers.get('content-type') || '';
    
    let file: File | null = null;
    let preset: string = '';
    
    // Parse based on content type
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      file = formData.get('audio') as File;
      preset = (formData.get('preset') as string) || 'warmth-master';
    } else {
      // Handle case where content type is not multipart
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid content type. Use multipart/form-data with audio file.' 
        },
        { status: 400 }
      );
    }
    
    // Get session token from Authorization header (secure approach)
    let sessionToken: string | null = null;
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      sessionToken = authHeader.substring(7);
    }

    // Validate file
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No audio file provided' },
        { status: 400 }
      );
import { calculateJobCost } from '@/lib/constants/pricing';
import { TIME_SAVED_BASELINES, POINT_EVENTS } from '@/lib/constants/gamification';
import { awardPoints } from '@/lib/services/pointsEngine';
import { createJob, completeJob } from '@/lib/services/jobService';
import { updateProfileStats } from '@/lib/services/userService';

// Simulated audio analysis function
function analyzeAudio(fileName: string, fileSize: number) {
  const genres = ['Hip-Hop/Trap', 'Electronic', 'Pop', 'Rock', 'R&B', 'Jazz', 'Classical'];
  const moods = ['Energetic & Dark', 'Chill & Relaxing', 'Upbeat & Happy', 'Melancholic', 'Aggressive', 'Ambient'];
  
  const genreIndex = fileSize % genres.length;
  const moodIndex = (fileSize * 2) % moods.length;
  
  const durationSeconds = 150 + (fileSize % 180);
  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;
  
  return {
    title: fileName.replace(/\.[^/.]+$/, ''),
    genre: genres[genreIndex],
    mood: moods[moodIndex],
    duration: `${minutes}:${seconds.toString().padStart(2, '0')}`,
    bpm: 120 + (fileSize % 60),
    key: ['C', 'D', 'E', 'F', 'G', 'A', 'B'][fileSize % 7] + [' Major', ' Minor'][fileSize % 2],
  };
}

// Apply audio effects (simulated)
function applyAudioEffects(effects: string[]): { 
  effectsApplied: string[];
  effectsDescription: string;
  qualityMetrics: {
    noiseReduction?: string;
    loudnessLUFS?: number;
    bassEnhancement?: string;
  };
} {
  const effectsApplied: string[] = [];
  const qualityMetrics: any = {};
  
  if (effects.includes('clean')) {
    effectsApplied.push('Audio Cleaning');
    qualityMetrics.noiseReduction = '85% noise reduction, artifacts removed';
  }
  
  if (effects.includes('loudness')) {
    effectsApplied.push('Loudness Normalization');
    qualityMetrics.loudnessLUFS = -14.0; // Spotify standard
  }
  
  if (effects.includes('bass_boost')) {
    effectsApplied.push('Bass Boost');
    qualityMetrics.bassEnhancement = '+6dB boost at 60-120Hz, no clipping';
  }
  
  const effectsDescription = effectsApplied.length > 0 
    ? effectsApplied.join(', ')
    : 'No effects applied';
  
  return { effectsApplied, effectsDescription, qualityMetrics };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('audio') as File;
    const preset = formData.get('preset') as string || 'basic_chain';
    const effectsJson = formData.get('effects') as string || '[]';
    
    if (!file) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Parse effects
    let effects: string[] = [];
    try {
      effects = JSON.parse(effectsJson);
    } catch (e) {
      console.warn('Failed to parse effects, using default');
      effects = ['clean'];
    }

    // Validate file type
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/mp4', 'audio/x-m4a', 'audio/ogg', 'audio/webm'];
    const validExtensions = /\.(mp3|wav|flac|m4a|ogg|webm)$/i;
    
    if (!validTypes.includes(file.type) && !file.name.match(validExtensions)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Supported: MP3, WAV, FLAC, M4A, OGG, WebM' },
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|flac|m4a|ogg|webm)$/i)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload an audio file (MP3, WAV, FLAC, M4A, OGG, WEBM)' },
        { status: 400 }
      );
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 50MB.' },
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 50MB' },
        { status: 400 }
      );
    }

    // Validate preset
    const presetConfig = PRESET_CONFIGS[preset];
    if (!presetConfig) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid preset. Available: ${Object.keys(PRESET_CONFIGS).join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Estimate duration (roughly 10 bytes per millisecond for compressed audio)
    const estimatedDurationSec = Math.ceil(file.size / 10000);
    const durationMinutes = estimatedDurationSec / 60;

    // Calculate token cost
    const tokenCost = calculateJobCost(presetConfig.jobType, durationMinutes);

    // Check authentication (optional - allow guest processing with limited features)
    // Generate cryptographically secure guest ID to prevent prediction
    let userId = generateSecureId('guest_');
    let userCredits = { balance: 100 }; // Guest gets limited credits
    let isAuthenticated = false;

    // Get client IP for guest rate limiting
    const forwardedFor = request.headers.get('x-forwarded-for');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';

    if (sessionToken) {
      const authResult = await getUserBySession(sessionToken);
      if (authResult) {
        userId = authResult.user.id;
        userCredits = getUserCredits(userId);
        isAuthenticated = true;

        // Rate limiting for authenticated users
        const rateLimit = checkRateLimit(
          `audio_process_${userId}`,
          RATE_LIMITS.JOB_CREATE.max,
          RATE_LIMITS.JOB_CREATE.window
        );

        if (!rateLimit.allowed) {
          return NextResponse.json(
            { success: false, error: 'Rate limit exceeded. Please wait before processing more files.' },
            { status: 429 }
          );
        }
      }
    } else {
      // Rate limiting for guest users based on IP
      // Guests get fewer requests per window than authenticated users
      const guestRateLimit = checkRateLimit(
        `guest_audio_process_${clientIp}`,
        Math.floor(RATE_LIMITS.JOB_CREATE.max / 3), // 1/3 of normal rate limit
        RATE_LIMITS.JOB_CREATE.window
      );

      if (!guestRateLimit.allowed) {
        return NextResponse.json(
          { success: false, error: 'Guest rate limit exceeded. Sign up for more access.' },
          { status: 429 }
        );
      }
    }

    // Check credits balance
    if (userCredits.balance < tokenCost) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Insufficient credits',
          required: tokenCost,
          available: userCredits.balance,
          topUpUrl: '/stripe'
        },
        { status: 402 }
      );
    }

    // Create job record
    const job = await createJob({
      userId,
      type: presetConfig.jobType,
      inputDurationSec: estimatedDurationSec,
      tier: isAuthenticated ? 'free' : 'free', // Would get from user in production
      inputUrl: file.name,
    });

    // Log token usage
    tokenUsageLog.push({
      userId,
      jobId: job.id,
      tokensUsed: tokenCost,
      jobType: presetConfig.jobType,
      timestamp: new Date(),
      preset,
    });

    // Simulate processing (in production, this would be actual audio processing)
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Complete the job
    const jobResult = await simulateJobProcessing(job.id);

    // Generate download URL (in production, would be a real cloud storage URL)
    const processedFileId = generateSecureId('processed_');
    const downloadUrl = `/api/audio/download/${processedFileId}`;

    // Store processed file info
    processedFilesStore.set(processedFileId, {
      originalFileName: file.name,
      processedAt: new Date(),
      downloadUrl,
      preset,
      userId,
      jobId: job.id,
      tokensUsed: tokenCost,
    });

    // Return success with all details
    return NextResponse.json({
      success: true,
      job: {
        id: job.id,
        status: jobResult?.job.status || 'done',
        preset: presetConfig.name,
        modules: presetConfig.modules,
      },
      processing: {
        tokensUsed: tokenCost,
        remainingCredits: userCredits.balance - tokenCost,
        estimatedDuration: `${Math.floor(estimatedDurationSec / 60)}:${(estimatedDurationSec % 60).toString().padStart(2, '0')}`,
        timeSaved: jobResult?.job.timeSavedSec ? `${Math.floor(jobResult.job.timeSavedSec / 60)} minutes` : 'N/A',
      },
      download: {
        url: downloadUrl,
        fileName: `${file.name.replace(/\.[^/.]+$/, '')}_${preset}.wav`,
        expiresIn: '24 hours',
      },
      points: jobResult?.pointsAwarded || 0,
      message: `Audio processed successfully with ${presetConfig.name} preset`,
    });

  } catch (error) {
    console.error('Audio processing error:', error);
    
    // Return proper JSON error
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to process audio file',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Analyze audio
    const audioAnalysis = analyzeAudio(file.name, file.size);
    
    // Apply effects
    const { effectsApplied, effectsDescription, qualityMetrics } = applyAudioEffects(effects);

    // Calculate duration and credits
    const durationSeconds = 180; // Simulate 3 minute audio
    const durationMinutes = durationSeconds / 60;
    const creditsCharged = calculateJobCost('audio_processing', durationMinutes);
    const timeSavedMinutes = TIME_SAVED_BASELINES.audio_processing;

    // Generate job ID
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // In a real implementation with authentication:
    // TODO: Replace with actual authentication system
    // 1. Get userId from session/token (e.g., from cookies or Authorization header)
    // 2. Verify user is authenticated
    // 3. Check user has enough credits in their account
    // 4. Deduct credits from user account atomically
    // 5. Create job record in database
    // 6. Award points via pointsEngine service
    // 7. Update leaderboard via leaderboardService
    // 8. Return job ID for tracking
    
    // For demo purposes with in-memory storage, we simulate these operations
    const userId = 'demo_user'; // In production, get from req.headers.authorization or session
    
    // Award points using gamification constants
    // Points for job completion based on processing time
    const pointsAwarded = POINT_EVENTS.JOB_MEDIUM; // 200 points for medium job (audio processing)
    
    // Determine badge based on effects applied (simulated)
    const badgeEarned = effects.length >= 3 ? 'Audio Master' : 'Audio Processor I';

    // Prepare response
    const response = {
      success: true,
      jobId,
      fileName: file.name,
      fileSize: file.size,
      preset,
      effects: effectsApplied,
      effectsDescription,
      qualityMetrics,
      audioAnalysis,
      creditsCharged,
      timeSavedMinutes,
      pointsAwarded,
      badgeEarned,
      message: `Audio processed successfully with ${effectsApplied.length} effect(s): ${effectsDescription}`,
      processedFileUrl: `processed_${file.name}`, // In production, this would be a real URL
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Audio processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process audio file' },
      { status: 500 }
    );
  }
}

/**
 * Get available presets and token costs
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const durationSec = parseInt(searchParams.get('duration') || '180');
    const durationMinutes = durationSec / 60;

    // Calculate costs for all presets
    const presetsWithCosts = Object.entries(PRESET_CONFIGS).map(([id, config]) => ({
      id,
      ...config,
      tokenCost: calculateJobCost(config.jobType, durationMinutes),
    }));

    return NextResponse.json({
      success: true,
      presets: presetsWithCosts,
      estimatedDuration: durationSec,
      message: 'Available presets with estimated token costs',
    });

  } catch (error) {
    console.error('Get presets error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get presets' },
      { status: 500 }
    );
  }
// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    message: 'Audio processing API endpoint',
    methods: ['POST'],
    accepts: 'multipart/form-data',
    fields: {
      audio: 'Audio file (required)',
      preset: 'Preset ID (optional, default: basic_chain)',
      effects: 'JSON array of effect IDs (optional, e.g., ["clean", "loudness", "bass_boost"])',
    },
    availableEffects: [
      {
        id: 'clean',
        name: 'Clean Audio',
        description: 'Remove noise, artifacts, and unwanted sounds',
      },
      {
        id: 'loudness',
        name: 'Spotify Loudness',
        description: 'Normalize to -14 LUFS (Spotify standard)',
      },
      {
        id: 'bass_boost',
        name: 'Bass Boost',
        description: 'Enhanced bass without distortion or clipping',
      },
    ],
  });
}
