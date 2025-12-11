/**
 * Tests for Phase 2 functionality:
 * - Optimized FFT/iFFT
 * - Audio decoder
 * - Weight loading system
 */

import { describe, test, expect } from '@jest/globals';
import { 
  stft, 
  istft, 
  DEFAULT_STFT_CONFIG 
} from '../../lib/audio-processing/utils/stft';
import {
  isSupportedFormat,
  validateAudioConstraints,
  stereoToMono,
  resampleAudio,
  SUPPORTED_FORMATS,
} from '../../lib/audio-processing/utils/audio-decoder';
import {
  getWeightCacheStats,
  clearWeightCache,
  validateWeights,
} from '../../lib/audio-processing/utils/weight-loader';

describe('Optimized FFT/iFFT', () => {
  test('STFT with optimized FFT produces correct output shape', () => {
    const signal = new Float32Array(44100); // 1 second
    for (let i = 0; i < signal.length; i++) {
      signal[i] = Math.sin(2 * Math.PI * 440 * i / 44100); // 440 Hz sine wave
    }

    const spectrogram = stft(signal, DEFAULT_STFT_CONFIG);
    
    const freqBins = Math.floor(DEFAULT_STFT_CONFIG.n_fft / 2) + 1;
    const expectedFrames = Math.floor((signal.length - DEFAULT_STFT_CONFIG.n_fft) / DEFAULT_STFT_CONFIG.hop_length) + 1;
    
    expect(spectrogram.real.length).toBe(freqBins * expectedFrames);
    expect(spectrogram.imag.length).toBe(freqBins * expectedFrames);
  });

  test('iSTFT reconstructs signal with optimized FFT', () => {
    const signal = new Float32Array(8192);
    for (let i = 0; i < signal.length; i++) {
      signal[i] = Math.sin(2 * Math.PI * 440 * i / 44100);
    }

    const spectrogram = stft(signal);
    const reconstructed = istft(spectrogram, signal.length);

    expect(reconstructed.length).toBe(signal.length);
    
    // Check reconstruction quality (correlation)
    let correlation = 0;
    const skipEdge = 1000; // Skip edge effects
    for (let i = skipEdge; i < signal.length - skipEdge; i++) {
      correlation += signal[i] * reconstructed[i];
    }
    expect(correlation).toBeGreaterThan(0);
  });

  test('optimized FFT is faster than naive DFT (smoke test)', () => {
    const signal = new Float32Array(2048);
    for (let i = 0; i < signal.length; i++) {
      signal[i] = Math.random() * 0.1;
    }

    const start = performance.now();
    const spectrogram = stft(signal, { ...DEFAULT_STFT_CONFIG, n_fft: 2048 });
    const elapsed = performance.now() - start;

    // Should complete in reasonable time (< 1 second for 2048 FFT)
    expect(elapsed).toBeLessThan(1000);
    expect(spectrogram.real.length).toBeGreaterThan(0);
  });
});

describe('Audio Decoder', () => {
  test('isSupportedFormat validates audio formats correctly', () => {
    expect(isSupportedFormat('audio/wav', 'test.wav')).toBe(true);
    expect(isSupportedFormat('audio/mpeg', 'test.mp3')).toBe(true);
    expect(isSupportedFormat('audio/flac', 'test.flac')).toBe(true);
    expect(isSupportedFormat('audio/ogg', 'test.ogg')).toBe(true);
    expect(isSupportedFormat('audio/webm', 'test.webm')).toBe(true);
    
    // Invalid formats
    expect(isSupportedFormat('video/mp4', 'test.mp4')).toBe(false);
    expect(isSupportedFormat('text/plain', 'test.txt')).toBe(false);
  });

  test('isSupportedFormat falls back to filename extension', () => {
    expect(isSupportedFormat('application/octet-stream', 'audio.wav')).toBe(true);
    expect(isSupportedFormat('application/octet-stream', 'audio.mp3')).toBe(true);
    expect(isSupportedFormat('application/octet-stream', 'audio.flac')).toBe(true);
    
    // Non-audio files should return false
    expect(isSupportedFormat('application/octet-stream', 'document.pdf')).toBe(false);
    expect(isSupportedFormat('video/mp4', 'video.mp4')).toBe(false);
  });

  test('validateAudioConstraints checks file size', () => {
    const maxSize = 100 * 1024 * 1024; // 100MB
    
    const validSize = validateAudioConstraints(50 * 1024 * 1024);
    expect(validSize.valid).toBe(true);
    
    const invalidSize = validateAudioConstraints(150 * 1024 * 1024);
    expect(invalidSize.valid).toBe(false);
    expect(invalidSize.error).toBeDefined();
  });

  test('validateAudioConstraints checks duration for free tier', () => {
    const validDuration = validateAudioConstraints(1024 * 1024, 120, 'free'); // 2 min
    expect(validDuration.valid).toBe(true);
    
    const invalidDuration = validateAudioConstraints(1024 * 1024, 240, 'free'); // 4 min
    expect(invalidDuration.valid).toBe(false);
    expect(invalidDuration.error).toContain('free');
  });

  test('validateAudioConstraints checks duration for pro tier', () => {
    const validDuration = validateAudioConstraints(1024 * 1024, 300, 'pro'); // 5 min
    expect(validDuration.valid).toBe(true);
    
    const invalidDuration = validateAudioConstraints(1024 * 1024, 700, 'pro'); // 11 min
    expect(invalidDuration.valid).toBe(false);
    expect(invalidDuration.error).toContain('pro');
  });

  test('stereoToMono converts stereo to mono', () => {
    const stereo = new Float32Array([1, 2, 3, 4, 5, 6]); // 3 samples, 2 channels
    const mono = stereoToMono(stereo, 2);
    
    expect(mono.length).toBe(3);
    expect(mono[0]).toBeCloseTo((1 + 2) / 2);
    expect(mono[1]).toBeCloseTo((3 + 4) / 2);
    expect(mono[2]).toBeCloseTo((5 + 6) / 2);
  });

  test('stereoToMono handles mono input', () => {
    const mono = new Float32Array([1, 2, 3]);
    const result = stereoToMono(mono, 1);
    
    expect(result).toBe(mono); // Should return same array
    expect(result.length).toBe(3);
  });

  test('resampleAudio resamples to different rate', () => {
    const audio = new Float32Array(100);
    for (let i = 0; i < audio.length; i++) {
      audio[i] = Math.sin(2 * Math.PI * i / 100);
    }
    
    const resampled = resampleAudio(audio, 44100, 22050); // Half rate
    
    expect(resampled.length).toBe(50);
  });

  test('resampleAudio handles same rate', () => {
    const audio = new Float32Array([1, 2, 3, 4, 5]);
    const result = resampleAudio(audio, 44100, 44100);
    
    expect(result).toBe(audio); // Should return same array
  });

  test('SUPPORTED_FORMATS contains expected formats', () => {
    expect(SUPPORTED_FORMATS).toContain('audio/wav');
    expect(SUPPORTED_FORMATS).toContain('audio/mpeg');
    expect(SUPPORTED_FORMATS).toContain('audio/flac');
    expect(SUPPORTED_FORMATS).toContain('audio/ogg');
    expect(SUPPORTED_FORMATS.length).toBeGreaterThan(5);
  });
});

