import { NextRequest, NextResponse } from 'next/server';
import { createInferenceEngine } from '@/lib/audio-processing/inference/engine';
import { initializeDeviceManager } from '@/lib/audio-processing/utils/device';
import { verifyMembership } from '@/lib/services/verifyMembership';
import { checkMembershipAndUsage, createMembershipErrorResponse, logSuccessfulUsage } from '@/lib/services/membershipMiddleware';

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
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const userId = formData.get('userId') as string;
    const requestedTier = (formData.get('tier') as string) || 'free';
    const format = (formData.get('format') as string) || 'wav';
    const normalize = (formData.get('normalize') as string) !== 'false';

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // For demo purposes, allow operation without userId but with limited functionality
    let tier: 'free' | 'pro' = 'free';
    let membershipInfo = null;

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

    // Validate tier
    if (tier !== 'free' && tier !== 'pro') {
      return NextResponse.json(
        { error: 'Invalid tier. Must be "free" or "pro"' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/mp4', 'audio/x-m4a', 'audio/ogg', 'audio/webm'];
    if (!validTypes.includes(audioFile.type) && !audioFile.name.match(/\.(mp3|wav|flac|m4a|ogg|webm)$/i)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload an audio file (MP3, WAV, FLAC, M4A, OGG, WEBM)' },
        { status: 400 }
      );
    }

    // Validate file size (100MB max)
    const maxSize = 100 * 1024 * 1024;
    if (audioFile.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 100MB' },
        { status: 400 }
      );
    }

    console.log(`Processing audio separation request: ${audioFile.name}, tier: ${tier}`);

    // Initialize device manager
    await initializeDeviceManager();

    // Create inference engine
    const engine = createInferenceEngine(tier as 'free' | 'pro');
    await engine.initialize();

    // NOTE: In production, decode audio file properly using Web Audio API or audio libraries
    // For Phase 1, this is a stub that assumes the file contains raw PCM data
    // Real implementation would use: AudioContext.decodeAudioData() or libraries like 'audio-decode'
    const arrayBuffer = await audioFile.arrayBuffer();
    
    // Stub: Create dummy audio data for testing
    // In production, replace with actual decoded audio
    const dummyLength = 44100 * 3; // 3 seconds
    const audioData = new Float32Array(dummyLength);
    for (let i = 0; i < audioData.length; i++) {
      audioData[i] = Math.sin(2 * Math.PI * 440 * i / 44100) * 0.5; // 440 Hz test tone
    }

    // Perform separation
    const startTime = Date.now();
    const result = await engine.separate(audioData, {
      tier: tier as 'free' | 'pro',
      outputFormat: format as 'wav' | 'mp3' | 'flac',
      sampleRate: 44100,
      normalize,
    });

    const processingTime = Date.now() - startTime;

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
      },
      device: {
        current: deviceInfo.current,
        capability: deviceInfo.capability,
      },
      membership: membershipInfo ? {
        tier: membershipInfo.tier,
        remainingUsage: userId ? await import('@/lib/services/logUsage').then(m => 
          membershipInfo.limits.stemSplitPerDay - m.countUsage(userId, 'stem_split')
        ) : undefined,
      } : undefined,
      message: `Audio separated into ${Object.keys(stems).length} stems`,
    });

  } catch (error) {
    console.error('Separation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to separate audio',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
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
