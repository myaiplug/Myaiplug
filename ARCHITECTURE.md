# TF-Locoformer Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     MyAiPlug Applications                        │
├─────────────────────────────────────────────────────────────────┤
│  StemSplit  │  NoDAW Polish  │  HalfScrew Pre-FX  │   Future    │
└─────┬───────┴────────┬───────┴────────┬───────────┴─────────────┘
      │                │                │
      ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Layer (Next.js)                         │
├─────────────────────────────────────────────────────────────────┤
│  POST /separate  │  POST /enhance  │  POST /clean              │
└─────┬─────────────┴─────┬───────────┴─────┬─────────────────────┘
      │                   │                  │
      └───────────────────┼──────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│              TF-Locoformer Inference Engine                      │
├─────────────────────────────────────────────────────────────────┤
│  • Tier Management (Free/Pro)                                   │
│  • Device Selection (CPU/GPU/WebGPU)                            │
│  • Audio Preprocessing                                           │
│  • Stem Separation/Enhancement                                   │
│  • Post-processing & Normalization                               │
└─────┬───────────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Core Processing Pipeline                      │
└─────────────────────────────────────────────────────────────────┘

Input Audio (PCM)
      │
      ▼
┌──────────────┐
│  STFT        │  n_fft=2048, hop=512, window=Hann
│  Transform   │  Output: [Time, Freq=1025, Complex=2]
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────────┐
│           TF-Locoformer Model (6 Blocks Medium)                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Input Projection: [T, F, 2] → [T, F, hidden=384]               │
│                                                                   │
│  ┌─────────────────────────────────────────────────────┐        │
│  │  Block 1-6: Dual-Path Transformer                   │        │
│  │                                                       │        │
│  │  ┌────────────────────────────────────────┐         │        │
│  │  │  Time Attention                         │         │        │
│  │  │  • Multi-head (8 heads)                 │         │        │
│  │  │  • Rotary Position Embeddings (RoPE)    │         │        │
│  │  │  • Attend across time for each freq     │         │        │
│  │  └────────┬───────────────────────────────┘         │        │
│  │           │ + Residual                               │        │
│  │           ▼                                          │        │
│  │  ┌────────────────────────────────────────┐         │        │
│  │  │  RMSGroupNorm (G=4)                     │         │        │
│  │  └────────┬───────────────────────────────┘         │        │
│  │           ▼                                          │        │
│  │  ┌────────────────────────────────────────┐         │        │
│  │  │  Frequency Attention                    │         │        │
│  │  │  • Multi-head (8 heads)                 │         │        │
│  │  │  • Rotary Position Embeddings (RoPE)    │         │        │
│  │  │  • Attend across freq for each time     │         │        │
│  │  └────────┬───────────────────────────────┘         │        │
│  │           │ + Residual                               │        │
│  │           ▼                                          │        │
│  │  ┌────────────────────────────────────────┐         │        │
│  │  │  RMSGroupNorm (G=4)                     │         │        │
│  │  └────────┬───────────────────────────────┘         │        │
│  │           ▼                                          │        │
│  │  ┌────────────────────────────────────────┐         │        │
│  │  │  ConvSwiGLU Feedforward                 │         │        │
│  │  │  • Expansion: hidden × 4                │         │        │
│  │  │  • Depthwise Conv (kernel=3)            │         │        │
│  │  │  • Swish-gated activation                │         │        │
│  │  └────────┬───────────────────────────────┘         │        │
│  │           │ + Residual                               │        │
│  │           ▼                                          │        │
│  │  ┌────────────────────────────────────────┐         │        │
│  │  │  RMSGroupNorm (G=4)                     │         │        │
│  │  └────────────────────────────────────────┘         │        │
│  │                                                       │        │
│  └───────────────────────────────────────────────────────┘        │
│  (Repeat 6 times)                                                │
│                                                                   │
│  Output Projection: [T, F, hidden] → [T, F×2×num_stems]         │
│                                                                   │
└──────┬────────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────────┐
│  Stem Extraction & iSTFT                                         │
├──────────────────────────────────────────────────────────────────┤
│  For each stem (vocals, drums, bass, instruments, fx):          │
│    1. Extract complex spectrogram [T, F, 2]                     │
│    2. Apply inverse STFT                                         │
│    3. Reconstruct time-domain audio                              │
└──────┬───────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────────┐
│  Post-Processing                                                 │
├──────────────────────────────────────────────────────────────────┤
│  • Normalization (prevent clipping)                              │
│  • Soft limiting (threshold=0.95)                                │
│  • Format conversion                                             │
└──────┬───────────────────────────────────────────────────────────┘
       │
       ▼
  Output Stems
  ┌───────────┬──────────┬──────┬─────────────┬────┐
  │  Vocals   │  Drums   │ Bass │ Instruments │ FX │
  └───────────┴──────────┴──────┴─────────────┴────┘
