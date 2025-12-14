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
 * POST /api/audio/clean
 * Cleans audio for HalfScrew pre-FX processing
 * Platform-wide entitlement system with capability-based authorization
 * 
 * Body:
 * - audio: Audio file (multipart/form-data)
 * - format: 'wav' | 'mp3' | 'flac' (default: 'wav')
 * 
 * Authentication via Authorization header (Supabase Auth)
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const format = (formData.get('format') as string) || 'wav';

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
        capabilityKey: 'audio_clean',
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

    // Validate file type
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/mp4', 'audio/x-m4a', 'audio/ogg', 'audio/webm'];
    const validExtensions = /\.(mp3|wav|flac|m4a|ogg|webm)$/i;
    
    if (!validTypes.includes(audioFile.type) && !audioFile.name.match(validExtensions)) {
      const fileExt = audioFile.name.split('.').pop()?.toLowerCase() || 'unknown';
    if (!isSupportedFormat(audioFile.type, audioFile.name)) {
      return NextResponse.json(
        { 
          error: 'Unsupported audio format',
          details: `The file format '.${fileExt}' is not supported. Please upload one of the following formats: MP3, WAV, FLAC, M4A, OGG, or WEBM.`,
          supportedFormats: ['mp3', 'wav', 'flac', 'm4a', 'ogg', 'webm'],
          detectedFormat: fileExt,
        },
        { status: 400 }
      );
    }

    // Validate file size (100MB max)
    const maxSize = 100 * 1024 * 1024;
    if (audioFile.size > maxSize) {
      const sizeMB = (audioFile.size / (1024 * 1024)).toFixed(2);
      return NextResponse.json(
        { 
          error: 'File too large',
          details: `The file size (${sizeMB} MB) exceeds the maximum allowed size of 100 MB.`,
          fileSize: audioFile.size,
          maxSize,
          sizeMB: parseFloat(sizeMB),
        },
    // Validate file size
    const sizeValidation = validateAudioConstraints(audioFile.size, undefined, tier as 'free' | 'pro');
    if (!sizeValidation.valid) {
      return NextResponse.json(
        { error: sizeValidation.error },
        { status: 400 }
      );
    }

    console.log(`Processing audio cleaning: ${audioFile.name}, tier: ${tier}`);

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

    // Perform cleaning
    const startTime = Date.now();
    const cleanedAudio = await engine.clean(audioData, {
      tier: tier as 'free' | 'pro',
      outputFormat: format as 'wav' | 'mp3' | 'flac',
      sampleRate: actualSampleRate,
      normalize: true,
    });

    const processingTime = Date.now() - startTime;

    // Get device info
    const deviceInfo = engine.getDeviceInfo();

    return NextResponse.json({
      success: true,
      jobId: `clean_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tier,
      output: {
        length: cleanedAudio.length,
        duration: cleanedAudio.length / 44100,
        format,
        filename: `${audioFile.name.replace(/\.[^.]+$/, '')}_clean.${format}`,
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
      entitlement: authResult ? {
        tier: authResult.tier,
        remainingUsage: authResult.remainingUsage,
        allowAsync: authResult.allowAsync,
      } : undefined,
      message: 'Audio cleaned successfully for HalfScrew pre-FX',
    });

  } catch (error) {
    console.error('Cleaning error:', error);
    
    let errorMessage = 'Failed to clean audio';
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
 * GET endpoint for API information
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/audio/clean',
    description: 'Clean audio for HalfScrew pre-FX processing',
    purpose: 'Removes noise and artifacts while preserving the main signal',
    method: 'POST',
    contentType: 'multipart/form-data',
    authentication: 'Authorization: Bearer <supabase_token> (optional)',
    parameters: {
      audio: 'Audio file (required)',
      format: '"wav" | "mp3" | "flac" (default: "wav")',
    },
    limits: {
      free: {
        dailyLimit: 10,
        maxDuration: 180, // 3 minutes
      },
      pro: {
        dailyLimit: 100,
        maxDuration: 600, // 10 minutes
      },
      vip: {
        dailyLimit: 'unlimited',
        maxDuration: 3600, // 1 hour
      },
    },
    use_cases: [
      'Pre-processing for HalfScrew effects',
      'Noise reduction',
      'Artifact removal',
      'Signal cleanup before time-stretching',
    ],
    entitlementSystem: 'Platform-wide capability-based authorization',
  });
}
