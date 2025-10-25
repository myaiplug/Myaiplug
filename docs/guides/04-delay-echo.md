# Delay & Echo Guide

**Time-based repetitions and rhythmic effects**

---

## Table of Contents
1. [Overview](#overview)
2. [Simple Delay](#simple-delay)
3. [Ping-Pong Delay](#ping-pong-delay)
4. [Slapback Echo](#slapback-echo)
5. [Multi-Tap Delay](#multi-tap-delay)
6. [Modulated Delay](#modulated-delay)
7. [Creative Delays](#creative-delays)

---

## Overview

Delay effects create discrete repetitions of the original signal. Use delay to:
- Add rhythmic interest
- Create depth and space
- Build tension and release
- Add movement and groove
- Create ambient textures

**Key Parameters:**
- **Delay Time**: Time between repetitions (ms or beats)
- **Feedback**: Number of repetitions
- **Mix/Wet Level**: Balance with dry signal
- **Filtering**: Tone of delays
- **Stereo Width**: Spatial positioning

**Delay Time Calculation:**
- Quarter note = 60,000 / BPM (ms)
- Eighth note = 30,000 / BPM (ms)
- Dotted eighth = 45,000 / BPM (ms)

---

## Simple Delay

Single mono or stereo delay with feedback.

### Basic Delay (🟢 Basic)

**Description**: Simple single delay  
**Use Case**: Quick echo effect, doubling  
**Quality**: Clean, straightforward repetitions

**FFmpeg Command:**
```bash
# 300ms delay with 3 repetitions
ffmpeg -i input.wav -af "aecho=0.7:0.6:300:0.4" output.wav
```

**SoX Command:**
```bash
# 300ms delay, 50% feedback
sox input.wav output.wav echo 0.7 0.6 300 0.5
```

**Parameters Explained:**
- `0.7`: Input gain
- `0.6`: Output gain
- `300`: Delay time in ms
- `0.4` or `0.5`: Feedback amount

**Tips:**
- Use musical delay times (sync to tempo)
- Lower feedback for subtle effect
- Higher feedback for spacey effects
- Mix level controls intensity

---

### Tempo-Synced Delay (🟡 Intermediate)

**Description**: Delay synchronized to song tempo  
**Use Case**: Rhythmic effects, musical delays  
**Quality**: Locked to groove

**Example for 120 BPM:**
```bash
# Quarter note delay (500ms at 120 BPM)
ffmpeg -i input.wav -af "aecho=0.8:0.6:500:0.4" output.wav

# Eighth note delay (250ms at 120 BPM)
ffmpeg -i input.wav -af "aecho=0.8:0.6:250:0.4" output.wav

# Dotted eighth delay (375ms at 120 BPM)
ffmpeg -i input.wav -af "aecho=0.8:0.6:375:0.4" output.wav
```

**Delay Time Formula:**
- Quarter note = 60,000 / BPM
- Eighth note = 30,000 / BPM
- Sixteenth note = 15,000 / BPM
- Dotted eighth = 45,000 / BPM

**Tips:**
- Calculate delay time from BPM
- Dotted eighth is most popular
- Match to song groove
- Use subtly in mix

---

### Filtered Delay (🟡 Intermediate)

**Description**: Delay with frequency filtering  
**Use Case**: Dub effects, vintage sounds, clarity  
**Quality**: Characterful, sits better in mix

**FFmpeg Command:**
```bash
# Delay with high-pass and low-pass filters
ffmpeg -i input.wav -af "\
highpass=f=400,lowpass=f=4000,\
aecho=0.7:0.6:400:0.5" output.wav
```

**Parameters Explained:**
- `highpass=f=400`: Remove low frequencies from delay
- `lowpass=f=4000`: Remove high frequencies
- Creates darker, vintage delay tone

**Tips:**
- High-pass prevents mud (300-500 Hz)
- Low-pass for darker, smoother delays
- Makes delay sit better in mix
- Essential for dense arrangements

---

## Ping-Pong Delay

Stereo delay that alternates between left and right.

### Basic Ping-Pong (🟡 Intermediate)

**Description**: Alternating left-right delays  
**Use Case**: Wide stereo effects, spacious mixes  
**Quality**: Expansive stereo image

**FFmpeg Command:**
```bash
# Ping-pong delay effect
ffmpeg -i input.wav -af "\
aecho=0.8:0.6:400|600:0.5|0.4" output.wav
```

**Parameters Explained:**
- `400|600`: Different delay times for L/R channels
- Creates bouncing effect
- Stereo alternation

**Tips:**
- Use slightly different L/R times
- Great on vocals and leads
- Wide stereo image
- Use in moderation

---

### Complex Ping-Pong (🔴 Advanced)

**Description**: Multi-tap ping-pong with filtering  
**Use Case**: Professional stereo delays  
**Quality**: Rich, animated stereo field

**FFmpeg Command:**
```bash
# Complex ping-pong with filters
ffmpeg -i input.wav -filter_complex "\
[0:a]asplit=2[l][r];\
[l]aecho=0.8:0.6:300:0.5,highpass=f=400[left];\
[r]aecho=0.8:0.6:450:0.5,highpass=f=400,adelay=150|150[right];\
[left][right]amerge=inputs=2[out]" \
-map "[out]" output.wav
```

**Tips:**
- Different L/R delay times
- Add filtering for clarity
- Offset timing for bounce
- Professional stereo width

---

## Slapback Echo

Short delay for classic rockabilly/vintage sound.

### Slapback Delay (🟢 Basic)

**Description**: Single short delay (40-150ms)  
**Use Case**: Vintage vocals, rockabilly guitar, character  
**Quality**: Classic '50s-'60s sound

**FFmpeg Command:**
```bash
# Slapback echo (100ms, single repeat)
ffmpeg -i input.wav -af "aecho=0.8:0.6:100:0.2" output.wav
```

**SoX Command:**
```bash
sox input.wav output.wav echo 0.8 0.6 100 0.3
```

**Parameters Explained:**
- `100`: Very short delay time (40-150ms)
- `0.2-0.3`: Low feedback (single repeat)
- Creates thickness and depth

**Tips:**
- 40-80ms for vocals
- 80-120ms for guitar
- Single repeat only (low feedback)
- Mix 30-50% with dry signal
- Classic rockabilly sound

---

### Double Slapback (🟡 Intermediate)

**Description**: Two slapback delays  
**Use Case**: Richer vintage sound  
**Quality**: Thick, characterized sound

**FFmpeg Command:**
```bash
# Double slapback
ffmpeg -i input.wav -af "\
aecho=0.8:0.6:80:0.3,\
aecho=0.7:0.5:120:0.2" output.wav
```

**Tips:**
- Two different delay times
- Creates more complex sound
- Still vintage character
- Great on vocals

---

## Multi-Tap Delay

Multiple delay taps at different times.

### Basic Multi-Tap (🟡 Intermediate)

**Description**: Several discrete delays  
**Use Case**: Complex rhythmic patterns, ambient textures  
**Quality**: Rich, evolving sound

**FFmpeg Command:**
```bash
# Multi-tap delay (3 taps)
ffmpeg -i input.wav -af "\
aecho=0.8:0.6:250:0.4,\
aecho=0.7:0.5:500:0.3,\
aecho=0.6:0.4:750:0.2" output.wav
```

**Parameters Explained:**
- Three separate delay times
- Decreasing feedback per tap
- Creates complex rhythm

**Tips:**
- Use musical intervals
- Vary feedback per tap
- Create polyrhythmic effects
- Great for sound design

---

### Rhythmic Multi-Tap (🔴 Advanced)

**Description**: Musically-timed multi-tap pattern  
**Use Case**: Rhythmic enhancement, groove  
**Quality**: Locked to musical grid

**FFmpeg Command (120 BPM):**
```bash
# Rhythmic pattern: quarter, eighth, sixteenth
ffmpeg -i input.wav -af "\
aecho=0.8:0.6:500:0.4,\
aecho=0.7:0.5:250:0.35,\
aecho=0.6:0.4:125:0.3" output.wav
```

**Tips:**
- Calculate from BPM
- Create interesting rhythms
- Triplet delays work well
- Combine different note values

---

## Modulated Delay

Delay with pitch/time modulation.

### Chorus-Delay Hybrid (🟡 Intermediate)

**Description**: Delay with subtle pitch modulation  
**Use Case**: Lush, animated delays  
**Quality**: Movement and life

**FFmpeg Command:**
```bash
# Delay with modulation simulation
ffmpeg -i input.wav -af "\
asetrate=44100*1.01,aresample=44100,\
aecho=0.7:0.5:350:0.4,\
asetrate=44100*0.99,aresample=44100" output.wav
```

**Tips:**
- Subtle pitch variations
- Creates movement
- More interesting than static delay
- Use sparingly

---

### Tape Delay Emulation (🔴 Advanced)

**Description**: Simulate analog tape delay characteristics  
**Use Case**: Vintage, warm delay sounds  
**Quality**: Organic, characterful delays

**FFmpeg Command:**
```bash
# Tape delay simulation
ffmpeg -i input.wav -af "\
highpass=f=300,lowpass=f=5000,\
aecho=0.75:0.55:400:0.45,\
asetrate=44100*0.995,aresample=44100" output.wav
```

**Tape Characteristics:**
- Filtered (darker tone)
- Slight pitch drift
- Compression on repeats
- Saturation/distortion

**Tips:**
- Dark, filtered tone
- Slight wow and flutter
- Compressed repeats
- Saturated character

---

## Creative Delays

Experimental and unusual delay effects.

### Reverse Delay (🟡 Intermediate)

**Description**: Backwards repeats  
**Use Case**: Psychedelic effects, transitions  
**Quality**: Surreal, attention-grabbing

**SoX Command:**
```bash
# Create reverse delay
sox input.wav - reverse | sox - - echo 0.7 0.5 300 0.4 | sox - output.wav reverse
```

**Workflow:**
1. Reverse input
2. Apply delay
3. Reverse again
4. Mix with dry

**Tips:**
- Surreal sound
- Great for transitions
- Use before drops
- Combine with forward delay

---

### Granular Delay (🔴 Advanced)

**Description**: Delay with granular texture  
**Use Case**: Experimental music, sound design  
**Quality**: Unique, textured repeats

**FFmpeg Command:**
```bash
# Granular-style delay
ffmpeg -i input.wav -af "\
aecho=0.7:0.5:100:0.4,\
aecho=0.6:0.4:200:0.35,\
aecho=0.5:0.3:50:0.3" output.wav
```

**Tips:**
- Very short delay times
- Multiple taps
- Creates texture
- Experimental sound

---

### Infinite Delay (🔴 Advanced)

**Description**: Self-sustaining delay feedback  
**Use Case**: Ambient, drones, experimental  
**Quality**: Evolving, infinite repeats

**FFmpeg Command:**
```bash
# Very high feedback for infinite delay
ffmpeg -i input.wav -af "aecho=0.8:0.9:400:0.9" output.wav
```

**Warning:**
- High feedback can cause runaway levels
- May need limiting
- Monitor output carefully
- Use with caution

---

## Delay Techniques

### Delay Throw

**Description**: Automate delay send for dramatic effect  
**Use Case**: End of phrases, special moments  
**Quality**: Dynamic, interesting

**Tips:**
- Send to delay on last word/note
- Creates dramatic tail
- Common in modern production

---

### Parallel Delay Processing

**Description**: Blend delay with dry signal  
**Quality**: More control, cleaner sound

**FFmpeg Command:**
```bash
# 70% dry, 30% delay
ffmpeg -i input.wav -filter_complex "\
[0:a]asplit=2[dry][delay];\
[delay]aecho=0.8:0.6:400:0.4[delayed];\
[dry][delayed]amix=inputs=2:weights=0.7 0.3[out]" \
-map "[out]" output.wav
```

---

### Stereo Width from Delay

**Description**: Use short delays for stereo widening  
**Use Case**: Make mono sources wider  
**Quality**: Enhanced stereo image

**FFmpeg Command:**
```bash
# Haas effect (stereo widening)
ffmpeg -i input.wav -af "aecho=0.8:0.6:15|25:0.0|0.0" output.wav
```

**Tips:**
- Very short delays (10-30ms)
- No feedback
- Haas effect
- Check mono compatibility

---

## Delay by Source

### Vocals
```bash
# Vocal delay (dotted eighth at 120 BPM)
ffmpeg -i vocal.wav -af "aecho=0.8:0.6:375:0.35" vocal_delay.wav
```
- Dotted eighth most popular
- 20-35% feedback
- Filter lows out
- Tempo-synced

### Guitar
```bash
# Guitar delay
ffmpeg -i guitar.wav -af "highpass=f=400,aecho=0.75:0.55:450:0.4" guitar_delay.wav
```
- Quarter or dotted eighth
- Filtered for clarity
- 30-40% feedback
- Stereo delays work well

### Drums
```bash
# Drum delay (snare/clap)
ffmpeg -i drums.wav -af "aecho=0.7:0.5:125:0.25" drums_delay.wav
```
- Short delays (eighth/sixteenth)
- Low feedback (1-2 repeats)
- Rhythmic effect
- Don't overdo

### Synths
```bash
# Synth delay
ffmpeg -i synth.wav -af "aecho=0.8:0.6:500:0.5,lowpass=f=8000" synth_delay.wav
```
- Longer delays
- Higher feedback
- Can be more aggressive
- Create space

---

## Best Practices

1. **Tempo Sync**: Calculate delay times from BPM
2. **Filter Delays**: High-pass to prevent mud
3. **Start Subtle**: Add more as needed
4. **Parallel Processing**: Better control
5. **Vary Feedback**: Different amounts for different effects
6. **Stereo Delays**: Create width and interest
7. **Automate**: Change delay throughout song
8. **Less is More**: Don't overuse
9. **Contrast**: Use on select elements
10. **Mono Check**: Ensure delays work in mono

---

## Common Delay Times (120 BPM)

| Note Value | Milliseconds | Use Case |
|------------|--------------|----------|
| Whole Note | 2000ms | Very long, ambient |
| Half Note | 1000ms | Long delays, space |
| Quarter Note | 500ms | Standard delay |
| Dotted Eighth | 375ms | Most popular |
| Eighth Note | 250ms | Fast rhythmic |
| Sixteenth Note | 125ms | Very fast, texture |
| Triplet | 333ms | Shuffled feel |

---

## Troubleshooting

**Problem**: Delays muddy the mix  
**Solution**: High-pass filter delays, reduce feedback, lower mix level

**Problem**: Delays sound too prominent  
**Solution**: Reduce mix level, filter more aggressively, shorter delay time

**Problem**: Need more movement  
**Solution**: Use ping-pong, modulated, or multi-tap delays

**Problem**: Delays clash with rhythm  
**Solution**: Calculate tempo-synced delay times

---

**Next Steps:**
- Calculate delays for your project tempo
- Try ping-pong delays
- Move on to [Modulation Effects](05-modulation.md)

---

[← Back to Main Guide](../../AUDIO_EFFECTS_GUIDE.md)
