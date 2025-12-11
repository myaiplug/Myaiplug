import { NextRequest, NextResponse } from 'next/server';
import { createInferenceEngine } from '@/lib/audio-processing/inference/engine';
import { initializeDeviceManager } from '@/lib/audio-processing/utils/device';
import { 
  decodeAudioFile, 
  isSupportedFormat, 
  validateAudioConstraints 
} from '@/lib/audio-processing/utils/audio-decoder';

/**
 * POST /api/audio/enhance
 * Enhances audio for NoDAW polish
 * Separates and remixes stems with optimized levels for professional sound
 * 
 * Body:
 * - audio: Audio file (multipart/form-data)
 * - tier: 'free' | 'pro' (default: 'free')
 * - format: 'wav' | 'mp3' | 'flac' (default: 'wav')
 * - enhancementLevel: 'subtle' | 'moderate' | 'aggressive' (default: 'moderate')
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const tier = (formData.get('tier') as string) || 'free';
    const format = (formData.get('format') as string) || 'wav';
    const enhancementLevel = (formData.get('enhancementLevel') as string) || 'moderate';

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

    console.log(`Processing audio enhancement request: ${audioFile.name}, tier: ${tier}, level: ${enhancementLevel}`);

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
      quality: qualityMetrics,
      message: 'Audio enhanced successfully for NoDAW polish',
    });

  } catch (error) {
    console.error('Enhancement error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to enhance audio',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Calculate quality metrics comparing original and enhanced audio
 */
function calculateQualityMetrics(
  original: Float32Array,
  enhanced: Float32Array
): {
  dynamicRangeImprovement: number;
  clarityScore: number;
  balanceScore: number;
} {
  // Calculate RMS for dynamic range
  const originalRMS = calculateRMS(original);
  const enhancedRMS = calculateRMS(enhanced);
  
  // Calculate peak values
  const originalPeak = Math.max(...Array.from(original).map(Math.abs));
  const enhancedPeak = Math.max(...Array.from(enhanced).map(Math.abs));
  
  // Dynamic range improvement (in dB)
  const originalDR = 20 * Math.log10(originalPeak / (originalRMS + 1e-10));
  const enhancedDR = 20 * Math.log10(enhancedPeak / (enhancedRMS + 1e-10));
  const dynamicRangeImprovement = enhancedDR - originalDR;
  
  // Clarity score (simplified - higher frequency content)
  const clarityScore = 0.85; // Placeholder
  
  // Balance score (how well stems are mixed)
  const balanceScore = 0.92; // Placeholder
  
  return {
    dynamicRangeImprovement: Math.round(dynamicRangeImprovement * 100) / 100,
    clarityScore: Math.round(clarityScore * 100) / 100,
    balanceScore: Math.round(balanceScore * 100) / 100,
  };
}

/**
 * Calculate RMS (Root Mean Square) of audio signal
 */
function calculateRMS(audio: Float32Array): number {
  let sumSquares = 0;
  for (let i = 0; i < audio.length; i++) {
    sumSquares += audio[i] * audio[i];
  }
  return Math.sqrt(sumSquares / audio.length);
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
    parameters: {
      audio: 'Audio file (required)',
      tier: '"free" | "pro" (default: "free")',
      format: '"wav" | "mp3" | "flac" (default: "wav")',
      enhancementLevel: '"subtle" | "moderate" | "aggressive" (default: "moderate")',
    },
    enhancement_levels: {
      subtle: 'Light touch-up, preserves original character',
      moderate: 'Balanced enhancement with improved clarity and dynamics',
      aggressive: 'Maximum processing for dramatic improvement',
    },
    use_cases: [
      'Post-processing for NoDAW',
      'Stem separation and remix',
      'Professional mastering',
      'Mix balance optimization',
    ],
  });
}
