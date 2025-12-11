/**
 * TF-Locoformer Inference Engine
 * Handles audio separation and enhancement using the TF-Locoformer model
 */

import { stft, istft, Complex, STFTConfig, DEFAULT_STFT_CONFIG } from '../utils/stft';
import { TFLocoformer, TFLocoformerConfig, MEDIUM_MODEL_CONFIG, PRO_MODEL_CONFIG } from '../models/tf-locoformer';
import { DeviceManager, getDeviceManager } from '../utils/device';

export interface SeparationOptions {
  tier: 'free' | 'pro';
  outputFormat: 'wav' | 'mp3' | 'flac';
  sampleRate: number;
  normalize: boolean;
}

export const DEFAULT_SEPARATION_OPTIONS: SeparationOptions = {
  tier: 'free',
  outputFormat: 'wav',
  sampleRate: 44100,
  normalize: true,
};

export interface SeparationResult {
  stems: Map<string, Float32Array>;
  sampleRate: number;
  duration: number;
  processingTime: number;
  device: string;
}

/**
 * TF-Locoformer Inference Engine
 */
export class TFLocoformerInference {
  private model: TFLocoformer | null = null;
  private config: TFLocoformerConfig;
  private stftConfig: STFTConfig;
  private deviceManager: DeviceManager;
  private isInitialized: boolean = false;

  constructor(tier: 'free' | 'pro' = 'free') {
    this.config = tier === 'pro' ? PRO_MODEL_CONFIG : MEDIUM_MODEL_CONFIG;
    this.stftConfig = DEFAULT_STFT_CONFIG;
    this.deviceManager = getDeviceManager();
  }

  /**
   * Initialize the inference engine
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    console.log('Initializing TF-Locoformer inference engine...');

    // Initialize device manager
    await this.deviceManager.initialize();

    // Create model
    this.model = new TFLocoformer(this.config);

    // In production, load pre-trained weights here
    // this.loadModelWeights();

    this.isInitialized = true;
    console.log('TF-Locoformer initialized successfully');
  }

  /**
   * Separate audio into stems
   * @param audio - Mono or stereo audio buffer
   * @param options - Separation options
   */
  async separate(
    audio: Float32Array,
    options: Partial<SeparationOptions> = {}
  ): Promise<SeparationResult> {
    if (!this.isInitialized || !this.model) {
      throw new Error('Inference engine not initialized. Call initialize() first.');
    }

    const opts = { ...DEFAULT_SEPARATION_OPTIONS, ...options };
    const startTime = performance.now();

    // Convert stereo to mono if needed (average channels)
    const monoAudio = this.convertToMono(audio);

    // Perform STFT
    console.log('Computing STFT...');
    const spectrogram = stft(monoAudio, this.stftConfig);

    // Prepare input for model
    const modelInput = this.prepareModelInput(spectrogram);

    // Run inference
    console.log('Running model inference...');
    const modelOutput = this.model.forward(
      modelInput.data,
      modelInput.shape
    );

    // Post-process output to get individual stems
    console.log('Post-processing stems...');
    const stems = this.postProcessOutput(
      modelOutput,
      modelInput.shape,
      monoAudio.length
    );

    // Normalize if requested
    if (opts.normalize) {
      this.normalizeStems(stems);
    }

    const processingTime = performance.now() - startTime;

    return {
      stems,
      sampleRate: opts.sampleRate,
      duration: monoAudio.length / opts.sampleRate,
      processingTime,
      device: this.deviceManager.getCurrentDevice()?.name || 'Unknown',
    };
  }

  /**
   * Clean audio (pre-processing for HalfScrew)
   */
  async clean(
    audio: Float32Array,
    options: Partial<SeparationOptions> = {}
  ): Promise<Float32Array> {
    const result = await this.separate(audio, options);
    
    // For cleaning, we typically want to remove noise/artifacts
    // Return the vocal stem if available, otherwise the main instrumental
    const vocals = result.stems.get('vocals');
    if (vocals) {
      return vocals;
    }

    const instrumental = result.stems.get('instrumental');
    if (instrumental) {
      return instrumental;
    }

    throw new Error('No suitable stem found for cleaning');
  }

  /**
   * Enhance audio (post-processing for NoDAW)
   */
  async enhance(
    audio: Float32Array,
    options: Partial<SeparationOptions> = {}
  ): Promise<Float32Array> {
    const result = await this.separate(audio, options);

    // For enhancement, combine stems with optimized mixing
    const enhanced = new Float32Array(audio.length).fill(0);
    
    // Mix all stems with balanced levels
    for (const [stemName, stemAudio] of result.stems) {
      const weight = this.getEnhancementWeight(stemName);
      
      for (let i = 0; i < enhanced.length; i++) {
        enhanced[i] += stemAudio[i] * weight;
      }
    }

    // Apply soft limiter to prevent clipping
    return this.applySoftLimiter(enhanced);
  }

