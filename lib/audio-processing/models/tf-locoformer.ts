/**
 * TF-Locoformer - Time-Frequency Transformer for Audio Source Separation
 * 
 * Core architecture:
 * - Dual-path TF modeling (time and frequency attention)
 * - ConvSwiGLU modules for efficient feature extraction
 * - RMSGroupNorm (G=4) for stable normalization
 * - Rotary positional embeddings
 * - 6-block Medium model configuration
 */

import { RMSGroupNorm } from './normalization';
import { RotaryEmbedding } from './rotary-embedding';
import { ConvSwiGLU, LinearLayer } from './conv-swiglu';

export interface TFLocoformerConfig {
  // Model dimensions
  numFreqBins: number;      // Number of frequency bins (from STFT)
  hiddenDim: number;        // Hidden dimension size
  numHeads: number;         // Number of attention heads
  numLayers: number;        // Number of transformer blocks
  
  // Architecture config
  ffnMultiplier: number;    // FFN hidden dim = hiddenDim * ffnMultiplier
  dropoutRate: number;      // Dropout probability
  
  // Normalization
  normGroups: number;       // Number of groups for RMSGroupNorm (default: 4)
  
  // Attention
  useRotaryEmb: boolean;    // Use rotary position embeddings
  attentionType: 'time' | 'frequency' | 'dual';  // Type of attention path
  
  // Stems configuration
  numStems: number;         // Number of output stems (2 for free, 5 for Pro)
  stemNames: string[];      // Names of stems
}

export const MEDIUM_MODEL_CONFIG: TFLocoformerConfig = {
  numFreqBins: 1025,        // For n_fft=2048
  hiddenDim: 384,
  numHeads: 8,
  numLayers: 6,
  ffnMultiplier: 4,
  dropoutRate: 0.1,
  normGroups: 4,
  useRotaryEmb: true,
  attentionType: 'dual',
  numStems: 2,
  stemNames: ['vocals', 'instrumental'],
};

export const PRO_MODEL_CONFIG: TFLocoformerConfig = {
  ...MEDIUM_MODEL_CONFIG,
  numStems: 5,
  stemNames: ['vocals', 'drums', 'bass', 'instruments', 'fx'],
};

/**
 * Simplified self-attention module
 */
class SimplifiedAttention {
  private dim: number;
  private numHeads: number;
  private headDim: number;
  private qProj: LinearLayer;
  private kProj: LinearLayer;
  private vProj: LinearLayer;
  private outProj: LinearLayer;
  private rope: RotaryEmbedding | null = null;

  constructor(dim: number, numHeads: number, useRotaryEmb: boolean = true) {
    this.dim = dim;
    this.numHeads = numHeads;
    this.headDim = dim / numHeads;

    this.qProj = new LinearLayer(dim, dim, false);
    this.kProj = new LinearLayer(dim, dim, false);
    this.vProj = new LinearLayer(dim, dim, false);
    this.outProj = new LinearLayer(dim, dim);

    if (useRotaryEmb) {
      this.rope = new RotaryEmbedding({ dim: this.headDim, maxSeqLen: 8192 });
    }
  }

  forward(x: Float32Array, shape: number[]): Float32Array {
    const [batch, seqLen, dim] = shape;

    // Project to Q, K, V
    const q = this.qProj.forward(x, shape);
    const k = this.kProj.forward(x, shape);
    const v = this.vProj.forward(x, shape);

    // Reshape for multi-head attention: [batch, seqLen, numHeads, headDim]
    const qReshaped = this.reshapeForHeads(q, batch, seqLen);
    const kReshaped = this.reshapeForHeads(k, batch, seqLen);
    const vReshaped = this.reshapeForHeads(v, batch, seqLen);

    // Apply rotary embeddings if enabled
    let qRot = qReshaped;
    let kRot = kReshaped;
    if (this.rope) {
      const ropeShape = [batch, seqLen, this.numHeads, this.headDim];
      qRot = this.rope.applyRotary(qReshaped, ropeShape);
      kRot = this.rope.applyRotary(kReshaped, ropeShape);
    }

    // Compute attention scores (simplified)
    const attended = this.computeAttention(qRot, kRot, vReshaped, batch, seqLen);

    // Reshape back and project
    const reshaped = this.reshapeFromHeads(attended, batch, seqLen);
    return this.outProj.forward(reshaped, shape);
  }

  private reshapeForHeads(x: Float32Array, batch: number, seqLen: number): Float32Array {
    const output = new Float32Array(x.length);
    
    for (let b = 0; b < batch; b++) {
      for (let s = 0; s < seqLen; s++) {
        for (let h = 0; h < this.numHeads; h++) {
          for (let d = 0; d < this.headDim; d++) {
            const srcIdx = (b * seqLen + s) * this.dim + h * this.headDim + d;
            const dstIdx = ((b * seqLen + s) * this.numHeads + h) * this.headDim + d;
            output[dstIdx] = x[srcIdx];
          }
        }
      }
    }
    
    return output;
  }

