# Dynamics Processing Guide

**Control the dynamic range of your audio**

---

## Table of Contents
1. [Overview](#overview)
2. [Compression](#compression)
3. [Limiting](#limiting)
4. [Expansion](#expansion)
5. [Gating](#gating)
6. [Multiband Dynamics](#multiband-dynamics)

---

## Overview

Dynamics processing controls the volume relationship between loud and quiet parts of audio. Use dynamics to:
- Control peaks and increase average level
- Add punch and sustain
- Reduce dynamic range for consistency
- Remove noise between phrases
- Shape transients and tonal character

**Key Concepts:**
- **Threshold**: Level at which processing begins
- **Ratio**: Amount of gain reduction applied
- **Attack**: How quickly processing responds
- **Release**: How quickly processing stops
- **Makeup Gain**: Compensate for level reduction

---

## Compression

Reduce the dynamic range by attenuating loud signals above a threshold.

### Gentle Compression (🟢 Basic)

**Description**: Subtle compression for glue and control  
**Use Case**: Mix bus, vocal smoothing, general leveling  
**Quality**: Transparent, musical compression

**FFmpeg Command:**
```bash
# 3:1 ratio, -18dB threshold, medium attack/release
ffmpeg -i input.wav -af "acompressor=threshold=-18dB:ratio=3:attack=20:release=200:makeup=3dB" output.wav
```

**SoX Command:**
```bash
sox input.wav output.wav compand 0.1,0.3 -60,-60,-18,-15,-12,-12,0,-9 3
```

**Parameters Explained:**
- `threshold=-18dB`: Compression starts at -18dB
- `ratio=3`: 3:1 compression (3dB over threshold = 1dB output)
- `attack=20`: Attack time in milliseconds
- `release=200`: Release time in milliseconds
- `makeup=3dB`: Gain compensation

**Tips:**
- Use 2:1 to 4:1 for transparent compression
- Slower attack preserves transients
- Faster release adds energy
- Adjust makeup gain to match input level

---

### Medium Compression (🟡 Intermediate)

**Description**: More aggressive compression for control  
**Use Case**: Vocals, bass, drums (individual tracks)  
**Quality**: Noticeable but musical compression

**FFmpeg Command:**
```bash
# 5:1 ratio, -15dB threshold, faster attack
ffmpeg -i input.wav -af "acompressor=threshold=-15dB:ratio=5:attack=5:release=100:knee=3dB:makeup=5dB" output.wav
```

**Parameters Explained:**
- `ratio=5`: More aggressive 5:1 compression
- `attack=5`: Fast attack catches transients
- `knee=3dB`: Soft knee for smoother transition
- `release=100`: Medium-fast release

**Tips:**
- Fast attack tames peaks effectively
- Soft knee sounds more natural
- Watch for pumping with fast release
- Use side-chain for frequency-selective compression

---

### Heavy Compression (🔴 Advanced)

**Description**: Aggressive compression for maximum control  
**Use Case**: Broadcasting, loud vocals, heavy limiting  
**Quality**: Obvious compression, high sustain

**FFmpeg Command:**
```bash
# 10:1 ratio, multi-stage compression
ffmpeg -i input.wav -af "\
acompressor=threshold=-20dB:ratio=4:attack=10:release=150:makeup=4dB,\
acompressor=threshold=-12dB:ratio=6:attack=2:release=80:makeup=3dB" output.wav
```

**Multi-Stage Approach:**
1. First stage: Moderate compression (4:1)
2. Second stage: Aggressive peak control (6:1)

**Tips:**
- Two-stage compression sounds more natural
- Each stage does less work
- Avoid extreme single-stage ratios (>10:1)
- Consider parallel compression

---

### Parallel Compression (🟡 Intermediate)

**Description**: Blend heavily compressed signal with dry signal  
**Use Case**: Add punch and sustain without losing dynamics  
**Quality**: Best of both worlds - punch and naturalness

**FFmpeg Command:**
```bash
# Create heavily compressed version, mix 50/50 with original
ffmpeg -i input.wav -filter_complex "\
[0:a]acompressor=threshold=-20dB:ratio=10:attack=1:release=50:makeup=10dB[compressed];\
[0:a][compressed]amix=inputs=2:weights=0.5 0.5" output.wav
```

**Parameters Explained:**
- Heavy compression on one channel
- `amix`: Mix dry and compressed signals
- `weights=0.5 0.5`: 50/50 blend

**Tips:**
- Experiment with mix ratios (30/70 to 70/30)
- Great for drums and bass
- Use extreme settings on compressed channel
- Adjust blend to taste

---

## Limiting

Prevent audio from exceeding a maximum level.

### Soft Limiting (🟢 Basic)

**Description**: Gentle peak control  
**Use Case**: Master bus protection, prevent clipping  
**Quality**: Transparent peak control

**FFmpeg Command:**
```bash
# Soft limiter at -1dB
ffmpeg -i input.wav -af "alimiter=limit=-1dB:attack=5:release=50" output.wav
```

**Parameters Explained:**
- `limit=-1dB`: Maximum output level
- `attack=5`: Fast attack to catch peaks
- `release=50`: Release time in milliseconds

**Tips:**
- Set limit 0.5-1dB below 0dBFS
- Use on master bus for safety
- Minimal gain reduction is best
- Should be mostly transparent

---

### Aggressive Limiting (🟡 Intermediate)

**Description**: Maximize loudness  
**Use Case**: Competitive loudness, streaming  
**Quality**: Noticeable but controlled distortion

**FFmpeg Command:**
```bash
# Aggressive limiter with multiple stages
ffmpeg -i input.wav -af "\
alimiter=limit=-0.5dB:attack=2:release=30,\
loudnorm=I=-14:TP=-1:LRA=11" output.wav
```

**Two-Stage Approach:**
1. Hard limiting at -0.5dB
2. Loudness normalization to -14 LUFS

**Tips:**
- Use loudness normalization for streaming
- Fast attack prevents intersample peaks
- Monitor for distortion
- Leave headroom for codec processing

---

### Mastering Limiter Chain (🔴 Advanced)

**Description**: Professional mastering limiting  
**Use Case**: Final mastering stage  
**Quality**: Maximum loudness with minimal artifacts

**FFmpeg Command:**
```bash
# Multi-stage mastering limiter
ffmpeg -i input.wav -af "\
acompressor=threshold=-6dB:ratio=3:attack=20:release=200:makeup=3dB,\
acompressor=threshold=-3dB:ratio=5:attack=5:release=100:makeup=2dB,\
alimiter=limit=-0.3dB:attack=1:release=20" output.wav
```

**Three-Stage Approach:**
1. Gentle compression for glue
2. Medium compression for level
3. Final limiting for peaks

**Tips:**
- Each stage does less work = cleaner results
- Monitor with metering (LUFS, true peak)
- Compare to commercial references
- Less limiting = more dynamics = better sound

---

## Expansion

Increase dynamic range by attenuating quiet signals below a threshold.

### Gentle Expansion (🟢 Basic)

**Description**: Subtle downward expansion  
**Use Case**: Reduce noise floor, increase dynamics  
**Quality**: Transparent noise reduction

**FFmpeg Command:**
```bash
# Expand signals below -40dB
ffmpeg -i input.wav -af "acompressor=threshold=-40dB:ratio=0.5:attack=20:release=200" output.wav
```

**Parameters Explained:**
- `ratio=0.5`: Expansion ratio (inverse of compression)
- `threshold=-40dB`: Expand below this level
- Ratios < 1.0 = expansion

**Tips:**
- Use to increase dynamic range
- Reduces noise between phrases
- Opposite effect of compression
- Subtle settings work best

---

### Upward Expansion (🟡 Intermediate)

**Description**: Increase dynamic range by boosting loud signals  
**Use Case**: Restore dynamics to compressed material  
**Quality**: Can restore life to over-compressed audio

**SoX Command:**
```bash
# Upward expansion using contrast
sox input.wav output.wav contrast 75
```

**Tips:**
- Use on over-compressed sources
- Can't fully restore original dynamics
- Experiment with amount
- May introduce artifacts

---

## Gating

Mute or attenuate audio below a threshold.

### Noise Gate (🟢 Basic)

**Description**: Remove noise between phrases  
**Use Case**: Clean up vocal recordings, drum tracks  
**Quality**: Clean signal with noise removed

**FFmpeg Command:**
```bash
# Gate at -35dB
ffmpeg -i input.wav -af "agate=threshold=-35dB:ratio=9:attack=10:release=200:knee=3dB" output.wav
```

**Parameters Explained:**
- `threshold=-35dB`: Gate opens above this level
- `ratio=9`: High ratio for complete gating
- `attack=10`: How fast gate opens
- `release=200`: How fast gate closes
- `knee=3dB`: Soft knee for smoother transition

**Tips:**
- Set threshold just above noise floor
- Slower attack preserves note starts
- Faster release on drums, slower on vocals
- Watch for cutting off natural decay

---

### Sidechain Gate (🟡 Intermediate)

**Description**: Gate controlled by another signal  
**Use Case**: Rhythmic gating, ducking effects  
**Quality**: Creative rhythmic effects

**FFmpeg Command:**
```bash
# Gate one signal based on another
ffmpeg -i audio.wav -i trigger.wav -filter_complex "\
[0:a][1:a]sidechaingate=threshold=-30dB:ratio=9:attack=5:release=100[gated]" \
-map "[gated]" output.wav
```

**Tips:**
- Use for creative rhythmic effects
- Great for EDM and electronic music
- Control audio with drums or other rhythmic source
- Experiment with threshold and release

---

### Advanced Gate with Hold (🔴 Advanced)

**Description**: Gate with hold time to prevent chattering  
**Use Case**: Professional vocal gating, drums  
**Quality**: Smooth, artifact-free gating

**FFmpeg Command:**
```bash
# Gate with hold parameter
ffmpeg -i input.wav -af "agate=threshold=-35dB:ratio=9:attack=5:release=200:hold=100:knee=3dB" output.wav
```

**Parameters Explained:**
- `hold=100`: Minimum time gate stays open (ms)
- Prevents rapid open/close cycles

**Tips:**
- Hold time prevents chattering
- Use 50-200ms hold for vocals
- Shorter hold for drums (20-50ms)
- Always use soft knee

---

## Multiband Dynamics

Process different frequency ranges independently.

### Multiband Compression (🔴 Advanced)

**Description**: Independent compression for each frequency band  
**Use Case**: Mastering, broadcast, podcast production  
**Quality**: Professional, transparent control

**FFmpeg Command:**
```bash
# Split into 3 bands, compress each separately
ffmpeg -i input.wav -filter_complex "\
[0:a]asplit=3[low][mid][high];\
[low]lowpass=f=200,acompressor=threshold=-18dB:ratio=4:attack=20:release=100[low_comp];\
[mid]highpass=f=200,lowpass=f=3000,acompressor=threshold=-15dB:ratio=3:attack=10:release=80[mid_comp];\
[high]highpass=f=3000,acompressor=threshold=-20dB:ratio=5:attack=5:release=50[high_comp];\
[low_comp][mid_comp][high_comp]amix=inputs=3:normalize=0[out]" \
-map "[out]" output.wav
```

**Band Configuration:**
- **Low (< 200 Hz)**: Control bass, 4:1 ratio
- **Mid (200 Hz - 3 kHz)**: Control body, 3:1 ratio
- **High (> 3 kHz)**: Control presence, 5:1 ratio

**Tips:**
- Different settings per band
- Prevents bass from triggering whole compressor
- More transparent than single-band
- Requires careful level matching

---

### De-Esser (🟡 Intermediate)

**Description**: High-frequency compression for sibilance  
**Use Case**: Vocal processing, reduce harsh "S" sounds  
**Quality**: Targeted sibilance control

**FFmpeg Command:**
```bash
# Compress only high frequencies (5-10 kHz)
ffmpeg -i input.wav -filter_complex "\
[0:a]asplit=2[main][sc];\
[sc]highpass=f=5000,lowpass=f=10000[sidechain];\
[main][sidechain]sidechaincompress=threshold=-25dB:ratio=6:attack=1:release=50[out]" \
-map "[out]" output.wav
```

**Parameters Explained:**
- Sidechain filtered to sibilance range (5-10 kHz)
- Fast attack catches "S" sounds
- Short release returns quickly

**Tips:**
- Adjust threshold to taste (-20 to -30 dB)
- Don't over-process (vocal sounds lispy)
- Use after EQ in chain
- Solo the sidechain to hear what's being compressed

---

## Common Dynamics Applications

### Vocal Compression Chain
```bash
# Professional vocal dynamics
ffmpeg -i vocal.wav -af "\
acompressor=threshold=-20dB:ratio=3:attack=10:release=100:makeup=3dB,\
acompressor=threshold=-12dB:ratio=5:attack=2:release=50:makeup=2dB,\
alimiter=limit=-1dB:attack=2:release=30" vocal_processed.wav
```

### Drum Bus Compression
```bash
# Glue drums together
ffmpeg -i drums.wav -af "acompressor=threshold=-15dB:ratio=4:attack=30:release=150:knee=4dB:makeup=4dB" drums_compressed.wav
```

### Podcast Leveling
```bash
# Consistent podcast levels
ffmpeg -i podcast.wav -af "\
acompressor=threshold=-20dB:ratio=3:attack=20:release=200:makeup=5dB,\
loudnorm=I=-16:TP=-1.5:LRA=11" podcast_leveled.wav
```

### Bass Compression
```bash
# Consistent bass levels
ffmpeg -i bass.wav -af "acompressor=threshold=-18dB:ratio=6:attack=5:release=80:makeup=5dB" bass_compressed.wav
```

---

## Best Practices

1. **Gain Reduction**: Aim for 3-6dB GR on average
2. **Attack Time**: Fast for transient control, slow to preserve punch
3. **Release Time**: Match to tempo or phrase length
4. **Makeup Gain**: Compensate for level reduction
5. **Soft Knee**: Sounds more natural than hard knee
6. **Serial Compression**: Multiple stages sound better than one extreme stage
7. **Parallel Compression**: Blend for best of both worlds
8. **Monitor Constantly**: Check input vs output levels
9. **Context**: Compress in context of full mix
10. **Reference**: Compare to professional tracks

---

## Compression Settings by Instrument

| Instrument | Ratio | Attack | Release | Notes |
|------------|-------|--------|---------|-------|
| Vocals | 3-6:1 | 10-30ms | 100-200ms | Slow attack preserves consonants |
| Bass | 4-8:1 | 5-20ms | 50-100ms | Fast attack controls low end |
| Drums | 4-10:1 | 5-30ms | 50-200ms | Varies by drum type |
| Acoustic Guitar | 2-4:1 | 10-30ms | 150-300ms | Gentle for natural dynamics |
| Piano | 2-3:1 | 20-50ms | 200-400ms | Very gentle, preserve dynamics |
| Mix Bus | 2-3:1 | 20-40ms | 200-400ms | Subtle glue compression |

---

## Troubleshooting

**Problem**: Pumping/breathing sound  
**Solution**: Slower attack/release, or lower ratio

**Problem**: Lost transients  
**Solution**: Slower attack time

**Problem**: Not enough compression  
**Solution**: Lower threshold or higher ratio

**Problem**: Over-compressed, lifeless  
**Solution**: Higher threshold, lower ratio, or parallel compression

**Problem**: Distortion  
**Solution**: Reduce makeup gain, check input levels

---

**Next Steps:**
- Experiment with attack/release times
- Try parallel compression
- Move on to [Reverb & Ambience](03-reverb-ambience.md)

---

[← Back to Main Guide](../../AUDIO_EFFECTS_GUIDE.md)
