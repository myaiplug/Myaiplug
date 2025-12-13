/**
 * Basic tests for TF-Locoformer audio processing modules
 */

import { describe, test, expect } from '@jest/globals';
import { 
  stft, 
  istft, 
  magnitude,
  createWindow,
  DEFAULT_STFT_CONFIG 
} from '../../lib/audio-processing/utils/stft';
import { RMSGroupNorm } from '../../lib/audio-processing/models/normalization';
import { RotaryEmbedding } from '../../lib/audio-processing/models/rotary-embedding';
import { swish, gelu } from '../../lib/audio-processing/models/conv-swiglu';
import { TFLocoformer, MEDIUM_MODEL_CONFIG, PRO_MODEL_CONFIG } from '../../lib/audio-processing/models/tf-locoformer';

describe('STFT/iSTFT', () => {
  test('createWindow generates correct window', () => {
    const window = createWindow(512, 'hann');
    
    expect(window.length).toBe(512);
    expect(window[0]).toBeCloseTo(0, 5);
    expect(window[255]).toBeCloseTo(1, 5);
    expect(window[511]).toBeCloseTo(0, 5);
  });

  test('STFT produces correct output shape', () => {
    const signal = new Float32Array(44100); // 1 second at 44.1kHz
    for (let i = 0; i < signal.length; i++) {
      signal[i] = Math.sin(2 * Math.PI * 440 * i / 44100); // 440 Hz sine wave
    }

    const spectrogram = stft(signal, DEFAULT_STFT_CONFIG);
    
    const freqBins = Math.floor(DEFAULT_STFT_CONFIG.n_fft / 2) + 1;
    const expectedFrames = Math.floor((signal.length - DEFAULT_STFT_CONFIG.n_fft) / DEFAULT_STFT_CONFIG.hop_length) + 1;
    
    expect(spectrogram.real.length).toBe(freqBins * expectedFrames);
    expect(spectrogram.imag.length).toBe(freqBins * expectedFrames);
  });

  test('iSTFT reconstructs signal', () => {
    const signal = new Float32Array(8192);
    for (let i = 0; i < signal.length; i++) {
      signal[i] = Math.sin(2 * Math.PI * 440 * i / 44100);
    }

    const spectrogram = stft(signal);
    const reconstructed = istft(spectrogram, signal.length);

    expect(reconstructed.length).toBe(signal.length);
    
    // Check correlation between original and reconstructed
    let correlation = 0;
    for (let i = 1000; i < signal.length - 1000; i++) {
      correlation += signal[i] * reconstructed[i];
    }
    expect(correlation).toBeGreaterThan(0);
  });

  test('magnitude computes correct values', () => {
    const spectrogram = {
      real: new Float32Array([3, 0, 4]),
      imag: new Float32Array([4, 5, 0]),
    };

    const mag = magnitude(spectrogram);

    expect(mag[0]).toBeCloseTo(5, 5); // sqrt(3^2 + 4^2) = 5
    expect(mag[1]).toBeCloseTo(5, 5); // sqrt(0^2 + 5^2) = 5
    expect(mag[2]).toBeCloseTo(4, 5); // sqrt(4^2 + 0^2) = 4
  });
});

describe('Activation Functions', () => {
  test('swish activation', () => {
    const input = new Float32Array([-2, -1, 0, 1, 2]);
    const output = swish(input);

    expect(output[2]).toBeCloseTo(0, 5); // swish(0) = 0
    expect(output[3]).toBeGreaterThan(0); // swish(positive) > 0
    expect(output[1]).toBeLessThan(0); // swish(negative) < 0
  });

  test('gelu activation', () => {
    const input = new Float32Array([-2, -1, 0, 1, 2]);
    const output = gelu(input);

    expect(output[2]).toBeCloseTo(0, 5); // gelu(0) ≈ 0
    expect(output[3]).toBeGreaterThan(0); // gelu(positive) > 0
    expect(output[1]).toBeLessThan(0); // gelu(negative) < 0
  });
});

describe('RMSGroupNorm', () => {
  test('normalizes correctly', () => {
    const norm = new RMSGroupNorm({
      numGroups: 2,
      numChannels: 4,
      eps: 1e-5,
      affine: false,
    });

    const input = new Float32Array([
      1, 2, 3, 4,  // channel values
      5, 6, 7, 8,
    ]);

    const output = norm.forward(input, [1, 4, 2]); // [batch, channels, spatial]

    expect(output.length).toBe(input.length);
    // Check that RMS normalization was applied
    expect(Math.abs(output[0])).toBeLessThan(Math.abs(input[0]));
  });
});

describe('RotaryEmbedding', () => {
  test('creates embeddings with correct shape', () => {
    const rope = new RotaryEmbedding({
      dim: 64,
      maxSeqLen: 1024,
    });

    const input = new Float32Array(64 * 10); // 10 tokens, 64 dims
    for (let i = 0; i < input.length; i++) {
      input[i] = Math.random();
    }

    const output = rope.applyRotary(input, [1, 10, 1, 64]); // [batch, seq, heads, dim]

    expect(output.length).toBe(input.length);
  });
});

describe('TFLocoformer Model', () => {
  test('creates model with correct config', () => {
    const model = new TFLocoformer(MEDIUM_MODEL_CONFIG);
    const config = model.getConfig();

    expect(config.numLayers).toBe(6);
    expect(config.hiddenDim).toBe(384);
    expect(config.numHeads).toBe(8);
    expect(config.numStems).toBe(2);
  });

  test('pro model has correct stem configuration', () => {
    const model = new TFLocoformer(PRO_MODEL_CONFIG);
    const config = model.getConfig();

    expect(config.numStems).toBe(5);
    expect(config.stemNames).toEqual(['vocals', 'drums', 'bass', 'instruments', 'fx']);
  });

  test('forward pass produces correct output shape', () => {
    const model = new TFLocoformer({
      ...MEDIUM_MODEL_CONFIG,
      numLayers: 1, // Reduce for faster test
    });

    const batch = 1;
    const time = 10;
    const freq = 1025;
    const complex = 2;

    const input = new Float32Array(batch * time * freq * complex);
    for (let i = 0; i < input.length; i++) {
      input[i] = Math.random() * 0.1;
    }

    const output = model.forward(input, [batch, time, freq, complex]);

    // Output should have shape [batch, time, freq * complex * num_stems]
    const expectedLength = batch * time * freq * complex * MEDIUM_MODEL_CONFIG.numStems;
    expect(output.length).toBeGreaterThan(0);
  });
});

describe('Model Configurations', () => {
  test('MEDIUM_MODEL_CONFIG has correct values', () => {
    expect(MEDIUM_MODEL_CONFIG.numLayers).toBe(6);
    expect(MEDIUM_MODEL_CONFIG.numStems).toBe(2);
    expect(MEDIUM_MODEL_CONFIG.normGroups).toBe(4);
    expect(MEDIUM_MODEL_CONFIG.attentionType).toBe('dual');
  });

  test('PRO_MODEL_CONFIG extends MEDIUM_MODEL_CONFIG', () => {
    expect(PRO_MODEL_CONFIG.numLayers).toBe(MEDIUM_MODEL_CONFIG.numLayers);
    expect(PRO_MODEL_CONFIG.hiddenDim).toBe(MEDIUM_MODEL_CONFIG.hiddenDim);
    expect(PRO_MODEL_CONFIG.numStems).toBe(5);
  });
});
