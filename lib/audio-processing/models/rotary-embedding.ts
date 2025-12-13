/**
 * Rotary Position Embedding (RoPE) for TF-Locoformer
 * Provides position-aware representations in transformer blocks
 */

export interface RotaryEmbeddingConfig {
  dim: number;           // Dimension of embedding
  maxSeqLen: number;     // Maximum sequence length
  base: number;          // Base for frequency computation
}

export const DEFAULT_ROTARY_CONFIG: RotaryEmbeddingConfig = {
  dim: 64,
  maxSeqLen: 8192,
  base: 10000,
};

/**
 * RotaryEmbedding class
 * Implements rotary position embeddings for attention mechanisms
 */
export class RotaryEmbedding {
  private config: RotaryEmbeddingConfig;
  private freqs: Float32Array;
  private cosCache: Float32Array;
  private sinCache: Float32Array;

  constructor(config: Partial<RotaryEmbeddingConfig> = {}) {
    this.config = { ...DEFAULT_ROTARY_CONFIG, ...config };
    
    // Pre-compute frequencies
    this.freqs = this.computeFrequencies();
    
    // Pre-compute cos and sin caches
    this.cosCache = new Float32Array(this.config.maxSeqLen * (this.config.dim / 2));
    this.sinCache = new Float32Array(this.config.maxSeqLen * (this.config.dim / 2));
    this.precomputeCache();
  }

  /**
   * Compute frequency bands
   */
  private computeFrequencies(): Float32Array {
    const dim = this.config.dim;
    const base = this.config.base;
    const freqs = new Float32Array(dim / 2);
    
    for (let i = 0; i < dim / 2; i++) {
      freqs[i] = 1.0 / Math.pow(base, (2 * i) / dim);
    }
    
    return freqs;
  }

  /**
   * Pre-compute cos and sin caches for all positions
   */
  private precomputeCache() {
    const halfDim = this.config.dim / 2;
    
    for (let pos = 0; pos < this.config.maxSeqLen; pos++) {
      for (let i = 0; i < halfDim; i++) {
        const angle = pos * this.freqs[i];
        const idx = pos * halfDim + i;
        this.cosCache[idx] = Math.cos(angle);
        this.sinCache[idx] = Math.sin(angle);
      }
    }
  }

  /**
   * Apply rotary embedding to query or key tensors
   * @param x - Input tensor of shape [batch, seqLen, numHeads, headDim]
   * @param shape - Shape array
   * @param seqOffset - Offset for position indices (for key/value caching)
   */
  applyRotary(x: Float32Array, shape: number[], seqOffset: number = 0): Float32Array {
    const [batch, seqLen, numHeads, headDim] = shape;
    
    if (headDim !== this.config.dim) {
      throw new Error(`Head dimension ${headDim} does not match RoPE dimension ${this.config.dim}`);
    }
    
    const output = new Float32Array(x.length);
    const halfDim = headDim / 2;
    
    for (let b = 0; b < batch; b++) {
      for (let s = 0; s < seqLen; s++) {
        const pos = s + seqOffset;
        
        if (pos >= this.config.maxSeqLen) {
          throw new Error(`Position ${pos} exceeds maximum sequence length ${this.config.maxSeqLen}`);
        }
        
        for (let h = 0; h < numHeads; h++) {
          const baseIdx = ((b * seqLen + s) * numHeads + h) * headDim;
          
          // Apply rotation to pairs of dimensions
          for (let i = 0; i < halfDim; i++) {
            const cacheIdx = pos * halfDim + i;
            const cos = this.cosCache[cacheIdx];
            const sin = this.sinCache[cacheIdx];
            
            const x1 = x[baseIdx + i];
            const x2 = x[baseIdx + i + halfDim];
            
            output[baseIdx + i] = x1 * cos - x2 * sin;
            output[baseIdx + i + halfDim] = x1 * sin + x2 * cos;
          }
        }
      }
    }
    
    return output;
  }

  /**
   * Apply rotary embedding with custom position indices
   */
  applyRotaryWithPositions(
    x: Float32Array,
    shape: number[],
    positions: Int32Array
  ): Float32Array {
    const [batch, seqLen, numHeads, headDim] = shape;
    const output = new Float32Array(x.length);
    const halfDim = headDim / 2;
    
    for (let b = 0; b < batch; b++) {
      for (let s = 0; s < seqLen; s++) {
        const pos = positions[b * seqLen + s];
        
        for (let h = 0; h < numHeads; h++) {
          const baseIdx = ((b * seqLen + s) * numHeads + h) * headDim;
          
          for (let i = 0; i < halfDim; i++) {
            const cacheIdx = pos * halfDim + i;
            const cos = this.cosCache[cacheIdx];
            const sin = this.sinCache[cacheIdx];
            
            const x1 = x[baseIdx + i];
            const x2 = x[baseIdx + i + halfDim];
            
            output[baseIdx + i] = x1 * cos - x2 * sin;
            output[baseIdx + i + halfDim] = x1 * sin + x2 * cos;
          }
        }
      }
    }
    
    return output;
  }
}

/**
 * Create position indices for 2D time-frequency grid
 * Used in TF-Locoformer for dual-path modeling
 */
export function create2DPositionIndices(
  timeSteps: number,
  freqBins: number
): { timeIndices: Int32Array; freqIndices: Int32Array } {
  const totalPositions = timeSteps * freqBins;
  const timeIndices = new Int32Array(totalPositions);
  const freqIndices = new Int32Array(totalPositions);
  
  for (let t = 0; t < timeSteps; t++) {
    for (let f = 0; f < freqBins; f++) {
      const idx = t * freqBins + f;
      timeIndices[idx] = t;
      freqIndices[idx] = f;
    }
  }
  
  return { timeIndices, freqIndices };
}

/**
 * Sinusoidal position embeddings (alternative to RoPE)
 */
export class SinusoidalPositionEmbedding {
  private dim: number;
  private maxLen: number;
  private embeddings: Float32Array;

  constructor(dim: number, maxLen: number = 10000) {
    this.dim = dim;
    this.maxLen = maxLen;
    this.embeddings = this.precomputeEmbeddings();
  }

  private precomputeEmbeddings(): Float32Array {
    const embeddings = new Float32Array(this.maxLen * this.dim);
    
    for (let pos = 0; pos < this.maxLen; pos++) {
      for (let i = 0; i < this.dim; i++) {
        const angle = pos / Math.pow(10000, (2 * Math.floor(i / 2)) / this.dim);
        
        if (i % 2 === 0) {
          embeddings[pos * this.dim + i] = Math.sin(angle);
        } else {
          embeddings[pos * this.dim + i] = Math.cos(angle);
        }
      }
    }
    
    return embeddings;
  }

  /**
   * Get position embeddings for a sequence
   */
  getEmbeddings(positions: Int32Array): Float32Array {
    const output = new Float32Array(positions.length * this.dim);
    
    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i];
      if (pos >= this.maxLen) {
        throw new Error(`Position ${pos} exceeds maximum length ${this.maxLen}`);
      }
      
      for (let d = 0; d < this.dim; d++) {
        output[i * this.dim + d] = this.embeddings[pos * this.dim + d];
      }
    }
    
    return output;
  }
}