describe('Weight Loader', () => {
  test('weight cache starts empty', () => {
    clearWeightCache();
    const stats = getWeightCacheStats();
    expect(stats.size).toBe(0);
    expect(stats.maxSize).toBe(3);
  });

  test('clearWeightCache resets cache', () => {
    clearWeightCache();
    const stats = getWeightCacheStats();
    expect(stats.size).toBe(0);
  });

  test('validateWeights checks basic structure', () => {
    const validWeights = {
      metadata: {
        version: 'test-v1',
        modelType: 'medium' as const,
        numLayers: 6,
        hiddenDim: 384,
      },
      weights: {
        inputProj: {
          weight: new Float32Array(100),
        },
        blocks: Array(6).fill(null).map(() => ({
          timeAttention: {
            qProj: { weight: new Float32Array(10) },
            kProj: { weight: new Float32Array(10) },
            vProj: { weight: new Float32Array(10) },
            outProj: { weight: new Float32Array(10) },
          },
          freqAttention: {
            qProj: { weight: new Float32Array(10) },
            kProj: { weight: new Float32Array(10) },
            vProj: { weight: new Float32Array(10) },
            outProj: { weight: new Float32Array(10) },
          },
          norm1: {},
          norm2: {},
          norm3: {},
          convSwiGLU: {
            conv1: { weight: new Float32Array(10) },
            conv2: { weight: new Float32Array(10) },
            gate: { weight: new Float32Array(10) },
          },
        })),
        outputProj: {
          weight: new Float32Array(100),
        },
      },
    };

    expect(validateWeights(validWeights)).toBe(true);
  });

  test('validateWeights rejects invalid structure', () => {
    const invalidWeights = {
      metadata: {
        version: 'test-v1',
        modelType: 'medium' as const,
        numLayers: 6,
        hiddenDim: 384,
      },
      weights: {
        inputProj: {
          weight: new Float32Array(100),
        },
        blocks: Array(3).fill(null), // Wrong number of blocks
        outputProj: {
          weight: new Float32Array(100),
        },
      },
    };

    expect(validateWeights(invalidWeights as any)).toBe(false);
  });

  test('validateWeights handles missing metadata', () => {
    const invalidWeights = {
      weights: {
        blocks: [],
      },
    };

    expect(validateWeights(invalidWeights as any)).toBe(false);
  });
});

describe('Integration Tests', () => {
  test('full pipeline: audio validation -> processing setup', () => {
    // Validate format
    const format = isSupportedFormat('audio/wav', 'test.wav');
    expect(format).toBe(true);
    
    // Validate constraints
    const constraints = validateAudioConstraints(10 * 1024 * 1024, 60, 'free');
    expect(constraints.valid).toBe(true);
    
    // Prepare audio
    const stereoAudio = new Float32Array([1, 2, 3, 4, 5, 6]);
    const monoAudio = stereoToMono(stereoAudio, 2);
    expect(monoAudio.length).toBe(3);
  });

  test('FFT round-trip maintains signal energy', () => {
    const signal = new Float32Array(4096);
    for (let i = 0; i < signal.length; i++) {
      signal[i] = Math.sin(2 * Math.PI * 440 * i / 44100) * 0.5;
    }
    
    // Calculate input energy
    let inputEnergy = 0;
    for (let i = 0; i < signal.length; i++) {
      inputEnergy += signal[i] * signal[i];
    }
    
    // FFT -> iFFT
    const spectrogram = stft(signal);
    const reconstructed = istft(spectrogram, signal.length);
    
    // Calculate output energy
    let outputEnergy = 0;
    const skipEdge = 500;
    for (let i = skipEdge; i < signal.length - skipEdge; i++) {
      outputEnergy += reconstructed[i] * reconstructed[i];
    }
    
    // Energy should be preserved (within tolerance)
    const ratio = outputEnergy / (inputEnergy * 0.8); // Allow 20% loss for edge effects
    expect(ratio).toBeGreaterThan(0.5);
    expect(ratio).toBeLessThan(2.0);
  });
});
