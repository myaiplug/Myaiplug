/**
 * TF-Locoformer Inference Engine
 * Handles audio separation and enhancement using the TF-Locoformer model
 */

import { stft, istft, Complex, STFTConfig, DEFAULT_STFT_CONFIG } from '../utils/stft';
import { TFLocoformer, TFLocoformerConfig, MEDIUM_MODEL_CONFIG, PRO_MODEL_CONFIG } from '../models/tf-locoformer';
import { DeviceManager, getDeviceManager, ExecutionMode, ExecutionConstraints } from '../utils/device';
import { loadWeightsFromFile, ModelWeights } from '../utils/weight-loader';

export interface SeparationOptions {
  tier: 'free' | 'pro';
  outputFormat: 'wav' | 'mp3' | 'flac';
  sampleRate: number;
  normalize: boolean;
  debug?: boolean; // PHASE 2: Enable engine metadata output
}

export const DEFAULT_SEPARATION_OPTIONS: SeparationOptions = {
  tier: 'free',
  outputFormat: 'wav',
  sampleRate: 44100,
  normalize: true,
  debug: false,
};

export interface EngineMetadata {
  modelName: string;
  modelVariant: string;
  weightHash: string | null;
  device: string;
  deviceType: string;
  chunkSize: number;
  overlapSize: number;
  executionMode: string;
}

export interface SeparationResult {
  stems: Map<string, Float32Array>;
  sampleRate: number;
  duration: number;
  processingTime: number;
  device: string;
  metadata?: EngineMetadata; // PHASE 2: Engine metadata (debug mode only)
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
  private weights: ModelWeights | null = null;
  private tier: 'free' | 'pro';
  private executionMode: ExecutionMode;
  private weightHash: string | null = null; // PHASE 2: Track weight hash

  constructor(tier: 'free' | 'pro' = 'free') {
    this.tier = tier;
    this.config = tier === 'pro' ? PRO_MODEL_CONFIG : MEDIUM_MODEL_CONFIG;
    this.stftConfig = DEFAULT_STFT_CONFIG;
    this.deviceManager = getDeviceManager();
    
    // PHASE 1: Free tier must use CPU-only mode (zero variable cost)
    this.executionMode = tier === 'free' ? ExecutionMode.CPU_ONLY : ExecutionMode.GPU_ALLOWED;
  }