  private reshapeFromHeads(x: Float32Array, batch: number, seqLen: number): Float32Array {
    const output = new Float32Array(x.length);
    
    for (let b = 0; b < batch; b++) {
      for (let s = 0; s < seqLen; s++) {
        for (let h = 0; h < this.numHeads; h++) {
          for (let d = 0; d < this.headDim; d++) {
            const srcIdx = ((b * seqLen + s) * this.numHeads + h) * this.headDim + d;
            const dstIdx = (b * seqLen + s) * this.dim + h * this.headDim + d;
            output[dstIdx] = x[srcIdx];
          }
        }
      }
    }
    
    return output;
  }

  private computeAttention(
    q: Float32Array,
    k: Float32Array,
    v: Float32Array,
    batch: number,
    seqLen: number
  ): Float32Array {
    const output = new Float32Array(q.length);
    const scale = Math.sqrt(this.headDim);

    for (let b = 0; b < batch; b++) {
      for (let h = 0; h < this.numHeads; h++) {
        for (let i = 0; i < seqLen; i++) {
          // Compute attention scores for position i
          const scores = new Float32Array(seqLen);
          
          for (let j = 0; j < seqLen; j++) {
            let dotProduct = 0;
            
            for (let d = 0; d < this.headDim; d++) {
              const qIdx = ((b * seqLen + i) * this.numHeads + h) * this.headDim + d;
              const kIdx = ((b * seqLen + j) * this.numHeads + h) * this.headDim + d;
              dotProduct += q[qIdx] * k[kIdx];
            }
            
            scores[j] = dotProduct / scale;
          }

          // Softmax
          let maxScore = -Infinity;
          for (let j = 0; j < seqLen; j++) {
            maxScore = Math.max(maxScore, scores[j]);
          }
          
          let sumExp = 0;
          for (let j = 0; j < seqLen; j++) {
            scores[j] = Math.exp(scores[j] - maxScore);
            sumExp += scores[j];
          }
          
          for (let j = 0; j < seqLen; j++) {
            scores[j] /= sumExp;
          }

          // Apply attention to values
          for (let d = 0; d < this.headDim; d++) {
            let attended = 0;
            
            for (let j = 0; j < seqLen; j++) {
              const vIdx = ((b * seqLen + j) * this.numHeads + h) * this.headDim + d;
              attended += scores[j] * v[vIdx];
            }
            
            const outIdx = ((b * seqLen + i) * this.numHeads + h) * this.headDim + d;
            output[outIdx] = attended;
          }
        }
      }
    }

    return output;
  }

  loadWeights(weights: {
    qProj: { weight: Float32Array };
    kProj: { weight: Float32Array };
    vProj: { weight: Float32Array };
    outProj: { weight: Float32Array; bias?: Float32Array };
  }) {
    this.qProj.loadWeights(weights.qProj.weight);
    this.kProj.loadWeights(weights.kProj.weight);
    this.vProj.loadWeights(weights.vProj.weight);
    this.outProj.loadWeights(weights.outProj.weight, weights.outProj.bias);
  }
}

/**
 * TF-Locoformer Block
 * Single transformer block with dual-path time-frequency attention
 */
class TFLocoformerBlock {
  private config: TFLocoformerConfig;
  private timeAttention: SimplifiedAttention;
  private freqAttention: SimplifiedAttention;
  private norm1: RMSGroupNorm;
  private norm2: RMSGroupNorm;
  private norm3: RMSGroupNorm;
  private convSwiGLU: ConvSwiGLU;

  constructor(config: TFLocoformerConfig) {
    this.config = config;

    this.timeAttention = new SimplifiedAttention(
      config.hiddenDim,
      config.numHeads,
      config.useRotaryEmb
    );

    this.freqAttention = new SimplifiedAttention(
      config.hiddenDim,
      config.numHeads,
      config.useRotaryEmb
    );

    this.norm1 = new RMSGroupNorm({
      numGroups: config.normGroups,
      numChannels: config.hiddenDim,
    });

    this.norm2 = new RMSGroupNorm({
      numGroups: config.normGroups,
      numChannels: config.hiddenDim,
    });

    this.norm3 = new RMSGroupNorm({
      numGroups: config.normGroups,
      numChannels: config.hiddenDim,
    });

    this.convSwiGLU = new ConvSwiGLU(
      config.hiddenDim,
      config.hiddenDim,
      config.hiddenDim * config.ffnMultiplier
    );
  }

