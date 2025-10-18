# Contributing to MyAiPlug™ NoDAW

Thank you for your interest in contributing to MyAiPlug™ NoDAW! This guide will help you understand how to add or replace demo audio examples.

## 📁 Demo Audio Files

The interactive demo uses audio loop files located in `/public/assets/loops/`. These files are loaded by the Web Audio API and processed in real-time.

### Required Files

The demo currently requires these two audio files:

1. **`dry.wav`** - The unprocessed (dry) audio loop
2. **`warmth_fx.wav`** - Optional: A pre-processed example (currently not actively used but kept for reference)

### Audio File Specifications

To ensure optimal performance and compatibility, your demo audio files **must** meet these specifications:

| Property | Required Value | Notes |
|----------|---------------|-------|
| **Format** | WAV (RIFF) | Standard uncompressed WAV format |
| **Sample Rate** | 44100 Hz | CD quality, standard for web audio |
| **Bit Depth** | 16-bit | PCM (Pulse Code Modulation) |
| **Channels** | Stereo (2) | Required for stereo widener module |
| **Duration** | 2-8 seconds | Optimal for seamless looping |
| **File Size** | < 2MB | Keeps page load times fast |

### Recommended Audio Characteristics

For the best demo experience:

- **Seamless Loops**: Audio should loop smoothly without clicks or pops at the boundaries
- **Musical Content**: Use musical loops (drums, bass, synths) rather than full mixes
- **Dynamic Range**: Avoid heavily compressed or limited audio
- **Clean Audio**: Use high-quality source material without artifacts
- **Appropriate Levels**: Peak levels around -6dB to -3dB (avoid clipping)

## 🎵 How to Replace Demo Audio

### Step 1: Prepare Your Audio File

1. **Export from your DAW** with the specifications above
2. **Name the file** `dry.wav` (must match exactly)
3. **Test the loop** in your DAW to ensure it's seamless
4. **Check file size** - if over 2MB, consider shortening the duration

### Step 2: Replace the File

Navigate to the project directory and replace the existing file:

```bash
cd /home/runner/work/Myaiplug/Myaiplug
cp /path/to/your/dry.wav public/assets/loops/dry.wav
```

Or simply:
1. Navigate to `public/assets/loops/` in your file browser
2. Delete or rename the existing `dry.wav`
3. Copy your new `dry.wav` into the folder

### Step 3: Verify the Audio

Before committing, verify your audio file meets the requirements:

```bash
# Check file format and specs
file public/assets/loops/dry.wav

# Expected output:
# RIFF (little-endian) data, WAVE audio, Microsoft PCM, 16 bit, stereo 44100 Hz
```

You can also use audio tools like `ffprobe` or `mediainfo`:

```bash
ffprobe public/assets/loops/dry.wav
```

### Step 4: Test the Demo

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Open the demo** in your browser at `http://localhost:3000`

3. **Navigate to the demo section** and click play

4. **Test all modules**:
   - Verify the audio plays smoothly
   - Check that the loop is seamless
   - Test all 6 audio modules (Warmth, Stereo Widener, HalfScrew, reTUNE 432, EQ Lite, Reverb Lite)
   - Use the A/B toggle to compare dry vs processed
   - Test the upload and record features

### Step 5: Commit Your Changes

If everything works correctly:

```bash
git add public/assets/loops/dry.wav
git commit -m "Update demo audio loop"
git push
```

## 🔧 Converting Audio Files

If your audio file doesn't meet the specifications, you can convert it using various tools:

### Using FFmpeg (Recommended)

```bash
# Convert any audio file to the correct format
ffmpeg -i input.mp3 -ar 44100 -ac 2 -sample_fmt s16 public/assets/loops/dry.wav

# Trim and normalize
ffmpeg -i input.wav -ss 0 -t 4 -af "loudnorm=I=-16:TP=-1.5:LRA=11" -ar 44100 -ac 2 -sample_fmt s16 public/assets/loops/dry.wav
```

### Using Audacity