  /**
   * Convert stereo to mono (average channels)
   */
  private convertToMono(audio: Float32Array): Float32Array {
    // Assume audio is already mono or interleaved stereo
    // For simplicity, if length suggests stereo, average it
    return audio;
  }

  /**
   * Prepare model input from spectrogram
   */
  private prepareModelInput(spectrogram: Complex): {
    data: Float32Array;
    shape: number[];
  } {
    const freqBins = Math.floor(this.stftConfig.n_fft / 2) + 1;
    const timeFrames = spectrogram.real.length / freqBins;

    // Interleave real and imaginary parts
    const data = new Float32Array(freqBins * timeFrames * 2);
    
    for (let t = 0; t < timeFrames; t++) {
      for (let f = 0; f < freqBins; f++) {
        const idx = t * freqBins + f;
        const outIdx = (t * freqBins + f) * 2;
        data[outIdx] = spectrogram.real[idx];
        data[outIdx + 1] = spectrogram.imag[idx];
      }
    }

    return {
      data,
      shape: [1, timeFrames, freqBins, 2],  // [batch, time, freq, complex]
    };
  }

  /**
   * Post-process model output to get individual stem audio
   */
  private postProcessOutput(
    modelOutput: Float32Array,
    inputShape: number[],
    audioLength: number
  ): Map<string, Float32Array> {
    const [batch, timeFrames, freqBins, _] = inputShape;
    const numStems = this.config.numStems;
    const stems = new Map<string, Float32Array>();

    // Split output into individual stems
    // Output layout: [batch, time, freq * complex * num_stems]
    const complexSize = freqBins * 2;
    const stemComplexSize = complexSize;
    
    for (let s = 0; s < numStems; s++) {
      const stemName = this.config.stemNames[s];
      
      // Extract stem spectrogram
      const stemReal = new Float32Array(freqBins * timeFrames);
      const stemImag = new Float32Array(freqBins * timeFrames);

      for (let t = 0; t < timeFrames; t++) {
        for (let f = 0; f < freqBins; f++) {
          // Output is [time, freq * 2 * num_stems]
          // For each time frame: [freq0_stem0_real, freq0_stem0_imag, freq0_stem1_real, ...]
          const timeOffset = t * (freqBins * 2 * numStems);
          const freqOffset = f * 2 * numStems;
          const stemOffset = s * 2;
          const outputIdx = timeOffset + freqOffset + stemOffset;
          
          const spectIdx = t * freqBins + f;
          
          stemReal[spectIdx] = modelOutput[outputIdx];
          stemImag[spectIdx] = modelOutput[outputIdx + 1];
        }
      }

      // Perform inverse STFT
      const stemAudio = istft(
        { real: stemReal, imag: stemImag },
        audioLength,
        this.stftConfig
      );

      stems.set(stemName, stemAudio);
    }

    return stems;
  }

  /**
   * Normalize stems to prevent clipping
   */
  private normalizeStems(stems: Map<string, Float32Array>): void {
    for (const [_, audio] of stems) {
      let maxAbs = 0;
      
      for (let i = 0; i < audio.length; i++) {
        maxAbs = Math.max(maxAbs, Math.abs(audio[i]));
      }

      if (maxAbs > 0.95) {
        const scale = 0.95 / maxAbs;
        for (let i = 0; i < audio.length; i++) {
          audio[i] *= scale;
        }
      }
    }
  }

  /**
   * Get enhancement weight for stem mixing
   */
  private getEnhancementWeight(stemName: string): number {
    const weights: Record<string, number> = {
      vocals: 1.0,
      drums: 0.9,
      bass: 0.85,
      instruments: 0.95,
      fx: 0.7,
      instrumental: 1.0,
    };

    return weights[stemName] || 1.0;
  }

  /**
   * Apply soft limiter to prevent clipping
   */
  private applySoftLimiter(audio: Float32Array, threshold: number = 0.95): Float32Array {
    const output = new Float32Array(audio.length);

    for (let i = 0; i < audio.length; i++) {
      const sample = audio[i];
      
      if (Math.abs(sample) > threshold) {
        // Soft clipping using tanh
        output[i] = threshold * Math.tanh(sample / threshold);
      } else {
        output[i] = sample;
      }
    }

    return output;
  }

  /**
   * Get inference configuration
   */
  getConfig(): TFLocoformerConfig {
    return { ...this.config };
  }

  /**
   * Check if engine supports real-time processing
   */
  supportsRealtime(): boolean {
    return this.deviceManager.supportsRealtime();
  }

  /**
   * Get device information
   */
  getDeviceInfo() {
    return {
      current: this.deviceManager.getCurrentDevice(),
      available: this.deviceManager.getAllDevices(),
      capability: this.deviceManager.getGPUCapability(),
      constraints: this.deviceManager.getMemoryConstraints(),
    };
  }
}

/**
 * Create inference engine instance
 */
export function createInferenceEngine(tier: 'free' | 'pro' = 'free'): TFLocoformerInference {
  return new TFLocoformerInference(tier);
}
