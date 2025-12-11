/**
 * Audio Decoder - Decodes various audio formats to Float32Array PCM
 * Supports WAV, MP3, and FLAC formats for real audio processing
 */

import audioDecode from 'audio-decode';

export interface AudioInfo {
  sampleRate: number;
  duration: number;
  channels: number;
  length: number;
}

export interface DecodedAudio {
  audioData: Float32Array;
  info: AudioInfo;
}

/**
 * Supported audio formats
 */
export const SUPPORTED_FORMATS = [
  'audio/wav',
  'audio/x-wav',
  'audio/wave',
  'audio/mpeg',
  'audio/mp3',
  'audio/flac',
  'audio/x-flac',
  'audio/ogg',
  'audio/webm',
  'audio/mp4',
  'audio/x-m4a',
] as const;

/**
 * Check if the audio format is supported
 */
export function isSupportedFormat(mimeType: string, filename?: string): boolean {
  // Check MIME type with type-safe includes check
  const isMimeTypeSupported = (SUPPORTED_FORMATS as readonly string[]).includes(mimeType);
  
  if (isMimeTypeSupported) {
    return true;
  }
  
  // Fallback to filename extension for audio files only
  if (filename) {
    const ext = filename.toLowerCase().split('.').pop();
    const audioExtensions = ['wav', 'mp3', 'flac', 'ogg', 'webm', 'm4a'];
    return ext ? audioExtensions.includes(ext) : false;
  }
  
  return false;
}

/**
 * Validate audio file size and duration constraints
 */