```

## Component Details

### STFT (Short-Time Fourier Transform)
- **Purpose**: Convert time-domain audio to time-frequency representation
- **Config**: FFT size 2048, hop 512, Hann window
- **Output**: Complex spectrogram [Time, Frequency=1025, Real+Imag]

### TF-Locoformer Blocks
Each of the 6 blocks contains:

1. **Time Attention**
   - Processes temporal information
   - Each frequency bin attends across time
   - 8 attention heads
   - Rotary position embeddings

2. **Frequency Attention**
   - Processes spectral information
   - Each time frame attends across frequencies
   - 8 attention heads
   - Rotary position embeddings

3. **ConvSwiGLU FFN**
   - 1D convolution along time axis
   - Expansion ratio: 4×
   - Swish-gated activation
   - Depthwise convolution (kernel=3)

4. **RMSGroupNorm**
   - Groups: 4
   - Channels: 384
   - Epsilon: 1e-5

### iSTFT (Inverse STFT)
- **Purpose**: Convert frequency domain back to time domain
- **Method**: Overlap-add with window normalization
- **Output**: Time-domain audio per stem

## Data Flow Example

### Free Tier (2 stems)
```
input.wav (stereo, 44.1kHz, 3 min)
    ↓ mono conversion
PCM [7,938,000 samples]
    ↓ STFT
Spectrogram [345 time frames, 1025 freq bins, 2 complex]
    ↓ TF-Locoformer
Features [345, 1025, 384] → Stems [345, 1025, 2×2]
    ↓ iSTFT (per stem)
vocals.wav [7,938,000 samples]
instrumental.wav [7,938,000 samples]
```

### Pro Tier (5 stems)
```
input.wav (stereo, 44.1kHz, 10 min)
    ↓ processing
vocals.wav
drums.wav
bass.wav
instruments.wav
fx.wav
```

## Device Architecture

```
┌──────────────────────────────────────────────────────────┐
│              Device Manager                               │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  Auto-detect:                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ WebGPU   │  │  WebGL   │  │   CPU    │              │
│  │ (Best)   │  │  (Good)  │  │ (Fallback)│              │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘              │
│       │             │              │                      │
│       └─────────────┼──────────────┘                      │
│                     ▼                                     │
│  ┌────────────────────────────────────────┐              │
│  │  GPU Capability Assessment              │              │
│  │  • RTX 2080 Super detection             │              │
│  │  • Performance tier (high/med/low)      │              │
│  │  • Real-time capability check           │              │
│  │  • Memory constraints                   │              │
│  └────────────────────────────────────────┘              │
│                                                           │
└──────────────────────────────────────────────────────────┘

Performance Tiers:
┌─────────────────┬──────────┬───────────┬──────────────┐
│     Device      │  Speed   │ Realtime  │  Max Audio   │
├─────────────────┼──────────┼───────────┼──────────────┤
│ RTX 2080 Super+ │  5-10×   │    ✓      │   5 minutes  │
│ Mid-range GPU   │  2-5×    │    ✗      │   3 minutes  │
│ CPU             │  0.5-1×  │    ✗      │   1 minute   │
└─────────────────┴──────────┴───────────┴──────────────┘
```

## API Architecture

```
┌────────────────────────────────────────────────────────────┐
│                    Client Application                       │
└────────────────────┬───────────────────────────────────────┘
                     │ HTTP POST (multipart/form-data)
                     ▼