  forward(x: Float32Array, shape: number[]): Float32Array {
    const [batch, time, freq, channels] = shape;
    
    // Time attention path
    if (this.config.attentionType === 'time' || this.config.attentionType === 'dual') {
      const normalized1 = this.norm1.forward(x, shape);
      const timeAttn = this.processTimeAttention(normalized1, batch, time, freq, channels);
      x = this.addResidual(x, timeAttn);
    }

    // Frequency attention path
    if (this.config.attentionType === 'frequency' || this.config.attentionType === 'dual') {
      const normalized2 = this.norm2.forward(x, shape);
      const freqAttn = this.processFreqAttention(normalized2, batch, time, freq, channels);
      x = this.addResidual(x, freqAttn);
    }

    // ConvSwiGLU feedforward
    const normalized3 = this.norm3.forward(x, shape);
    const ffn = this.processFFN(normalized3, batch, time, freq, channels);
    x = this.addResidual(x, ffn);

    return x;
  }

  private processTimeAttention(
    x: Float32Array,
    batch: number,
    time: number,
    freq: number,
    channels: number
  ): Float32Array {
    // Reshape for time attention: [batch * freq, time, channels]
    const reshaped = new Float32Array(x.length);
    for (let b = 0; b < batch; b++) {
      for (let f = 0; f < freq; f++) {
        for (let t = 0; t < time; t++) {
          for (let c = 0; c < channels; c++) {
            const srcIdx = ((b * time + t) * freq + f) * channels + c;
            const dstIdx = ((b * freq + f) * time + t) * channels + c;
            reshaped[dstIdx] = x[srcIdx];
          }
        }
      }
    }

    const attended = this.timeAttention.forward(reshaped, [batch * freq, time, channels]);

    // Reshape back
    const output = new Float32Array(x.length);
    for (let b = 0; b < batch; b++) {
      for (let f = 0; f < freq; f++) {
        for (let t = 0; t < time; t++) {
          for (let c = 0; c < channels; c++) {
            const srcIdx = ((b * freq + f) * time + t) * channels + c;
            const dstIdx = ((b * time + t) * freq + f) * channels + c;
            output[dstIdx] = attended[srcIdx];
          }
        }
      }
    }

    return output;
  }

  private processFreqAttention(
    x: Float32Array,
    batch: number,
    time: number,
    freq: number,
    channels: number
  ): Float32Array {
    // For frequency attention, data is already in correct layout [batch * time, freq, channels]
    // No reshape needed since we process across frequency dimension for each time step
    return this.freqAttention.forward(x, [batch * time, freq, channels]);
  }

  private processFFN(
    x: Float32Array,
    batch: number,
    time: number,
    freq: number,
    channels: number
  ): Float32Array {
    // Process with ConvSwiGLU along time dimension
    const totalSamples = batch * freq;
    const output = new Float32Array(x.length);

    for (let i = 0; i < totalSamples; i++) {
      const input = new Float32Array(channels * time);
      
      // Extract time sequence
      for (let t = 0; t < time; t++) {
        for (let c = 0; c < channels; c++) {
          const idx = (i * time + t) * channels + c;
          input[c * time + t] = x[idx];
        }
      }

      const result = this.convSwiGLU.forward(input, time);

      // Put back
      for (let t = 0; t < result.outputLength; t++) {
        for (let c = 0; c < channels; c++) {
          const idx = (i * time + t) * channels + c;
          output[idx] = result.output[c * result.outputLength + t];
        }
      }
    }

    return output;
  }

  private addResidual(x: Float32Array, residual: Float32Array): Float32Array {
    const output = new Float32Array(x.length);
    for (let i = 0; i < x.length; i++) {
      output[i] = x[i] + residual[i];
    }
    return output;
  }
}

/**
 * Main TF-Locoformer Model
 */
export class TFLocoformer {
  private config: TFLocoformerConfig;
  private blocks: TFLocoformerBlock[];
  private inputProj: LinearLayer;
  private outputProj: LinearLayer;

  constructor(config: Partial<TFLocoformerConfig> = {}) {
    this.config = { ...MEDIUM_MODEL_CONFIG, ...config };
    
    this.inputProj = new LinearLayer(this.config.numFreqBins * 2, this.config.hiddenDim);
    this.outputProj = new LinearLayer(
      this.config.hiddenDim,
      this.config.numFreqBins * 2 * this.config.numStems
    );

    this.blocks = [];
    for (let i = 0; i < this.config.numLayers; i++) {
      this.blocks.push(new TFLocoformerBlock(this.config));
    }
  }

  /**
   * Forward pass through the model
   * @param spectrogram - Complex spectrogram [real, imag] interleaved
   * @param shape - [batch, time, freq, 2] where 2 is [real, imag]
   */
  forward(spectrogram: Float32Array, shape: number[]): Float32Array {
    const [batch, time, freq, _] = shape;

    // Project input to hidden dimension
    const projected = this.inputProj.forward(spectrogram, [batch, time, freq * 2]);
    let x = projected;

    // Process through transformer blocks
    const blockShape = [batch, time, freq, this.config.hiddenDim];
    for (const block of this.blocks) {
      x = block.forward(x, blockShape);
    }

    // Project to output (multi-stem)
    const output = this.outputProj.forward(x, [batch, time, this.config.hiddenDim]);

    return output;
  }

  getConfig(): TFLocoformerConfig {
    return { ...this.config };
  }
}