export function validateAudioConstraints(
  fileSize: number,
  duration?: number,
  tier: 'free' | 'pro' = 'free'
): { valid: boolean; error?: string } {
  // File size limits
  const maxFileSize = 100 * 1024 * 1024; // 100MB
  if (fileSize > maxFileSize) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${maxFileSize / (1024 * 1024)}MB`,
    };
  }
  
  // Duration limits
  if (duration !== undefined) {
    const maxDuration = tier === 'pro' ? 600 : 180; // 10 min for Pro, 3 min for Free
    if (duration > maxDuration) {
      return {
        valid: false,
        error: `Audio too long. Maximum duration for ${tier} tier is ${maxDuration} seconds`,
      };
    }
  }
  
  return { valid: true };
}

/**
 * Convert stereo to mono by averaging channels
 */
export function stereoToMono(audioData: Float32Array, channels: number): Float32Array {
  if (channels <= 0) {
    throw new Error('Invalid number of channels: must be greater than 0');
  }
  
  if (channels === 1) {
    return audioData;
  }
  
  const monoLength = audioData.length / channels;
  const mono = new Float32Array(monoLength);
  
  for (let i = 0; i < monoLength; i++) {
    let sum = 0;
    for (let ch = 0; ch < channels; ch++) {
      sum += audioData[i * channels + ch];
    }
    mono[i] = sum / channels;
  }
  
  return mono;
}

/**
 * Resample audio to target sample rate (simple linear interpolation)
 */
export function resampleAudio(
  audioData: Float32Array,
  fromRate: number,
  toRate: number
): Float32Array {
  if (fromRate === toRate) {
    return audioData;
  }
  
  const ratio = fromRate / toRate;
  const newLength = Math.floor(audioData.length / ratio);
  const resampled = new Float32Array(newLength);
  
  for (let i = 0; i < newLength; i++) {
    const srcIndex = i * ratio;
    const srcIndexFloor = Math.floor(srcIndex);
    const srcIndexCeil = Math.min(srcIndexFloor + 1, audioData.length - 1);
    const frac = srcIndex - srcIndexFloor;
    
    // Linear interpolation
    resampled[i] = audioData[srcIndexFloor] * (1 - frac) + audioData[srcIndexCeil] * frac;
  }
  
  return resampled;
}

/**
 * Decode audio file from ArrayBuffer
 * Supports WAV, MP3, FLAC formats
 */
export async function decodeAudioFile(
  arrayBuffer: ArrayBuffer,
  targetSampleRate: number = 44100,
  convertToMono: boolean = true
): Promise<DecodedAudio> {
  try {
    // Use audio-decode library to decode various formats
    const audioBuffer = await audioDecode(arrayBuffer);
    
    // Extract audio data
    let audioData: Float32Array;
    const channels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const length = audioBuffer.length;
    
    // Get channel data
    if (channels === 1) {
      audioData = audioBuffer.getChannelData(0);
    } else if (channels === 2) {
      // Interleave stereo channels
      const left = audioBuffer.getChannelData(0);
      const right = audioBuffer.getChannelData(1);
      audioData = new Float32Array(length * 2);
      for (let i = 0; i < length; i++) {
        audioData[i * 2] = left[i];
        audioData[i * 2 + 1] = right[i];
      }
    } else {
      // Handle multi-channel audio by mixing down to stereo first
      const mixedData = new Float32Array(length * 2);
      for (let i = 0; i < length; i++) {
        let leftSum = 0;
        let rightSum = 0;
        for (let ch = 0; ch < channels; ch++) {
          const sample = audioBuffer.getChannelData(ch)[i];
          if (ch % 2 === 0) {
            leftSum += sample;
          } else {
            rightSum += sample;
          }
        }
        mixedData[i * 2] = leftSum / Math.ceil(channels / 2);
        mixedData[i * 2 + 1] = rightSum / Math.floor(channels / 2);
      }
      audioData = mixedData;
    }
    
    // Convert to mono if requested
    if (convertToMono && channels > 1) {
      audioData = stereoToMono(audioData, channels);
    }
    
    // Resample if needed
    if (sampleRate !== targetSampleRate) {
      audioData = resampleAudio(audioData, sampleRate, targetSampleRate);
    }
    
    const info: AudioInfo = {
      sampleRate: targetSampleRate,
      duration: audioData.length / targetSampleRate,
      channels: convertToMono ? 1 : channels,
      length: audioData.length,
    };
    
    return { audioData, info };
  } catch (error) {
    throw new Error(
      `Failed to decode audio file: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Decode WAV file specifically (PCM format)
 * Fallback for when audio-decode is not available or fails
 */
export function decodeWAV(arrayBuffer: ArrayBuffer): DecodedAudio {
  const view = new DataView(arrayBuffer);
  
  // Verify RIFF header
  const riff = String.fromCharCode(
    view.getUint8(0),
    view.getUint8(1),
    view.getUint8(2),
    view.getUint8(3)
  );
  if (riff !== 'RIFF') {
    throw new Error('Invalid WAV file: Missing RIFF header');
  }
  
  // Verify WAVE format
  const wave = String.fromCharCode(
    view.getUint8(8),
    view.getUint8(9),
    view.getUint8(10),
    view.getUint8(11)
  );
  if (wave !== 'WAVE') {
    throw new Error('Invalid WAV file: Missing WAVE format');
  }
  
  // Find fmt chunk
  let offset = 12;
  let fmtChunkSize = 0;
  let audioFormat = 0;
  let numChannels = 0;
  let sampleRate = 0;
  let bitsPerSample = 0;
  
  while (offset < view.byteLength) {
    const chunkId = String.fromCharCode(
      view.getUint8(offset),
      view.getUint8(offset + 1),
      view.getUint8(offset + 2),
      view.getUint8(offset + 3)
    );
    const chunkSize = view.getUint32(offset + 4, true);
    
    if (chunkId === 'fmt ') {
      fmtChunkSize = chunkSize;
      audioFormat = view.getUint16(offset + 8, true);
      numChannels = view.getUint16(offset + 10, true);
      sampleRate = view.getUint32(offset + 12, true);
      bitsPerSample = view.getUint16(offset + 22, true);
      break;
    }
    
    offset += 8 + chunkSize;
  }
  
  if (audioFormat !== 1 && audioFormat !== 3) {
    throw new Error(`Unsupported WAV format: ${audioFormat} (only PCM is supported)`);
  }
  
  // Find data chunk
  offset = 12;
  let dataOffset = 0;
  let dataSize = 0;
  
  while (offset < view.byteLength) {
    const chunkId = String.fromCharCode(
      view.getUint8(offset),
      view.getUint8(offset + 1),
      view.getUint8(offset + 2),
      view.getUint8(offset + 3)
    );
    const chunkSize = view.getUint32(offset + 4, true);
    
    if (chunkId === 'data') {
      dataOffset = offset + 8;
      dataSize = chunkSize;
      break;
    }
    
    offset += 8 + chunkSize;
  }
  
  if (dataOffset === 0) {
    throw new Error('Invalid WAV file: Missing data chunk');
  }
  
  // Read audio samples
  const bytesPerSample = bitsPerSample / 8;
  const numSamples = dataSize / bytesPerSample / numChannels;
  const audioData = new Float32Array(numSamples * numChannels);
  
  for (let i = 0; i < numSamples * numChannels; i++) {
    let sample = 0;
    
    if (bitsPerSample === 16) {
      sample = view.getInt16(dataOffset + i * 2, true) / 32768.0;
    } else if (bitsPerSample === 24) {
      const byte1 = view.getUint8(dataOffset + i * 3);
      const byte2 = view.getUint8(dataOffset + i * 3 + 1);
      const byte3 = view.getInt8(dataOffset + i * 3 + 2);
      sample = ((byte3 << 16) | (byte2 << 8) | byte1) / 8388608.0;
    } else if (bitsPerSample === 32 && audioFormat === 3) {
      // 32-bit float
      sample = view.getFloat32(dataOffset + i * 4, true);
    } else if (bitsPerSample === 32) {
      // 32-bit int
      sample = view.getInt32(dataOffset + i * 4, true) / 2147483648.0;
    } else if (bitsPerSample === 8) {
      sample = (view.getUint8(dataOffset + i) - 128) / 128.0;
    }
    
    audioData[i] = sample;
  }
  
  const info: AudioInfo = {
    sampleRate,
    duration: numSamples / sampleRate,
    channels: numChannels,
    length: audioData.length,
  };
  
  return { audioData, info };
}

/**
 * Stream-decode large audio files in chunks
 * For files larger than a threshold, process in chunks to avoid memory issues
 */
export async function streamDecodeAudio(
  arrayBuffer: ArrayBuffer,
  chunkSize: number = 10 * 1024 * 1024, // 10MB chunks
  targetSampleRate: number = 44100,
  convertToMono: boolean = true
): Promise<DecodedAudio> {
  // For now, if file is small enough, use regular decode
  if (arrayBuffer.byteLength <= chunkSize) {
    return decodeAudioFile(arrayBuffer, targetSampleRate, convertToMono);
  }
  
  // For large files, decode in one go but with progress tracking potential
  // True streaming would require chunked processing at the encoder level
  console.log(`Decoding large audio file (${(arrayBuffer.byteLength / (1024 * 1024)).toFixed(2)}MB)`);
  return decodeAudioFile(arrayBuffer, targetSampleRate, convertToMono);
}
