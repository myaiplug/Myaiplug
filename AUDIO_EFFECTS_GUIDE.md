# Audio Effects Command-Line Guide

**The Ultimate Producer's Guide to Audio Effects Processing**

A comprehensive, categorized collection of command-line recipes for professional audio effects processing using FFmpeg, SoX, Pedalboard, Rubberband, and other CLI tools.

---

## 📋 Table of Contents

1. [Introduction](#introduction)
2. [Required Tools](#required-tools)
3. [Categories Overview](#categories-overview)
4. [Using This Guide](#using-this-guide)
5. [Category Guides](#category-guides)

---

## Introduction

This guide provides production-ready command-line recipes for audio effects processing. Each category includes multiple quality tiers (Basic, Intermediate, Advanced) to match your needs and computational resources.

**Target Audience:**
- Music producers
- Audio engineers
- Sound designers
- Developers working with audio
- Content creators

**Philosophy:**
- **Basic Tier**: Quick, efficient processing with good results
- **Intermediate Tier**: Better quality with moderate processing requirements
- **Advanced Tier**: Professional-grade results with higher computational cost

---

## Required Tools

### Essential Tools

1. **FFmpeg** - Swiss army knife for audio/video processing
   ```bash
   # Install on Ubuntu/Debian
   sudo apt-get install ffmpeg
   
   # Install on macOS
   brew install ffmpeg
   
   # Verify installation
   ffmpeg -version
   ```

2. **SoX** - Sound eXchange, audio manipulation tool
   ```bash
   # Install on Ubuntu/Debian
   sudo apt-get install sox libsox-fmt-all
   
   # Install on macOS
   brew install sox
   
   # Verify installation
   sox --version
   ```

3. **Rubberband** - Time-stretching and pitch-shifting
   ```bash
   # Install on Ubuntu/Debian
   sudo apt-get install rubberband-cli
   
   # Install on macOS
   brew install rubberband
   
   # Verify installation
   rubberband --help
   ```

### Optional Tools

4. **Python + Pedalboard** - Spotify's audio effects library
   ```bash
   pip install pedalboard
   ```

5. **LADSPA/LV2 Plugins** - Additional effects for SoX
   ```bash
   sudo apt-get install ladspa-sdk swh-plugins
   ```

---

## Categories Overview

This guide covers the following audio processing categories:

| Category | Description | Typical Use Cases |
|----------|-------------|-------------------|
| **[EQ (Equalization)](#eq-equalization)** | Frequency shaping and tonal balance | Mixing, mastering, corrective EQ |
| **[Dynamics](#dynamics)** | Compression, limiting, expansion | Level control, punch, clarity |
| **[Reverb & Ambience](#reverb--ambience)** | Spatial effects and room simulation | Depth, space, atmosphere |
| **[Delay & Echo](#delay--echo)** | Time-based repetitions | Rhythm, depth, space |
| **[Modulation](#modulation)** | Chorus, flanger, phaser effects | Movement, width, interest |
| **[Distortion & Saturation](#distortion--saturation)** | Harmonic enhancement and grit | Warmth, character, aggression |
| **[Pitch & Time](#pitch--time)** | Pitch shifting and time stretching | Key changes, tempo adjustment |
| **[Restoration](#restoration)** | Noise reduction, de-click, de-ess | Audio cleanup, repair |
| **[Creative FX](#creative-fx)** | Granular, reverse, gating effects | Experimental, transitions |

---

## Using This Guide

### Recipe Format

Each recipe follows this structure:

```
### Recipe Name [Tier]

**Description**: What the effect does
**Use Case**: When to use it
**Quality**: Processing time and quality trade-offs

**Command:**
```bash
[command-line recipe]
```

**Parameters Explained:**
- `parameter1`: Description
- `parameter2`: Description

**Tips:**
- Tip 1
- Tip 2
```

### Quality Tiers

- **🟢 Basic**: Fast processing, good quality for demos and quick work
- **🟡 Intermediate**: Balanced quality/speed for most production work
- **🔴 Advanced**: Professional-grade quality for final delivery

---

## Category Guides

### 📚 Detailed Category Documentation

Each category has its own detailed guide with multiple recipes:

1. **[EQ (Equalization)](docs/guides/01-eq-equalization.md)**
   - High-pass filters
   - Low-pass filters
   - Parametric EQ
   - Shelving EQ
   - Notch filters

2. **[Dynamics Processing](docs/guides/02-dynamics.md)**
   - Compression
   - Limiting
   - Expansion
   - Gating

3. **[Reverb & Ambience](docs/guides/03-reverb-ambience.md)**
   - Room reverb
   - Hall reverb
   - Plate reverb
   - Ambience generation

4. **[Delay & Echo](docs/guides/04-delay-echo.md)**
   - Simple delay
   - Ping-pong delay
   - Slapback echo
   - Multi-tap delay

5. **[Modulation Effects](docs/guides/05-modulation.md)**
   - Chorus
   - Flanger
   - Phaser
   - Tremolo

6. **[Distortion & Saturation](docs/guides/06-distortion-saturation.md)**
   - Tape saturation
   - Tube distortion
   - Bit crushing
   - Hard clipping

7. **[Pitch & Time Manipulation](docs/guides/07-pitch-time.md)**
   - Pitch shifting
   - Time stretching
   - Formant preservation
   - Tempo changes

8. **[Audio Restoration](docs/guides/08-restoration.md)**
   - Noise reduction
   - De-clicking
   - De-essing
   - Hum removal

9. **[Creative Effects](docs/guides/09-creative-fx.md)**
   - Granular synthesis
   - Reverse effects
   - Creative gating
   - Glitch effects

---

## Quick Reference: Common Tasks

### File Format Conversion
```bash
# Convert to standard format
ffmpeg -i input.mp3 -ar 44100 -ac 2 -sample_fmt s16 output.wav
```

### Normalize Audio
```bash
# Peak normalization
ffmpeg -i input.wav -af "loudnorm" output.wav
```

### Batch Processing
```bash
# Process multiple files
for file in *.wav; do
  ffmpeg -i "$file" -af "highpass=f=100" "processed_$file"
done
```

### Chain Multiple Effects
```bash
# Combine multiple filters
ffmpeg -i input.wav -af "highpass=f=80,lowpass=f=12000,volume=1.5,compand" output.wav
```

---

## Contributing

Want to add recipes or improve existing ones? See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

**Contribution Areas:**
- New recipes for existing categories
- Additional quality tiers
- Tool-specific optimizations
- Real-world use case examples
- Performance benchmarks

---

## Resources

### Official Documentation
- [FFmpeg Filters](https://ffmpeg.org/ffmpeg-filters.html)
- [SoX Manual](http://sox.sourceforge.net/sox.html)
- [Rubberband Library](https://breakfastquay.com/rubberband/)
- [Pedalboard Docs](https://spotify.github.io/pedalboard/)

### Learning Resources
- FFmpeg Audio Processing Tutorials
- SoX Audio Manipulation Guide
- Audio DSP Theory

---

## License

© 2025 MyAiPlug™. All rights reserved.

This guide is provided for educational and professional use. Commands and recipes are provided as-is. Always test on copies of your audio files.

---

**Next Steps:**
1. Install the required tools
2. Browse the category guides
3. Try basic recipes first
4. Experiment with parameters
5. Build your own processing chains

Happy processing! 🎵
