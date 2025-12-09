/**
 * ConvSwiGLU - Convolutional Swish-Gated Linear Unit
 * Core building block of TF-Locoformer
 */

/**
 * Swish activation function (SiLU)
 * f(x) = x * sigmoid(x)
 */
export function swish(x: Float32Array): Float32Array {
  const output = new Float32Array(x.length);
  
  for (let i = 0; i < x.length; i++) {
    const sigmoid = 1.0 / (1.0 + Math.exp(-x[i]));
    output[i] = x[i] * sigmoid;
  }
  
  return output;
}

/**
 * GELU activation function
 * f(x) ≈ 0.5 * x * (1 + tanh(√(2/π) * (x + 0.044715 * x³)))
 */
export function gelu(x: Float32Array): Float32Array {
  const output = new Float32Array(x.length);
  const sqrt2OverPi = Math.sqrt(2.0 / Math.PI);
  
  for (let i = 0; i < x.length; i++) {
    const val = x[i];
    const cube = val * val * val;
    const inner = sqrt2OverPi * (val + 0.044715 * cube);
    output[i] = 0.5 * val * (1.0 + Math.tanh(inner));
  }
  
  return output;
}

/**
 * 1D Convolution layer
 */
export class Conv1D {
  private inChannels: number;
  private outChannels: number;
  private kernelSize: number;
  private stride: number;
  private padding: number;
  private dilation: number;
  private groups: number;
  private weights: Float32Array | null = null;
  private bias: Float32Array | null = null;

  constructor(
    inChannels: number,
    outChannels: number,
    kernelSize: number,
    stride: number = 1,
    padding: number = 0,
    dilation: number = 1,
    groups: number = 1,
    useBias: boolean = true
  ) {
    this.inChannels = inChannels;
    this.outChannels = outChannels;
    this.kernelSize = kernelSize;
    this.stride = stride;
    this.padding = padding;
    this.dilation = dilation;
    this.groups = groups;

    if (useBias) {
      this.bias = new Float32Array(outChannels).fill(0);
    }
  }

  forward(input: Float32Array, inputLength: number): { output: Float32Array; outputLength: number } {
    if (!this.weights) {
      throw new Error('Weights not loaded. Call loadWeights() first.');
    }

    const batch = 1; // Assuming batch size 1 for simplicity
    const inChannelsPerGroup = this.inChannels / this.groups;
    const outChannelsPerGroup = this.outChannels / this.groups;

    // Calculate output length
    const outputLength = Math.floor(
      (inputLength + 2 * this.padding - this.dilation * (this.kernelSize - 1) - 1) / this.stride + 1
    );

    const output = new Float32Array(this.outChannels * outputLength);

    // Pad input if needed
    let paddedInput = input;
    let paddedLength = inputLength;
    if (this.padding > 0) {
      paddedLength = inputLength + 2 * this.padding;
      paddedInput = new Float32Array(this.inChannels * paddedLength);
      
      for (let c = 0; c < this.inChannels; c++) {
        for (let i = 0; i < inputLength; i++) {
          paddedInput[c * paddedLength + this.padding + i] = input[c * inputLength + i];
        }
      }
    }

    // Perform grouped convolution
    for (let g = 0; g < this.groups; g++) {
      const inGroupOffset = g * inChannelsPerGroup;
      const outGroupOffset = g * outChannelsPerGroup;

      for (let oc = 0; oc < outChannelsPerGroup; oc++) {
        const outChannel = outGroupOffset + oc;
        
        for (let pos = 0; pos < outputLength; pos++) {
          let sum = 0;
          const inputPos = pos * this.stride;

          for (let ic = 0; ic < inChannelsPerGroup; ic++) {
            const inChannel = inGroupOffset + ic;
            
            for (let k = 0; k < this.kernelSize; k++) {
              const inputIdx = inputPos + k * this.dilation;
              if (inputIdx >= 0 && inputIdx < paddedLength) {
                const weightIdx = ((outChannel * inChannelsPerGroup + ic) * this.kernelSize + k);
                sum += paddedInput[inChannel * paddedLength + inputIdx] * this.weights[weightIdx];
              }
            }
          }

          if (this.bias) {
            sum += this.bias[outChannel];
          }

          output[outChannel * outputLength + pos] = sum;
        }
      }
    }

    return { output, outputLength };
  }

  loadWeights(weights: Float32Array, bias?: Float32Array) {
    this.weights = new Float32Array(weights);
    if (bias) {
      this.bias = new Float32Array(bias);
    }
  }
}

/**
 * ConvSwiGLU Module
 * Combines convolution with SwiGLU activation for efficient feature extraction
 */
export class ConvSwiGLU {
  private inChannels: number;
  private outChannels: number;
  private hiddenChannels: number;
  private kernelSize: number;
  private conv1: Conv1D;
  private conv2: Conv1D;
  private convGate: Conv1D;
  private convOut: Conv1D;

