# Audio Restoration Guide

**Noise reduction, de-clicking, de-essing, and cleanup**

---

## Table of Contents
1. [Overview](#overview)
2. [Noise Reduction](#noise-reduction)
3. [De-Clicking](#de-clicking)
4. [De-Essing](#de-essing)
5. [Hum Removal](#hum-removal)
6. [Click & Pop Removal](#click--pop-removal)
7. [Restoration Workflows](#restoration-workflows)

---

## Overview

Audio restoration removes unwanted artifacts and noise. Use restoration to:
- Clean up recordings
- Remove background noise
- Fix technical problems
- Restore old recordings
- Improve clarity

**Common Issues:**
- Background hiss
- AC hum (50/60 Hz)
- Clicks and pops
- Sibilance (harsh "S" sounds)
- Room noise
- Digital artifacts

**Key Principles:**
- Less is more - preserve original character
- Process gradually - multiple gentle stages
- Monitor artifacts - don't introduce new problems
- Reference original - A/B compare constantly
- Context matters - judge in final use case

---

## Noise Reduction

Remove constant background noise while preserving signal.

### Gentle Noise Reduction (🟢 Basic)

**Description**: Subtle noise floor reduction  
**Use Case**: Clean up good recordings with slight hiss  
**Quality**: Transparent, minimal artifacts

**SoX Command:**
```bash
# Simple noise gate
sox input.wav output.wav noisered noise-profile.prof 0.2
```

**Process:**
1. Create noise profile from silent section:
```bash
sox input.wav -n trim 0 1 noiseprof noise-profile.prof
```
2. Apply noise reduction:
```bash
sox input.wav output.wav noisered noise-profile.prof 0.2
```

**Parameters Explained:**
- `0.2`: Amount of reduction (0.0-1.0)
- 0.1-0.3 is subtle
- Higher values = more reduction but more artifacts

**Tips:**
- Capture noise profile from silent section
- Start with low amounts (0.1-0.3)
- Multiple passes better than one extreme pass
- Watch for "underwater" sound

---

### Standard Noise Reduction (🟡 Intermediate)

**Description**: Moderate noise reduction  
**Use Case**: Noisy recordings, field recordings  
**Quality**: Noticeable improvement, some artifacts possible

**SoX Command:**
```bash
# Moderate noise reduction
sox input.wav output.wav noisered noise-profile.prof 0.4
```

**Tips:**
- 0.3-0.5 range for moderate reduction
- May introduce some artifacts
- A/B test carefully
- Consider multi-band approach

---

### Heavy Noise Reduction (🔴 Advanced)

**Description**: Aggressive noise reduction  
**Use Case**: Very noisy recordings, restoration  
**Quality**: Maximum reduction, expect artifacts

**SoX Command:**
```bash
# Heavy noise reduction with multi-pass
sox input.wav temp1.wav noisered noise-profile.prof 0.3
sox temp1.wav output.wav noisered noise-profile.prof 0.3
rm temp1.wav
```

**Tips:**
- Multiple gentle passes better than one extreme
- 2-3 passes of 0.2-0.3 reduction
- Combine with other restoration techniques
- Accept some artifacts on very noisy material

---

### Spectral Noise Gating (🔴 Advanced)

**Description**: Frequency-selective noise reduction  
**Use Case**: Complex noise patterns  
**Quality**: Targeted, sophisticated

**FFmpeg Approach:**
```bash
# High-pass to remove rumble, gate for transients
ffmpeg -i input.wav -af "\
highpass=f=80,\
agate=threshold=-45dB:ratio=9:attack=10:release=200:knee=3dB" output.wav
```

**Tips:**
- Combine high-pass filtering with gating
- Remove low-frequency rumble
- Gate removes noise between phrases
- Multi-stage approach

---

## De-Clicking

Remove clicks, pops, and digital glitches.

### Light De-Click (🟢 Basic)

**Description**: Remove subtle clicks  
**Use Case**: Digital transfers, light restoration  
**Quality**: Transparent, preserves transients

**SoX Command:**
```bash
# Gentle de-click
sox input.wav output.wav declick -n 1
```

**Parameters Explained:**
- `-n 1`: Number of passes (1-4)
- More passes = more aggressive
- Start with 1 pass

**Tips:**
- One pass usually sufficient
- Preserves drum transients
- Very transparent
- For subtle clicks only

---

### Standard De-Click (🟡 Intermediate)

**Description**: Moderate click removal  
**Use Case**: Vinyl transfers, moderate damage  
**Quality**: Good balance of removal and preservation

**SoX Command:**
```bash
# Standard de-click
sox input.wav output.wav declick -n 2
```

**Tips:**
- 2 passes for moderate clicks
- Watch for transient loss
- A/B test with drums and percussion
- May need different settings per section

---

### Heavy De-Click (🔴 Advanced)

**Description**: Aggressive click removal  
**Use Case**: Badly damaged recordings  
**Quality**: Maximum removal, may affect transients

**SoX Command:**
```bash
# Heavy de-click with multiple passes
sox input.wav output.wav declick -n 3 declick -n 2
```

**Tips:**
- Multiple stages with different settings
- Expect some transient dulling
- May need to restore high frequencies after
- Last resort for badly damaged material

---

## De-Essing

Reduce harsh sibilance in vocals.

### Subtle De-Esser (🟢 Basic)

**Description**: Gentle sibilance control  
**Use Case**: Well-recorded vocals with slight harshness  
**Quality**: Transparent sibilance reduction

**FFmpeg Command:**
```bash
# Simple high-frequency compression
ffmpeg -i input.wav -filter_complex "\
[0:a]asplit=2[main][sc];\
[sc]highpass=f=6000[sidechain];\
[main][sidechain]sidechaincompress=threshold=-25dB:ratio=3:attack=1:release=50[out]" \
-map "[out]" output.wav
```

**Parameters Explained:**
- `highpass=f=6000`: Target sibilance range (5-10 kHz)
- `threshold=-25dB`: When de-essing starts
- `ratio=3`: Gentle compression

**Tips:**
- 5-8 kHz for most sibilance
- Adjust threshold to taste
- Very transparent
- Use after EQ in chain

---

### Standard De-Esser (🟡 Intermediate)

**Description**: Moderate sibilance reduction  
**Use Case**: Bright vocals, excessive sibilance  
**Quality**: Noticeable but natural reduction

**FFmpeg Command:**
```bash
# Moderate de-essing
ffmpeg -i input.wav -filter_complex "\
[0:a]asplit=2[main][sc];\
[sc]highpass=f=5000,lowpass=f=10000[sidechain];\
[main][sidechain]sidechaincompress=threshold=-22dB:ratio=5:attack=1:release=40[out]" \
-map "[out]" output.wav
```

**Tips:**
- Bandpass filter on sidechain (5-10 kHz)
- Higher ratio (4-6:1)
- Fast attack catches sibilance
- Medium release

---

### Aggressive De-Esser (🔴 Advanced)

**Description**: Heavy sibilance reduction  
**Use Case**: Very bright recordings, fix harsh recordings  
**Quality**: Maximum reduction, may sound dull

**FFmpeg Command:**
```bash
# Aggressive de-essing
ffmpeg -i input.wav -filter_complex "\
[0:a]asplit=2[main][sc];\
[sc]highpass=f=4500,lowpass=f=12000[sidechain];\
[main][sidechain]sidechaincompress=threshold=-20dB:ratio=8:attack=0.5:release=30[out]" \
-map "[out]" output.wav
```

**Tips:**
- Wider frequency range
- High ratio (6-10:1)
- Very fast attack
- May need to boost air after (12+ kHz)

---

### Multiband De-Esser (🔴 Advanced)

**Description**: Frequency-specific sibilance control  
**Use Case**: Professional vocal processing  
**Quality**: Precise, transparent

**Approach:**
```bash
# Split into bands, compress only sibilance range
ffmpeg -i input.wav -filter_complex "\
[0:a]asplit=3[low][mid][high];\
[low]lowpass=f=5000[lows];\
[mid]highpass=f=5000,lowpass=f=10000,\
  compand=attacks=0.001:decays=0.05:points=-40/-40|-25/-20|-20/-15[mids];\
[high]highpass=f=10000[highs];\
[lows][mids][highs]amix=inputs=3:normalize=0[out]" \
-map "[out]" output.wav
```

**Tips:**
- Only compress sibilance band (5-10 kHz)
- Leave lows and highs unaffected
- Most transparent approach
- Professional results

---

## Hum Removal

Remove 50/60 Hz AC hum and harmonics.

### Single Frequency Hum Removal (🟢 Basic)

**Description**: Remove fundamental hum frequency  
**Use Case**: Light hum, single frequency  
**Quality**: Clean removal of target frequency

**FFmpeg Command:**
```bash
# Remove 60 Hz hum (US)
ffmpeg -i input.wav -af "equalizer=f=60:t=h:width=10:g=-40" output.wav

# Remove 50 Hz hum (EU)
ffmpeg -i input.wav -af "equalizer=f=50:t=h:width=10:g=-40" output.wav
```

**Tips:**
- Very narrow notch filter
- -30 to -40 dB cut
- 5-10 Hz bandwidth
- Minimal impact on other frequencies

---

### Hum + Harmonics Removal (🟡 Intermediate)

**Description**: Remove fundamental and harmonic hum  
**Use Case**: Moderate hum problem  
**Quality**: Complete hum removal

**FFmpeg Command:**
```bash
# Remove 60 Hz and first 4 harmonics
ffmpeg -i input.wav -af "\
equalizer=f=60:t=h:width=10:g=-40,\
equalizer=f=120:t=h:width=10:g=-40,\
equalizer=f=180:t=h:width=10:g=-40,\
equalizer=f=240:t=h:width=10:g=-40,\
equalizer=f=300:t=h:width=10:g=-40" output.wav
```

**Harmonics:**
- 1st: 60 Hz (fundamental)
- 2nd: 120 Hz
- 3rd: 180 Hz
- 4th: 240 Hz
- 5th: 300 Hz

**Tips:**
- Remove fundamental + 3-5 harmonics
- Use spectrum analyzer to identify
- Careful not to remove too much
- May need adjustment per frequency

---

### Complex Hum Removal (🔴 Advanced)

**Description**: Multiple hum sources and harmonics  
**Use Case**: Severe hum issues  
**Quality**: Comprehensive removal

**FFmpeg Command:**
```bash
# Both 50 and 60 Hz + harmonics (ground loop issues)
ffmpeg -i input.wav -af "\
equalizer=f=50:t=h:width=8:g=-40,\
equalizer=f=60:t=h:width=8:g=-40,\
equalizer=f=100:t=h:width=8:g=-35,\
equalizer=f=120:t=h:width=8:g=-35,\
equalizer=f=150:t=h:width=8:g=-35,\
equalizer=f=180:t=h:width=8:g=-35" output.wav
```

**Tips:**
- Address multiple fundamental frequencies
- May have both 50 and 60 Hz
- Harmonics of each
- Use high-pass filter first (below 40 Hz)

---

## Click & Pop Removal

Remove vinyl clicks and digital pops.

### Light Click Removal (🟢 Basic)

**Description**: Remove occasional clicks  
**Use Case**: Good quality digital transfers  
**Quality**: Transparent

**SoX Command:**
```bash
# Light click removal
sox input.wav output.wav declick
```

**Tips:**
- Default settings work well
- Very transparent
- Doesn't affect transients
- For light issues only

---

### Vinyl Restoration (🔴 Advanced)

**Description**: Comprehensive vinyl click/pop removal  
**Use Case**: Vinyl record transfers  
**Quality**: Clean but requires careful processing

**SoX Command:**
```bash
# Multi-stage vinyl restoration
sox input.wav temp1.wav declick -n 2
sox temp1.wav temp2.wav noisered noise-profile.prof 0.3
sox temp2.wav output.wav equalizer 2000 1.5q 2
rm temp1.wav temp2.wav
```

**Stages:**
1. Click removal (2 passes)
2. Noise reduction
3. Gentle high-frequency boost (lost in cleaning)

**Tips:**
- Process in stages
- Create noise profile from run-out groove
- May need EQ after to restore brightness
- Test on different material

---

## Restoration Workflows

### Podcast Cleanup Workflow (🟡 Intermediate)

**Description**: Complete podcast audio cleanup  
**Use Case**: Podcast production  
**Quality**: Broadcast-ready

**FFmpeg Command Chain:**
```bash
# 1. High-pass filter
ffmpeg -i raw.wav -af "highpass=f=80" temp1.wav

# 2. Noise gate
ffmpeg -i temp1.wav -af "agate=threshold=-45dB:ratio=9:attack=10:release=200" temp2.wav

# 3. De-essing
ffmpeg -i temp2.wav -filter_complex "\
[0:a]asplit=2[main][sc];\
[sc]highpass=f=5000[sidechain];\
[main][sidechain]sidechaincompress=threshold=-25dB:ratio=4:attack=1:release=50[out]" \
-map "[out]" temp3.wav

# 4. Compression and normalization
ffmpeg -i temp3.wav -af "\
acompressor=threshold=-20dB:ratio=3:attack=10:release=100:makeup=5dB,\
loudnorm=I=-16:TP=-1.5:LRA=11" clean.wav

# Cleanup
rm temp*.wav
```

**Workflow Steps:**
1. Remove rumble
2. Gate background noise
3. Control sibilance
4. Level and normalize

---

### Voice-Over Cleanup (🟡 Intermediate)

**Description**: Clean voice recordings for video  
**Use Case**: YouTube, video production  
**Quality**: Professional voice-over sound

**Commands:**
```bash
# Combined cleanup
ffmpeg -i voiceover.wav -af "\
highpass=f=80,\
agate=threshold=-40dB:ratio=9:attack=10:release=150,\
acompressor=threshold=-18dB:ratio=3:attack=15:release=150:makeup=4dB,\
equalizer=f=200:t=q:width=1.5:g=-2,\
equalizer=f=3000:t=q:width=1.5:g=2,\
loudnorm=I=-16:TP=-1" clean_vo.wav
```

**Processing Chain:**
1. High-pass filter (rumble)
2. Noise gate (background)
3. Compression (consistency)
4. EQ (clarity)
5. Normalize (levels)

---

### Field Recording Restoration (🔴 Advanced)

**Description**: Clean up outdoor/location recordings  
**Use Case**: Documentary, field recordings  
**Quality**: Best possible from compromised source

**SoX Command Chain:**
```bash
# 1. Create noise profile from ambient section
sox field.wav -n trim 5 1 noiseprof noise.prof

# 2. Apply restoration
sox field.wav restored.wav \
  highpass 100 \
  noisered noise.prof 0.3 \
  declick -n 2 \
  compand 0.1,0.3 -60,-60,-30,-15,-20,-12,-10,-10,0,-7 \
  equalizer 200 1.5q -1 \
  equalizer 3000 1.5q 1
```

**Steps:**
1. High-pass (wind rumble)
2. Noise reduction
3. De-click (wind pops)
4. Compression (level)
5. EQ (clarity)

---

## Best Practices

1. **Process Order**: High-pass → Gate → De-click → Noise Reduce → De-ess → EQ → Compress
2. **Multiple Passes**: Gentle processing in stages better than one extreme pass
3. **A/B Constantly**: Compare to original frequently
4. **Preserve Character**: Don't over-process
5. **Reference Material**: Use clean recordings as reference
6. **Spectral Analysis**: Use visual tools to identify problems
7. **Context**: Judge in final use case (mix, video, etc.)
8. **Document Settings**: Keep notes on what works
9. **Test Sections**: Process small sections first
10. **Accept Limitations**: Can't fix everything perfectly

---

## Common Issues

### Background Noise
**Solution**: High-pass filter + noise gate + noise reduction

### AC Hum
**Solution**: Notch filters at fundamental + harmonics

### Clicks/Pops
**Solution**: De-click tool, multiple gentle passes

### Harsh Sibilance
**Solution**: De-esser in sibilance frequency range

### Rumble
**Solution**: High-pass filter (60-100 Hz)

### Room Reverb
**Solution**: Cannot remove easily - use gate to reduce

---

## Troubleshooting

**Problem**: "Underwater" sound after noise reduction  
**Solution**: Reduce amount, use multiple gentler passes

**Problem**: Transients dulled after de-clicking  
**Solution**: Fewer passes, test on percussion

**Problem**: Voice sounds lispy after de-essing  
**Solution**: Raise threshold, reduce ratio, narrow frequency range

**Problem**: Notch filters create artifacts  
**Solution**: Narrow bandwidth, precise frequency, less reduction

**Problem**: Too many artifacts from restoration  
**Solution**: Accept some noise, less aggressive processing

---

**Next Steps:**
- Practice noise profiling techniques
- Create restoration presets
- Move on to [Creative Effects](09-creative-fx.md)

---

[← Back to Main Guide](../../AUDIO_EFFECTS_GUIDE.md)
