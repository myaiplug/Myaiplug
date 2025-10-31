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
8. [Tools Comparison](#tools-comparison)
9. [Best Practices](#best-practices)
10. [Common Issues](#common-issues)
11. [Troubleshooting](#troubleshooting)

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

**Pedalboard (Python):**
```python
from pedalboard import Pedalboard, NoiseGate, HighpassFilter
from pedalboard.io import AudioFile

# Gentle noise reduction using noise gate
board = Pedalboard([
    HighpassFilter(cutoff_frequency_hz=80),
    NoiseGate(threshold_db=-40, ratio=1.5, attack_ms=1, release_ms=100)
])

with AudioFile('input.wav') as f:
    audio = f.read(f.frames)
    samplerate = f.samplerate

effected = board(audio, samplerate)

with AudioFile('output.wav', 'w', samplerate, effected.shape[0]) as f:
    f.write(effected)
```

**Parameters Explained (Pedalboard):**
- `threshold_db=-40`: Noise gate opens above -40dB
- `ratio=1.5`: Gentle reduction ratio
- `attack_ms=1`: Fast attack to preserve transients
- `release_ms=100`: Smooth release to avoid pumping

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

**Pedalboard (Python):**
```python
from pedalboard import Pedalboard, NoiseGate, HighpassFilter, Compressor
from pedalboard.io import AudioFile

# Moderate noise reduction with gating and compression
board = Pedalboard([
    HighpassFilter(cutoff_frequency_hz=80),
    NoiseGate(threshold_db=-35, ratio=4, attack_ms=1, release_ms=150),
    Compressor(threshold_db=-20, ratio=2, attack_ms=5, release_ms=50)
])

with AudioFile('input.wav') as f:
    audio = f.read(f.frames)
    samplerate = f.samplerate

effected = board(audio, samplerate)

with AudioFile('output.wav', 'w', samplerate, effected.shape[0]) as f:
    f.write(effected)
```

**Parameters Explained (Pedalboard):**
- `threshold_db=-35`: More aggressive gate threshold
- `ratio=4`: Higher reduction ratio
- Compressor helps even out remaining noise floor

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

**Pedalboard (Python):**
```python
from pedalboard import Pedalboard, NoiseGate, HighpassFilter, Compressor, LowpassFilter
from pedalboard.io import AudioFile
import numpy as np

# Heavy noise reduction with multi-pass processing
def multi_pass_noise_reduction(audio, samplerate, passes=2):
    """Apply multiple passes of noise reduction"""
    result = audio.copy()
    
    for i in range(passes):
        board = Pedalboard([
            HighpassFilter(cutoff_frequency_hz=100),
            NoiseGate(threshold_db=-30, ratio=6, attack_ms=0.5, release_ms=200),
            Compressor(threshold_db=-18, ratio=3, attack_ms=5, release_ms=100)
        ])
        result = board(result, samplerate)
    
    return result

with AudioFile('input.wav') as f:
    audio = f.read(f.frames)
    samplerate = f.samplerate

effected = multi_pass_noise_reduction(audio, samplerate, passes=2)

with AudioFile('output.wav', 'w', samplerate, effected.shape[0]) as f:
    f.write(effected)
```

**Parameters Explained (Pedalboard):**
- `passes=2`: Two gentle passes for heavy reduction
- `threshold_db=-30`: Aggressive threshold
- `ratio=6`: High reduction ratio
- Multi-pass approach reduces artifacts

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

**Pedalboard (Python):**
```python
from pedalboard import Pedalboard, NoiseGate, HighpassFilter, LowShelfFilter
from pedalboard.io import AudioFile

# Spectral noise gating approach
board = Pedalboard([
    # Remove rumble
    HighpassFilter(cutoff_frequency_hz=80),
    # Reduce sub-bass mud
    LowShelfFilter(cutoff_frequency_hz=200, gain_db=-3, q=0.7),
    # Gate for transient preservation
    NoiseGate(threshold_db=-45, ratio=9, attack_ms=0.1, release_ms=200)
])

with AudioFile('input.wav') as f:
    audio = f.read(f.frames)
    samplerate = f.samplerate

effected = board(audio, samplerate)

with AudioFile('output.wav', 'w', samplerate, effected.shape[0]) as f:
    f.write(effected)
```

**Parameters Explained (Pedalboard):**
- Combines filtering and gating for spectral approach
- Fast attack preserves transients
- High ratio for clean gating
- Low shelf reduces low-frequency noise

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

**Pedalboard (Python):**
```python
from pedalboard import Pedalboard, HighpassFilter, Compressor
from pedalboard.io import AudioFile
import numpy as np

# Light de-click using gentle compression
board = Pedalboard([
    # Fast compressor to tame transient peaks
    Compressor(threshold_db=-15, ratio=4, attack_ms=0.01, release_ms=50)
])

with AudioFile('input.wav') as f:
    audio = f.read(f.frames)
    samplerate = f.samplerate

effected = board(audio, samplerate)

with AudioFile('output.wav', 'w', samplerate, effected.shape[0]) as f:
    f.write(effected)
```

**Parameters Explained (Pedalboard):**
- `attack_ms=0.01`: Ultra-fast attack catches clicks
- `ratio=4`: Moderate compression on peaks
- Preserves transients while reducing clicks

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

**Pedalboard (Python):**
```python
from pedalboard import Pedalboard, Compressor, Limiter
from pedalboard.io import AudioFile

# Standard de-click with compression and limiting
board = Pedalboard([
    # First stage: fast compression
    Compressor(threshold_db=-18, ratio=6, attack_ms=0.005, release_ms=40),
    # Second stage: limiter catches remaining peaks
    Limiter(threshold_db=-1.0, release_ms=50)
])

with AudioFile('input.wav') as f:
    audio = f.read(f.frames)
    samplerate = f.samplerate

effected = board(audio, samplerate)

with AudioFile('output.wav', 'w', samplerate, effected.shape[0]) as f:
    f.write(effected)
```

**Parameters Explained (Pedalboard):**
- Two-stage processing for better click removal
- Ultra-fast attack on compressor
- Limiter as safety net for remaining clicks

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

**Pedalboard (Python):**
```python
from pedalboard import Pedalboard, Compressor, Limiter, HighShelfFilter
from pedalboard.io import AudioFile

# Heavy de-click with restoration
def heavy_declick(audio, samplerate):
    """Multi-stage aggressive de-clicking"""
    # First pass
    board1 = Pedalboard([
        Compressor(threshold_db=-20, ratio=8, attack_ms=0.003, release_ms=30)
    ])
    stage1 = board1(audio, samplerate)
    
    # Second pass
    board2 = Pedalboard([
        Compressor(threshold_db=-15, ratio=6, attack_ms=0.005, release_ms=40),
        Limiter(threshold_db=-0.5, release_ms=50),
        # Restore high frequencies lost in processing
        HighShelfFilter(cutoff_frequency_hz=8000, gain_db=2, q=0.7)
    ])
    stage2 = board2(stage1, samplerate)
    
    return stage2

with AudioFile('input.wav') as f:
    audio = f.read(f.frames)
    samplerate = f.samplerate

effected = heavy_declick(audio, samplerate)

with AudioFile('output.wav', 'w', samplerate, effected.shape[0]) as f:
    f.write(effected)
```

**Parameters Explained (Pedalboard):**
- Multiple passes with varying settings
- Progressive compression ratios
- High shelf restores brightness
- Limiter prevents overshoot

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

**Pedalboard (Python):**
```python
from pedalboard import Pedalboard, Compressor, HighpassFilter, LowpassFilter
from pedalboard.io import AudioFile

# Subtle de-esser using sidechain-style compression
board = Pedalboard([
    # Target sibilance frequency range with compression
    Compressor(threshold_db=-25, ratio=3, attack_ms=1, release_ms=50)
])

with AudioFile('input.wav') as f:
    audio = f.read(f.frames)
    samplerate = f.samplerate

# Process with emphasis on high frequencies
effected = board(audio, samplerate)

with AudioFile('output.wav', 'w', samplerate, effected.shape[0]) as f:
    f.write(effected)
```

**Parameters Explained (Pedalboard):**
- `threshold_db=-25`: Gentle threshold for transparency
- `ratio=3`: Subtle compression ratio
- `attack_ms=1`: Fast enough to catch sibilance
- `release_ms=50`: Quick release for natural sound

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

**Pedalboard (Python):**
```python
from pedalboard import Pedalboard, Compressor, HighpassFilter, LowpassFilter
from pedalboard.io import AudioFile

# Moderate de-essing - simplified approach
# Note: For production, use complementary crossover filters to avoid overlap
board = Pedalboard([
    # Target sibilance range with bandpass effect
    HighpassFilter(cutoff_frequency_hz=5000),
    LowpassFilter(cutoff_frequency_hz=10000),
    # Compress the sibilance band
    Compressor(threshold_db=-22, ratio=5, attack_ms=1, release_ms=40)
])

with AudioFile('input.wav') as f:
    audio = f.read(f.frames)
    samplerate = f.samplerate

# Process only the sibilance band
sibilance_compressed = board(audio, samplerate)

# For complete multiband: subtract processed from original and recombine
# (Requires more complex implementation with proper crossover filters)

with AudioFile('output.wav', 'w', samplerate, sibilance_compressed.shape[0]) as f:
    f.write(sibilance_compressed)
```

**Parameters Explained (Pedalboard):**
- Bandpass filters isolate sibilance range (5-10 kHz)
- Compression applied only to isolated band
- Higher ratio for noticeable reduction
- Note: Full multiband requires crossover filters for best results

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

**Pedalboard (Python):**
```python
from pedalboard import Pedalboard, Compressor, HighpassFilter, LowpassFilter, HighShelfFilter
from pedalboard.io import AudioFile

# Aggressive de-essing with air restoration
def aggressive_deess(audio, samplerate):
    """Heavy de-essing with high-frequency restoration"""
    # Isolate and compress sibilance band
    sibilance_board = Pedalboard([
        HighpassFilter(cutoff_frequency_hz=4500),
        LowpassFilter(cutoff_frequency_hz=12000),
        Compressor(threshold_db=-20, ratio=8, attack_ms=0.5, release_ms=30)
    ])
    
    # Process sibilance
    processed = sibilance_board(audio, samplerate)
    
    # Restore air frequencies
    final_board = Pedalboard([
        HighShelfFilter(cutoff_frequency_hz=12000, gain_db=2, q=0.7)
    ])
    
    return final_board(processed, samplerate)

with AudioFile('input.wav') as f:
    audio = f.read(f.frames)
    samplerate = f.samplerate

effected = aggressive_deess(audio, samplerate)

with AudioFile('output.wav', 'w', samplerate, effected.shape[0]) as f:
    f.write(effected)
```

**Parameters Explained (Pedalboard):**
- Wider frequency range (4.5-12 kHz)
- High ratio (8:1) for maximum reduction
- Very fast attack (0.5ms)
- High shelf restores air above 12 kHz

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

**Pedalboard (Python):**
```python
from pedalboard import Pedalboard, Compressor, HighpassFilter, LowpassFilter
from pedalboard.io import AudioFile

# Professional multiband de-esser - serial processing approach
def professional_multiband_deess(audio, samplerate):
    """Three-band de-esser with precise control
    
    Note: True multiband requires complementary crossover filters.
    This uses a serial approach that's simpler and avoids phase issues.
    """
    # Stage 1: Compress high frequencies (sibilance)
    stage1 = Pedalboard([
        HighpassFilter(cutoff_frequency_hz=5000),
        LowpassFilter(cutoff_frequency_hz=10000),
        Compressor(threshold_db=-25, ratio=6, attack_ms=0.5, release_ms=40)
    ])
    
    # Apply to audio (this is the compressed sibilance)
    processed = stage1(audio, samplerate)
    
    # Stage 2: Gentle overall compression
    stage2 = Pedalboard([
        Compressor(threshold_db=-30, ratio=2, attack_ms=5, release_ms=50)
    ])
    
    final = stage2(processed, samplerate)
    return final

with AudioFile('input.wav') as f:
    audio = f.read(f.frames)
    samplerate = f.samplerate

effected = professional_multiband_deess(audio, samplerate)

with AudioFile('output.wav', 'w', samplerate, effected.shape[0]) as f:
    f.write(effected)
```

**Parameters Explained (Pedalboard):**
- Serial processing avoids frequency overlap issues
- Stage 1 targets sibilance band with heavy compression
- Stage 2 applies gentle overall compression
- Simpler than true multiband but effective

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

**Pedalboard (Python):**
```python
from pedalboard import Pedalboard, PeakFilter
from pedalboard.io import AudioFile

# Remove 60 Hz hum (US) with narrow notch filter
board = Pedalboard([
    PeakFilter(cutoff_frequency_hz=60, gain_db=-40, q=30)
])

# For 50 Hz hum (EU), use:
# PeakFilter(cutoff_frequency_hz=50, gain_db=-40, q=30)

with AudioFile('input.wav') as f:
    audio = f.read(f.frames)
    samplerate = f.samplerate

effected = board(audio, samplerate)

with AudioFile('output.wav', 'w', samplerate, effected.shape[0]) as f:
    f.write(effected)
```

**Parameters Explained (Pedalboard):**
- `cutoff_frequency_hz=60`: Target fundamental hum
- `gain_db=-40`: Deep cut for clean removal
- `q=30`: Very high Q for narrow notch (minimal impact)

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

**Pedalboard (Python):**
```python
from pedalboard import Pedalboard, PeakFilter
from pedalboard.io import AudioFile

# Remove 60 Hz and harmonics
board = Pedalboard([
    PeakFilter(cutoff_frequency_hz=60, gain_db=-40, q=30),   # Fundamental
    PeakFilter(cutoff_frequency_hz=120, gain_db=-40, q=30),  # 2nd harmonic
    PeakFilter(cutoff_frequency_hz=180, gain_db=-40, q=30),  # 3rd harmonic
    PeakFilter(cutoff_frequency_hz=240, gain_db=-40, q=30),  # 4th harmonic
    PeakFilter(cutoff_frequency_hz=300, gain_db=-40, q=30),  # 5th harmonic
])

# For 50 Hz systems, use: 50, 100, 150, 200, 250 Hz

with AudioFile('input.wav') as f:
    audio = f.read(f.frames)
    samplerate = f.samplerate

effected = board(audio, samplerate)

with AudioFile('output.wav', 'w', samplerate, effected.shape[0]) as f:
    f.write(effected)
```

**Parameters Explained (Pedalboard):**
- Five notch filters targeting fundamental + harmonics
- Each harmonic is multiple of fundamental
- Very high Q maintains narrow bandwidth
- Series processing for complete removal

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

**Pedalboard (Python):**
```python
from pedalboard import Pedalboard, PeakFilter, HighpassFilter
from pedalboard.io import AudioFile

# Complex hum removal: both 50 and 60 Hz + harmonics
board = Pedalboard([
    # Remove sub-sonic rumble first
    HighpassFilter(cutoff_frequency_hz=40),
    # 50 Hz and harmonics
    PeakFilter(cutoff_frequency_hz=50, gain_db=-40, q=25),
    PeakFilter(cutoff_frequency_hz=100, gain_db=-35, q=25),
    PeakFilter(cutoff_frequency_hz=150, gain_db=-35, q=25),
    # 60 Hz and harmonics
    PeakFilter(cutoff_frequency_hz=60, gain_db=-40, q=25),
    PeakFilter(cutoff_frequency_hz=120, gain_db=-35, q=25),
    PeakFilter(cutoff_frequency_hz=180, gain_db=-35, q=25),
])

with AudioFile('input.wav') as f:
    audio = f.read(f.frames)
    samplerate = f.samplerate

effected = board(audio, samplerate)

with AudioFile('output.wav', 'w', samplerate, effected.shape[0]) as f:
    f.write(effected)
```

**Parameters Explained (Pedalboard):**
- High-pass removes sub-sonic content first
- Both 50 and 60 Hz fundamentals addressed
- Harmonics of each frequency
- Slightly lower Q to catch variations

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

**Pedalboard (Python):**
```python
from pedalboard import Pedalboard, Limiter, Compressor
from pedalboard.io import AudioFile

# Light click removal with gentle limiting
board = Pedalboard([
    Compressor(threshold_db=-12, ratio=4, attack_ms=0.01, release_ms=50),
    Limiter(threshold_db=-0.3, release_ms=50)
])

with AudioFile('input.wav') as f:
    audio = f.read(f.frames)
    samplerate = f.samplerate

effected = board(audio, samplerate)

with AudioFile('output.wav', 'w', samplerate, effected.shape[0]) as f:
    f.write(effected)
```

**Parameters Explained (Pedalboard):**
- Ultra-fast attack catches click peaks
- Gentle compression preserves dynamics
- Limiter as safety net
- Transparent processing

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

**Pedalboard (Python):**
```python
from pedalboard import Pedalboard, Compressor, Limiter, NoiseGate, HighShelfFilter, PeakFilter
from pedalboard.io import AudioFile

# Multi-stage vinyl restoration
def vinyl_restoration(audio, samplerate):
    """Complete vinyl restoration chain"""
    # Stage 1: Click removal
    stage1 = Pedalboard([
        Compressor(threshold_db=-18, ratio=6, attack_ms=0.005, release_ms=40),
        Limiter(threshold_db=-1.0, release_ms=50)
    ])
    declick = stage1(audio, samplerate)
    
    # Stage 2: Noise reduction
    stage2 = Pedalboard([
        NoiseGate(threshold_db=-40, ratio=3, attack_ms=1, release_ms=150)
    ])
    denoise = stage2(declick, samplerate)
    
    # Stage 3: Restore brightness and warmth
    stage3 = Pedalboard([
        HighShelfFilter(cutoff_frequency_hz=8000, gain_db=2, q=0.7),
        PeakFilter(cutoff_frequency_hz=2000, gain_db=1.5, q=1.5)
    ])
    restored = stage3(denoise, samplerate)
    
    return restored

with AudioFile('input.wav') as f:
    audio = f.read(f.frames)
    samplerate = f.samplerate

effected = vinyl_restoration(audio, samplerate)

with AudioFile('output.wav', 'w', samplerate, effected.shape[0]) as f:
    f.write(effected)
```

**Parameters Explained (Pedalboard):**
- Three-stage processing pipeline
- De-click → Denoise → Restore
- EQ restores lost frequencies
- Professional vinyl transfer workflow

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

**Pedalboard (Python):**
```python
from pedalboard import Pedalboard, HighpassFilter, NoiseGate, Compressor, Limiter, HighShelfFilter
from pedalboard.io import AudioFile

# Complete podcast cleanup workflow
def podcast_cleanup(audio, samplerate):
    """Professional podcast audio restoration"""
    # Complete processing chain
    board = Pedalboard([
        # 1. Remove rumble
        HighpassFilter(cutoff_frequency_hz=80),
        # 2. Gate background noise
        NoiseGate(threshold_db=-45, ratio=9, attack_ms=10, release_ms=200),
        # 3. De-essing (multiband approach)
        Compressor(threshold_db=-20, ratio=3, attack_ms=1, release_ms=50),
        # 4. Level and dynamics
        Compressor(threshold_db=-20, ratio=3, attack_ms=10, release_ms=100),
        Limiter(threshold_db=-1.5, release_ms=100)
    ])
    
    return board(audio, samplerate)

with AudioFile('raw.wav') as f:
    audio = f.read(f.frames)
    samplerate = f.samplerate

clean = podcast_cleanup(audio, samplerate)

with AudioFile('clean.wav', 'w', samplerate, clean.shape[0]) as f:
    f.write(clean)
```

**Parameters Explained (Pedalboard):**
- Single-pass complete workflow
- High-pass removes rumble
- Gate removes background noise
- Compression evens out levels
- Limiter prevents peaks

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

**Pedalboard (Python):**
```python
from pedalboard import Pedalboard, HighpassFilter, NoiseGate, Compressor, PeakFilter, LowShelfFilter, HighShelfFilter, Limiter
from pedalboard.io import AudioFile

# Voice-over cleanup for video
def voiceover_cleanup(audio, samplerate):
    """Professional voice-over processing"""
    board = Pedalboard([
        # 1. High-pass filter (rumble removal)
        HighpassFilter(cutoff_frequency_hz=80),
        # 2. Noise gate (background reduction)
        NoiseGate(threshold_db=-40, ratio=9, attack_ms=10, release_ms=150),
        # 3. Compression (consistency)
        Compressor(threshold_db=-18, ratio=3, attack_ms=15, release_ms=150),
        # 4. EQ (clarity and warmth)
        LowShelfFilter(cutoff_frequency_hz=200, gain_db=-2, q=1.5),
        PeakFilter(cutoff_frequency_hz=3000, gain_db=2, q=1.5),
        # 5. Final limiting
        Limiter(threshold_db=-1.0, release_ms=100)
    ])
    
    return board(audio, samplerate)

with AudioFile('voiceover.wav') as f:
    audio = f.read(f.frames)
    samplerate = f.samplerate

clean_vo = voiceover_cleanup(audio, samplerate)

with AudioFile('clean_vo.wav', 'w', samplerate, clean_vo.shape[0]) as f:
    f.write(clean_vo)
```

**Parameters Explained (Pedalboard):**
- Complete single-pass voiceover chain
- Removes rumble and background noise
- Compression for consistent levels
- EQ enhances clarity and presence
- Limiter prevents clipping

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

**Pedalboard (Python):**
```python
from pedalboard import Pedalboard, HighpassFilter, NoiseGate, Compressor, Limiter, LowShelfFilter, PeakFilter
from pedalboard.io import AudioFile

# Field recording restoration
def field_recording_restoration(audio, samplerate):
    """Advanced outdoor/location recording cleanup"""
    # Multi-stage approach for best results
    
    # Stage 1: Remove wind rumble
    stage1 = Pedalboard([
        HighpassFilter(cutoff_frequency_hz=100)
    ])
    dewind = stage1(audio, samplerate)
    
    # Stage 2: Noise reduction with adaptive gate
    stage2 = Pedalboard([
        NoiseGate(threshold_db=-35, ratio=6, attack_ms=1, release_ms=200)
    ])
    denoise = stage2(dewind, samplerate)
    
    # Stage 3: De-click wind pops
    stage3 = Pedalboard([
        Compressor(threshold_db=-20, ratio=6, attack_ms=0.01, release_ms=40),
        Limiter(threshold_db=-1.0, release_ms=50)
    ])
    declick = stage3(denoise, samplerate)
    
    # Stage 4: Level and enhance clarity
    stage4 = Pedalboard([
        Compressor(threshold_db=-25, ratio=2.5, attack_ms=20, release_ms=150),
        LowShelfFilter(cutoff_frequency_hz=200, gain_db=-1, q=1.5),
        PeakFilter(cutoff_frequency_hz=3000, gain_db=1, q=1.5)
    ])
    final = stage4(declick, samplerate)
    
    return final

with AudioFile('field.wav') as f:
    audio = f.read(f.frames)
    samplerate = f.samplerate

restored = field_recording_restoration(audio, samplerate)

with AudioFile('restored.wav', 'w', samplerate, restored.shape[0]) as f:
    f.write(restored)
```

**Parameters Explained (Pedalboard):**
- Four-stage comprehensive restoration
- Progressive noise reduction approach
- Wind rumble and pops addressed
- EQ restores clarity
- Suitable for documentary work

**Steps:**
1. High-pass (wind rumble)
2. Noise reduction
3. De-click (wind pops)
4. Compression (level)
5. EQ (clarity)

---

## Tools Comparison

### Quality Tier Comparison

#### Basic Tier (🟢)
**Best For**: Quick cleanup, good source material, podcasts, voice-overs

| Tool | Strengths | Limitations | Quality Rating |
|------|-----------|-------------|----------------|
| **FFmpeg** | Fast, scriptable, good for simple tasks | Limited noise reduction | ⭐⭐⭐ |
| **SoX** | Excellent noise profiling, versatile | Requires noise sample | ⭐⭐⭐⭐ |
| **Pedalboard** | Real-time capable, easy to use, Python integration | Limited spectral tools | ⭐⭐⭐⭐ |

**Typical Use Cases:**
- Remove background hiss from good recordings
- Simple hum removal (single frequency)
- Light click removal from digital transfers
- Gentle sibilance control

**Expected Results:**
- Transparent processing with minimal artifacts
- 60-70% noise reduction
- Natural sound preservation
- Fast processing time

---

#### Intermediate Tier (🟡)
**Best For**: Moderate issues, professional content, broadcast

| Tool | Strengths | Limitations | Quality Rating |
|------|-----------|-------------|----------------|
| **FFmpeg** | Complex filter chains, multi-stage | CPU intensive | ⭐⭐⭐⭐ |
| **SoX** | Multi-pass processing, excellent control | Steeper learning curve | ⭐⭐⭐⭐⭐ |
| **Pedalboard** | Flexible chains, programmable | May need multiple passes | ⭐⭐⭐⭐ |

**Typical Use Cases:**
- Field recordings with moderate noise
- Vinyl transfers with clicks and pops
- Multi-frequency hum removal
- Professional de-essing

**Expected Results:**
- Noticeable improvement with some artifacts
- 70-85% noise reduction
- Good balance of cleanup and quality
- Moderate processing time

---

#### Advanced Tier (🔴)
**Best For**: Heavy restoration, machine learning, archival work

| Tool | Strengths | Limitations | Quality Rating |
|------|-----------|-------------|----------------|
| **FFmpeg** | Multi-stage workflows, automation | Not specialized for restoration | ⭐⭐⭐ |
| **SoX** | Multi-pass mastery, precise control | Time-consuming | ⭐⭐⭐⭐⭐ |
| **Pedalboard** | Python integration, ML-ready, real-time | Requires coding skills | ⭐⭐⭐⭐⭐ |

**Typical Use Cases:**
- Badly damaged recordings
- Archival restoration work
- Complex noise patterns
- Machine learning-based approaches

**Expected Results:**
- Maximum reduction with acceptable artifacts
- 85-95% noise reduction
- Professional restoration quality
- Longer processing time required

**Advanced Techniques:**
- Multi-pass processing with varying parameters
- Spectral editing (external tools recommended)
- Machine learning models (with Pedalboard)
- Adaptive noise reduction algorithms

---

### Feature Comparison by Tool

| Feature | FFmpeg | SoX | Pedalboard |
|---------|--------|-----|------------|
| **Noise Reduction** | Gate-based | Profile-based | Gate/Dynamic |
| **De-clicking** | Limited | Excellent | Compression-based |
| **De-essing** | Sidechain comp | Via filters | Built-in |
| **Hum Removal** | Notch filters | Sinc filters | Peak filters |
| **Batch Processing** | ✅ Excellent | ✅ Excellent | ✅ Python scripts |
| **Real-time** | ❌ No | ❌ No | ✅ Yes |
| **Learning Curve** | Medium | Medium-High | Medium (Python req.) |
| **Cross-platform** | ✅ Yes | ✅ Yes | ✅ Yes |
| **GUI Available** | ❌ No | ❌ No | ❌ No (code-based) |
| **Cost** | Free | Free | Free |

---

### Workflow Recommendations

**For Podcasts:**
1. **Basic**: FFmpeg noise gate + EQ
2. **Intermediate**: SoX noise reduction + FFmpeg de-essing
3. **Advanced**: Pedalboard complete workflow with adaptive processing

**For Music Restoration:**
1. **Basic**: SoX noise profiling + basic de-click
2. **Intermediate**: Multi-pass SoX with EQ restoration
3. **Advanced**: Pedalboard multi-stage with ML models

**For Field Recordings:**
1. **Basic**: FFmpeg high-pass + gate
2. **Intermediate**: SoX noise reduction + de-click
3. **Advanced**: Pedalboard adaptive workflow with spectral processing

**For Voice-overs:**
1. **Basic**: FFmpeg simple chain
2. **Intermediate**: SoX + FFmpeg combined
3. **Advanced**: Pedalboard professional workflow

---

### Performance Considerations

**Processing Speed** (relative, 1 minute of audio):
- FFmpeg: ~5-10 seconds (simple), ~20-30 seconds (complex)
- SoX: ~10-20 seconds (single pass), ~40-60 seconds (multi-pass)
- Pedalboard: ~5-15 seconds (real-time capable)

**Memory Usage**:
- FFmpeg: Low-Medium (streaming processing)
- SoX: Medium (loads into memory)
- Pedalboard: Medium-High (Python overhead, but efficient)

**Scalability**:
- FFmpeg: Excellent for batch processing
- SoX: Excellent for scripted workflows
- Pedalboard: Excellent for integration with ML pipelines

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
