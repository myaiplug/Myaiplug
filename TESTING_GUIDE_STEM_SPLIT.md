# Stem Split Demo - Testing Guide

## Overview
This guide provides comprehensive testing instructions for the newly implemented stem split demo functionality.

## Quick Start Testing

### Prerequisites
- Modern browser (Chrome 55+, Firefox 53+, Safari 14+, Edge 79+)
- Audio files for testing (various formats and durations)
- Internet connection

### Basic Test Flow
1. Navigate to the home page
2. Scroll to "Stem Split Demo" section (after Premium Audio Demo)
3. Upload an audio file
4. Verify 20-second trimming (if file > 20s)
5. Wait for processing (~25-30 seconds)
6. Download and verify split results
7. Test playback of vocals and instrumental

## Detailed Test Cases

### Test Case 1: Upload Audio File < 20 Seconds
**Objective**: Verify short files are processed without trimming

**Steps:**
1. Prepare an audio file less than 20 seconds (e.g., 15 seconds)
2. Navigate to landing page stem split demo section
3. Click upload area or drag file
4. Verify file preview shows in UI
5. Click "Split Audio" button
6. Wait for processing

**Expected Results:**
- ✅ File uploads successfully
- ✅ No trimming message displayed
- ✅ Processing completes in ~25-30 seconds
- ✅ Both vocals and instrumental are same duration as original
- ✅ Waveform players show both tracks
- ✅ Download buttons work for both tracks
- ✅ Audio playback works correctly

### Test Case 2: Upload Audio File > 20 Seconds
**Objective**: Verify trimming functionality works correctly

**Steps:**
1. Prepare an audio file longer than 20 seconds (e.g., 60 seconds)
2. Navigate to landing page stem split demo section
3. Click upload area or drag file
4. Observe trimming message: "Preparing demo (limiting to 20 seconds)..."
5. Wait for trimming to complete
6. Verify file preview shows
7. Click "Split Audio" button
8. Wait for processing

**Expected Results:**
- ✅ File uploads successfully
- ✅ Trimming message appears briefly
- ✅ File is automatically trimmed to 20 seconds
- ✅ New filename: `{basename}_demo_20s.wav`
- ✅ Processing completes in ~25-30 seconds
- ✅ Both vocals and instrumental are exactly 20 seconds
- ✅ Waveform players show both tracks
- ✅ Download and playback work correctly

### Test Case 3: File Size Limits
**Objective**: Verify file size validation

**Steps:**
1. Try uploading files of various sizes:
   - 5MB file (should work)
   - 9MB file (should work)
   - 11MB file (should fail in demo mode)

**Expected Results:**
- ✅ Files ≤ 10MB: Upload successfully
- ✅ Files > 10MB: Show error "File too large. Maximum size: 10MB"
- ✅ Error state displays properly with retry option
- ✅ User can click "Try Again" to reset

### Test Case 4: Different Audio Formats
**Objective**: Verify support for various audio formats

**Test formats:**
- MP3
- WAV
- FLAC
- M4A
- OGG

**Steps:**
1. For each format, upload a test file
2. Verify format is accepted
3. Complete split process
4. Verify results

**Expected Results:**
- ✅ All supported formats accepted
- ✅ Trimming works for all formats
- ✅ Output is always WAV format
- ✅ Quality is maintained

### Test Case 5: Invalid File Types
**Objective**: Verify proper error handling for invalid files

**Steps:**
1. Try uploading non-audio files:
   - Image file (.jpg, .png)
   - Document file (.pdf, .txt)
   - Video file (.mp4)

**Expected Results:**
- ✅ Shows error: "Please upload an audio file"
- ✅ File is rejected
- ✅ User can try again with valid file

### Test Case 6: Drag and Drop
**Objective**: Verify drag-and-drop functionality

**Steps:**
1. Drag an audio file from file explorer
2. Hover over upload area
3. Drop file

**Expected Results:**
- ✅ Upload area highlights on hover
- ✅ File is accepted on drop
- ✅ Same behavior as clicking to upload

### Test Case 7: Playback Controls
**Objective**: Verify waveform player functionality

**Steps:**
1. Complete a split operation
2. Click play on vocals track
3. Observe playback
4. Click pause
5. Seek to different position
6. Repeat for instrumental track

**Expected Results:**
- ✅ Play/pause works correctly
- ✅ Waveform visualization displays
- ✅ Seek/scrubbing works
- ✅ Volume control works
- ✅ Both tracks can be played simultaneously or separately

### Test Case 8: Download Functionality
**Objective**: Verify download feature

**Steps:**
1. Complete a split operation
2. Click download button for vocals
3. Verify file downloads
4. Click download button for instrumental
5. Verify file downloads
6. Open downloaded files in audio player

**Expected Results:**
- ✅ Downloads trigger automatically
- ✅ Files have correct names: `{original}_vocals.wav` and `{original}_instrumental.wav`
- ✅ Files are valid WAV format
- ✅ Audio quality is preserved
- ✅ Duration matches (20s in demo mode)

### Test Case 9: Error Recovery
**Objective**: Verify error handling and recovery

**Scenarios to test:**
1. Network interruption during upload
2. API timeout
3. Corrupted audio file
4. Browser doesn't support Web Audio API

**Expected Results:**
- ✅ Clear error messages displayed
- ✅ "Try Again" button works
- ✅ Can reset and upload new file
- ✅ No memory leaks or hanging state

### Test Case 10: Multiple Sessions
**Objective**: Verify can perform multiple splits

**Steps:**
1. Complete a split operation
2. Click "Split Another Track"
3. Upload different file
4. Complete another split
5. Repeat 2-3 times

