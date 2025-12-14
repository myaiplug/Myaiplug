/**
 * STFT (Short-Time Fourier Transform) utilities for audio processing
 * Provides time-frequency domain conversion for TF-Locoformer
 */

import FFT from 'fft.js';

export interface STFTConfig {
  n_fft: number;       // FFT size (default: 2048)
  hop_length: number;  // Hop size (default: 512)
  win_length: number;  // Window length (default: 2048)
  window: 'hann' | 'hamming' | 'blackman';
  center: boolean;     // Center padding
  normalized: boolean; // Normalize FFT
  onesided: boolean;   // One-sided FFT (real input)
}

export const DEFAULT_STFT_CONFIG: STFTConfig = {
  n_fft: 2048,
  hop_length: 512,
  win_length: 2048,
  window: 'hann',
  center: true,
  normalized: false,
  onesided: true,
};

/**
 * Create window function
 */
export function createWindow(length: number, type: 'hann' | 'hamming' | 'blackman'): Float32Array {
  const window = new Float32Array(length);
  
  switch (type) {
    case 'hann':
      for (let i = 0; i < length; i++) {
        window[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (length - 1)));
      }
      break;
    case 'hamming':
      for (let i = 0; i < length; i++) {
        window[i] = 0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (length - 1));
      }
      break;
    case 'blackman':
      for (let i = 0; i < length; i++) {
        const a0 = 0.42;
        const a1 = 0.5;
        const a2 = 0.08;
        window[i] = a0 - a1 * Math.cos((2 * Math.PI * i) / (length - 1)) + 
                    a2 * Math.cos((4 * Math.PI * i) / (length - 1));
      }
      break;
  }
  
  return window;
}

/**
 * Pad signal with reflection for center mode
 */
export function padSignal(signal: Float32Array, padSize: number): Float32Array {
  const paddedLength = signal.length + 2 * padSize;
  const padded = new Float32Array(paddedLength);
  
  // Copy original signal
  padded.set(signal, padSize);
  
  // Reflect left
  for (let i = 0; i < padSize; i++) {
    padded[i] = signal[padSize - 1 - i];
  }
  
  // Reflect right
  for (let i = 0; i < padSize; i++) {
    padded[padSize + signal.length + i] = signal[signal.length - 2 - i];
  }
  
  return padded;
}

/**
 * Complex number representation
 */
export interface Complex {
  real: Float32Array;
  imag: Float32Array;
}

/**
 * Perform STFT on audio signal
 * Returns complex spectrogram: [freq_bins, time_frames]
 */
export function stft(
  signal: Float32Array,
  config: Partial<STFTConfig> = {}
): Complex {
  const cfg = { ...DEFAULT_STFT_CONFIG, ...config };
  
  // Pad signal if center mode
  let processedSignal = signal;
  if (cfg.center) {
    const padSize = Math.floor(cfg.n_fft / 2);
    processedSignal = padSignal(signal, padSize);
  }
  
  // Create window
  const window = createWindow(cfg.win_length, cfg.window);
  
  // Calculate number of frames
  const numFrames = Math.floor((processedSignal.length - cfg.n_fft) / cfg.hop_length) + 1;
  
  // Frequency bins (one-sided)
  const freqBins = cfg.onesided ? Math.floor(cfg.n_fft / 2) + 1 : cfg.n_fft;
  
  // Initialize output
  const real = new Float32Array(freqBins * numFrames);
  const imag = new Float32Array(freqBins * numFrames);
  
  // Temporary buffers for FFT
  const frameBuffer = new Float32Array(cfg.n_fft);
  
  // Process each frame
  for (let frame = 0; frame < numFrames; frame++) {
    const offset = frame * cfg.hop_length;
    
    // Extract and window frame
    for (let i = 0; i < cfg.win_length; i++) {
      frameBuffer[i] = processedSignal[offset + i] * window[i];
    }
    
    // Zero-pad if needed
    for (let i = cfg.win_length; i < cfg.n_fft; i++) {
      frameBuffer[i] = 0;
    }
    
    // Perform FFT using optimized fft.js library
    const frameResult = optimizedFFT(frameBuffer, cfg.onesided);
    
    // Store results
    for (let k = 0; k < freqBins; k++) {
      real[k * numFrames + frame] = frameResult.real[k];
      imag[k * numFrames + frame] = frameResult.imag[k];
    }
  }
  
  // Normalize if requested
  if (cfg.normalized) {
    const norm = Math.sqrt(cfg.n_fft);
    for (let i = 0; i < real.length; i++) {
      real[i] /= norm;
      imag[i] /= norm;
    }
  }
  
  return { real, imag };
}

/**
 * Optimized FFT implementation using fft.js
 * Replaces the previous simplified DFT with production-ready FFT
 */