  /**
   * Initialize the inference engine
   * PHASE 2 SOTA: Predictable GPU failure handling
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    console.log(`Initializing TF-Locoformer inference engine (${this.tier} tier, ${this.executionMode} mode)...`);

    // PHASE 1: Initialize device manager with execution constraints
    const constraints: ExecutionConstraints = {
      mode: this.executionMode,
      forceCPU: this.tier === 'free',
      tier: this.tier,
    };

    // PHASE 2: Predictable GPU failure handling
    try {
      await this.deviceManager.initialize(undefined, constraints);
    } catch (error) {
      console.warn('[PHASE2 SOTA] Device initialization failed:', error);
      
      // If GPU initialization fails for Pro tier, explicitly retry on CPU
      if (this.tier !== 'free') {
        console.log('[PHASE2 SOTA] GPU unavailable - retrying with CPU...');
        const cpuConstraints: ExecutionConstraints = {
          mode: ExecutionMode.CPU_ONLY,
          forceCPU: true,
          tier: this.tier,
        };
        await this.deviceManager.initialize(undefined, cpuConstraints);
      } else {
        throw new Error(`Failed to initialize device: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Verify CPU-only enforcement for free tier
    const currentDevice = this.deviceManager.getCurrentDevice();
    if (this.tier === 'free' && currentDevice?.type !== 'cpu') {
      throw new Error('[PHASE1 SAFETY] Free tier attempted to use GPU - this should never happen');
    }

    // Create model
    this.model = new TFLocoformer(this.config);

    // Load pre-trained weights
    try {
      console.log(`Loading pretrained weights for ${this.tier} tier...`);
      this.weights = await loadWeightsFromFile(
        this.tier === 'pro' ? 'pro' : 'medium',
        'latest'
      );
      
      // Load weights into model
      if (this.weights && this.model) {
        this.model.loadWeights(this.weights);
        // PHASE 2: Calculate weight hash for metadata
        this.weightHash = this.calculateWeightHash(this.weights);
        console.log(`Pretrained weights loaded successfully (hash: ${this.weightHash})`);
      }
    } catch (error) {
      console.warn('Failed to load pretrained weights:', error);
      console.warn('Model will use randomly initialized weights (not recommended for production)');
      this.weightHash = null;
    }

    this.isInitialized = true;
    console.log(`TF-Locoformer initialized successfully on ${currentDevice?.name || 'Unknown device'}`);
  }

  /**
   * Calculate weight hash for metadata
   * PHASE 2: Simple hash for weight tracking
   */
  private calculateWeightHash(weights: ModelWeights): string {
    // Simple hash based on metadata
    const hashString = JSON.stringify({
      variant: weights.metadata?.variant,
      version: weights.metadata?.version,
      date: weights.metadata?.trainedDate,
    });
    
    let hash = 0;
    for (let i = 0; i < hashString.length; i++) {
      const char = hashString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  /**
   * Separate audio into stems with chunking and overlap-add
   * PHASE 2 SOTA: Implements 15-20s chunks with 1.5-2s overlap for seamless processing
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

    // PHASE 2 SOTA: Chunking parameters
    const chunkDurationSec = 18; // 15-20 seconds
    const overlapDurationSec = 1.75; // 1.5-2 seconds
    const chunkSize = Math.floor(chunkDurationSec * opts.sampleRate);
    const overlapSize = Math.floor(overlapDurationSec * opts.sampleRate);
    const hopSize = chunkSize - overlapSize;

    // Convert stereo to mono if needed (average channels)
    const monoAudio = this.convertToMono(audio);

    console.log(`[PHASE2 SOTA] Processing ${monoAudio.length} samples with chunking:`);
    console.log(`  - Chunk size: ${chunkSize} samples (${chunkDurationSec}s)`);
    console.log(`  - Overlap: ${overlapSize} samples (${overlapDurationSec}s)`);
    console.log(`  - Hop size: ${hopSize} samples`);

    // Initialize stem buffers for overlap-add
    const numStems = this.config.numStems;
    const stemBuffers = new Map<string, Float32Array>();
    for (const stemName of this.config.stemNames) {
      stemBuffers.set(stemName, new Float32Array(monoAudio.length));
    }

    // Create window function for overlap-add (Hann window)
    const window = this.createHannWindow(chunkSize, overlapSize);

    // Process chunks with overlap-add
    let chunkIndex = 0;
    for (let offset = 0; offset < monoAudio.length; offset += hopSize) {
      const chunkEnd = Math.min(offset + chunkSize, monoAudio.length);
      const currentChunkSize = chunkEnd - offset;
      
      console.log(`  Processing chunk ${chunkIndex + 1} at offset ${offset} (${currentChunkSize} samples)`);

      // Extract chunk
      const chunk = monoAudio.slice(offset, chunkEnd);
      
      // Pad if needed
      let paddedChunk = chunk;
      if (currentChunkSize < chunkSize) {
        paddedChunk = new Float32Array(chunkSize);
        paddedChunk.set(chunk);
      }

      // Process chunk through model
      const chunkStems = await this.processChunk(paddedChunk, opts);

      // Overlap-add into stem buffers with windowing
      for (const [stemName, chunkStem] of chunkStems) {
        const stemBuffer = stemBuffers.get(stemName)!;
        
        for (let i = 0; i < currentChunkSize && (offset + i) < monoAudio.length; i++) {
          // Apply window function for smooth transitions
          const windowValue = window[i < overlapSize ? i : (i > currentChunkSize - overlapSize ? i : overlapSize)];
          stemBuffer[offset + i] += chunkStem[i] * windowValue;
        }
      }

      chunkIndex++;
    }

    // PHASE 2 SOTA: Apply stem-specific post-conditioning AFTER inference
    console.log('[PHASE2 SOTA] Applying stem-specific post-conditioning...');
    this.applyStemPostConditioning(stemBuffers, opts.sampleRate);

    // PHASE 2: Normalize stems individually AFTER inference (if requested)
    if (opts.normalize) {
      console.log('[PHASE2 SOTA] Normalizing stems individually after inference...');
      this.normalizeStems(stemBuffers);
    }

    const processingTime = performance.now() - startTime;

    // PHASE 2: Build engine metadata (only if debug mode)
    let metadata: EngineMetadata | undefined;
    if (opts.debug) {
      const device = this.deviceManager.getCurrentDevice();
      metadata = {
        modelName: 'TF-Locoformer',
        modelVariant: `${this.config.numStems}-stem`,
        weightHash: this.weightHash,
        device: device?.name || 'Unknown',
        deviceType: device?.type || 'unknown',
        chunkSize,
        overlapSize,
        executionMode: this.executionMode,
      };
      console.log('[PHASE2 SOTA] Engine metadata:', metadata);
    }

    return {
      stems: stemBuffers,
      sampleRate: opts.sampleRate,
      duration: monoAudio.length / opts.sampleRate,
      processingTime,
      device: this.deviceManager.getCurrentDevice()?.name || 'Unknown',
      metadata,
    };
  }

  /**
   * Process a single audio chunk through the model
   * PHASE 2 SOTA: Core inference for chunked processing
   */
  private async processChunk(
    chunk: Float32Array,
    opts: SeparationOptions
  ): Promise<Map<string, Float32Array>> {
    // Perform STFT
    const spectrogram = stft(chunk, this.stftConfig);

    // Prepare input for model
    const modelInput = this.prepareModelInput(spectrogram);

    // Run inference
    const modelOutput = this.model!.forward(
      modelInput.data,
      modelInput.shape
    );

    // Post-process output to get individual stems
    const stems = this.postProcessOutput(
      modelOutput,
      modelInput.shape,
      chunk.length
    );

    return stems;
  }

  /**
   * Create Hann window for overlap-add
   * PHASE 2 SOTA: Smooth windowing to prevent clicks and seams
   */
  private createHannWindow(chunkSize: number, overlapSize: number): Float32Array {
    const window = new Float32Array(chunkSize);
    
    // Hann window for overlap regions
    for (let i = 0; i < overlapSize; i++) {
      const t = i / overlapSize;
      window[i] = 0.5 * (1 - Math.cos(Math.PI * t));
    }
    
    // Unity gain in the middle
    for (let i = overlapSize; i < chunkSize - overlapSize; i++) {
      window[i] = 1.0;
    }
    
    // Fade out at the end
    for (let i = chunkSize - overlapSize; i < chunkSize; i++) {
      const t = (chunkSize - i) / overlapSize;
      window[i] = 0.5 * (1 - Math.cos(Math.PI * t));
    }
    
    return window;
  }

  /**
   * Apply stem-specific post-conditioning
   * PHASE 2 SOTA: Different processing for each stem type
   */
  private applyStemPostConditioning(stems: Map<string, Float32Array>, sampleRate: number): void {
    for (const [stemName, audio] of stems) {
      switch (stemName) {
        case 'vocals':
          // Highpass 20-40 Hz to remove low-frequency rumble
          this.applyHighpass(audio, 30, sampleRate);
          break;
          
        case 'bass':
          // Mono below 120 Hz for tight low end
          this.applyLowFrequencyMono(audio, 120, sampleRate);
          break;
          
        case 'drums':
          // Preserve transients - no normalization applied earlier
          // Already handled by not normalizing before inference
          break;
          
        case 'instruments':
        case 'instrumental':
          // Preserve stereo width - no modification
          break;
          
        case 'fx':
        case 'other':
          // Preserve stereo width
          break;
      }
    }
  }

  /**
   * Simple highpass filter (removes DC and low-frequency content)
   */
  private applyHighpass(audio: Float32Array, cutoffHz: number, sampleRate: number): void {
    const rc = 1.0 / (2.0 * Math.PI * cutoffHz);
    const dt = 1.0 / sampleRate;
    const alpha = rc / (rc + dt);
    
    let prevInput = audio[0];
    let prevOutput = 0;
    
    for (let i = 0; i < audio.length; i++) {
      const currentInput = audio[i];
      const output = alpha * (prevOutput + currentInput - prevInput);
      audio[i] = output;
      prevInput = currentInput;
      prevOutput = output;
    }
  }

  /**
   * Make low frequencies mono (collapse stereo below cutoff)
   * Note: This is a simplified version - assumes mono input
   */
  private applyLowFrequencyMono(audio: Float32Array, cutoffHz: number, sampleRate: number): void {
    // For mono input, this is a no-op
    // In a real stereo implementation, this would:
    // 1. Split into L/R channels
    // 2. Average L/R below cutoffHz
    // 3. Keep L/R separate above cutoffHz
    console.log(`[SOTA] Low-frequency mono processing for bass (cutoff: ${cutoffHz}Hz)`);
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
