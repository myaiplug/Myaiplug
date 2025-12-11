# TF-Locoformer Audio Processing

Unified audio separation and enhancement engine for MyAiPlug applications (StemSplit, NoDAW, HalfScrew pre-FX, etc.).

## Overview

TF-Locoformer is a Time-Frequency Transformer-based model designed for high-quality audio source separation and enhancement. This implementation provides inference-only capabilities with support for both CPU and GPU execution.

## Architecture

### Core Components

1. **STFT/iSTFT** - Time-frequency domain conversion
2. **TF-Locoformer Model** - 6-block Medium model with:
   - Dual-path TF modeling (time and frequency attention)
   - ConvSwiGLU modules for efficient feature extraction
   - RMSGroupNorm (G=4) for stable normalization
   - Rotary positional embeddings
3. **Inference Engine** - Device-aware execution with CPU/GPU fallback

### Model Configurations

#### Free Tier (2-stem)
- **Stems**: Vocals, Instrumental
- **Use cases**: Basic separation, karaoke, vocal isolation

#### Pro Tier (5-stem)
- **Stems**: Vocals, Drums, Bass, Instruments, FX
- **Use cases**: Professional mixing, remixing, mastering

## API Endpoints

### 1. POST `/api/audio/separate`
Separates audio into individual stems.

**Parameters:**
```typescript
{
  audio: File,                    // Audio file
  tier: 'free' | 'pro',          // Tier selection
  format: 'wav' | 'mp3' | 'flac', // Output format
  normalize: boolean              // Auto-normalize output
}
```

**Response:**
```typescript
{
  success: boolean,
  jobId: string,
  tier: string,
  stems: {
    [stemName: string]: {
      name: string,
      length: number,
      duration: number,
      available: boolean
    }
  },
  processing: {
    duration: number,
    processingTime: number,
    device: string,
    supportsRealtime: boolean
  }
}
```

### 2. POST `/api/audio/clean`
Cleans audio for HalfScrew pre-FX processing. Removes noise and artifacts.

**Parameters:**
```typescript
{
  audio: File,
  tier: 'free' | 'pro',
  format: 'wav' | 'mp3' | 'flac'
}
```

**Use cases:**
- Pre-processing for time-stretching effects
- Noise reduction
- Signal cleanup

### 3. POST `/api/audio/enhance`
Enhances audio for NoDAW polish. Separates and remixes stems with optimized levels.

**Parameters:**
```typescript
{
  audio: File,
  tier: 'free' | 'pro',
  format: 'wav' | 'mp3' | 'flac',
  enhancementLevel: 'subtle' | 'moderate' | 'aggressive'
}
```

**Enhancement Levels:**
- **Subtle**: Light touch-up, preserves original character
- **Moderate**: Balanced enhancement (default)
- **Aggressive**: Maximum processing for dramatic improvement

## Usage Examples

### TypeScript/JavaScript

```typescript
import { 
  createInferenceEngine, 
  initializeDeviceManager 
} from '@/lib/audio-processing';

// Initialize device manager
await initializeDeviceManager();

// Create inference engine
const engine = createInferenceEngine('free'); // or 'pro'
await engine.initialize();

// Check device capabilities
const deviceInfo = engine.getDeviceInfo();
console.log('Current device:', deviceInfo.current);
console.log('Supports realtime:', engine.supportsRealtime());

// Separate audio
const result = await engine.separate(audioData, {
  tier: 'free',
  outputFormat: 'wav',
  sampleRate: 44100,
  normalize: true,
});

// Access stems
const vocals = result.stems.get('vocals');
const instrumental = result.stems.get('instrumental');

// Clean audio
const cleaned = await engine.clean(audioData);

// Enhance audio
const enhanced = await engine.enhance(audioData);
```

### API Usage

```bash
# Separate audio (free tier)
curl -X POST http://localhost:3000/api/audio/separate \
  -F "audio=@input.wav" \
  -F "tier=free" \
  -F "format=wav"

# Clean audio
curl -X POST http://localhost:3000/api/audio/clean \
  -F "audio=@input.wav" \
  -F "tier=free"

# Enhance audio
curl -X POST http://localhost:3000/api/audio/enhance \
  -F "audio=@input.wav" \
  -F "tier=pro" \
  -F "enhancementLevel=moderate"
```

## Device Support

### Automatic Device Detection

The system automatically detects and selects the best available compute device:

1. **WebGPU** (preferred) - Modern GPU acceleration
2. **WebGL/GPU** - Legacy GPU support
3. **CPU** - Always available as fallback

### Performance Expectations

| Device | Configuration | Processing Speed | Max Audio Length |
|--------|--------------|------------------|------------------|
| RTX 2080 Super+ | High | 5-10x realtime | 5 minutes |
| Mid-range GPU | Medium | 2-5x realtime | 3 minutes |
| CPU | Low | 0.5-1x realtime | 1 minute |

### GPU Detection

```typescript
import { getDeviceManager } from '@/lib/audio-processing';

const manager = getDeviceManager();
await manager.initialize();

const capability = manager.getGPUCapability();
console.log('RTX 2080 or better:', capability.isRTX2080OrBetter);
console.log('Performance level:', capability.estimatedPerformance);
console.log('Supports realtime:', capability.supportsRealtime);
```

## Technical Details

### STFT Configuration

```typescript
{
  n_fft: 2048,         // FFT size
  hop_length: 512,     // Hop size
  win_length: 2048,    // Window length
  window: 'hann',      // Window function
  center: true,        // Center padding
  normalized: false,   // FFT normalization
  onesided: true       // One-sided FFT
}
```

### Model Architecture

```
Input Audio
    ↓
  STFT (2048 FFT, 512 hop)
    ↓
  [Batch, Time, Freq=1025, Complex=2]
    ↓
  Input Projection (→ hidden_dim=384)
    ↓
  6x TF-Locoformer Blocks:
    - Time Attention (8 heads, RoPE)
    - Frequency Attention (8 heads, RoPE)
    - ConvSwiGLU FFN (×4 expansion)
    - RMSGroupNorm (G=4)
    ↓
  Output Projection (→ num_stems × complex)
    ↓
  iSTFT per stem
    ↓
  [vocals, instrumental] or [vocals, drums, bass, instruments, fx]
```

### Memory Requirements

- **Free tier (2-stem)**: ~500MB GPU / 1GB CPU
- **Pro tier (5-stem)**: ~1GB GPU / 2GB CPU

## Limitations (Phase 1)

- ✅ Inference only (no training)
- ✅ Pre-trained weights not included (stub implementation)
- ✅ Simplified FFT (use production FFT library in deployment)
- ✅ Basic audio I/O (extend for production formats)
- ✅ Single-batch processing (extend for batch processing)

## Future Enhancements (Phase 2+)

- [ ] Load pre-trained model weights
- [ ] Optimize FFT with WebAssembly or native libraries
- [ ] Real-time streaming processing
- [ ] Multi-batch inference
- [ ] Advanced audio encoding/decoding
- [ ] Model quantization for faster inference
- [ ] Mobile device support

## Integration Points

### StemSplit
```typescript
POST /api/audio/separate
- Primary use case for stem separation
```

### HalfScrew
```typescript
POST /api/audio/clean
- Pre-processing before pitch/tempo effects
```

### NoDAW
```typescript
POST /api/audio/enhance
- Post-processing and mastering
```

## Testing

```bash
# Unit tests (to be added)
npm run test:audio-processing

# Integration tests
npm run test:api
```

## License

All rights reserved © 2025 MyAiPlug™

## Version

- **Phase 1**: 1.0.0
- **Model**: Medium 6-block
- **Release**: December 2024
