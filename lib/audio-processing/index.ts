/**
 * TF-Locoformer Audio Processing Library
 * 
 * Unified separation + enhancement engine for MyAiPlug
 * - Inference only, no training
 * - Shared backend module used by all apps
 * - 2-stem free tier demo (vocals/instrumental)
 * - 5-stem Pro tier (vocals/drums/bass/instruments/FX)
 */

// Core models
export { TFLocoformer, MEDIUM_MODEL_CONFIG, PRO_MODEL_CONFIG } from './models/tf-locoformer';
export type { TFLocoformerConfig } from './models/tf-locoformer';

export { RMSGroupNorm, LayerNorm } from './models/normalization';
export type { RMSGroupNormConfig } from './models/normalization';

export { RotaryEmbedding, SinusoidalPositionEmbedding, create2DPositionIndices } from './models/rotary-embedding';
export type { RotaryEmbeddingConfig } from './models/rotary-embedding';

export { 
  ConvSwiGLU, 
  SwiGLUFFN, 
  LinearLayer, 
  Conv1D,
  swish,
  gelu 
} from './models/conv-swiglu';

// Inference
export { TFLocoformerInference, createInferenceEngine } from './inference/engine';
export type { SeparationOptions, SeparationResult } from './inference/engine';

// Utilities
export { 
  stft, 
  istft, 
  magnitude, 
  phase, 
  createWindow, 
  padSignal,
  DEFAULT_STFT_CONFIG 
} from './utils/stft';
export type { STFTConfig, Complex } from './utils/stft';

export {
  decodeAudioFile,
  decodeWAV,
  isSupportedFormat,
  validateAudioConstraints,
  stereoToMono,
  resampleAudio,
  streamDecodeAudio,
  SUPPORTED_FORMATS,
} from './utils/audio-decoder';
export type { AudioInfo, DecodedAudio } from './utils/audio-decoder';

export {
  loadWeightsFromFile,
  clearWeightCache,
  getWeightCacheStats,
  validateWeights,
  getWeightsDir,
} from './utils/weight-loader';
export type { WeightMetadata, ModelWeights } from './utils/weight-loader';

export {
  detectDevices,
  selectBestDevice,
  checkGPUCapability,
  getDeviceManager,
  initializeDeviceManager,
  DeviceManager,
  DeviceType,
} from './utils/device';
export type { DeviceInfo } from './utils/device';

// Version
export const VERSION = '1.0.0-phase2';
export const MODEL_VERSION = 'medium-6block';
export const FEATURES = {
  optimizedFFT: true,
  realAudioDecoding: true,
  weightLoading: true,
  modelCaching: true,
  streamingSupport: true,
  gpuOptimization: true,
};

/**
 * Quick start example:
 * 
 * ```typescript
 * import { createInferenceEngine, initializeDeviceManager } from '@/lib/audio-processing';
 * 
 * // Initialize
 * await initializeDeviceManager();
 * const engine = createInferenceEngine('free'); // or 'pro'
 * await engine.initialize();
 * 
 * // Separate audio
 * const result = await engine.separate(audioData, {
 *   tier: 'free',
 *   outputFormat: 'wav',
 *   sampleRate: 44100,
 *   normalize: true,
 * });
 * 
 * // Access stems
 * const vocals = result.stems.get('vocals');
 * const instrumental = result.stems.get('instrumental');
 * ```
 */
