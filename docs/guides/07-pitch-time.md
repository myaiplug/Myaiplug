# Pitch & Time Manipulation Guide

**Pitch shifting, time stretching, and tempo changes**

---

## Table of Contents
1. [Overview](#overview)
2. [Pitch Shifting](#pitch-shifting)
3. [Time Stretching](#time-stretching)
4. [Combined Pitch/Time](#combined-pitchtime)
5. [Formant Preservation](#formant-preservation)
6. [Tempo Changes](#tempo-changes)
7. [Creative Pitch Effects](#creative-pitch-effects)

---

## Overview

Pitch and time manipulation allows independent control of pitch and tempo. Use these effects to:
- Change musical key without affecting tempo
- Change tempo without affecting pitch
- Create special effects
- Fix timing or tuning issues
- Match different recordings

**Key Concepts:**
- **Pitch Shifting**: Change frequency without duration
- **Time Stretching**: Change duration without pitch
- **Formants**: Resonant frequencies that define timbre
- **Artifacts**: Unwanted side effects (phasiness, warbling)
- **Quality vs Speed**: Trade-off in processing

**Primary Tools:**
- **Rubberband**: Professional time/pitch manipulation
- **SoX**: Good for basic operations
- **FFmpeg**: Basic time/pitch capabilities

---

## Pitch Shifting

Change pitch without altering duration.

### Semitone Pitch Shift (🟢 Basic)

**Description**: Shift pitch by musical intervals  
**Use Case**: Key changes, tuning correction  
**Quality**: Clean for moderate shifts (±5 semitones)

**Rubberband Command:**
```bash
# Shift up 2 semitones
rubberband -p 2 input.wav output.wav

# Shift down 3 semitones
rubberband -p -3 input.wav output.wav
```

**FFmpeg Command:**
```bash
# Pitch shift (not as high quality)
ffmpeg -i input.wav -af "asetrate=44100*1.122,aresample=44100" output.wav
# Note: 1.122 = 2^(2/12) for 2 semitones up
```

**Tips:**
- ±2-3 semitones is relatively artifact-free
- ±5 semitones is pushing it
- >±7 semitones will have noticeable artifacts
- Use cents for fine tuning (100 cents = 1 semitone)

---

### Fine Pitch Adjustment (🟢 Basic)

**Description**: Small pitch corrections in cents  
**Use Case**: Tuning, slight detune, chorus effects  
**Quality**: Very clean for small adjustments

**Rubberband Command:**
```bash
# Shift up 10 cents (1/10th semitone)
rubberband -p 0.1 input.wav output.wav

# Shift down 15 cents
rubberband -p -0.15 input.wav output.wav
```

**Tips:**
- ±50 cents basically artifact-free
- Great for tuning correction
- Use for subtle chorus/thickening
- Very transparent

---

### Octave Pitch Shift (🟡 Intermediate)

**Description**: Shift by one or more octaves  
**Use Case**: Harmonization, sub-bass, creative effects  
**Quality**: Good quality but requires careful processing

**Rubberband Command:**
```bash
# One octave up (+12 semitones)
rubberband -p 12 input.wav output.wav

# One octave down (-12 semitones)
rubberband -p -12 input.wav output.wav

# Two octaves down
rubberband -p -24 input.wav output.wav
```

**Tips:**
- Use high-quality mode for octaves
- Artifacts more noticeable
- Great for harmonies
- Sub-bass generation (octave down on bass)

---

### High-Quality Pitch Shift (🔴 Advanced)

**Description**: Maximum quality pitch shifting  
**Use Case**: Professional production, mastering  
**Quality**: Best possible results

**Rubberband Command:**
```bash
# High quality, precise mode
rubberband -p 3 --pitch-hq --formant input.wav output.wav
```

**Parameters Explained:**
- `--pitch-hq`: High-quality pitch shifting
- `--formant`: Preserve formants (vocal quality)
- Slower processing
- Best results

**Tips:**
- Use for important material
- Worth the extra processing time
- Formant preservation for vocals
- Professional results

---

## Time Stretching

Change duration without altering pitch.

### Basic Time Stretch (🟢 Basic)

**Description**: Simple tempo change  
**Use Case**: Match tempos, slow down/speed up  
**Quality**: Good for moderate changes (50-200%)

**Rubberband Command:**
```bash
# Stretch to 120% (slower, 20% longer)
rubberband -t 1.2 input.wav output.wav

# Compress to 80% (faster, 20% shorter)
rubberband -t 0.8 input.wav output.wav
```

**SoX Command:**
```bash
# Stretch to 150% duration
sox input.wav output.wav stretch 1.5

# Compress to 80% duration
sox input.wav output.wav tempo 1.25
```

**Tips:**
- 0.5-2.0x is generally good range
- <0.5x or >2x will have artifacts
- Rubberband usually better than SoX
- Test different quality settings

---

### Tempo Change by BPM (🟡 Intermediate)

**Description**: Change from one BPM to another  
**Use Case**: Match song tempos  
**Quality**: Musical, maintains groove

**Rubberband Command:**
```bash
# Change from 120 BPM to 130 BPM
# Ratio = 120/130 = 0.923
rubberband -t 0.923 input.wav output.wav
```

**Calculation:**
```
time_ratio = original_bpm / target_bpm
```

**Examples:**
- 100 BPM → 120 BPM: ratio = 100/120 = 0.833
- 140 BPM → 120 BPM: ratio = 140/120 = 1.167

**Tips:**
- Calculate ratio from BPMs
- Maintains musical feel
- Good for DJ mixes
- Preserves transients well

---

### High-Quality Time Stretch (🔴 Advanced)

**Description**: Maximum quality time stretching  
**Use Case**: Professional production, extreme stretches  
**Quality**: Best possible, minimal artifacts

**Rubberband Command:**
```bash
# High quality stretch
rubberband -t 1.5 --time-hq --precise input.wav output.wav
```

**Parameters Explained:**
- `--time-hq`: High-quality mode
- `--precise`: More accurate transient detection
- Slower processing
- Best for extreme changes

**Tips:**
- Use for >2x or <0.5x stretches
- Essential for extreme changes
- Worth the processing time
- Professional results

---

## Combined Pitch/Time

Independent pitch and time manipulation.

### Key Change Without Tempo Change (🟡 Intermediate)

**Description**: Shift key, maintain tempo  
**Use Case**: Key changes, remixes, mashups  
**Quality**: Clean for moderate shifts

**Rubberband Command:**
```bash
# Up 2 semitones, same tempo
rubberband -p 2 input.wav output.wav

# Down 3 semitones, same tempo
rubberband -p -3 input.wav output.wav
```

**Tips:**
- Pure pitch shift
- Tempo unchanged
- Perfect for key changes
- Useful for mashups

---

### Tempo Change Without Pitch Change (🟡 Intermediate)

**Description**: Change tempo, maintain pitch  
**Use Case**: Speed up/slow down without chipmunk effect  
**Quality**: Natural tempo changes

**Rubberband Command:**
```bash
# 110% tempo (faster), same pitch
rubberband -t 0.909 input.wav output.wav

# 90% tempo (slower), same pitch
rubberband -t 1.111 input.wav output.wav
```

**Tips:**
- Pure time stretch
- Pitch unchanged
- Natural sound
- Great for tempo matching

---

### Combined Pitch and Time (🔴 Advanced)

**Description**: Change both independently  
**Use Case**: Creative effects, matching to different tempo/key  
**Quality**: Flexible but requires care

**Rubberband Command:**
```bash
# Up 2 semitones, 110% speed
rubberband -p 2 -t 0.909 input.wav output.wav

# Down 5 semitones, 90% speed
rubberband -p -5 -t 1.111 input.wav output.wav
```

**Tips:**
- Complete control
- Calculate ratios carefully
- Test different combinations
- Monitor artifacts

---

## Formant Preservation

Maintain vocal character during pitch shifting.

### Formant-Preserved Pitch Shift (🟡 Intermediate)

**Description**: Shift pitch while keeping vocal quality  
**Use Case**: Vocal pitch correction, harmonies  
**Quality**: Natural-sounding vocals

**Rubberband Command:**
```bash
# Pitch shift with formant preservation
rubberband -p 3 --formant input.wav output.wav
```

**Tips:**
- Essential for vocals
- Prevents chipmunk/monster effects
- Keeps natural timbre
- Use for all vocal pitch shifts

---

### Formant Shifting (🔴 Advanced)

**Description**: Intentionally shift formants  
**Use Case**: Gender change effects, creative vocals  
**Quality**: Special effects

**Rubberband Command:**
```bash
# Pitch up, formants down (male → female)
rubberband -p 5 --formant-shift 0.8 input.wav output.wav

# Pitch down, formants up (female → male)
rubberband -p -5 --formant-shift 1.2 input.wav output.wav
```

**Tips:**
- Create gender-shift effects
- Formant shift 0.8-1.2 range useful
- Combine with pitch shift
- Creative vocal effects

---

## Tempo Changes

Smooth tempo changes and transitions.

### Gradual Tempo Ramp (🔴 Advanced)

**Description**: Accelerate or decelerate tempo  
**Use Case**: Tempo transitions, ritardando, accelerando  
**Quality**: Musical tempo changes

**Rubberband Command:**
```bash
# Tempo ramp (requires splits)
rubberband -t 1.0:0.9 input.wav output.wav
```

**Tips:**
- Smooth transitions
- Musical effect
- Use for build-ups
- Test different curves

---

### Constant Tempo Adjustment (🟢 Basic)

**Description**: Fixed tempo change throughout  
**Use Case**: Match to backing track, fit to video length  
**Quality**: Consistent, clean

**Rubberband Command:**
```bash
# Specific duration (10 seconds to 12 seconds)
rubberband -D 12 input.wav output.wav
```

**Tips:**
- Specify exact duration
- Good for video sync
- Consistent tempo
- Easy to calculate

---

## Creative Pitch Effects

### Pitch Automation/Bends (🔴 Advanced)

**Description**: Varying pitch throughout  
**Use Case**: Pitch bends, dive bombs, creative effects  
**Quality**: Expressive, musical

**Approach:**
- Split audio into segments
- Apply different pitch shifts
- Crossfade segments
- Create smooth transitions

**Tips:**
- Requires manual editing
- Very expressive
- Great for creative effects
- Time-consuming but worthwhile

---

### Harmonizer (🟡 Intermediate)

**Description**: Create harmony by pitch shifting and mixing  
**Use Case**: Vocal harmonies, guitar harmonies  
**Quality**: Artificial but useful

**Rubberband Commands:**
```bash
# Create 3rd above harmony
rubberband -p 4 input.wav harmony_3rd.wav

# Create 5th above harmony
rubberband -p 7 input.wav harmony_5th.wav

# Mix together
sox -m input.wav harmony_3rd.wav harmony_5th.wav output.wav
```

**Common Intervals:**
- Minor 3rd: +3 semitones
- Major 3rd: +4 semitones
- Perfect 4th: +5 semitones
- Perfect 5th: +7 semitones
- Octave: +12 semitones

---

### Detune/Thicken Effect (🟢 Basic)

**Description**: Slight pitch variations for thickness  
**Use Case**: Thicken vocals, guitars, synths  
**Quality**: Subtle, natural thickness

**Rubberband Commands:**
```bash
# Create detuned versions
rubberband -p 0.1 input.wav slight_up.wav
rubberband -p -0.1 input.wav slight_down.wav

# Mix with original
sox -m input.wav slight_up.wav slight_down.wav output.wav
```

**Tips:**
- ±10-20 cents works well
- Mix with original
- Creates natural chorus
- Subtle but effective

---

### Reverse with Pitch Shift (🟡 Intermediate)

**Description**: Backwards audio with pitch change  
**Use Case**: Creative effects, transitions  
**Quality**: Unique, attention-grabbing

**Commands:**
```bash
# Reverse and pitch shift
sox input.wav - reverse | rubberband -p 5 - output.wav
```

**Tips:**
- Combine techniques
- Great for transitions
- Experimental sound
- Use sparingly

---

## Quality Settings

### Rubberband Quality Modes

```bash
# Fastest (lower quality)
rubberband --realtime input.wav output.wav

# Default (good balance)
rubberband input.wav output.wav

# High quality
rubberband --pitch-hq --time-hq input.wav output.wav

# Maximum quality
rubberband --pitch-hq --time-hq --precise input.wav output.wav
```

**Quality Hierarchy:**
1. `--realtime`: Fastest, lowest quality
2. Default: Good balance
3. `--pitch-hq` / `--time-hq`: High quality
4. `--precise`: Maximum quality

---

## Best Practices

1. **Use Rubberband**: Generally best quality
2. **Modest Changes**: ±5 semitones or 0.5-2.0x time
3. **Formant Preserve**: Always for vocals
4. **Test Settings**: Different quality modes affect results
5. **Reference**: A/B test changes
6. **Artifacts**: Listen carefully for warbling, phasiness
7. **Transients**: Preserve with `--precise` flag
8. **Processing Time**: High quality takes longer
9. **Plan Ahead**: Record at target pitch/tempo when possible
10. **Context**: Judge in full mix

---

## Common Applications

### Vocal Tuning
```bash
# Subtle pitch correction
rubberband -p 0.2 --formant input.wav output.wav
```

### DJ Tempo Matching
```bash
# Match 128 BPM to 130 BPM
rubberband -t 0.985 input.wav output.wav
```

### Sub-Bass Generation
```bash
# Octave down for sub
rubberband -p -12 --formant input.wav output.wav
```

### Slow-Mo Effect
```bash
# 50% speed, one octave down
rubberband -t 2.0 -p -12 input.wav output.wav
```

### Fast-Forward Effect
```bash
# 2x speed, one octave up
rubberband -t 0.5 -p 12 input.wav output.wav
```

---

## Artifact Troubleshooting

**Problem**: Warbling, phasiness  
**Solution**: Use `--pitch-hq` or reduce shift amount

**Problem**: Loss of transients  
**Solution**: Use `--precise` flag, less extreme changes

**Problem**: Chipmunk/monster voice  
**Solution**: Use `--formant` for vocals

**Problem**: Grainy texture  
**Solution**: Higher quality mode, smaller changes

**Problem**: Pre-echo artifacts  
**Solution**: `--precise` flag, shorter window size

---

## Pitch Shift Calculations

### Semitone to Frequency Ratio
```
ratio = 2^(semitones/12)
```

**Examples:**
- +12 semitones (octave): 2^(12/12) = 2.0
- +7 semitones (5th): 2^(7/12) = 1.498
- +5 semitones (4th): 2^(5/12) = 1.335
- +4 semitones (M3): 2^(4/12) = 1.260
- +3 semitones (m3): 2^(3/12) = 1.189
- -12 semitones: 2^(-12/12) = 0.5

### Tempo Ratio Calculation
```
time_ratio = original_bpm / target_bpm
```

**Examples:**
- 120 → 130 BPM: 120/130 = 0.923
- 90 → 120 BPM: 90/120 = 0.75
- 140 → 120 BPM: 140/120 = 1.167

---

## Tools Comparison

| Tool | Pitch | Time | Quality | Speed | Formants |
|------|-------|------|---------|-------|----------|
| Rubberband | ✅ | ✅ | Excellent | Medium | ✅ |
| SoX | ✅ | ✅ | Good | Fast | ❌ |
| FFmpeg | Limited | Limited | Basic | Fast | ❌ |

**Recommendation**: Use Rubberband for best results.

---

**Next Steps:**
- Experiment with different pitch intervals
- Try tempo matching exercises
- Move on to [Audio Restoration](08-restoration.md)

---

[← Back to Main Guide](../../AUDIO_EFFECTS_GUIDE.md)
