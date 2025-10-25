# Distortion & Saturation Guide

**Add harmonic content, warmth, and aggression**

---

## Table of Contents
1. [Overview](#overview)
2. [Tape Saturation](#tape-saturation)
3. [Tube/Valve Saturation](#tube-saturation)
4. [Hard Clipping](#hard-clipping)
5. [Soft Clipping](#soft-clipping)
6. [Bit Crushing](#bit-crushing)
7. [Overdrive & Distortion](#overdrive--distortion)
8. [Fuzz](#fuzz)

---

## Overview

Distortion and saturation add harmonic content and character. Use these effects to:
- Add warmth and analog character
- Create aggression and energy
- Add perceived loudness
- Shape tone and timbre
- Create lo-fi and vintage sounds

**Types of Distortion:**
- **Saturation**: Subtle harmonic enhancement
- **Overdrive**: Moderate distortion
- **Distortion**: Heavy clipping and harmonics
- **Fuzz**: Extreme distortion with square-wave-like qualities

**Key Concepts:**
- **Harmonics**: Additional frequencies added
- **Even vs Odd**: Different harmonic characters
- **Clipping Point**: Where distortion begins
- **Asymmetry**: Different positive/negative clipping

---

## Tape Saturation

Subtle harmonic enhancement mimicking analog tape.

### Gentle Tape Saturation (🟢 Basic)

**Description**: Subtle warmth and glue  
**Use Case**: Mix bus, master, individual tracks  
**Quality**: Transparent analog warmth

**FFmpeg Command:**
```bash
# Gentle tape saturation using overdrive
ffmpeg -i input.wav -af "acompressor=threshold=-6dB:ratio=2:attack=1:release=50,volume=1.2" output.wav
```

**SoX Command:**
```bash
# Tape saturation simulation
sox input.wav output.wav overdrive 5 10
```

**Parameters Explained (SoX):**
- `5`: Gain in dB
- `10`: Color amount (adds harmonics)

**Tips:**
- Very subtle (3-10 dB drive)
- Adds warmth without obvious distortion
- Use on busses and master
- Even harmonics = warmth

---

### Medium Tape Saturation (🟡 Intermediate)

**Description**: Noticeable tape character  
**Use Case**: Drums, bass, adding punch  
**Quality**: Vintage analog character

**SoX Command:**
```bash
sox input.wav output.wav overdrive 10 20
```

**Tips:**
- Medium drive (10-15 dB)
- Adds compression-like qualities
- Thickens sound
- Vintage vibe

---

### Hot Tape Saturation (🔴 Advanced)

**Description**: Aggressive tape distortion  
**Use Case**: Drums, lo-fi effects, character  
**Quality**: Obvious tape compression and distortion

**SoX Command:**
```bash
sox input.wav output.wav overdrive 20 30
```

**Tips:**
- Heavy drive (>15 dB)
- Obvious distortion
- Compressed, thick sound
- Lo-fi aesthetic

---

## Tube Saturation

Warm valve/tube amplifier characteristics.

### Subtle Tube Warmth (🟢 Basic)

**Description**: Gentle tube-style harmonics  
**Use Case**: Vocals, acoustic instruments, warmth  
**Quality**: Musical warmth

**SoX Command:**
```bash
sox input.wav output.wav overdrive 7 15
```

**Tips:**
- Light drive (5-10 dB)
- Even harmonics dominate
- Smooth, warm character
- Transparent enhancement

---

### Classic Tube Saturation (🟡 Intermediate)

**Description**: Standard tube amp character  
**Use Case**: Guitars, bass, keys  
**Quality**: Rich harmonic content

**SoX Command:**
```bash
sox input.wav output.wav overdrive 12 25
```

**Tips:**
- Medium drive (10-15 dB)
- Adds compression
- Rich harmonics
- Musical distortion

---

### Pushed Tube Distortion (🔴 Advanced)

**Description**: Overdriven tube amp  
**Use Case**: Rock guitars, aggressive tones  
**Quality**: Hot, driven sound

**SoX Command:**
```bash
sox input.wav output.wav overdrive 18 35
```

**Tips:**
- Heavy drive (15-20 dB)
- Starts to break up
- Aggressive character
- Rock/blues tones

---

## Hard Clipping

Digital clipping for aggressive, precise distortion.

### Soft-Knee Clipping (🟢 Basic)

**Description**: Gradual clipping onset  
**Use Case**: Controlled distortion  
**Quality**: Smoother than pure hard clip

**FFmpeg Command:**
```bash
# Soft clipping using compander
ffmpeg -i input.wav -af "compand=attacks=0:points=-80/-80|-10/-10|0/-5|20/-3" output.wav
```

**Tips:**
- Gradual clipping curve
- Less harsh than hard clip
- More musical
- Good starting point

---

### Hard Clipping (🟡 Intermediate)

**Description**: Sharp clipping threshold  
**Use Case**: Digital distortion, aggressive sounds  
**Quality**: Precise, harsh, digital

**FFmpeg Command:**
```bash
# Hard clip at -3dB
ffmpeg -i input.wav -af "alimiter=limit=-3dB:attack=1:release=1,volume=0.5" output.wav
```

**Tips:**
- Sharp cutoff
- Lots of odd harmonics
- Harsh, aggressive
- Digital character

---

### Asymmetric Clipping (🔴 Advanced)

**Description**: Different positive/negative clipping  
**Use Case**: More complex harmonic content  
**Quality**: Richer, more interesting distortion

**FFmpeg Command:**
```bash
# Asymmetric clipping simulation
ffmpeg -i input.wav -af "compand=attacks=0.001:points=-80/-80|-20/-15|-10/-8|0/-3|20/0" output.wav
```

**Tips:**
- Different curves for +/-
- More even harmonics
- Tube-like character
- Complex harmonics

---

## Soft Clipping

Smoother distortion with gradual onset.

### Gentle Soft Clip (🟢 Basic)

**Description**: Very gradual clipping  
**Use Case**: Subtle warmth, analog-style  
**Quality**: Smooth, musical

**SoX Command:**
```bash
sox input.wav output.wav overdrive 8 5
```

**Tips:**
- Very gradual
- Mostly even harmonics
- Warm, smooth
- Transparent

---

### Standard Soft Clip (🟡 Intermediate)

**Description**: Moderate soft clipping  
**Use Case**: Add body and sustain  
**Quality**: Warm compression-like effect

**SoX Command:**
```bash
sox input.wav output.wav overdrive 15 10
```

**Tips:**
- Noticeable but musical
- Adds sustain
- Compression qualities
- Versatile

---

## Bit Crushing

Reduce bit depth for lo-fi digital distortion.

### Subtle Bit Reduction (🟢 Basic)

**Description**: Slight digital artifacts  
**Use Case**: Lo-fi character, vintage digital  
**Quality**: Subtle digital grit

**SoX Command:**
```bash
# Reduce to 12-bit
sox input.wav -b 12 output.wav
```

**Tips:**
- 12-14 bit for subtle
- Adds digital noise floor
- Retro digital sound
- Careful with levels

---

### Heavy Bit Crushing (🟡 Intermediate)

**Description**: Obvious lo-fi distortion  
**Use Case**: Electronic music, creative effects  
**Quality**: Crunchy, digital, aliased

**SoX Command:**
```bash
# Reduce to 8-bit
sox input.wav -b 8 output.wav
```

**Tips:**
- 6-8 bit for heavy effect
- Quantization noise
- Aliasing artifacts
- Very lo-fi

---

### Bit Crush + Sample Rate Reduction (🔴 Advanced)

**Description**: Combined bit depth and sample rate reduction  
**Use Case**: Extreme lo-fi, retro games, creative  
**Quality**: Heavily degraded, aliased

**FFmpeg Command:**
```bash
# Reduce bit depth and sample rate
ffmpeg -i input.wav -ar 8000 -sample_fmt u8 temp.wav
ffmpeg -i temp.wav -ar 44100 output.wav
rm temp.wav
```

**SoX Command:**
```bash
# 8-bit, 8kHz for extreme lo-fi
sox input.wav -r 8000 -b 8 - | sox - -r 44100 output.wav
```

**Tips:**
- Extreme aliasing
- Retro game sound
- Very destructive
- Creative effect only

---

## Overdrive & Distortion

Guitar-style overdrive and distortion.

### Light Overdrive (🟢 Basic)

**Description**: Gentle drive, edge-of-breakup  
**Use Case**: Blues, jazz, subtle grit  
**Quality**: Warm, slightly broken up

**SoX Command:**
```bash
sox input.wav output.wav overdrive 10 15
```

**Tips:**
- 8-12 dB drive
- Touch-sensitive
- Warm character
- Musical breakup

---

### Classic Overdrive (🟡 Intermediate)

**Description**: Standard overdrive sound  
**Use Case**: Rock, pop, driven guitars  
**Quality**: Sustained, crunchy tone

**SoX Command:**
```bash
sox input.wav output.wav overdrive 15 25
```

**Tips:**
- 12-18 dB drive
- Good sustain
- Midrange emphasis
- Classic rock tone

---

### Heavy Distortion (🔴 Advanced)

**Description**: Aggressive, saturated distortion  
**Use Case**: Metal, hard rock, aggressive sounds  
**Quality**: Thick, compressed, sustained

**SoX Command:**
```bash
sox input.wav output.wav overdrive 25 40
```

**Tips:**
- >20 dB drive
- Heavy compression
- Long sustain
- Aggressive tone

---

## Fuzz

Extreme distortion with square-wave-like characteristics.

### Classic Fuzz (🟡 Intermediate)

**Description**: Vintage fuzz pedal sound  
**Use Case**: '60s rock, psychedelic, garage  
**Quality**: Woolly, compressed, fuzzy

**SoX Command:**
```bash
# Heavy overdrive for fuzz-like effect
sox input.wav output.wav overdrive 30 50
```

**Tips:**
- Extreme drive (>25 dB)
- Nearly square wave
- Compressed sustain
- Classic '60s sound

---

### Octave Fuzz (🔴 Advanced)

**Description**: Fuzz with octave up  
**Use Case**: Hendrix-style effects, lead tones  
**Quality**: Aggressive, synth-like

**FFmpeg Command:**
```bash
# Fuzz + octave simulation
ffmpeg -i input.wav -af "asetrate=44100*2,aresample=44100" temp.wav
ffmpeg -i temp.wav -af "compand=attacks=0:points=-80/-80|0/0|20/3" output.wav
```

**Tips:**
- Pitch shift + distortion
- Synth-like character
- Lead guitar sound
- Iconic effect

---

## Distortion Techniques

### Parallel Distortion

**Description**: Blend distorted with clean signal  
**Benefits**: Retain clarity while adding grit

**FFmpeg Command:**
```bash
# 70% clean, 30% distorted
ffmpeg -i input.wav -filter_complex "\
[0:a]asplit=2[clean][dist];\
[dist]compand=attacks=0:points=-80/-80|0/0|20/5[distorted];\
[clean][distorted]amix=inputs=2:weights=0.7 0.3[out]" \
-map "[out]" output.wav
```

**Tips:**
- Keep low end clean
- Add distorted highs/mids
- More definition
- Common on bass

---

### Multiband Distortion

**Description**: Distort different frequency ranges separately  
**Use Case**: Controlled, targeted distortion  
**Quality**: Clean lows, distorted highs

**FFmpeg Command:**
```bash
# Clean lows, distorted highs
ffmpeg -i input.wav -filter_complex "\
[0:a]asplit=2[low][high];\
[low]lowpass=f=300[lows];\
[high]highpass=f=300,compand=attacks=0:points=-80/-80|0/0|20/4[highs];\
[lows][highs]amix=inputs=2:normalize=0[out]" \
-map "[out]" output.wav
```

**Tips:**
- Keep bass clean
- Distort mids/highs
- Better mix translation
- Professional sound

---

### Pre/Post EQ

**Description**: Shape tone before and after distortion  
**Quality**: Control harmonic content and tone

**FFmpeg Command:**
```bash
# EQ before and after distortion
ffmpeg -i input.wav -af "\
equalizer=f=800:t=q:width=1:g=3,\
compand=attacks=0:points=-80/-80|0/0|20/4,\
equalizer=f=3000:t=q:width=1.5:g=2" output.wav
```

**Tips:**
- Boost mids before = more distortion there
- Cut lows before = less mud
- Shape after for final tone
- Critical for good tone

---

## Distortion by Source

### Vocals
```bash
# Subtle vocal saturation
sox vocal.wav vocal_sat.wav overdrive 5 10
```
- Very subtle (3-8 dB)
- Adds presence
- Careful not to harsh
- Parallel processing often better

### Bass
```bash
# Parallel bass distortion
sox bass.wav -p highpass 300 overdrive 15 25 | \
sox - bass.wav -m bass_distorted.wav
```
- Keep lows clean
- Distort highs for definition
- Parallel processing
- Multiband approach

### Drums
```bash
# Drum saturation
sox drums.wav drums_sat.wav overdrive 8 15
```
- Subtle to medium (5-12 dB)
- Adds punch and glue
- Per-drum or on bus
- Parallel compression-like

### Synths
```bash
# Synth distortion
sox synth.wav synth_dist.wav overdrive 20 30
```
- Can be aggressive
- Shapes timbre
- Adds harmonics
- Great for leads

---

## Best Practices

1. **Start Subtle**: Add gradually
2. **Parallel Processing**: Often sounds better
3. **Multiband**: Keep lows clean
4. **EQ Before/After**: Shape the distortion
5. **Gain Staging**: Watch output levels
6. **Context**: Judge in full mix
7. **Reference**: Compare to pro tracks
8. **Variety**: Different types for different sources
9. **Less is More**: Especially in mixing
10. **High-Pass First**: Remove sub-bass before distorting

---

## Distortion Amount Guide

| Amount (dB) | Character | Use Case |
|-------------|-----------|----------|
| 3-8 dB | Subtle warmth | Mix bus, master, subtle enhancement |
| 8-12 dB | Noticeable saturation | Individual tracks, character |
| 12-18 dB | Overdrive | Guitars, driven sounds |
| 18-25 dB | Heavy distortion | Rock guitars, aggressive tones |
| >25 dB | Fuzz/extreme | Special effects, lo-fi, creative |

---

## Harmonic Content

### Even Harmonics (2nd, 4th, 6th)
- Warmer, smoother
- Tube/tape saturation
- Musical, pleasing
- Adds body

### Odd Harmonics (3rd, 5th, 7th)
- Harder, more aggressive
- Transistor/digital distortion
- Edgy character
- Adds presence

### Asymmetric Clipping
- Mix of even and odd
- Complex harmonics
- Most interesting
- Natural sound

---

## Troubleshooting

**Problem**: Too harsh, brittle  
**Solution**: Low-pass after distortion, use softer clipping, reduce amount

**Problem**: Muddy, undefined  
**Solution**: High-pass before distortion, multiband approach, less distortion

**Problem**: Loses punch  
**Solution**: Parallel processing, keep transients clean, less compression

**Problem**: Too much noise  
**Solution**: Gate before distortion, reduce amount, use better quality distortion

---

**Next Steps:**
- Experiment with parallel distortion
- Try multiband approaches
- Move on to [Pitch & Time Manipulation](07-pitch-time.md)

---

[← Back to Main Guide](../../AUDIO_EFFECTS_GUIDE.md)
