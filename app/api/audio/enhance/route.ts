import { NextRequest, NextResponse } from 'next/server';
import { createInferenceEngine } from '@/lib/audio-processing/inference/engine';
import { initializeDeviceManager } from '@/lib/audio-processing/utils/device';
import { authorizeAndConsume } from '@/lib/services/entitlements';
import { getOptionalUserId } from '@/lib/services/auth';
import { 
  decodeAudioFile, 
  isSupportedFormat, 
  validateAudioConstraints 
} from '@/lib/audio-processing/utils/audio-decoder';

/**
 * POST /api/audio/enhance
 * Enhances audio for NoDAW polish
 * Platform-wide entitlement system with capability-based authorization
 * 
 * Body:
 * - audio: Audio file (multipart/form-data)
 * - format: 'wav' | 'mp3' | 'flac' (default: 'wav')
 * - enhancementLevel: 'subtle' | 'moderate' | 'aggressive' (default: 'moderate')
 * 
 * Authentication via Authorization header (Supabase Auth)
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const format = (formData.get('format') as string) || 'wav';
    const enhancementLevel = (formData.get('enhancementLevel') as string) || 'moderate';

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Resolve userId from Supabase Auth
    const userId = await getOptionalUserId(request);

    // Authorization check
    let authResult = null;
    let tier: 'free' | 'pro' = 'free';

    if (userId) {
      authResult = await authorizeAndConsume({
        userId,
        capabilityKey: 'audio_enhance',
        usageAmount: 1,
      });

      if (!authResult.allowed) {
        return NextResponse.json(
          {
            error: authResult.error,
            tier: authResult.tier,
            remainingUsage: authResult.remainingUsage,
            upgradeUrl: authResult.upgradeUrl,
            capabilityName: authResult.capabilityName,
          },
          { status: 429 }
        );
      }

      tier = authResult.tier === 'free' ? 'free' : 'pro';
    }

    // Validate enhancement level
    const validLevels = ['subtle', 'moderate', 'aggressive'];
    if (!validLevels.includes(enhancementLevel)) {
      return NextResponse.json(
        { error: `Invalid enhancement level. Must be one of: ${validLevels.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate file type
    if (!isSupportedFormat(audioFile.type, audioFile.name)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload an audio file (MP3, WAV, FLAC, M4A, OGG, WEBM)' },
        { status: 400 }
      );
    }

    // Validate file size
    const sizeValidation = validateAudioConstraints(audioFile.size, undefined, tier as 'free' | 'pro');
    if (!sizeValidation.valid) {
      return NextResponse.json(
        { error: sizeValidation.error },
        { status: 400 }
      );
    }

    console.log(`Processing audio enhancement: ${audioFile.name}, tier: ${tier}, level: ${enhancementLevel}`);

    // Initialize device manager
    await initializeDeviceManager();

    // Create inference engine
    const engine = createInferenceEngine(tier as 'free' | 'pro');
    await engine.initialize();

    // Decode audio file
    const arrayBuffer = await audioFile.arrayBuffer();
    let audioData: Float32Array;
    let actualSampleRate: number;
    let actualDuration: number;
    
    // NOTE: Phase stub - create test audio data
    const dummyLength = 44100 * 3;
    const audioData = new Float32Array(dummyLength);
    for (let i = 0; i < audioData.length; i++) {
      audioData[i] = Math.sin(2 * Math.PI * 440 * i / 44100) * 0.5;
    try {
      console.log('Decoding audio file...');
      const decoded = await decodeAudioFile(arrayBuffer, 44100, true);
      audioData = decoded.audioData;
      actualSampleRate = decoded.info.sampleRate;
      actualDuration = decoded.info.duration;
      
      // Validate duration
      const durationValidation = validateAudioConstraints(
        audioFile.size, 
        actualDuration, 
        tier as 'free' | 'pro'
      );
      if (!durationValidation.valid) {
        return NextResponse.json(
          { error: durationValidation.error },
          { status: 400 }
        );
      }
      
      console.log(`Decoded ${actualDuration.toFixed(2)}s of audio at ${actualSampleRate}Hz`);
    } catch (decodeError) {
      console.error('Audio decoding error:', decodeError);
      return NextResponse.json(
        { 
          error: 'Failed to decode audio file',
          details: decodeError instanceof Error ? decodeError.message : 'Unknown error'
        },
        { status: 400 }
      );
    }

    // Perform enhancement
    const startTime = Date.now();
    const enhancedAudio = await engine.enhance(audioData, {
      tier: tier as 'free' | 'pro',
      outputFormat: format as 'wav' | 'mp3' | 'flac',
      sampleRate: actualSampleRate,
      normalize: true,
    });

    const processingTime = Date.now() - startTime;

    // Get device info
    const deviceInfo = engine.getDeviceInfo();

    // Calculate quality metrics
    const qualityMetrics = calculateQualityMetrics(audioData, enhancedAudio);

    return NextResponse.json({
      success: true,
      jobId: `enhance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tier,
      enhancementLevel,
      output: {
        length: enhancedAudio.length,
        duration: enhancedAudio.length / 44100,
        format,
        filename: `${audioFile.name.replace(/\.[^.]+$/, '')}_enhanced.${format}`,
        available: true,
      },
      processing: {
        processingTime,
        device: deviceInfo.current?.name || 'Unknown',
        supportsRealtime: engine.supportsRealtime(),
      },
      device: {
        current: deviceInfo.current,
        capability: deviceInfo.capability,
      },
      quality: qualityMetrics,
      entitlement: authResult ? {
        tier: authResult.tier,
        remainingUsage: authResult.remainingUsage,
        allowAsync: authResult.allowAsync,
      } : undefined,
      message: 'Audio enhanced successfully for NoDAW polish',
    });

  } catch (error) {
    console.error('Enhancement error:', error);
    
    let errorMessage = 'Failed to enhance audio';
    let errorDetails = error instanceof Error ? error.message : 'Unknown error';
    let statusCode = 500;

    if (error instanceof Error && error.message.includes('Authentication required')) {
      errorMessage = 'Authentication required';
      errorDetails = 'Please provide valid authentication credentials.';
      statusCode = 401;
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails,
      },
      { status: statusCode }
    );
  }
}

/**
 * Calculate quality metrics comparing original and enhanced audio
 */
