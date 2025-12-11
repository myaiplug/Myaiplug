/**
 * RMSGroupNorm - Root Mean Square Group Normalization
 * Used in TF-Locoformer for stable training and inference
 */

export interface RMSGroupNormConfig {
  numGroups: number;      // Number of groups (G=4 for TF-Locoformer)
  numChannels: number;    // Total number of channels
  eps: number;            // Small constant for numerical stability
  affine: boolean;        // Whether to use learnable affine parameters
}

export const DEFAULT_RMS_GROUP_NORM_CONFIG: RMSGroupNormConfig = {
  numGroups: 4,
  numChannels: 64,
  eps: 1e-5,
  affine: true,
};

/**
 * RMSGroupNorm layer
 * Normalizes input by RMS within groups
 */
export class RMSGroupNorm {
  private config: RMSGroupNormConfig;
  private gamma: Float32Array | null = null;
  private beta: Float32Array | null = null;

  constructor(config: Partial<RMSGroupNormConfig> = {}) {
    this.config = { ...DEFAULT_RMS_GROUP_NORM_CONFIG, ...config };
    
    if (this.config.numChannels % this.config.numGroups !== 0) {
      throw new Error('Number of channels must be divisible by number of groups');
    }
    
    if (this.config.affine) {
      this.gamma = new Float32Array(this.config.numChannels).fill(1.0);
      this.beta = new Float32Array(this.config.numChannels).fill(0.0);
    }
  }

  /**
   * Forward pass
   * @param input - Input tensor of shape [batch, channels, height, width] or [batch, channels, length]
   * @param shape - Shape of input tensor
   */
  forward(input: Float32Array, shape: number[]): Float32Array {
    const [batch, channels, ...spatial] = shape;
    const spatialSize = spatial.reduce((a, b) => a * b, 1);
    const groupSize = channels / this.config.numGroups;
    
    const output = new Float32Array(input.length);
    
    // Process each batch item
    for (let b = 0; b < batch; b++) {
      const batchOffset = b * channels * spatialSize;
      
      // Process each group
      for (let g = 0; g < this.config.numGroups; g++) {
        const groupOffset = batchOffset + g * groupSize * spatialSize;
        
        // Compute RMS for this group
        let sumSquares = 0;
        for (let c = 0; c < groupSize; c++) {
          const channelOffset = groupOffset + c * spatialSize;
          for (let i = 0; i < spatialSize; i++) {
            const val = input[channelOffset + i];
            sumSquares += val * val;
          }
        }
        
        const rms = Math.sqrt(sumSquares / (groupSize * spatialSize) + this.config.eps);
        
        // Normalize and apply affine transform
        for (let c = 0; c < groupSize; c++) {
          const channelIdx = g * groupSize + c;
          const channelOffset = groupOffset + c * spatialSize;
          
          const gamma = this.config.affine ? this.gamma![channelIdx] : 1.0;
          const beta = this.config.affine ? this.beta![channelIdx] : 0.0;
          
          for (let i = 0; i < spatialSize; i++) {
            const val = input[channelOffset + i];
            output[channelOffset + i] = (val / rms) * gamma + beta;
          }
        }
      }
    }
    
    return output;
  }

  /**
   * Load learned parameters
   */
  loadWeights(weights: { weight?: Float32Array; bias?: Float32Array } | Float32Array, beta?: Float32Array) {
    // Support both object and legacy format
    let gamma: Float32Array;
    let betaArray: Float32Array;
    
    if (weights instanceof Float32Array) {
      gamma = weights;
      betaArray = beta || new Float32Array(this.config.numChannels).fill(0);
    } else {
      gamma = weights.weight || new Float32Array(this.config.numChannels).fill(1);
      betaArray = weights.bias || new Float32Array(this.config.numChannels).fill(0);
    }
    
    if (gamma.length !== this.config.numChannels || betaArray.length !== this.config.numChannels) {
      throw new Error('Weight dimensions must match number of channels');
    }
    
    this.gamma = new Float32Array(gamma);
    this.beta = new Float32Array(betaArray);
  }
}

/**
 * Layer Normalization (simpler alternative)
 */
export class LayerNorm {
  private eps: number;
  private gamma: Float32Array;
  private beta: Float32Array;
  private normalizedShape: number[];

  constructor(normalizedShape: number[], eps: number = 1e-5) {
    this.normalizedShape = normalizedShape;
    this.eps = eps;
    
    const size = normalizedShape.reduce((a, b) => a * b, 1);
    this.gamma = new Float32Array(size).fill(1.0);
    this.beta = new Float32Array(size).fill(0.0);
  }

  forward(input: Float32Array, shape: number[]): Float32Array {
    const output = new Float32Array(input.length);
    const normalizedSize = this.normalizedShape.reduce((a, b) => a * b, 1);
    const batchSize = input.length / normalizedSize;
    
    for (let b = 0; b < batchSize; b++) {
      const offset = b * normalizedSize;
      
      // Compute mean
      let sum = 0;
      for (let i = 0; i < normalizedSize; i++) {
        sum += input[offset + i];
      }
      const mean = sum / normalizedSize;
      
      // Compute variance
      let sumSq = 0;
      for (let i = 0; i < normalizedSize; i++) {
        const diff = input[offset + i] - mean;
        sumSq += diff * diff;
      }
      const variance = sumSq / normalizedSize;
      const std = Math.sqrt(variance + this.eps);
      
      // Normalize and apply affine
      for (let i = 0; i < normalizedSize; i++) {
        const normalized = (input[offset + i] - mean) / std;
        output[offset + i] = normalized * this.gamma[i] + this.beta[i];
      }
    }
    
    return output;
  }

  loadWeights(gamma: Float32Array, beta: Float32Array) {
    this.gamma = new Float32Array(gamma);
    this.beta = new Float32Array(beta);
  }
}