┌────────────────────────────────────────────────────────────┐
│               Next.js API Routes (Edge)                     │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  /api/audio/separate                                        │
│  ├─ Validate: file type, size, tier                        │
│  ├─ Initialize: device manager, inference engine           │
│  ├─ Process: audio → stems                                 │
│  └─ Return: job info, stems metadata                       │
│                                                             │
│  /api/audio/clean                                           │
│  ├─ Validate: file type, size                              │
│  ├─ Process: remove noise/artifacts                        │
│  └─ Return: cleaned audio info                             │
│                                                             │
│  /api/audio/enhance                                         │
│  ├─ Validate: file type, size, level                       │
│  ├─ Process: separate → remix → polish                     │
│  └─ Return: enhanced audio + quality metrics               │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

## Memory Architecture

```
Processing Pipeline Memory Layout:

Input Audio:
┌────────────────────────────────────────────┐
│  Float32Array [samples]                    │  ~40MB (10s @ 44.1kHz)
└────────────────────────────────────────────┘

STFT:
┌────────────────────────────────────────────┐
│  Real: Float32Array [T×F]                  │  ~10MB
│  Imag: Float32Array [T×F]                  │  ~10MB
└────────────────────────────────────────────┘

Model Hidden States:
┌────────────────────────────────────────────┐
│  Activations: Float32Array [T×F×hidden]    │  ~150MB
└────────────────────────────────────────────┘

Output Stems:
┌────────────────────────────────────────────┐
│  Stem 1: Float32Array [samples]            │  ~40MB
│  Stem 2: Float32Array [samples]            │  ~40MB
│  Stem 3-5: (Pro tier)                      │  ~120MB
└────────────────────────────────────────────┘

Total Memory (Free Tier): ~250MB
Total Memory (Pro Tier): ~490MB
```

## Tier Configuration

```
┌─────────────────────────────────────────────────────────┐
│                     Free Tier                            │
├─────────────────────────────────────────────────────────┤
│  Stems: 2 (vocals, instrumental)                        │
│  Max Duration: 3 minutes                                │
│  Use Cases:                                             │
│  • Karaoke creation                                     │
│  • Vocal isolation                                      │
│  • Basic remixing                                       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                      Pro Tier                            │
├─────────────────────────────────────────────────────────┤
│  Stems: 5 (vocals, drums, bass, instruments, fx)       │
│  Max Duration: 10 minutes                               │
│  Use Cases:                                             │
│  • Professional mixing                                  │
│  • Remixing & mashups                                   │
│  • Mastering                                            │
│  • Stem-level effects                                   │
└─────────────────────────────────────────────────────────┘
```

## File Structure

```
lib/audio-processing/
├── index.ts                    # Public API exports
│
├── models/                     # Neural network components
│   ├── tf-locoformer.ts       # 6-block transformer (457 lines)
│   ├── conv-swiglu.ts         # ConvSwiGLU modules (353 lines)
│   ├── normalization.ts       # RMSGroupNorm (163 lines)
│   └── rotary-embedding.ts    # Position embeddings (233 lines)
│
├── utils/                      # Utilities
│   ├── stft.ts                # Time-frequency conversion (331 lines)
│   └── device.ts              # GPU detection (250 lines)
│
└── inference/                  # Inference engine
    └── engine.ts              # Separation/clean/enhance (317 lines)
```

## Routing Table

```
API Endpoint              → Use Case           → Engine Method
───────────────────────────────────────────────────────────────
POST /api/audio/separate  → StemSplit          → engine.separate()
POST /api/audio/clean     → HalfScrew Pre-FX   → engine.clean()
POST /api/audio/enhance   → NoDAW Polish       → engine.enhance()
```

---

**Total Lines of Code**: ~2,600 (production) + 1,100 (docs) + 310 (tests) = ~4,000 lines
**Build Status**: ✅ Success
**Security**: ✅ 0 Vulnerabilities
**Phase**: 1 Complete
