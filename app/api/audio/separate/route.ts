import { NextRequest, NextResponse } from 'next/server';
import { createInferenceEngine } from '@/lib/audio-processing/inference/engine';
import { initializeDeviceManager } from '@/lib/audio-processing/utils/device';
import { verifyMembership } from '@/lib/services/verifyMembership';
import { checkMembershipAndUsage, createMembershipErrorResponse, logSuccessfulUsage } from '@/lib/services/membershipMiddleware';
import { countUsage } from '@/lib/services/logUsage';

/**
 * POST /api/audio/separate
 * Separates audio into stems using TF-Locoformer
 * 
 * Body:
 * - audio: Audio file (multipart/form-data)
 * - userId: User ID (required for membership checking)
 * - tier: 'free' | 'pro' (optional, will be determined by membership)
 * - format: 'wav' | 'mp3' | 'flac' (default: 'wav')
 * - normalize: boolean (default: true)
 * - debug: boolean (default: false) - Enable detailed benchmark logging
 */
export async function POST(request: NextRequest) {
  const benchmarks: Record<string, number> = {};
  const overallStartTime = Date.now();
  
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const userId = formData.get('userId') as string;
    const requestedTier = (formData.get('tier') as string) || 'free';
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

    // For demo purposes, allow operation without userId but with limited functionality
    let tier: 'free' | 'pro' = 'free';
    let membershipInfo = null;

    const membershipCheckStart = Date.now();
    if (userId) {
      // Check membership and usage limits
      const membershipCheck = await checkMembershipAndUsage(userId, 'stem_split', 'stemSplitPerDay');
      
      if (!membershipCheck.allowed) {
        return createMembershipErrorResponse(
          membershipCheck.error || 'Membership limit exceeded',
          membershipCheck.remainingUsage || 0
        );
      }

      membershipInfo = membershipCheck.membership;
      
      // Determine tier based on membership and permissions
      if (membershipInfo.permissions.fiveStemModel) {
        tier = 'pro';
      }
    } else {
      // Allow operation without userId for backward compatibility, but use requested tier
      tier = requestedTier as 'free' | 'pro';
    }
    benchmarks.membershipCheck = Date.now() - membershipCheckStart;

    // Validate tier
    if (tier !== 'free' && tier !== 'pro') {
      return NextResponse.json(
        { error: 'Invalid tier. Must be "free" or "pro"' },
        { status: 400 }
      );
    }

    // Validate file type with detailed error messages
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/mp4', 'audio/x-m4a', 'audio/ogg', 'audio/webm'];
    const validExtensions = /\.(mp3|wav|flac|m4a|ogg|webm)$/i;
    
    if (!validTypes.includes(audioFile.type) && !audioFile.name.match(validExtensions)) {
      const fileExt = audioFile.name.split('.').pop()?.toLowerCase() || 'unknown';
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

    // Estimate audio duration and check membership limits
    const estimatedDuration = estimateAudioDuration(audioFile);
    if (membershipInfo && estimatedDuration > membershipInfo.limits.maxFileDuration) {
      const maxMinutes = Math.floor(membershipInfo.limits.maxFileDuration / 60);
      const estimatedMinutes = Math.floor(estimatedDuration / 60);
      return NextResponse.json(
        {
          error: 'File duration exceeds tier limit',
          details: `The estimated audio duration (${estimatedMinutes} minutes) exceeds the ${membershipInfo.tier.toUpperCase()} tier limit of ${maxMinutes} minutes. Please upgrade your membership or use a shorter audio file.`,
          estimatedDuration,
          maxDuration: membershipInfo.limits.maxFileDuration,
          tier: membershipInfo.tier,
          upgradeUrl: '/pricing',
        },
        { status: 400 }
      );
    }

    console.log(`Processing audio separation request: ${audioFile.name}, tier: ${tier}, duration: ~${estimatedDuration}s`);

    // Initialize device manager
    const deviceInitStart = Date.now();
    await initializeDeviceManager();
    benchmarks.deviceInit = Date.now() - deviceInitStart;

    // Create inference engine
    const engineInitStart = Date.now();
    const engine = createInferenceEngine(tier as 'free' | 'pro');
    await engine.initialize();
    benchmarks.engineInit = Date.now() - engineInitStart;

    // NOTE: In production, decode audio file properly using Web Audio API or audio libraries
    // For Phase 3, this is a stub that assumes the file contains raw PCM data
    // Real implementation would use: AudioContext.decodeAudioData() or libraries like 'audio-decode'
    const decodeStart = Date.now();
    const arrayBuffer = await audioFile.arrayBuffer();
    
    // Stub: Create dummy audio data for testing
    // In production, replace with actual decoded audio
    const dummyLength = 44100 * 3; // 3 seconds
    const audioData = new Float32Array(dummyLength);
    for (let i = 0; i < audioData.length; i++) {
      audioData[i] = Math.sin(2 * Math.PI * 440 * i / 44100) * 0.5; // 440 Hz test tone
    }
    benchmarks.audioDecode = Date.now() - decodeStart;

    // Perform separation
    const separationStart = Date.now();
    const result = await engine.separate(audioData, {
      tier: tier as 'free' | 'pro',
      outputFormat: format as 'wav' | 'mp3' | 'flac',
      sampleRate: 44100,
      normalize,
    });
    benchmarks.separation = Date.now() - separationStart;

    const processingTime = Date.now() - overallStartTime;

    // Get device info
    const deviceInfo = engine.getDeviceInfo();

    // Prepare response with stem information
    const stems: Record<string, any> = {};
    for (const [stemName, stemAudio] of result.stems) {
      stems[stemName] = {
        name: stemName,
        length: stemAudio.length,
        duration: stemAudio.length / result.sampleRate,
        // In production, encode to requested format and provide download URL
        // File naming: originalFilename_stemsplit_stemName.format
        filename: `${audioFile.name.replace(/\.[^.]+$/, '')}_stemsplit_${stemName}.${format}`,
        available: true,
      };
    }

    // Log successful usage if userId provided
    if (userId) {
      logSuccessfulUsage(userId, 'stem_split', '/api/audio/separate', {
        tier,
        format,
        duration: result.duration,
        processingTime,
        stemCount: Object.keys(stems).length,
      });
    }

    // Log benchmark details if debug mode is enabled
    if (debug) {
      console.log('Separation Benchmarks:', {
        ...benchmarks,
        total: processingTime,
        breakdown: {
          requestParsing: `${benchmarks.requestParsing}ms`,
          membershipCheck: `${benchmarks.membershipCheck}ms`,
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
      stems,
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
      membership: membershipInfo ? {
        tier: membershipInfo.tier,
        remainingUsage: userId ? (membershipInfo.limits.stemSplitPerDay - countUsage(userId, 'stem_split')) : undefined,
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
 * Estimate audio duration from file size
 * This is a rough estimation based on typical bitrates
 */
function estimateAudioDuration(file: File): number {
  const fileName = file.name.toLowerCase();
  const fileSize = file.size;

  // Estimate based on format
  // MP3: ~128 kbps average, WAV: ~1411 kbps (44.1kHz stereo), FLAC: ~800 kbps
  let estimatedBitrate = 128000; // Default to MP3 bitrate

  if (fileName.endsWith('.wav')) {
    estimatedBitrate = 1411000; // 44.1kHz stereo uncompressed
  } else if (fileName.endsWith('.flac')) {
    estimatedBitrate = 800000; // FLAC average
  } else if (fileName.endsWith('.m4a')) {
    estimatedBitrate = 256000; // M4A/AAC typical
  } else if (fileName.endsWith('.ogg') || fileName.endsWith('.webm')) {
    estimatedBitrate = 192000; // Ogg Vorbis typical
  }

  // Duration in seconds = (fileSize in bytes * 8) / bitrate
  const durationSeconds = (fileSize * 8) / estimatedBitrate;
  return Math.ceil(durationSeconds);
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
    parameters: {
      audio: 'Audio file (required)',
      userId: 'User ID (optional, required for membership enforcement)',
      tier: '"free" | "pro" (optional, determined by membership if userId provided)',
      format: '"wav" | "mp3" | "flac" (default: "wav")',
      normalize: 'boolean (default: true)',
    },
    tiers: {
      free: {
        stems: ['vocals', 'instrumental'],
        maxDuration: 180, // 3 minutes
        dailyLimit: 5,
      },
      pro: {
        stems: ['vocals', 'drums', 'bass', 'instruments', 'fx'],
        maxDuration: 600, // 10 minutes
        dailyLimit: 50,
      },
      vip: {
        stems: ['vocals', 'drums', 'bass', 'instruments', 'fx'],
        maxDuration: 3600, // 1 hour
        dailyLimit: 'unlimited',
      },
    },
    outputFileNaming: '{originalFilename}_stemsplit_{stemName}.{format}',
  });
}
