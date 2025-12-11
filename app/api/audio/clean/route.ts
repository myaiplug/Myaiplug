import { NextRequest, NextResponse } from 'next/server';
import { createInferenceEngine } from '@/lib/audio-processing/inference/engine';
import { initializeDeviceManager } from '@/lib/audio-processing/utils/device';
import { 
  decodeAudioFile, 
  isSupportedFormat, 
  validateAudioConstraints 
} from '@/lib/audio-processing/utils/audio-decoder';

/**
 * POST /api/audio/clean
 * Cleans audio for HalfScrew pre-FX processing
 * Removes noise and artifacts while preserving the main signal
 * 
 * Body:
 * - audio: Audio file (multipart/form-data)
 * - tier: 'free' | 'pro' (default: 'free')
 * - format: 'wav' | 'mp3' | 'flac' (default: 'wav')
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const tier = (formData.get('tier') as string) || 'free';
    const format = (formData.get('format') as string) || 'wav';

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Validate tier
    if (tier !== 'free' && tier !== 'pro') {
      return NextResponse.json(
        { error: 'Invalid tier. Must be "free" or "pro"' },
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

    console.log(`Processing audio cleaning request: ${audioFile.name}, tier: ${tier}`);

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
        // In production, encode to requested format and provide download URL
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
      message: 'Audio cleaned successfully for HalfScrew pre-FX',
    });

  } catch (error) {
    console.error('Cleaning error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to clean audio',
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
    endpoint: '/api/audio/clean',
    description: 'Clean audio for HalfScrew pre-FX processing',
    purpose: 'Removes noise and artifacts while preserving the main signal',
    method: 'POST',
    contentType: 'multipart/form-data',
    parameters: {
      audio: 'Audio file (required)',
      tier: '"free" | "pro" (default: "free")',
      format: '"wav" | "mp3" | "flac" (default: "wav")',
    },
    use_cases: [
      'Pre-processing for HalfScrew effects',
      'Noise reduction',
      'Artifact removal',
      'Signal cleanup before time-stretching',
    ],
  });
}
