# 📚 Documentation Index

Welcome to MyAiPlug™ NoDAW documentation! Find what you need quickly:

## 🎯 I Want To...

### Replace Demo Audio Files
→ **[AUDIO_GUIDE.md](AUDIO_GUIDE.md)** - Quick start (2 minutes)  
→ **[CONTRIBUTING.md](CONTRIBUTING.md)** - Complete guide (detailed)

### Learn About the Project
→ **[readme.md](readme.md)** - Full documentation with features and setup

### Get Started Quickly
→ **[README.md](README.md)** - Quick links and overview

## 📖 Documentation Files

| File | Purpose | Best For |
|------|---------|----------|
| **[README.md](README.md)** | Quick overview & navigation | First-time visitors |
| **[readme.md](readme.md)** | Full project documentation | Understanding features |
| **[AUDIO_GUIDE.md](AUDIO_GUIDE.md)** | Quick audio replacement steps | Fast audio swap |
| **[CONTRIBUTING.md](CONTRIBUTING.md)** | Detailed contribution guide | In-depth instructions |

## 🔍 Quick Answers

### What audio format do I need?
- WAV (uncompressed)
- 44100 Hz sample rate
- 16-bit depth
- Stereo
- 2-8 seconds duration

→ See [AUDIO_GUIDE.md](AUDIO_GUIDE.md#-fast-track)

### How do I replace demo audio?
```bash
cp your-audio.wav public/assets/loops/dry.wav
npm run dev
```

→ See [AUDIO_GUIDE.md](AUDIO_GUIDE.md#-fast-track)

### How do I convert my audio file?
```bash
ffmpeg -i input.mp3 -ar 44100 -ac 2 -sample_fmt s16 public/assets/loops/dry.wav
```

→ See [CONTRIBUTING.md](CONTRIBUTING.md#-converting-audio-files)

### My audio doesn't work - help!
→ See [CONTRIBUTING.md](CONTRIBUTING.md#-troubleshooting)

## 🚀 Getting Started

1. **Install dependencies**: `npm install`
2. **Start dev server**: `npm run dev`
3. **Build for production**: `npm run build`
4. **Replace demo audio**: See [AUDIO_GUIDE.md](AUDIO_GUIDE.md)

## 💡 Tips

- Use seamless loops for best experience
- Keep file size under 2MB
- Test in browser after replacing audio
- Check browser console for errors

---

**Still need help?** Check [CONTRIBUTING.md](CONTRIBUTING.md) or open an issue on GitHub.