**Expected Results:**
- ✅ Previous URLs are cleaned up
- ✅ Each session is independent
- ✅ No memory leaks
- ✅ Performance remains consistent

### Test Case 11: Browser Compatibility
**Objective**: Verify works across different browsers

**Test browsers:**
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (14+)

**Steps:**
1. Test basic flow on each browser
2. Verify UI rendering
3. Test audio playback
4. Verify downloads

**Expected Results:**
- ✅ Works on all listed browsers
- ✅ UI renders correctly
- ✅ Audio processing works
- ✅ No console errors

### Test Case 12: Mobile Devices
**Objective**: Verify mobile functionality

**Steps:**
1. Open on mobile device (iOS Safari, Chrome Android)
2. Test file upload from device
3. Verify UI is responsive
4. Test playback on mobile

**Expected Results:**
- ✅ Upload works on mobile
- ✅ UI is mobile-friendly
- ✅ Processing works
- ✅ Playback works (with mobile browser limitations)

### Test Case 13: Edge Cases - Filename Handling
**Objective**: Verify robust filename handling

**Test filenames:**
- `song.mp3` (normal)
- `my.song.with.dots.mp3` (multiple dots)
- `song` (no extension)
- `.wav` (extension only - edge case)
- `song name with spaces.mp3` (spaces)
- `song-with-special_chars!@#.mp3` (special characters)

**Expected Results:**
- ✅ All filenames handled correctly
- ✅ Output filename is clean: `{basename}_demo_20s.wav`
- ✅ No errors from filename processing

### Test Case 14: Performance - Large Files
**Objective**: Verify performance with maximum file size

**Steps:**
1. Upload a 10MB audio file (at limit)
2. Monitor browser memory usage
3. Monitor processing time
4. Verify completion

**Expected Results:**
- ✅ File uploads successfully
- ✅ Memory usage stays reasonable (<100MB)
- ✅ Processing completes in acceptable time
- ✅ No browser slowdown or crash

### Test Case 15: Demo Mode UI Indicators
**Objective**: Verify demo mode is clearly communicated

**Steps:**
1. Navigate to demo section
2. Observe UI elements

**Expected Results:**
- ✅ "(Demo Mode)" badge visible in header
- ✅ "First 20 seconds only" message displayed
- ✅ File size limit shown: "Max 10MB"
- ✅ Clear distinction from full product

## Regression Testing

### Areas to Check
1. Other landing page sections still work
2. Navigation not affected
3. Footer links work
4. Other audio demos (PremiumAudioDemo) not affected
5. Page load performance

## Performance Benchmarks

### Expected Metrics
- **Initial page load**: < 3 seconds
- **File upload**: 1-2 seconds for 10MB file
- **Audio trimming**: 1-3 seconds for 60s file
- **API processing**: 20-30 seconds
- **Download**: Instant (blob URL)

### Memory Usage
- **Idle**: ~50MB
- **During trimming**: ~80MB
- **During playback**: ~90MB
- **After cleanup**: Back to ~50MB

## Known Limitations

1. **Demo Mode Only**: Limited to 20 seconds
2. **File Size**: 10MB maximum in demo mode
3. **Format**: Output is always WAV (no MP3 option in demo)
4. **Processing Time**: Cannot be skipped or accelerated
5. **No Authentication**: Demo works without sign-up

## Troubleshooting Common Issues

### Issue: "Failed to trim audio file"
- **Cause**: Browser doesn't support Web Audio API or file is corrupted
- **Solution**: Try different browser or different file

### Issue: "File too large"
- **Cause**: File exceeds 10MB limit
- **Solution**: Use smaller file or compress before uploading

### Issue: "Please upload an audio file"
- **Cause**: Invalid file type
- **Solution**: Ensure file is audio format (MP3, WAV, etc.)

### Issue: Processing takes too long
- **Cause**: Server load or network issues
- **Solution**: Wait or try again later

### Issue: Playback doesn't work
- **Cause**: Browser audio policy or codec issue
- **Solution**: Click play button (user interaction required), check browser console

## Automated Testing Recommendations

### Unit Tests
```javascript
// Example test structure
describe('StemSplitTool', () => {
  it('should trim audio to 20 seconds in demo mode', async () => {
    // Test implementation
  });
  
  it('should handle files without extensions', () => {
    // Test implementation
  });
  
  it('should cleanup resources on unmount', () => {
    // Test implementation
  });
});
```

### Integration Tests
- Test API endpoint with various file sizes
- Verify response format and data
- Test error scenarios (429, 400, 500)

### E2E Tests
- Full user flow from upload to download
- Cross-browser testing
- Mobile testing

## Sign-off Checklist

Before considering testing complete:
- [ ] All test cases passed
- [ ] Tested on Chrome, Firefox, Safari
- [ ] Tested on mobile device
- [ ] No console errors
- [ ] No memory leaks detected
- [ ] Performance benchmarks met
- [ ] Error handling works correctly
- [ ] UI/UX is intuitive
- [ ] Documentation is accurate
- [ ] No security vulnerabilities

## Reporting Issues

When reporting issues, include:
1. Test case number/name
2. Browser and version
3. Operating system
4. File details (format, size, duration)
5. Steps to reproduce
6. Expected vs actual behavior
7. Screenshots or console logs
8. Network tab output (if relevant)

## Success Criteria

The implementation is successful if:
- ✅ All critical test cases pass
- ✅ No blocking bugs
- ✅ Performance meets benchmarks
- ✅ Works on all major browsers
- ✅ Error handling is robust
- ✅ UI/UX is clear and intuitive
- ✅ Security scan passes

---

**Last Updated**: 2025-01-06
**Version**: 1.0
**Status**: Ready for Testing