1. Open your audio file in Audacity
2. **Set Project Rate** to 44100 Hz (bottom left)
3. **Convert to Stereo** if needed: Tracks > Mix > Mix Stereo Down to Mono, then Tracks > Add New > Stereo Track
4. **Trim** to desired length (2-8 seconds)
5. **Normalize** to -3dB: Effect > Normalize
6. **Export**:
   - File > Export > Export as WAV
   - Encoding: Signed 16-bit PCM
   - Sample Rate: 44100 Hz

### Using SoX (Command Line)

```bash
# Convert and resample
sox input.mp3 -r 44100 -b 16 -c 2 public/assets/loops/dry.wav

# Trim to 4 seconds and normalize
sox input.wav -r 44100 -b 16 -c 2 public/assets/loops/dry.wav trim 0 4 norm
```

## 🎚️ Creating Great Demo Loops

### What Makes a Good Demo Loop?

1. **Clear Musical Content**: Use recognizable instruments or rhythms
2. **Stereo Information**: Wide stereo field showcases the Stereo Widener module
3. **Harmonic Content**: Rich harmonics demonstrate the Warmth module
4. **Dynamic Range**: Uncompressed audio shows the effects better
5. **Appropriate Tempo**: 80-140 BPM works well for most genres

### Suggested Content Types

- ✅ Drum loops with clear stereo imaging
- ✅ Bass + drum grooves
- ✅ Synth patterns with movement
- ✅ Guitar riffs with natural dynamics
- ✅ Full instrumental loops (not vocals)
- ❌ Heavily compressed mastered tracks
- ❌ Full songs with vocals
- ❌ Low-quality recordings with noise
- ❌ Very long loops (>10 seconds)

### Example Workflow

1. **Source**: Start with a clean, professional-quality loop
2. **Trim**: Cut to exactly 4 bars at your tempo
3. **Fade**: Apply 5ms crossfades at loop points
4. **Normalize**: Peak around -6dB
5. **Export**: WAV, 44100 Hz, 16-bit, stereo
6. **Test**: Load in demo and verify seamless looping

## 🐛 Troubleshooting

### Audio Doesn't Play

- **Check browser console** for errors (F12 in most browsers)
- **Verify file path** is exactly `/public/assets/loops/dry.wav`
- **Check file format** with `file` command
- **Clear browser cache** and reload
- **Check autoplay policy**: Some browsers block autoplay - click to start

### Audio Clicks or Pops

- **Loop points aren't seamless**: Use crossfades at boundaries
- **File is corrupted**: Re-export from source
- **Sample rate mismatch**: Ensure 44100 Hz

### Audio Sounds Distorted

- **Clipping**: Input level too high - normalize to -6dB
- **File corruption**: Re-export
- **Browser compatibility**: Test in Chrome, Firefox, Safari

### File Too Large

- **Shorten duration**: Aim for 2-4 seconds
- **Keep 16-bit**: Don't use 24-bit or 32-bit
- **Don't use MP3/compressed**: Only WAV is supported

### Browser Compatibility

The Web Audio API works in:
- ✅ Chrome/Edge 23+
- ✅ Firefox 25+
- ✅ Safari 6+
- ✅ Mobile Chrome/Safari (iOS 14.5+)

## 📝 Code Changes

If you need to modify how audio files are loaded, check these files:

- **`/lib/audioEngine.ts`** - Main audio engine (line 35: `loopUrl` setting)
- **`/components/MiniStudio.tsx`** - Demo UI component
- **`/lib/audioModules.ts`** - Individual audio processing modules

The default loop is set in `audioEngine.ts`:
```typescript
private loopUrl: string = '/assets/loops/dry.wav';
```

## 🤝 Need Help?

If you encounter issues:

1. Check the troubleshooting section above
2. Review the browser console for errors
3. Ensure your audio file meets all specifications
4. Open an issue on GitHub with:
   - Audio file specifications (`file` command output)
   - Browser and version
   - Error messages from console
   - Steps to reproduce

## 📄 License

By contributing demo audio, you confirm that you have the rights to use and distribute the audio, and that it's compatible with the project's license.

---

© 2025 MyAiPlug™. All rights reserved.
