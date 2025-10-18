# Quick Guide: Replacing Demo Audio

## ⚡ Fast Track

1. **Your audio file must be**:
   - Format: WAV (uncompressed)
   - Sample Rate: 44100 Hz
   - Bit Depth: 16-bit
   - Channels: Stereo
   - Duration: 2-8 seconds
   - File Size: Under 2MB

2. **Replace the file**:
   ```bash
   cp your-audio.wav public/assets/loops/dry.wav
   ```

3. **Test it**:
   ```bash
   npm run dev
   # Open http://localhost:3000 and navigate to demo section
   ```

## 🔧 Convert Your File

Don't have the right format? Use FFmpeg:

```bash
ffmpeg -i your-audio.mp3 -ar 44100 -ac 2 -sample_fmt s16 public/assets/loops/dry.wav
```

## ✅ Verify Format

```bash
file public/assets/loops/dry.wav
# Should show: RIFF (little-endian) data, WAVE audio, Microsoft PCM, 16 bit, stereo 44100 Hz
```

## 📖 Need More Help?

See **[CONTRIBUTING.md](CONTRIBUTING.md)** for:
- Detailed instructions
- Audio editing tips
- Troubleshooting
- Creating great loops

---

**Pro Tip**: Use seamless loops (crossfaded at boundaries) for the best experience.
