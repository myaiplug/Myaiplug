# Modulation Effects Guide

**Chorus, Flanger, Phaser, and Tremolo**

---

## Table of Contents
1. [Overview](#overview)
2. [Chorus](#chorus)
3. [Flanger](#flanger)
4. [Phaser](#phaser)
5. [Tremolo](#tremolo)
6. [Vibrato](#vibrato)
7. [Combined Effects](#combined-effects)

---

## Overview

Modulation effects use time-varying delays or filters to create movement and depth. Use modulation to:
- Add width and dimension
- Create movement and animation
- Thicken sounds
- Add character and interest
- Create vintage and retro sounds

**Common Parameters:**
- **Rate/Speed**: How fast the modulation cycles (Hz or BPM)
- **Depth**: Amount of modulation effect
- **Delay Time**: Base delay before modulation (chorus/flanger)
- **Feedback**: Resonance and intensity (flanger/phaser)
- **Mix**: Wet/dry balance

---

## Chorus

Subtle pitch and time variations creating a thicker, wider sound.

### Subtle Chorus (🟢 Basic)

**Description**: Light chorus for gentle thickening  
**Use Case**: Vocals, guitars, synths  
**Quality**: Natural doubling effect

**FFmpeg Command:**
```bash
# Simple chorus using chorus filter
ffmpeg -i input.wav -af "chorus=0.7:0.9:55:0.4:0.25:2" output.wav
```

**SoX Command:**
```bash
sox input.wav output.wav chorus 0.7 0.9 55 0.4 0.25 2 -t
```

**Parameters Explained:**
- `0.7`: Input gain
- `0.9`: Output gain
- `55`: Delay in ms
- `0.4`: Decay (feedback)
- `0.25`: Speed (Hz)
- `2`: Depth (ms)
- `-t` (SoX): Triangle wave (smoother)

**Tips:**
- Slow rate (0.2-0.5 Hz)
- Shallow depth (1-3 ms)
- Creates stereo width
- Very subtle effect

---

### Classic Chorus (🟡 Intermediate)

**Description**: Standard chorus effect  
**Use Case**: '80s sounds, electric guitars, keyboards  
**Quality**: Rich, animated sound

**SoX Command:**
```bash
sox input.wav output.wav chorus 0.7 0.9 50 0.4 0.5 2 -s
```

**Parameters Explained:**
- `0.5`: Moderate speed (Hz)
- `2`: Moderate depth (ms)
- `-s`: Sinusoidal LFO (sine wave)

**Tips:**
- Medium rate (0.5-1.5 Hz)
- Medium depth (2-5 ms)
- Mix 30-50% with dry
- Classic '80s sound

---

### Multi-Voice Chorus (🔴 Advanced)

**Description**: Multiple chorus voices for lush sound  
**Use Case**: Pads, ambient textures, rich sounds  
**Quality**: Very thick, wide, complex

**SoX Command:**
```bash
# Triple chorus (3 voices)
sox input.wav output.wav chorus 0.6 0.9 50 0.4 0.25 2 -t \
                          chorus 0.6 0.9 60 0.4 0.5 2.3 -t \
                          chorus 0.6 0.9 40 0.4 0.3 1.8 -s
```

**Tips:**
- Multiple chorus stages
- Slightly different settings per voice
- Very lush, wide sound
- Great for pads and synths

---

### Stereo Chorus (🟡 Intermediate)

**Description**: Wide stereo chorus effect  
**Use Case**: Stereo widening, spacious mixes  
**Quality**: Enhanced stereo image

**SoX Command:**
```bash
sox input.wav output.wav chorus 0.7 0.9 55|60 0.4 0.4|0.3 2|2.5 -t
```

**Parameters Explained:**
- `55|60`: Different delays for L/R
- `0.4|0.3`: Different rates for L/R
- `2|2.5`: Different depths for L/R

**Tips:**
- Different L/R settings
- Creates wide stereo field
- Check mono compatibility
- Adjust balance to taste

---

## Flanger

Sweeping comb filter effect with metallic, jet-like quality.

### Subtle Flanger (🟢 Basic)

**Description**: Light flanging for gentle movement  
**Use Case**: Add character without being obvious  
**Quality**: Subtle jet-plane sweep

**FFmpeg Command:**
```bash
# Gentle flanger
ffmpeg -i input.wav -af "flanger=delay=5:depth=2:regen=20:width=70:speed=0.5" output.wav
```

**SoX Command:**
```bash
sox input.wav output.wav flanger 0.7 0.9 5 2 20 sine 0.5 -t
```

**Parameters Explained:**
- `delay=5`: Base delay (0-10ms)
- `depth=2`: Modulation depth
- `regen=20`: Feedback/regeneration (0-100)
- `speed=0.5`: LFO rate in Hz
- `width=70`: Stereo width (0-100)

**Tips:**
- Short delay (0-5ms)
- Low feedback (10-30%)
- Slow rate (0.3-0.8 Hz)
- Subtle enhancement

---

### Classic Flanger (🟡 Intermediate)

**Description**: Recognizable flanging effect  
**Use Case**: '70s rock, psychedelic sounds  
**Quality**: Obvious jet-plane sweep

**FFmpeg Command:**
```bash
# Classic flanger
ffmpeg -i input.wav -af "flanger=delay=7:depth=5:regen=50:width=80:speed=0.3" output.wav
```

**SoX Command:**
```bash
sox input.wav output.wav flanger 0.7 0.9 7 5 50 sine 0.3 -t
```

**Tips:**
- Medium delay (5-10ms)
- Higher feedback (40-60%)
- Slow to medium rate
- Classic '70s sound

---

### Jet Flanger (🔴 Advanced)

**Description**: Extreme flanging with high resonance  
**Use Case**: Special effects, psychedelic, EDM  
**Quality**: Dramatic, swooshing, jet-like

**FFmpeg Command:**
```bash
# Extreme jet flanger
ffmpeg -i input.wav -af "flanger=delay=10:depth=10:regen=80:width=90:speed=0.2" output.wav
```

**Tips:**
- Longer delay (8-15ms)
- High feedback (70-95%)
- Very slow rate (0.1-0.4 Hz)
- Dramatic effect

---

### Through-Zero Flanger (🔴 Advanced)

**Description**: Flanger that can delay through zero  
**Use Case**: Authentic vintage flanging  
**Quality**: Classic tape flanging sound

**SoX Command:**
```bash
# Through-zero flanger simulation
sox input.wav output.wav flanger 0.8 0.95 1 10 80 sine 0.2 -i
```

**Parameters:**
- `-i`: Inverted (through-zero mode in SoX)
- Very dramatic sweeping
- Authentic vintage sound

---

## Phaser

Sweeping notch filters creating space-age swirl.

### Subtle Phaser (🟢 Basic)

**Description**: Light phasing for movement  
**Use Case**: Guitars, keyboards, gentle animation  
**Quality**: Smooth, swirling motion

**SoX Command:**
```bash
sox input.wav output.wav phaser 0.8 0.7 2 0.5 0.5 -t
```

**Parameters Explained:**
- `0.8`: Input gain
- `0.7`: Output gain
- `2`: Number of stages (2-10)
- `0.5`: Decay/feedback
- `0.5`: Speed in Hz
- `-t`: Triangle wave

**Tips:**
- 2-4 stages for subtle effect
- Slow rate (0.3-0.8 Hz)
- Low feedback (0.3-0.6)
- Gentle swirl

---

### Classic Phaser (🟡 Intermediate)

**Description**: Standard phaser effect  
**Use Case**: '70s funk, rock, electric piano  
**Quality**: Recognizable swoosh

**SoX Command:**
```bash
sox input.wav output.wav phaser 0.8 0.7 4 0.7 0.5 -s
```

**Parameters Explained:**
- `4`: Four stages (typical)
- `0.7`: Medium feedback
- `0.5`: Moderate rate
- `-s`: Sine wave LFO

**Tips:**
- 4-6 stages standard
- Medium feedback (0.5-0.8)
- Medium rate (0.4-1.0 Hz)
- Classic '70s sound

---

### Deep Phaser (🔴 Advanced)

**Description**: Many stages with high resonance  
**Use Case**: Psychedelic, experimental, dramatic  
**Quality**: Deep, resonant swoosh

**SoX Command:**
```bash
sox input.wav output.wav phaser 0.8 0.7 8 0.9 0.3 -s
```

**Tips:**
- 8-12 stages for deep effect
- High feedback (0.8-0.95)
- Slow rate (0.2-0.5 Hz)
- Very dramatic

---

### Stereo Phaser (🟡 Intermediate)

**Description**: Phaser with stereo offset  
**Use Case**: Wide, animated stereo field  
**Quality**: Enhanced stereo movement

**SoX Command:**
```bash
# Different rates for L/R channels
sox input.wav output.wav phaser 0.8 0.7 4 0.6 0.5|0.4 -s
```

**Tips:**
- Different L/R rates
- Creates stereo animation
- Wide spatial effect
- Check mono compatibility

---

## Tremolo

Amplitude modulation creating rhythmic volume changes.

### Subtle Tremolo (🟢 Basic)

**Description**: Gentle volume modulation  
**Use Case**: Guitars, organs, subtle movement  
**Quality**: Natural pulsing

**FFmpeg Command:**
```bash
# Subtle tremolo at 4 Hz
ffmpeg -i input.wav -af "tremolo=f=4:d=0.3" output.wav
```

**SoX Command:**
```bash
sox input.wav output.wav tremolo 4 30
```

**Parameters Explained:**
- `f=4` or `4`: Frequency (Hz)
- `d=0.3` or `30`: Depth (0-1 or 0-100%)

**Tips:**
- Rate 3-6 Hz for musical tremolo
- Depth 20-40% for subtle
- Sync to tempo if possible
- Classic guitar amp effect

---

### Classic Tremolo (🟡 Intermediate)

**Description**: Standard tremolo effect  
**Use Case**: Vintage guitar, organ, '60s sounds  
**Quality**: Obvious rhythmic pulsing

**FFmpeg Command:**
```bash
# Classic tremolo
ffmpeg -i input.wav -af "tremolo=f=5:d=0.6" output.wav
```

**SoX Command:**
```bash
sox input.wav output.wav tremolo 5 60
```

**Tips:**
- Rate 4-6 Hz typical
- Depth 50-70% noticeable
- Sine or triangle wave
- Vintage character

---

### Tempo-Synced Tremolo (🟡 Intermediate)

**Description**: Tremolo synchronized to BPM  
**Use Case**: Rhythmic effects locked to tempo  
**Quality**: Musical, groove-locked

**Example for 120 BPM:**
```bash
# Quarter note tremolo (2 Hz at 120 BPM)
ffmpeg -i input.wav -af "tremolo=f=2:d=0.5" output.wav

# Eighth note tremolo (4 Hz at 120 BPM)
ffmpeg -i input.wav -af "tremolo=f=4:d=0.5" output.wav

# Triplet tremolo (3 Hz at 120 BPM)
ffmpeg -i input.wav -af "tremolo=f=3:d=0.5" output.wav
```

**Rate Calculation:**
- Quarter notes = BPM / 60
- Eighth notes = BPM / 30
- Sixteenth notes = BPM / 15

---

### Extreme Tremolo (🔴 Advanced)

**Description**: Very fast or very deep tremolo  
**Use Case**: Special effects, ring modulation-like  
**Quality**: Dramatic, attention-grabbing

**FFmpeg Command:**
```bash
# Extreme tremolo
ffmpeg -i input.wav -af "tremolo=f=12:d=0.9" output.wav
```

**Tips:**
- Fast rates (>10 Hz) = ring mod-like
- Deep depth (>80%) = gate-like
- Use sparingly
- Creative effect

---

## Vibrato

Pitch modulation creating wavering tone.

### Subtle Vibrato (🟢 Basic)

**Description**: Natural vibrato effect  
**Use Case**: Vocals, strings, natural pitch variation  
**Quality**: Organic pitch movement

**FFmpeg Command:**
```bash
# Subtle vibrato
ffmpeg -i input.wav -af "vibrato=f=5:d=0.3" output.wav
```

**SoX Command:**
```bash
sox input.wav output.wav vibro 5 0.3
```

**Parameters Explained:**
- `f=5`: Frequency in Hz (rate)
- `d=0.3`: Depth (0-1 or 0-100%)

**Tips:**
- Rate 4-7 Hz natural
- Depth 0.2-0.4 subtle
- Emulates vocal/string vibrato
- Use sparingly

---

### Classic Vibrato (🟡 Intermediate)

**Description**: Noticeable pitch modulation  
**Use Case**: Guitars, organs, '60s effects  
**Quality**: Obvious pitch warble

**FFmpeg Command:**
```bash
# Classic vibrato
ffmpeg -i input.wav -af "vibrato=f=6:d=0.6" output.wav
```

**Tips:**
- Rate 5-8 Hz
- Depth 0.5-0.7
- Vintage guitar/organ sound
- Characteristic warble

---

## Combined Effects

Stacking modulation effects for complex results.

### Chorus + Flanger (🔴 Advanced)

**Description**: Lush, swirling combination  
**Use Case**: Pads, ambient, dreamy sounds  
**Quality**: Very rich and animated

**SoX Command:**
```bash
sox input.wav output.wav chorus 0.7 0.9 55 0.4 0.3 2 -t | \
sox - output.wav flanger 0.7 0.9 3 2 30 sine 0.3 -t
```

**Tips:**
- Chorus first, then flanger
- Adjust levels to prevent buildup
- Very lush sound
- Great for pads

---

### Phaser + Tremolo (🟡 Intermediate)

**Description**: Rhythmic pulsing with sweep  
**Use Case**: Rhythmic effects, psychedelic  
**Quality**: Dynamic, moving, pulsing

**SoX Command:**
```bash
sox input.wav output.wav phaser 0.8 0.7 4 0.6 0.5 -s tremolo 4 50
```

**Tips:**
- Phaser creates sweep
- Tremolo adds rhythm
- Experiment with rates
- Very animated

---

### Rotary Speaker Simulation (🔴 Advanced)

**Description**: Simulate Leslie rotating speaker  
**Use Case**: Organs, guitars, vintage keys  
**Quality**: Authentic rotary sound

**SoX Command:**
```bash
# Slow rotary
sox input.wav output.wav chorus 0.7 0.9 40 0.3 0.8 3 -t tremolo 0.8 40

# Fast rotary
sox input.wav output.wav chorus 0.7 0.9 20 0.4 5 4 -t tremolo 5 50
```

**Components:**
- Chorus for Doppler effect
- Tremolo for amplitude modulation
- Different speeds for slow/fast

---

## Modulation Techniques

### Parallel Modulation

**Description**: Blend modulated with dry signal  
**Benefits**: More control, natural sound

**FFmpeg Command:**
```bash
# 60% dry, 40% chorus
ffmpeg -i input.wav -filter_complex "\
[0:a]asplit=2[dry][mod];\
[mod]chorus=0.7:0.9:55:0.4:0.25:2[chorused];\
[dry][chorused]amix=inputs=2:weights=0.6 0.4[out]" \
-map "[out]" output.wav
```

---

### Stereo Enhancement

**Description**: Use modulation for width  
**Use Case**: Mono to stereo, width enhancement

**Tips:**
- Chorus great for width
- Slight L/R differences
- Check mono compatibility
- Subtle settings

---

## Modulation by Source

### Electric Guitar
```bash
# Classic guitar chorus
sox guitar.wav guitar_chorus.wav chorus 0.7 0.9 50 0.4 0.5 2.5 -t
```
- Chorus or flanger
- Medium depth
- Slow to medium rate

### Vocals
```bash
# Subtle vocal chorus
sox vocal.wav vocal_chorus.wav chorus 0.8 0.9 60 0.3 0.2 1.5 -t
```
- Very subtle chorus
- Shallow depth
- Slow rate

### Synths/Pads
```bash
# Lush pad chorus
sox pad.wav pad_lush.wav chorus 0.6 0.9 55 0.4 0.3 2 -t \
                         chorus 0.6 0.9 45 0.4 0.4 2.3 -s
```
- Multi-voice chorus
- Can be more aggressive
- Creates width

### Bass
```bash
# Subtle bass enhancement
sox bass.wav bass_mod.wav chorus 0.8 0.9 70 0.2 0.2 1 -t
```
- Very subtle
- Longer delays
- Low depth
- Adds character without losing focus

---

## Best Practices

1. **Start Subtle**: Add modulation gradually
2. **Mono Check**: Always check mono compatibility
3. **Rate Selection**: Musical rates sound better
4. **Depth Control**: Less depth = more natural
5. **Tempo Sync**: Lock to song tempo when possible
6. **Parallel Processing**: Often sounds better
7. **EQ First**: Shape tone before modulation
8. **Don't Overuse**: Select elements only
9. **Stereo Width**: Great for adding space
10. **Context**: Judge in full mix

---

## Common Settings Reference

### Chorus
- **Subtle**: Rate 0.2-0.5 Hz, Depth 1-2ms
- **Medium**: Rate 0.5-1.5 Hz, Depth 2-5ms
- **Heavy**: Rate 1-3 Hz, Depth 5-10ms

### Flanger
- **Subtle**: Delay 0-5ms, Feedback 10-30%
- **Medium**: Delay 5-10ms, Feedback 40-60%
- **Extreme**: Delay 10-15ms, Feedback 70-95%

### Phaser
- **Subtle**: 2-4 stages, Feedback 0.3-0.6
- **Medium**: 4-6 stages, Feedback 0.5-0.8
- **Deep**: 8-12 stages, Feedback 0.8-0.95

### Tremolo
- **Subtle**: Rate 3-6 Hz, Depth 20-40%
- **Medium**: Rate 4-6 Hz, Depth 50-70%
- **Extreme**: Rate >10 Hz, Depth >80%

---

## Troubleshooting

**Problem**: Too obvious, unnatural  
**Solution**: Reduce depth, slow rate, lower mix level

**Problem**: Cancels in mono  
**Solution**: Reduce stereo width, use less extreme settings

**Problem**: Loses low end  
**Solution**: Use parallel processing, high-pass modulation only

**Problem**: Not enough movement  
**Solution**: Increase depth or rate, try different effect type

---

**Next Steps:**
- Experiment with different rates and depths
- Try combining effects
- Move on to [Distortion & Saturation](06-distortion-saturation.md)

---

[← Back to Main Guide](../../AUDIO_EFFECTS_GUIDE.md)
