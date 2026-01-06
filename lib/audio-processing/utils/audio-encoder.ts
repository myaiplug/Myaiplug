/**
 * Audio Encoding Utilities
 * Encode Float32Array audio data to WAV/MP3 format
 */

/**
 * Encode Float32Array to WAV format
 * @param audioData - Interleaved stereo audio data
 * @param sampleRate - Sample rate in Hz
 * @returns WAV file as ArrayBuffer
 */
export function encodeWAV(audioData: Float32Array, sampleRate: number): ArrayBuffer {
  const numChannels = 2; // Stereo
  const numFrames = audioData.length / numChannels;
  const bytesPerSample = 2; // 16-bit PCM
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numFrames * blockAlign;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // WAV Header
  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');

  // fmt sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Sub-chunk size
  view.setUint16(20, 1, true); // Audio format (1 = PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bytesPerSample * 8, true); // Bits per sample

  // data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Write PCM samples
  let offset = 44;
  for (let i = 0; i < audioData.length; i++) {
    // Convert float32 (-1 to 1) to int16 (-32768 to 32767)
    const sample = Math.max(-1, Math.min(1, audioData[i]));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
    offset += 2;
  }

  return buffer;
}

/**
 * Helper function to write a string to DataView
 */
function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Convert ArrayBuffer to base64 string
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Encode audio data to base64 WAV string
 * @param audioData - Float32Array audio data (interleaved stereo)
 * @param sampleRate - Sample rate in Hz
 * @returns Base64 encoded WAV data URL
 */
export function encodeToBase64WAV(audioData: Float32Array, sampleRate: number): string {
  const wavBuffer = encodeWAV(audioData, sampleRate);
  const base64 = arrayBufferToBase64(wavBuffer);
  return `data:audio/wav;base64,${base64}`;
}