function optimizedFFT(input: Float32Array, onesided: boolean): Complex {
  const N = input.length;
  const fft = new FFT(N);
  
  // Create input array for fft.js (interleaved real/imag)
  const fftInput = new Array(N * 2);
  for (let i = 0; i < N; i++) {
    fftInput[i * 2] = input[i];
    fftInput[i * 2 + 1] = 0; // Imaginary part is 0 for real input
  }
  
  // Perform FFT
  const fftOutput = fft.createComplexArray();
  fft.transform(fftOutput, fftInput);
  
  // Extract results
  const size = onesided ? Math.floor(N / 2) + 1 : N;
  const real = new Float32Array(size);
  const imag = new Float32Array(size);
  
  for (let k = 0; k < size; k++) {
    real[k] = fftOutput[k * 2];
    imag[k] = fftOutput[k * 2 + 1];
  }
  
  return { real, imag };
}

/**
 * Perform inverse STFT to reconstruct time-domain signal
 */
export function istft(
  spectrogram: Complex,
  signalLength: number,
  config: Partial<STFTConfig> = {}
): Float32Array {
  const cfg = { ...DEFAULT_STFT_CONFIG, ...config };
  
  const freqBins = cfg.onesided ? Math.floor(cfg.n_fft / 2) + 1 : cfg.n_fft;
  const numFrames = spectrogram.real.length / freqBins;
  
  // Create window
  const window = createWindow(cfg.win_length, cfg.window);
  
  // Output signal buffer
  const outputLength = cfg.center 
    ? signalLength + cfg.n_fft 
    : signalLength;
  const output = new Float32Array(outputLength);
  const windowSum = new Float32Array(outputLength);
  
  // Reconstruct each frame
  for (let frame = 0; frame < numFrames; frame++) {
    const offset = frame * cfg.hop_length;
    
    // Extract frame spectrum
    const frameReal = new Float32Array(freqBins);
    const frameImag = new Float32Array(freqBins);
    
    for (let k = 0; k < freqBins; k++) {
      frameReal[k] = spectrogram.real[k * numFrames + frame];
      frameImag[k] = spectrogram.imag[k * numFrames + frame];
    }
    
    // Inverse FFT using optimized fft.js library
    const timeFrame = optimizedIFFT({ real: frameReal, imag: frameImag }, cfg.n_fft, cfg.onesided);
    
    // Overlap-add with window
    for (let i = 0; i < cfg.win_length && offset + i < output.length; i++) {
      output[offset + i] += timeFrame[i] * window[i];
      windowSum[offset + i] += window[i] * window[i];
    }
  }
  
  // Normalize by window sum
  for (let i = 0; i < output.length; i++) {
    if (windowSum[i] > 1e-8) {
      output[i] /= windowSum[i];
    }
  }
  
  // Remove padding if center mode
  if (cfg.center) {
    const padSize = Math.floor(cfg.n_fft / 2);
    return output.slice(padSize, padSize + signalLength);
  }
  
  return output.slice(0, signalLength);
}

/**
 * Optimized inverse FFT using fft.js
 * Replaces the previous simplified iDFT with production-ready iFFT
 */
function optimizedIFFT(spectrum: Complex, n_fft: number, onesided: boolean): Float32Array {
  const fft = new FFT(n_fft);
  const size = spectrum.real.length;
  
  // Reconstruct full spectrum if one-sided
  let fullReal: Float32Array;
  let fullImag: Float32Array;
  
  if (onesided) {
    fullReal = new Float32Array(n_fft);
    fullImag = new Float32Array(n_fft);
    
    // Copy positive frequencies
    for (let i = 0; i < size; i++) {
      fullReal[i] = spectrum.real[i];
      fullImag[i] = spectrum.imag[i];
    }
    
    // Mirror for negative frequencies (conjugate symmetry)
    for (let i = 1; i < size - 1; i++) {
      fullReal[n_fft - i] = spectrum.real[i];
      fullImag[n_fft - i] = -spectrum.imag[i];
    }
  } else {
    fullReal = spectrum.real;
    fullImag = spectrum.imag;
  }
  
  // Create input array for fft.js (interleaved real/imag)
  const fftInput = new Array(n_fft * 2);
  for (let i = 0; i < n_fft; i++) {
    fftInput[i * 2] = fullReal[i];
    fftInput[i * 2 + 1] = fullImag[i];
  }
  
  // Perform inverse FFT
  const fftOutput = fft.createComplexArray();
  fft.inverseTransform(fftOutput, fftInput);
  
  // Extract real part
  const output = new Float32Array(n_fft);
  for (let i = 0; i < n_fft; i++) {
    output[i] = fftOutput[i * 2];
  }
  
  return output;
}

/**
 * Compute magnitude spectrogram
 */
export function magnitude(spectrogram: Complex): Float32Array {
  const mag = new Float32Array(spectrogram.real.length);
  
  for (let i = 0; i < mag.length; i++) {
    const real = spectrogram.real[i];
    const imag = spectrogram.imag[i];
    mag[i] = Math.sqrt(real * real + imag * imag);
  }
  
  return mag;
}

/**
 * Compute phase spectrogram
 */
export function phase(spectrogram: Complex): Float32Array {
  const ph = new Float32Array(spectrogram.real.length);
  
  for (let i = 0; i < ph.length; i++) {
    ph[i] = Math.atan2(spectrogram.imag[i], spectrogram.real[i]);
  }
  
  return ph;
}
