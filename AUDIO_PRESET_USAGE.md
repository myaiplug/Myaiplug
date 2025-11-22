# Audio Preset Usage Guide

## Overview
The audio preset system allows users to upload audio files, apply various effects, and save the processed audio.

## How to Use

### 1. Upload Audio
1. Navigate to the Interactive Demo section (MiniStudio)
2. Click the **"📁 Upload Audio"** button
3. Select an audio file from your device (MP3, WAV, FLAC, M4A, OGG, WEBM)
4. The audio will load into the player and you'll see a status message

### 2. Apply Effects
Once audio is loaded:
- Navigate through different effect modules using the arrow buttons or dots
- Adjust parameters using the knobs
- Toggle individual modules on/off using the module buttons
- Use **Preset Chains** for professional combinations of effects:
  - **Warmth Master**: Professional warmth and clarity
  - **Vocal Polish**: Perfect for vocals and podcasts
  - **Bass Heavy**: Deep bass with controlled highs
  - **Stereo Wide**: Maximum stereo width
  - **Lo-Fi Vibe**: Vintage tape aesthetics
  - **Broadcast Ready**: Radio-ready professional sound

### 3. Preview Effects
- Click **"Dry"** to hear the original audio
- Click **"Processed"** to hear the audio with effects applied
- Use **"A/B"** button to quickly toggle between dry and processed

### 4. Save Processed Audio
Once you're happy with the effects:
1. Click the **"✨ Apply Effects & Save"** button
2. The system will:
   - Record the processed audio
   - Upload both original and processed files
   - Create a job entry in your dashboard
   - Charge credits (50 credits for standard processing)
   - Track time saved (approximately 25 minutes)

### 5. Access Your Processed Audio
- Processed audio will be available in your **Dashboard → Jobs** section
- You can also add processed audio to your **Portfolio** for public sharing

## Available Effects

### Warmth
Adds body and soft tape-like harmonics
- **Parameter**: Warmth (0-10)
- **Presets**: Lo-Fi Tape, Subtle Glow, Thick

### Stereo Widener
Creates wider stereo image while staying mono-safe
- **Parameters**: Width (0-1), Balance (-0.5 to 0.5)
- **Presets**: Wide, Superwide, Vox L Focus

### EQ Lite (3-Band)
Shape lows, mids, and airy highs
- **Parameters**: Sub (-12 to 12), Mid (-12 to 12), Air (-12 to 12)
- **Presets**: Vocal Shine, Bass Boost, Lo-Fi

### Reverb Lite
Adds space and ambience
- **Parameters**: Wet (0-1), Room (0.05-0.5)
- **Presets**: Plate, Hall, Huge

### HalfScrew
Lo-fi pitch/tempo demo effect
- **Parameter**: Screw (0-10)
- **Presets**: Slight, Medium, Heavy

### reTUNE 432
Simple pitch tuning
- **Parameter**: Tune (-12 to 12)
- **Presets**: 432 Hz, 440 Hz, 444 Hz

## Recording Live Audio
Instead of uploading a file, you can:
1. Click **"⏺ Record"** to start recording
2. Play/process audio through the effects chain
3. Click **"⏹ Stop"** to download the recorded output

## Transcription & Analysis
For uploaded audio with vocals:
- **"🎤 Get Lyrics"** (50 credits): Extract lyrics from the audio
- **"🎯 Full Analysis"** (150 credits): Get comprehensive lyrical analysis with:
  - Verse and chorus scoring
  - Strengths and improvements
  - Expert industry advice
  - Hit potential assessment

## Tips for Best Results
1. **Start with Preset Chains**: They provide professional starting points
2. **Use A/B Comparison**: Frequently toggle between dry and processed to ensure improvements
3. **Watch the Quality Check Panel**: Keep peak levels below 95% to avoid clipping
4. **Save Custom Presets**: When you find settings you like, save them for future use
5. **Experiment with Module Combinations**: Toggle different modules on/off to create unique sounds

## Credits & Pricing
- Audio processing: 50 credits per job
- Transcription: 50 credits
- Full analysis: 150 credits
- New users receive 100 free credits
- Additional credits can be purchased via subscription plans

## Technical Specifications
- **Maximum File Size**: 50MB
- **Supported Formats**: MP3, WAV, FLAC, M4A, OGG, WEBM
- **Processing**: Client-side Web Audio API for real-time preview
- **Output Format**: WEBM (Opus codec) for processed audio

## Need Help?
- Check the **Info** panel for each module's description
- Hover over module names for tooltips
- Visit the FAQ section for common questions
- Contact support for technical issues

---

**Note**: This is a demo implementation. In production, processed audio would be stored in cloud storage (S3/Cloudinary) and processed using professional audio libraries on the backend.
