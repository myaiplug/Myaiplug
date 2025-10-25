# Reverb & Ambience Guide

**Add space and depth to your audio**

---

## Table of Contents
1. [Overview](#overview)
2. [Room Reverb](#room-reverb)
3. [Hall Reverb](#hall-reverb)
4. [Plate Reverb](#plate-reverb)
5. [Spring Reverb](#spring-reverb)
6. [Ambience & Early Reflections](#ambience--early-reflections)
7. [Creative Reverbs](#creative-reverbs)

---

## Overview

Reverb simulates the acoustic environment where sound occurs. Use reverb to:
- Add depth and dimension
- Create sense of space
- Blend elements together
- Add character and atmosphere
- Simulate different environments

**Key Parameters:**
- **Decay Time**: How long reverb lasts
- **Pre-Delay**: Time before reverb starts
- **Room Size**: Simulated space dimensions
- **Dampening**: High-frequency absorption
- **Mix/Wet Level**: Amount of effect

---

## Room Reverb

Small to medium room simulations for intimate spaces.

### Small Room (🟢 Basic)

**Description**: Tight, intimate room sound  
**Use Case**: Vocals, acoustic instruments, podcasts  
**Quality**: Natural, present sound

**FFmpeg Command:**
```bash
# Small room reverb
ffmpeg -i input.wav -af "aecho=0.6:0.3:30:0.3,aecho=0.5:0.3:40:0.2" output.wav
```

**SoX Command:**
```bash
# Small room simulation
sox input.wav output.wav reverb 20 50 100 100 0 0
```

**Parameters Explained (SoX):**
- `20`: Reverb time (%)
- `50`: High-frequency damping (%)
- `100`: Room scale (%)
- `0 0`: Stereo depth and pre-delay

**Tips:**
- Short decay times (0.3-0.8s)
- Use for intimate, close sound
- Great for spoken word
- Subtle effect for natural results

---

### Medium Room (🟡 Intermediate)

**Description**: Standard room ambience  
**Use Case**: General mixing, add depth without distance  
**Quality**: Balanced space and presence

**FFmpeg Command:**
```bash
# Medium room with pre-delay
ffmpeg -i input.wav -af "aecho=0.7:0.4:50:0.4,aecho=0.6:0.4:70:0.3,aecho=0.4:0.3:100:0.2" output.wav
```

**SoX Command:**
```bash
sox input.wav output.wav reverb 40 70 100 100 5 10
```

**Parameters Explained:**
- Moderate decay (1-1.5s)
- `5`: Pre-delay in ms
- Multiple echoes create density

**Tips:**
- Add 10-30ms pre-delay for clarity
- Moderate damping for natural tone
- Use on most mix elements
- Adjust mix level to taste (15-30%)

---

### Large Room (🔴 Advanced)

**Description**: Spacious room with rich reflections  
**Use Case**: Drums, orchestral elements, cinematic sounds  
**Quality**: Expansive, enveloping space

**SoX Command:**
```bash
sox input.wav output.wav reverb 60 80 100 100 10 20 -w
```

**Parameters Explained:**
- `60`: Longer reverb time
- `80`: Moderate HF damping
- `10 20`: Pre-delay and room characteristics
- `-w`: Wet only (for parallel processing)

**Tips:**
- Decay times 1.5-2.5s
- Increase stereo width
- Great for drums and percussion
- Combine with dry signal

---

## Hall Reverb

Large concert hall simulations for grandeur and space.

### Concert Hall (🟡 Intermediate)

**Description**: Classic concert hall reverb  
**Use Case**: Orchestral, classical, cinematic  
**Quality**: Rich, natural hall sound

**SoX Command:**
```bash
sox input.wav output.wav reverb 70 80 100 100 15 30
```

**Parameters Explained:**
- `70`: Long decay (2-3s)
- `80`: Natural damping
- `15 30`: Pre-delay and depth

**Tips:**
- Long decay times (2-4s)
- Smooth high-frequency rolloff
- Use sparingly in pop mixes
- Great for strings and brass

---

### Cathedral (🔴 Advanced)

**Description**: Massive cathedral space  
**Use Case**: Choral, ambient, sound design  
**Quality**: Epic, ethereal atmosphere

**SoX Command:**
```bash
sox input.wav output.wav reverb 90 70 100 100 20 40
```

**Tips:**
- Very long decay (4-8s)
- Creates distance and grandeur
- Use for special effects
- May muddy dense mixes

---

## Plate Reverb

Electro-mechanical plate reverb simulation.

### Classic Plate (🟡 Intermediate)

**Description**: Smooth, dense plate reverb  
**Use Case**: Vocals, snare drum, guitar  
**Quality**: Professional, polished sound

**SoX Command:**
```bash
# Bright, dense plate reverb
sox input.wav output.wav reverb 50 30 100 100 5 0
```

**Parameters Explained:**
- `30`: Less high-frequency damping (brighter)
- `5`: Short pre-delay
- Bright, dense character

**Tips:**
- Shorter decay than halls (1-2s)
- Brighter than rooms
- Great on vocals and drums
- Classic '70s-'80s sound

---

### Dark Plate (🟡 Intermediate)

**Description**: Warmer, darker plate  
**Use Case**: Ballads, smooth vocals, jazz  
**Quality**: Vintage, warm character

**SoX Command:**
```bash
sox input.wav output.wav reverb 50 60 100 100 10 0
```

**Tips:**
- More high-frequency damping
- Smoother, less bright
- Works well in busy mixes
- Adds warmth

---

## Spring Reverb

Guitar amp-style spring reverb.

### Spring Reverb (🟢 Basic)

**Description**: Vintage spring reverb sound  
**Use Case**: Guitar, surf music, vintage effects  
**Quality**: Characteristic boing and splash

**FFmpeg Command:**
```bash
# Simulate spring reverb with filtered delays
ffmpeg -i input.wav -af "\
aecho=0.8:0.5:60:0.3,\
aecho=0.6:0.4:80:0.2,\
lowpass=f=4000,\
highpass=f=200" output.wav
```

**Tips:**
- Metallic, resonant character
- Short, bouncy decay
- Filter for authentic sound
- Great on guitars and keys

---

## Ambience & Early Reflections

Subtle spatial effects using early reflections only.

### Early Reflections Only (🟢 Basic)

**Description**: Room sense without tail  
**Use Case**: Add space while maintaining clarity  
**Quality**: Transparent spatial enhancement

**FFmpeg Command:**
```bash
# Short delays simulate early reflections
ffmpeg -i input.wav -af "\
aecho=0.4:0.9:15:0.2,\
aecho=0.3:0.9:25:0.15,\
aecho=0.25:0.9:35:0.1" output.wav
```

**Tips:**
- Very short delays (10-50ms)
- No reverb tail
- Adds width and dimension
- Won't muddy the mix

---

### Stereo Ambience (🟡 Intermediate)

**Description**: Wide stereo ambience  
**Use Case**: Stereo widening, spacious mixes  
**Quality**: Enhanced stereo field

**SoX Command:**
```bash
# Create stereo ambience
sox input.wav output.wav reverb 30 50 100 100 5 0 reverse reverb 30 50 100 100 5 0 reverse
```

**Tips:**
- Combines forward and reverse reverb
- Creates unique stereo image
- Shimmer effect
- Great for ambient music

---

## Creative Reverbs

Experimental and unusual reverb effects.

### Reverse Reverb (🟡 Intermediate)

**Description**: Backwards reverb swell  
**Use Case**: Transitions, intros, special effects  
**Quality**: Dramatic build-up effect

**SoX Command:**
```bash
# Create reverse reverb
sox input.wav - reverse | sox - - reverb 70 80 100 100 0 0 | sox - output.wav reverse
```

**Workflow:**
1. Reverse input
2. Apply reverb
3. Reverse again

**Tips:**
- Creates anticipation
- Great before downbeats
- Use sparingly for impact
- Combine with forward reverb

---

### Gated Reverb (🔴 Advanced)

**Description**: Reverb cut off abruptly  
**Use Case**: Drums (especially snare), '80s sound  
**Quality**: Punchy, explosive sound

**FFmpeg Command:**
```bash
# Reverb with gate
ffmpeg -i input.wav -af "\
aecho=0.8:0.4:40:0.5,\
aecho=0.7:0.3:60:0.4,\
aecho=0.6:0.2:80:0.3,\
agate=threshold=-30dB:ratio=9:attack=1:release=50" output.wav
```

**Tips:**
- Add reverb then gate
- Fast release on gate
- Iconic '80s drum sound
- Experiment with gate threshold

---

### Shimmer Reverb (🔴 Advanced)

**Description**: Reverb with pitch-shifted feedback  
**Use Case**: Ambient, pads, ethereal effects  
**Quality**: Angelic, otherworldly atmosphere

**FFmpeg Command:**
```bash
# Shimmer effect with pitch shift
ffmpeg -i input.wav -af "\
aecho=0.7:0.5:100:0.4,\
asetrate=44100*1.5,aresample=44100,\
aecho=0.5:0.4:150:0.3" output.wav
```

**Tips:**
- Pitch shift octave up
- Long decay times
- Mix with normal reverb
- Perfect for pads and ambience

---

### Infinite Reverb (🔴 Advanced)

**Description**: Never-ending reverb tail  
**Use Case**: Drones, ambient textures, sound design  
**Quality**: Sustained, evolving texture

**SoX Command:**
```bash
sox input.wav output.wav reverb 100 90 100 100 0 0
```

**Tips:**
- Very high reverb time setting
- Use for creative effects only
- Creates pad-like textures
- Combine with feedback loop

---

## Reverb Techniques

### Parallel Reverb Processing

**Description**: Blend reverb with dry signal  
**Benefits**: More control, cleaner sound

**FFmpeg Command:**
```bash
# 70% dry, 30% reverb
ffmpeg -i input.wav -filter_complex "\
[0:a]asplit=2[dry][verb];\
[verb]aecho=0.7:0.4:60:0.4[reverb];\
[dry][reverb]amix=inputs=2:weights=0.7 0.3[out]" \
-map "[out]" output.wav
```

---

### Pre-Delay for Clarity

**Description**: Delay reverb start for separation  
**Use Case**: Keep source clear while adding space

**FFmpeg Command:**
```bash
# 50ms pre-delay
ffmpeg -i input.wav -af "adelay=50|50,aecho=0.6:0.4:100:0.3" output.wav
```

**Tips:**
- 20-50ms for vocals
- Longer for instruments
- Maintains clarity
- Prevents muddiness

---

### EQ Before Reverb

**Description**: Shape frequency content before reverb  
**Use Case**: Prevent muddy or harsh reverb

**FFmpeg Command:**
```bash
# High-pass before reverb
ffmpeg -i input.wav -af "highpass=f=200,aecho=0.6:0.4:80:0.3" output.wav
```

**Tips:**
- High-pass to remove low-end mud
- Low-pass for darker, smoother reverb
- Shape reverb tone independently
- Cleaner results

---

## Reverb by Source

### Vocals
```bash
# Clear vocal reverb with pre-delay
sox input.wav output.wav reverb 40 70 100 100 30 10
```
- Medium room or plate
- 30-50ms pre-delay
- 1.5-2.5s decay
- Moderate mix (15-30%)

### Drums
```bash
# Punchy drum reverb
sox drums.wav drums_verb.wav reverb 35 50 100 100 10 5
```
- Short to medium decay
- Less pre-delay
- Brighter settings
- Can be aggressive

### Acoustic Guitar
```bash
# Natural guitar ambience
sox guitar.wav guitar_verb.wav reverb 45 60 100 100 20 15
```
- Small to medium room
- Natural damping
- Subtle mix level
- Preserve articulation

### Strings/Orchestra
```bash
# Rich hall reverb
sox strings.wav strings_verb.wav reverb 70 75 100 100 20 30
```
- Hall or large room
- Long decay (2-4s)
- Natural damping
- Higher mix level (30-50%)

---

## Best Practices

1. **Use Pre-Delay**: Keeps source separate from reverb
2. **High-Pass Reverb Send**: Remove low frequencies
3. **Mono Compatible**: Check reverb in mono
4. **Less is More**: Start with too little, add more
5. **Match Decay to Tempo**: Reverb tails shouldn't clash
6. **Different Reverbs**: Use different reverbs for different elements
7. **Automate**: Change reverb levels throughout song
8. **Reference**: Compare to professional productions
9. **Context**: Judge reverb in full mix context
10. **Parallel Processing**: Often sounds better than inline

---

## Common Problems

**Problem**: Muddy mix  
**Solution**: Reduce reverb amount, high-pass reverb send, shorter decay

**Problem**: Reverb too obvious  
**Solution**: Reduce mix level, increase pre-delay, use darker reverb

**Problem**: Lacks depth  
**Solution**: Increase reverb amount, add more pre-delay, use larger space

**Problem**: Reverb too bright/harsh  
**Solution**: More damping, low-pass filter on reverb, darker settings

---

**Next Steps:**
- Experiment with decay times
- Try parallel reverb processing
- Move on to [Delay & Echo](04-delay-echo.md)

---

[← Back to Main Guide](../../AUDIO_EFFECTS_GUIDE.md)