  constructor(
    inChannels: number,
    outChannels: number,
    hiddenChannels?: number,
    kernelSize: number = 3
  ) {
    this.inChannels = inChannels;
    this.outChannels = outChannels;
    this.hiddenChannels = hiddenChannels || inChannels * 4;
    this.kernelSize = kernelSize;

    const padding = Math.floor(kernelSize / 2);

    // Input projection
    this.conv1 = new Conv1D(inChannels, this.hiddenChannels, 1);

    // Depthwise convolution
    this.conv2 = new Conv1D(
      this.hiddenChannels,
      this.hiddenChannels,
      kernelSize,
      1,
      padding,
      1,
      this.hiddenChannels
    );

    // Gate convolution
    this.convGate = new Conv1D(
      this.hiddenChannels,
      this.hiddenChannels,
      kernelSize,
      1,
      padding,
      1,
      this.hiddenChannels
    );

    // Output projection
    this.convOut = new Conv1D(this.hiddenChannels, outChannels, 1);
  }

  forward(input: Float32Array, inputLength: number): { output: Float32Array; outputLength: number } {
    // Input projection
    let { output: x, outputLength: len } = this.conv1.forward(input, inputLength);

    // Depthwise convolution
    const { output: x1, outputLength: len1 } = this.conv2.forward(x, len);

    // Gate convolution
    const { output: gate, outputLength: len2 } = this.convGate.forward(x, len);

    // Apply swish to gate
    const activatedGate = swish(gate);

    // Element-wise multiplication (GLU)
    const gated = new Float32Array(x1.length);
    for (let i = 0; i < x1.length; i++) {
      gated[i] = x1[i] * activatedGate[i];
    }

    // Output projection
    return this.convOut.forward(gated, len1);
  }

  loadWeights(weights: {
    conv1: { weight: Float32Array; bias?: Float32Array };
    conv2: { weight: Float32Array; bias?: Float32Array };
    convGate: { weight: Float32Array; bias?: Float32Array };
    convOut: { weight: Float32Array; bias?: Float32Array };
  }) {
    this.conv1.loadWeights(weights.conv1.weight, weights.conv1.bias);
    this.conv2.loadWeights(weights.conv2.weight, weights.conv2.bias);
    this.convGate.loadWeights(weights.convGate.weight, weights.convGate.bias);
    this.convOut.loadWeights(weights.convOut.weight, weights.convOut.bias);
  }
}

/**
 * Feedforward Network with SwiGLU
 */
export class SwiGLUFFN {
  private dim: number;
  private hiddenDim: number;
  private fc1: LinearLayer;
  private fcGate: LinearLayer;
  private fc2: LinearLayer;

  constructor(dim: number, hiddenDim?: number) {
    this.dim = dim;
    this.hiddenDim = hiddenDim || dim * 4;

    this.fc1 = new LinearLayer(dim, this.hiddenDim);
    this.fcGate = new LinearLayer(dim, this.hiddenDim);
    this.fc2 = new LinearLayer(this.hiddenDim, dim);
  }

  forward(input: Float32Array, shape: number[]): Float32Array {
    // Project to hidden dimension
    const x = this.fc1.forward(input, shape);
    const gate = this.fcGate.forward(input, shape);

    // Apply swish to gate and multiply
    const activatedGate = swish(gate);
    const gated = new Float32Array(x.length);
    for (let i = 0; i < x.length; i++) {
      gated[i] = x[i] * activatedGate[i];
    }

    // Project back to original dimension
    const outputShape = [...shape];
    outputShape[outputShape.length - 1] = this.hiddenDim;
    return this.fc2.forward(gated, outputShape);
  }

  loadWeights(weights: {
    fc1: { weight: Float32Array; bias?: Float32Array };
    fcGate: { weight: Float32Array; bias?: Float32Array };
    fc2: { weight: Float32Array; bias?: Float32Array };
  }) {
    this.fc1.loadWeights(weights.fc1.weight, weights.fc1.bias);
    this.fcGate.loadWeights(weights.fcGate.weight, weights.fcGate.bias);
    this.fc2.loadWeights(weights.fc2.weight, weights.fc2.bias);
  }
}

/**
 * Simple linear layer (fully connected)
 */
export class LinearLayer {
  private inFeatures: number;
  private outFeatures: number;
  private weights: Float32Array | null = null;
  private bias: Float32Array | null = null;

  constructor(inFeatures: number, outFeatures: number, useBias: boolean = true) {
    this.inFeatures = inFeatures;
    this.outFeatures = outFeatures;

    if (useBias) {
      this.bias = new Float32Array(outFeatures).fill(0);
    }
  }

  forward(input: Float32Array, shape: number[]): Float32Array {
    if (!this.weights) {
      throw new Error('Weights not loaded');
    }

    const lastDim = shape[shape.length - 1];
    const batchSize = input.length / lastDim;
    const output = new Float32Array(batchSize * this.outFeatures);

    for (let b = 0; b < batchSize; b++) {
      for (let o = 0; o < this.outFeatures; o++) {
        let sum = 0;
        for (let i = 0; i < this.inFeatures; i++) {
          sum += input[b * this.inFeatures + i] * this.weights[o * this.inFeatures + i];
        }
        if (this.bias) {
          sum += this.bias[o];
        }
        output[b * this.outFeatures + o] = sum;
      }
    }

    return output;
  }

  loadWeights(weights: Float32Array, bias?: Float32Array) {
    this.weights = new Float32Array(weights);
    if (bias) {
      this.bias = new Float32Array(bias);
    }
  }
}