function calculateQualityMetrics(
  original: Float32Array,
  enhanced: Float32Array
): { snr: number; rmsGain: number; dynamicRange: number } {
  // Signal-to-noise ratio (simplified)
  let originalRms = 0;
  let enhancedRms = 0;
  
  for (let i = 0; i < Math.min(original.length, enhanced.length); i++) {
    originalRms += original[i] * original[i];
    enhancedRms += enhanced[i] * enhanced[i];
  }
  
  originalRms = Math.sqrt(originalRms / original.length);
  enhancedRms = Math.sqrt(enhancedRms / enhanced.length);
  
  const snr = 20 * Math.log10(enhancedRms / (originalRms + 1e-10));
  const rmsGain = enhancedRms / (originalRms + 1e-10);
  
  // Dynamic range
  let maxVal = 0;
  let minVal = 0;
  
  for (let i = 0; i < enhanced.length; i++) {
    maxVal = Math.max(maxVal, enhanced[i]);
    minVal = Math.min(minVal, enhanced[i]);
  }
  
  const dynamicRange = 20 * Math.log10((maxVal - minVal) / 2);
  
  return {
    snr: Number(snr.toFixed(2)),
    rmsGain: Number(rmsGain.toFixed(2)),
    dynamicRange: Number(dynamicRange.toFixed(2)),
  };
}

/**
 * GET endpoint for API information
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/audio/enhance',
    description: 'Enhance audio for NoDAW polish',
    purpose: 'Separates and remixes stems with optimized levels for professional sound',
    method: 'POST',
    contentType: 'multipart/form-data',
    authentication: 'Authorization: Bearer <supabase_token> (optional)',
    parameters: {
      audio: 'Audio file (required)',
      format: '"wav" | "mp3" | "flac" (default: "wav")',
      enhancementLevel: '"subtle" | "moderate" | "aggressive" (default: "moderate")',
    },
    limits: {
      free: {
        dailyLimit: 10,
        maxDuration: 180,
      },
      pro: {
        dailyLimit: 100,
        maxDuration: 600,
      },
      vip: {
        dailyLimit: 'unlimited',
        maxDuration: 3600,
      },
    },
    entitlementSystem: 'Platform-wide capability-based authorization',
  });
}
