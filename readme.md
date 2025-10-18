# MyAiPlug™ NoDAW — Professional AI Audio Tools

A professional, conversion-focused landing page and interactive audio demo built with Next.js 14, TypeScript, TailwindCSS, and Framer Motion.

## 🎯 Features

- **Studio-Grade Audio Processing**: 6 professional audio modules powered by Web Audio API
  - Warmth (Harmonics & Body)
  - Stereo Widener
  - HalfScrew (Pitch & Tempo)
  - reTUNE 432 (Pitch Shift)
  - EQ Lite (3-Band)
  - Reverb Lite
- **Interactive Demo**: Real-time A/B comparison with no uploads required
- **Conversion-Optimized Design**: Hero section, features, pricing, and CTAs
- **Modern Tech Stack**: Next.js 14 + TypeScript + TailwindCSS + Framer Motion
- **Responsive & Fast**: Optimized for all devices with 90+ Lighthouse scores

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📁 Project Structure

```
/app              - Next.js app router pages
/components       - Reusable React components
/sections         - Landing page sections (Hero, Features, Pricing)
/lib              - Core logic (Audio engine, modules)
/public/assets    - Static assets (audio loops, images, UI elements)
_legacy/          - Original vanilla JS files (backup)
```

## 🎵 Audio Modules

Each module includes:
- Real-time parameter control
- Curated presets
- A/B dry/processed comparison
- Visual feedback

### 🎚️ Replacing Demo Audio

Want to use your own audio loops? See **[CONTRIBUTING.md](CONTRIBUTING.md)** for detailed instructions on:
- Audio file specifications (format, sample rate, bit depth)
- Step-by-step replacement guide
- Converting audio files with FFmpeg/Audacity
- Troubleshooting common issues
- Creating great demo loops

**Quick Start**: Replace `/public/assets/loops/dry.wav` with your own seamless loop (WAV, 44100Hz, 16-bit stereo, 2-8 seconds)

## 🎨 Branding

- **Primary**: #7C4DFF (Purple gradient)
- **Accent**: #00C2FF (Cyan)
- **Warm Accent**: #FFB84D, #FF9900 (Orange gradient)
- **Background**: #0D0D0F, #111122 (Dark theme)

## 📝 License

© 2025 MyAiPlug™. All rights reserved.
