# EQ (Equalization) Guide

**Shaping the frequency spectrum of your audio**

---

## Table of Contents
1. [Overview](#overview)
2. [High-Pass Filters](#high-pass-filters)
3. [Low-Pass Filters](#low-pass-filters)
4. [Parametric EQ](#parametric-eq)
5. [Shelving EQ](#shelving-eq)
6. [Notch Filters](#notch-filters)
7. [Multi-Band EQ](#multi-band-eq)

---

## Overview

Equalization is the process of adjusting the balance between frequency components within an audio signal. Use EQ to:
- Remove unwanted frequencies
- Enhance desired frequencies
- Fix tonal imbalances
- Create space in a mix
- Shape the character of sounds

---

## High-Pass Filters

Remove low-frequency rumble and sub-bass content.

### Basic High-Pass (🟢 Basic)

**Description**: Simple first-order high-pass filter  
**Use Case**: Remove rumble from vocals, acoustic instruments  
**Quality**: Fast, gentle 6dB/octave slope

**FFmpeg Command:**
```bash
ffmpeg -i input.wav -af "highpass=f=100" output.wav
```

**SoX Command:**
```bash
sox input.wav output.wav highpass 100
```

**Parameters Explained:**
- `f=100`: Cutoff frequency in Hz (frequencies below are attenuated)

**Tips:**
- Use 80-100 Hz for vocals
- Use 40-60 Hz for most instruments
- Be conservative to avoid thinning the sound

---

### Steep High-Pass (🟡 Intermediate)

**Description**: Second-order high-pass with steeper slope  
**Use Case**: More aggressive low-end cleanup  
**Quality**: 12dB/octave slope, better filtering

**FFmpeg Command:**
```bash
ffmpeg -i input.wav -af "highpass=f=100:poles=2:width_type=h:width=0.707" output.wav
```

**SoX Command:**
```bash
sox input.wav output.wav highpass 100 2
```

**Parameters Explained:**
- `poles=2`: Number of filter poles (higher = steeper slope)
- `width_type=h`: Width specified in Hz
- `width=0.707`: Q factor (0.707 = Butterworth response)

**Tips:**
- Use for removing unwanted sub-bass
- Good for making room in the low end
- Watch for phase shifts near cutoff

---

### Surgical High-Pass (🔴 Advanced)

**Description**: Multi-stage high-pass with linear phase option  
**Use Case**: Professional mastering and precise filtering  
**Quality**: Minimal phase distortion, very clean

**FFmpeg Command:**
```bash
ffmpeg -i input.wav -af "highpass=f=100:poles=4:width_type=h:width=0.707,highpass=f=30:poles=2" output.wav
```

**SoX Command with Phase Control:**
```bash
sox input.wav output.wav highpass 100 4 -phase 90
```

**Parameters Explained:**
- `poles=4`: Four-pole filter (24dB/octave)
- Multiple stages: Cascaded filters for extremely steep rolloff
- `-phase 90`: Phase response adjustment

**Tips:**
- Use in mastering contexts
- Combine with spectrum analysis
- Always A/B test the results

---

## Low-Pass Filters

Remove high-frequency content and harshness.

### Basic Low-Pass (🟢 Basic)

**Description**: Simple low-pass filter  
**Use Case**: Remove harshness, simulate analog warmth  
**Quality**: Gentle 6dB/octave rolloff

**FFmpeg Command:**
```bash
ffmpeg -i input.wav -af "lowpass=f=8000" output.wav
```

**SoX Command:**
```bash
sox input.wav output.wav lowpass 8000
```

**Parameters Explained:**
- `f=8000`: Cutoff frequency in Hz (frequencies above are attenuated)

**Tips:**
- Use 10-12 kHz for subtle warmth
- Use 5-8 kHz for telephone/radio effects
- Lower frequencies = more dramatic effect

---

### Resonant Low-Pass (🟡 Intermediate)

**Description**: Low-pass with resonance control  
**Use Case**: Filter sweeps, synthesizer-style effects  
**Quality**: Adds emphasis at cutoff frequency

**FFmpeg Command:**
```bash
ffmpeg -i input.wav -af "lowpass=f=2000:poles=2:width_type=q:width=2" output.wav
```

**SoX Command:**
```bash
sox input.wav output.wav lowpass -2 2000 0.5
```

**Parameters Explained:**
- `width_type=q`: Specify Q (resonance) factor
- `width=2`: Q value (higher = more resonance)
- `-2`: Two-pole filter (SoX)

**Tips:**
- Q values above 1.0 create resonance peak
- Use for creative filtering effects
- Automate cutoff frequency for sweeps

---

### Anti-Aliasing Low-Pass (🔴 Advanced)

**Description**: Steep low-pass for anti-aliasing  
**Use Case**: Pre-processing before sample rate conversion  
**Quality**: Very steep, minimal passband ripple

**FFmpeg Command:**
```bash
ffmpeg -i input.wav -af "lowpass=f=20000:poles=8:width_type=h:width=0.707" output.wav
```

**Tips:**
- Set cutoff slightly below Nyquist frequency
- Use before downsampling
- Prevents aliasing artifacts

---

## Parametric EQ

Boost or cut specific frequency ranges with precise control.

### Single-Band Parametric (🟢 Basic)

**Description**: Boost or cut a single frequency band  
**Use Case**: Fix resonances, enhance presence  
**Quality**: Precise frequency targeting

**FFmpeg Command:**
```bash
# Boost 2kHz by 3dB, Q=1
ffmpeg -i input.wav -af "equalizer=f=2000:t=h:width=200:g=3" output.wav
```

**SoX Command:**
```bash
sox input.wav output.wav equalizer 2000 200 3
```

**Parameters Explained:**
- `f=2000`: Center frequency in Hz
- `width=200`: Bandwidth in Hz
- `g=3`: Gain in dB (positive = boost, negative = cut)
- `t=h`: Width type (h=Hz, q=Q factor, o=octaves)

**Tips:**
- Use narrow bandwidth (high Q) for problem frequencies
- Use wide bandwidth (low Q) for musical shaping
- Cut before boost when possible

---

### Multi-Band Parametric (🟡 Intermediate)

**Description**: Multiple EQ bands for comprehensive shaping  
**Use Case**: Mixing, general tonal shaping  
**Quality**: Professional multi-band processing

**FFmpeg Command:**
```bash
ffmpeg -i input.wav -af "\
equalizer=f=100:t=q:width=1.5:g=-2,\
equalizer=f=800:t=q:width=1:g=2,\
equalizer=f=3000:t=q:width=1.2:g=1.5,\
equalizer=f=10000:t=q:width=2:g=-1" output.wav
```

**Parameters for Each Band:**
- Band 1: Cut rumble at 100 Hz
- Band 2: Boost body at 800 Hz
- Band 3: Enhance presence at 3 kHz
- Band 4: Tame brightness at 10 kHz

**Tips:**
- Work from low to high frequencies
- Use subtractive EQ first (cuts)
- Make small adjustments (1-3 dB)
- A/B test frequently

---

### Dynamic EQ (🔴 Advanced)

**Description**: EQ that responds to signal level  
**Use Case**: Control problem frequencies only when present  
**Quality**: Adaptive, transparent processing

**FFmpeg Multi-Stage Command:**
```bash
ffmpeg -i input.wav -af "\
compand=attacks=0.001:decays=0.1:points=-80/-80|-60/-60|-40/-38|-20/-15|0/-12,\
equalizer=f=3000:t=q:width=1.5:g=3" output.wav
```

**Tips:**
- Combine compression with EQ
- Use for de-essing (high-frequency compression)
- Target specific problem ranges
- Requires careful threshold setting

---

## Shelving EQ

Boost or cut all frequencies above or below a certain point.

### Low Shelf (🟢 Basic)

**Description**: Boost or cut low frequencies  
**Use Case**: Add warmth or reduce muddiness  
**Quality**: Broad low-end adjustment

**FFmpeg Command:**
```bash
# Boost lows below 200 Hz by 3dB
ffmpeg -i input.wav -af "lowshelf=f=200:g=3" output.wav
```

**SoX Command:**
```bash
sox input.wav output.wav bass 3 200
```

**Parameters Explained:**
- `f=200`: Shelf frequency in Hz
- `g=3`: Gain in dB

**Tips:**
- Use 100-300 Hz for most instruments
- Boost for warmth, cut for clarity
- Be cautious with boost to avoid muddiness

---

### High Shelf (🟢 Basic)

**Description**: Boost or cut high frequencies  
**Use Case**: Add air and brightness or reduce harshness  
**Quality**: Broad high-end adjustment

**FFmpeg Command:**
```bash
# Boost highs above 8kHz by 2dB
ffmpeg -i input.wav -af "highshelf=f=8000:g=2" output.wav
```

**SoX Command:**
```bash
sox input.wav output.wav treble 2 8000
```

**Tips:**
- Use 5-10 kHz for air and sparkle
- Small boosts go a long way (1-3 dB)
- Cut to reduce harshness

---

### Variable Slope Shelving (🟡 Intermediate)

**Description**: Shelving EQ with adjustable slope  
**Use Case**: More precise tonal shaping  
**Quality**: Better control over transition region

**FFmpeg Command:**
```bash
ffmpeg -i input.wav -af "lowshelf=f=200:g=3:width_type=q:width=0.707" output.wav
```

**Parameters Explained:**
- `width_type=q`: Use Q factor
- `width=0.707`: Butterworth response (neutral slope)
- Lower Q = gentler slope
- Higher Q = steeper slope

---

## Notch Filters

Remove specific narrow frequency bands.

### Single Notch (🟢 Basic)

**Description**: Remove a specific problem frequency  
**Use Case**: Eliminate hum, resonances, or feedback  
**Quality**: Surgical frequency removal

**FFmpeg Command:**
```bash
# Remove 60Hz hum
ffmpeg -i input.wav -af "equalizer=f=60:t=h:width=10:g=-40" output.wav
```

**SoX Command:**
```bash
sox input.wav output.wav sinc -60 60
```

**Parameters Explained:**
- `f=60`: Center frequency to remove
- `width=10`: Narrow bandwidth
- `g=-40`: Deep cut (-40dB)

**Tips:**
- Use for AC hum (50/60 Hz and harmonics)
- Very narrow bandwidth to minimize impact
- May need multiple notches for harmonics

---

### Multiple Notch Filters (🟡 Intermediate)

**Description**: Remove fundamental and harmonics  
**Use Case**: Complete hum/buzz removal  
**Quality**: Clean removal of periodic noise

**FFmpeg Command:**
```bash
# Remove 60Hz and harmonics (60, 120, 180, 240 Hz)
ffmpeg -i input.wav -af "\
equalizer=f=60:t=h:width=10:g=-40,\
equalizer=f=120:t=h:width=10:g=-40,\
equalizer=f=180:t=h:width=10:g=-40,\
equalizer=f=240:t=h:width=10:g=-40" output.wav
```

**Tips:**
- Target fundamental and first 3-5 harmonics
- Use spectrum analyzer to identify frequencies
- Be cautious not to remove too much

---

## Multi-Band EQ

Professional mixing and mastering EQ chains.

### Vocal EQ Chain (🟡 Intermediate)

**Description**: Complete vocal processing chain  
**Use Case**: Professional vocal sound  
**Quality**: Broadcast-ready results

**FFmpeg Command:**
```bash
ffmpeg -i vocal.wav -af "\
highpass=f=80:poles=2,\
equalizer=f=200:t=q:width=2:g=-2,\
equalizer=f=800:t=q:width=1:g=1,\
equalizer=f=3000:t=q:width=1.5:g=2,\
equalizer=f=7000:t=q:width=1:g=-1,\
highshelf=f=10000:g=1.5" vocal_eq.wav
```

**EQ Stages:**
1. High-pass: Remove rumble
2. 200 Hz: Reduce muddiness
3. 800 Hz: Add body
4. 3 kHz: Enhance presence
5. 7 kHz: Tame sibilance
6. 10 kHz+: Add air

---

### Mastering EQ Chain (🔴 Advanced)

**Description**: Subtle mastering EQ  
**Use Case**: Final mix enhancement  
**Quality**: Transparent, professional mastering

**FFmpeg Command:**
```bash
ffmpeg -i mix.wav -af "\
highpass=f=30:poles=4,\
equalizer=f=60:t=q:width=2:g=-1,\
equalizer=f=200:t=q:width=1.5:g=0.5,\
equalizer=f=3000:t=q:width=2:g=0.5,\
highshelf=f=8000:g=1:width_type=q:width=0.7,\
lowpass=f=18000:poles=2" mastered.wav
```

**Mastering Approach:**
- Subtle adjustments only (< 2dB)
- Clean up problem frequencies
- Enhance without coloring
- Gentle high-pass and low-pass

**Tips:**
- Use reference tracks
- Make changes in context of full mix
- Less is more in mastering
- Always compare to original

---

## Common EQ Applications

### De-Mudding
```bash
# Remove muddiness (200-500 Hz)
ffmpeg -i input.wav -af "equalizer=f=300:t=q:width=1:g=-3" output.wav
```

### Adding Presence
```bash
# Boost presence (2-5 kHz)
ffmpeg -i input.wav -af "equalizer=f=3000:t=q:width=1.5:g=2" output.wav
```

### Telephone Effect
```bash
# Narrow bandpass (300-3000 Hz)
ffmpeg -i input.wav -af "highpass=f=300,lowpass=f=3000" output.wav
```

### Radio Effect
```bash
# Vintage radio sound
ffmpeg -i input.wav -af "highpass=f=400,lowpass=f=4000,equalizer=f=1000:t=q:width=0.5:g=3" output.wav
```

---

## Best Practices

1. **Use Your Ears**: Trust what you hear, not just the numbers
2. **Cut Before Boost**: Subtractive EQ is often more natural
3. **Small Adjustments**: 1-3 dB changes are usually sufficient
4. **Context Matters**: EQ in the context of the full mix
5. **A/B Comparison**: Regularly compare to the original
6. **Spectrum Analyzer**: Use visual tools to identify problem frequencies
7. **High-Pass Everything**: Except kick and bass
8. **Watch Phase**: Steep filters can cause phase issues

---

## Tools Comparison

| Feature | FFmpeg | SoX | Advantage |
|---------|--------|-----|-----------|
| Parametric EQ | ✅ | ✅ | Both excellent |
| Shelving | ✅ | ✅ | Both excellent |
| High/Low Pass | ✅ | ✅ | Both excellent |
| Linear Phase | ❌ | Limited | External tools needed |
| Automation | Script | Script | Both scriptable |
| GUI | ❌ | ❌ | Use external tools |

---

**Next Steps:**
- Experiment with different Q values
- Create your own EQ presets
- Move on to [Dynamics Processing](02-dynamics.md)

---

[← Back to Main Guide](../../AUDIO_EFFECTS_GUIDE.md)
