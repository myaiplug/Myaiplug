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
import { encodeToBase64WAV } from '@/lib/audio-processing/utils/audio-encoder';

/**
 * POST /api/audio/separate
 * Separates audio into stems using TF-Locoformer
 * Platform-wide entitlement system with capability-based authorization
 * 
 * Body:
 * - audio: Audio file (multipart/form-data)
 * - format: 'wav' | 'mp3' | 'flac' (default: 'wav')
 * - normalize: boolean (default: true)
 * - debug: boolean (default: false) - Enable detailed benchmark logging
 * 
 * Authentication via Authorization header (Supabase Auth)
 * 
 * Note: App Router handles body parsing automatically. The body size is
 * controlled by the Next.js config (bodySizeLimit in next.config.js).
 */
export async function POST(request: NextRequest) {
  const benchmarks: Record<string, number> = {};
  const overallStartTime = Date.now();
  
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const format = (formData.get('format') as string) || 'wav';
    const normalize = (formData.get('normalize') as string) !== 'false';
    const debug = (formData.get('debug') as string) === 'true';

    benchmarks.requestParsing = Date.now() - overallStartTime;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Resolve userId from Supabase Auth (server-side)
    // For backward compatibility, also check form data
    const authStart = Date.now();
    const userId = await getOptionalUserId(request);
    benchmarks.authResolution = Date.now() - authStart;

    // Authorization and capability check
    let authResult = null;
    let tier: 'free' | 'pro' = 'free';
    let modelVariant = '2-stem';

    if (userId) {
      const authzStart = Date.now();
      authResult = await authorizeAndConsume({
        userId,
        capabilityKey: 'stem_split',
        usageAmount: 1, // 1 job
      });
      benchmarks.authorization = Date.now() - authzStart;

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

      // Use tier and model variant from authorization
      tier = authResult.tier === 'free' ? 'free' : 'pro';
      modelVariant = authResult.modelVariant || '2-stem';
    } else {
      // No userId - allow operation with free tier for backward compatibility
      // In production, you may want to require authentication
      console.warn('No userId provided - defaulting to free tier');
    }

    // Validate file type using new audio decoder utility
    if (!isSupportedFormat(audioFile.type, audioFile.name)) {
      return NextResponse.json(
        { 
          error: 'Unsupported audio format',
          details: `The file format is not supported. Please upload one of the following formats: MP3, WAV, FLAC, M4A, OGG, or WEBM.`,
          supportedFormats: ['mp3', 'wav', 'flac', 'm4a', 'ogg', 'webm'],
        },
        { status: 400 }
      );
    }

    // Validate file size (100MB max) with detailed message
    const maxSize = 100 * 1024 * 1024;
    if (audioFile.size > maxSize) {
      const sizeMB = (audioFile.size / (1024 * 1024)).toFixed(2);
      return NextResponse.json(
        { 
          error: 'File too large',
          details: `The file size (${sizeMB} MB) exceeds the maximum allowed size of 100 MB. Please compress your audio file or split it into smaller segments.`,
          fileSize: audioFile.size,
          maxSize,
          sizeMB: parseFloat(sizeMB),
        },
        { status: 400 }
      );
    }

    // Validate file size constraints
    // Validate file size
    const sizeValidation = validateAudioConstraints(audioFile.size, undefined, tier as 'free' | 'pro');
    if (!sizeValidation.valid) {
      return NextResponse.json(
        { error: sizeValidation.error },
        { status: 400 }
      );
    }

    console.log(`Processing stem separation: ${audioFile.name}, tier: ${tier}, model: ${modelVariant}`);

    // Initialize device manager
    const deviceInitStart = Date.now();
    await initializeDeviceManager();
    benchmarks.deviceInit = Date.now() - deviceInitStart;

    // Create inference engine based on model variant
    const engineInitStart = Date.now();
    const engine = createInferenceEngine(tier);
    await engine.initialize();
    benchmarks.engineInit = Date.now() - engineInitStart;

    // Decode audio file
    // NOTE: In production, decode audio file properly using Web Audio API or audio libraries
    const decodeStart = Date.now();
    // Decode audio file using the new audio decoder
    const arrayBuffer = await audioFile.arrayBuffer();
    let audioData: Float32Array;
    let actualSampleRate: number;
    let actualDuration: number;
    
    try {
      console.log('Decoding audio file...');
      const decoded = await decodeAudioFile(arrayBuffer, 44100, true);
      audioData = decoded.audioData;
      actualSampleRate = decoded.info.sampleRate;
      actualDuration = decoded.info.duration;
      
      // Validate duration after decoding
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
    benchmarks.audioDecode = Date.now() - decodeStart;

    // Perform separation
    const separationStart = Date.now();
    const result = await engine.separate(audioData, {
      tier: tier as 'free' | 'pro',
      outputFormat: format as 'wav' | 'mp3' | 'flac',
      sampleRate: actualSampleRate,
      normalize,
    });
    benchmarks.separation = Date.now() - separationStart;

    const processingTime = Date.now() - overallStartTime;

    // Get device info
    const deviceInfo = engine.getDeviceInfo();

    // Prepare response with stem information
    const stems: Record<string, any> = {};
    const stemAudioData: Record<string, string> = {}; // For base64 encoded audio
    
    for (const [stemName, stemAudio] of result.stems) {
      stems[stemName] = {
        name: stemName,
        length: stemAudio.length,
        duration: stemAudio.length / result.sampleRate,
        // File naming: originalFilename_stemsplit_stemName.format
        filename: `${audioFile.name.replace(/\.[^.]+$/, '')}_stemsplit_${stemName}.${format}`,
        available: true,
      };
      
      // Encode audio to base64 WAV for immediate download
      // Only for 2-stem (vocals + instrumental)
      if (format === 'wav' && (stemName === 'vocals' || stemName === 'instrumental')) {
        stemAudioData[stemName] = encodeToBase64WAV(stemAudio, result.sampleRate);
      }
    }

    // Log benchmark details if debug mode is enabled
    if (debug) {
      console.log('Separation Benchmarks:', {
        ...benchmarks,
        total: processingTime,
        breakdown: {
          requestParsing: `${benchmarks.requestParsing}ms`,
          authResolution: `${benchmarks.authResolution || 0}ms`,
          authorization: `${benchmarks.authorization || 0}ms`,
          deviceInit: `${benchmarks.deviceInit}ms`,
          engineInit: `${benchmarks.engineInit}ms`,
          audioDecode: `${benchmarks.audioDecode}ms`,
          separation: `${benchmarks.separation}ms`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      jobId: `sep_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tier,
      modelVariant,
      stems,
      // Include base64 encoded audio for immediate download
      vocals: stemAudioData.vocals,
      instrumental: stemAudioData.instrumental,
      processing: {
        duration: result.duration,
        processingTime,
        device: result.device,
        supportsRealtime: engine.supportsRealtime(),
        benchmarks: debug ? benchmarks : undefined,
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
      message: `Audio separated into ${Object.keys(stems).length} stems`,
    });

  } catch (error) {
    console.error('Separation error:', error);
    
    // Provide detailed error messages based on error type
    let errorMessage = 'Failed to separate audio';
    let errorDetails = error instanceof Error ? error.message : 'Unknown error';
    let statusCode = 500;

    if (error instanceof Error) {
      // Handle specific error types
      if (error.message.includes('decode')) {
        errorMessage = 'Audio file decoding failed';
        errorDetails = 'The audio file appears to be corrupted or in an unsupported format. Please try re-encoding your audio file or use a different format.';
        statusCode = 400;
      } else if (error.message.includes('memory') || error.message.includes('Memory')) {
        errorMessage = 'Insufficient memory';
        errorDetails = 'The audio file is too large to process with available memory. Please try a shorter file or reduce the sample rate.';
        statusCode = 507;
      } else if (error.message.includes('GPU') || error.message.includes('device')) {
        errorMessage = 'Device processing error';
        errorDetails = 'There was an issue with GPU/CPU processing. The system will retry with CPU processing.';
      } else if (error.message.includes('not initialized')) {
        errorMessage = 'Inference engine not initialized';
        errorDetails = 'The audio processing engine failed to initialize. Please try again.';
      } else if (error.message.includes('Authentication required')) {
        errorMessage = 'Authentication required';
        errorDetails = 'Please provide valid authentication credentials.';
        statusCode = 401;
      }
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails,
        timestamp: new Date().toISOString(),
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
    endpoint: '/api/audio/separate',
    description: 'Separate audio into stems using TF-Locoformer',
    method: 'POST',
    contentType: 'multipart/form-data',
    authentication: 'Authorization: Bearer <supabase_token> (optional for backward compatibility)',
    parameters: {
      audio: 'Audio file (required)',
      format: '"wav" | "mp3" | "flac" (default: "wav")',
      normalize: 'boolean (default: true)',
      debug: 'boolean (default: false) - Enable benchmark logging',
    },
    tiers: {
      free: {
        stems: ['vocals', 'instrumental'],
        modelVariant: '2-stem',
        maxDuration: 180, // 3 minutes
        dailyLimit: 5,
      },
      pro: {
        stems: ['vocals', 'drums', 'bass', 'instruments', 'fx'],
        modelVariant: '5-stem',
        maxDuration: 600, // 10 minutes
        dailyLimit: 50,
      },
      vip: {
        stems: ['vocals', 'drums', 'bass', 'instruments', 'fx'],
        modelVariant: '5-stem',
        maxDuration: 3600, // 1 hour
        dailyLimit: 'unlimited',
      },
    },
    outputFileNaming: '{originalFilename}_stemsplit_{stemName}.{format}',
    entitlementSystem: 'Platform-wide capability-based authorization',
  });
}
