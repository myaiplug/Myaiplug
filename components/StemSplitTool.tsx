/**
 * StemSplitTool Component
 * Full stem splitting tool with file upload, processing, and preview
 */

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WaveformPlayer from '@/components/audio/WaveformPlayer';
import { splitAudio } from '@/lib/api/split';
import { useAuth } from '@/lib/contexts/AuthContext';
import Link from 'next/link';

interface StemSplitToolProps {
  demoMode?: boolean; // If true, limit processing to 20 seconds
}

export default function StemSplitTool({ demoMode = false }: StemSplitToolProps) {
  const { user } = useAuth();
  const [state, setState] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error' | 'limit'>('idle');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string>('');
  const [vocalsBlob, setVocalsBlob] = useState<Blob | null>(null);
  const [instrumentalBlob, setInstrumentalBlob] = useState<Blob | null>(null);
  const [vocalsUrl, setVocalsUrl] = useState<string>('');
  const [instrumentalUrl, setInstrumentalUrl] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState('');
  const [upgradeUrl, setUpgradeUrl] = useState('');
  const [progress, setProgress] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Cleanup URLs and AudioContext on unmount
  const cleanupUrls = useCallback(() => {
    if (uploadedFileUrl) URL.revokeObjectURL(uploadedFileUrl);
    if (vocalsUrl) URL.revokeObjectURL(vocalsUrl);
    if (instrumentalUrl) URL.revokeObjectURL(instrumentalUrl);
  }, [uploadedFileUrl, vocalsUrl, instrumentalUrl]);

  // Cleanup effect for component unmount
  useEffect(() => {
    return () => {
      cleanupUrls();
      // Close AudioContext to free resources
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [cleanupUrls]);

  // Trim audio to specified duration (in seconds)
  const trimAudioFile = async (file: File, maxDuration: number): Promise<File> => {
    try {
      // Initialize AudioContext if not already done
      if (!audioContextRef.current) {
        // Create AudioContext with proper webkit polyfill
        const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
        
        if (!AudioContextClass) {
          throw new Error('Web Audio API is not supported in this browser');
        }
        
        audioContextRef.current = new AudioContextClass();
      }
      const audioContext = audioContextRef.current;

      // Decode audio file
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // Check if trimming is needed
      if (audioBuffer.duration <= maxDuration) {
        return file; // No need to trim
      }

      // Create new buffer with trimmed duration
      const sampleRate = audioBuffer.sampleRate;
      const numberOfChannels = audioBuffer.numberOfChannels;
      const trimmedLength = Math.floor(maxDuration * sampleRate);
      const trimmedBuffer = audioContext.createBuffer(numberOfChannels, trimmedLength, sampleRate);

      // Copy audio data for each channel
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sourceData = audioBuffer.getChannelData(channel);
        const trimmedData = trimmedBuffer.getChannelData(channel);
        for (let i = 0; i < trimmedLength; i++) {
          trimmedData[i] = sourceData[i];
        }
      }

      // Convert trimmed buffer to WAV blob
      const wavBlob = await audioBufferToWav(trimmedBuffer);
      
      // Create new file with proper filename handling
      const originalName = file.name || 'audio';
      const lastDotIndex = originalName.lastIndexOf('.');
      const baseName = lastDotIndex > 0 ? originalName.substring(0, lastDotIndex) : originalName;
      const trimmedFileName = `${baseName}_demo_20s.wav`;
      
      const trimmedFile = new File([wavBlob], trimmedFileName, {
        type: 'audio/wav'
      });

      return trimmedFile;
    } catch (error) {
      console.error('Error trimming audio:', error);
      throw new Error('Failed to trim audio file');
    }
  };

  // Convert AudioBuffer to WAV Blob
  const audioBufferToWav = async (buffer: AudioBuffer): Promise<Blob> => {
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;

    const bytesPerSample = bitDepth / 8;
    const blockAlign = numberOfChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = buffer.length * blockAlign;

    const arrayBuffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(arrayBuffer);

    // Write WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);

    // Write audio data
    const channels: Float32Array[] = [];
    for (let i = 0; i < numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

    let offset = 44;
    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, channels[channel][i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
  };

  const handleFileSelect = async (file: File) => {
    // Cleanup previous URLs
    cleanupUrls();

    // Validate file
    if (!file.type.startsWith('audio/')) {
      setErrorMessage('Please upload an audio file');
      setState('error');
      return;
    }

    // Check file size (limit to 10MB in demo mode, otherwise 50MB/100MB)
    const maxSize = demoMode ? 10 * 1024 * 1024 : (user ? 100 * 1024 * 1024 : 50 * 1024 * 1024);
    if (file.size > maxSize) {
      setErrorMessage(`File too large. Maximum size: ${demoMode ? '10MB' : (user ? '100MB' : '50MB')}`);
      setState('error');
      return;
    }

    // In demo mode, trim to 20 seconds
    let processedFile = file;
    if (demoMode) {
      try {
        setProgress('Preparing demo (limiting to 20 seconds)...');
        processedFile = await trimAudioFile(file, 20);
        setProgress('');
      } catch (error) {
        console.error('Error preparing demo:', error);
        setErrorMessage('Failed to prepare audio for demo. Please try a different file.');
        setState('error');
        return;
      }
    }

    setUploadedFile(processedFile);
    const url = URL.createObjectURL(processedFile);
    setUploadedFileUrl(url);
    setState('uploading');
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) await handleFileSelect(file);
  };

  const handleSplit = async () => {
    if (!uploadedFile || state === 'processing') return;

    setState('processing');
    setProgress('Uploading audio file...');

    try {
      // Call split API
      setProgress('Processing with AI...');
      const result = await splitAudio(uploadedFile);

      if (result.success && result.vocals && result.instrumental) {
        // Create URLs from blobs
        const vocalsObjectUrl = URL.createObjectURL(result.vocals);
        const instrumentalObjectUrl = URL.createObjectURL(result.instrumental);
        
        setVocalsBlob(result.vocals);
        setInstrumentalBlob(result.instrumental);
        setVocalsUrl(vocalsObjectUrl);
        setInstrumentalUrl(instrumentalObjectUrl);
        setState('success');
        setProgress('');
      } else if (result.upgradeUrl) {
        // Rate limited
        setState('limit');
        setErrorMessage(result.error || 'Daily limit reached');
        setUpgradeUrl(result.upgradeUrl);
        setProgress('');
      } else {
        // Error
        setState('error');
        setErrorMessage(result.error || 'Failed to split audio');
        setProgress('');
      }
    } catch (error) {
      console.error('[StemSplitTool] Error:', error);
      setState('error');
      setErrorMessage('An unexpected error occurred');
      setProgress('');
    }
  };

  const handleReset = () => {
    cleanupUrls();
    setState('idle');
    setUploadedFile(null);
    setUploadedFileUrl('');
    setVocalsBlob(null);
    setInstrumentalBlob(null);
    setVocalsUrl('');
    setInstrumentalUrl('');
    setErrorMessage('');
    setUpgradeUrl('');
    setProgress('');
  };

  const handleDownload = (blob: Blob | null, filename: string) => {
    if (!blob) return;
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-myai-bg-panel/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-display font-bold mb-2">
            AI <span className="gradient-text">Stem Splitter</span>
            {demoMode && <span className="text-sm ml-2 text-purple-400">(Demo Mode)</span>}
          </h2>
          <p className="text-gray-400">
            {demoMode 
              ? 'Try it now! Upload any audio and we\'ll split the first 20 seconds'
              : 'Separate any audio into vocals and instrumental tracks'
            }
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* Idle State - File Upload */}
          {state === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Drag & Drop Zone */}
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="relative border-2 border-dashed border-white/20 rounded-xl p-12 text-center
                         hover:border-purple-500/50 transition-colors cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) await handleFileSelect(file);
                  }}
                  className="hidden"
                />
                
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
                  🎵
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Drop your audio file here
                </h3>
                <p className="text-gray-400 mb-4">
                  or click to browse
                </p>
                <div className="text-sm text-gray-500">
                  Supports MP3, WAV, FLAC, M4A, OGG • Max {demoMode ? '10MB' : (user ? '100MB' : '50MB')}
                  {demoMode && <span className="block mt-1 text-purple-400">Demo: First 20 seconds only</span>}
                </div>
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-2xl mb-2">🎤</div>
                  <div className="font-semibold text-white mb-1">Clean Vocals</div>
                  <div className="text-gray-400">Isolated vocal track</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-2xl mb-2">🎸</div>
                  <div className="font-semibold text-white mb-1">Instrumental</div>
                  <div className="text-gray-400">Music without vocals</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-2xl mb-2">⚡</div>
                  <div className="font-semibold text-white mb-1">Fast Processing</div>
                  <div className="text-gray-400">Results in ~30 seconds</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Uploading State - File Preview */}
          {state === 'uploading' && uploadedFile && (
            <motion.div
              key="uploading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* File Info */}
              <div className="bg-white/5 rounded-lg p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl">🎵</div>
                  <div className="flex-1">
                    <div className="font-semibold text-white">{uploadedFile.name}</div>
                    <div className="text-sm text-gray-400">
                      {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </div>
                  </div>
                </div>

                {/* Waveform Preview */}
                {uploadedFileUrl && (
                  <WaveformPlayer
                    src={uploadedFileUrl}
                    title="Original Audio"
                    variant="original"
                  />
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleReset}
                  className="flex-1 py-3 px-6 border-2 border-white/20 rounded-xl text-white font-semibold
                           hover:bg-white/5 hover:border-purple-500/50 transition-all duration-300"
                >
                  Choose Different File
                </button>
                <button
                  onClick={handleSplit}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl 
                           text-white font-semibold hover:from-purple-500 hover:to-pink-500 
                           transition-all duration-300 hover:scale-[1.02]"
                >
                  Split Audio →
                </button>
              </div>
            </motion.div>
          )}

          {/* Processing State */}
          {state === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12 space-y-6"
            >
              {/* Animated Icon */}
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <svg 
                  className="w-20 h-20 text-purple-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" 
                  />
                </svg>
              </motion.div>
              
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {progress}
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    ...
                  </motion.span>
                </h3>
                <p className="text-gray-400">This usually takes 20-30 seconds</p>
              </div>

              {/* Progress Bar */}
              <div className="w-full max-w-md h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                  animate={{
                    width: ['0%', '100%'],
                  }}
                  transition={{
                    duration: 25,
                    ease: "easeInOut"
                  }}
                />
              </div>
            </motion.div>
          )}

          {/* Success State - Split Results */}
          {state === 'success' && vocalsUrl && instrumentalUrl && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Success Message */}
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
                <div className="text-3xl mb-2">✅</div>
                <div className="font-semibold text-white">Split Complete!</div>
                <div className="text-sm text-gray-400 mt-1">
                  Your audio has been successfully separated
                </div>
              </div>

              {/* Split Results */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-white">🎤 Vocals</h4>
                    <button
                      onClick={() => handleDownload(vocalsBlob, `${uploadedFile?.name}_vocals.wav`)}
                      className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      ↓ Download
                    </button>
                  </div>
                  <WaveformPlayer
                    src={vocalsUrl}
                    title="Vocals"
                    variant="vocals"
                    autoPlay={false}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-white">🎸 Instrumental</h4>
                    <button
                      onClick={() => handleDownload(instrumentalBlob, `${uploadedFile?.name}_instrumental.wav`)}
                      className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      ↓ Download
                    </button>
                  </div>
                  <WaveformPlayer
                    src={instrumentalUrl}
                    title="Instrumental"
                    variant="instrumental"
                    autoPlay={false}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleReset}
                  className="flex-1 py-3 px-6 border-2 border-white/20 rounded-xl text-white font-semibold
                           hover:bg-white/5 hover:border-purple-500/50 transition-all duration-300"
                >
                  Split Another Track
                </button>
                {!user && (
                  <Link href="/signup" className="flex-1">
                    <button
                      className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl 
                               text-white font-semibold hover:from-purple-500 hover:to-pink-500 
                               transition-all duration-300"
                    >
                      Sign Up Free
                    </button>
                  </Link>
                )}
              </div>
            </motion.div>
          )}

          {/* Error State */}
          {state === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-12 text-center space-y-4"
            >
              <div className="text-red-400 text-6xl mb-4">⚠️</div>
              <h3 className="text-2xl font-bold text-white">Something went wrong</h3>
              <p className="text-gray-400 max-w-md mx-auto">{errorMessage}</p>
              <button
                onClick={handleReset}
                className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-semibold
                         transition-all duration-300"
              >
                Try Again
              </button>
            </motion.div>
          )}

          {/* Limit Hit State */}
          {state === 'limit' && (
            <motion.div
              key="limit"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-12 text-center space-y-6"
            >
              <div className="text-yellow-400 text-6xl mb-4">🎵</div>
              <h3 className="text-2xl font-bold text-white">Daily Limit Reached</h3>
              <p className="text-gray-400 max-w-md mx-auto">{errorMessage}</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleReset}
                  className="px-8 py-3 border-2 border-white/20 rounded-xl text-white font-semibold
                           hover:bg-white/5 transition-all duration-300"
                >
                  Go Back
                </button>
                <Link href={upgradeUrl}>
                  <button
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl 
                             text-white font-semibold hover:from-purple-500 hover:to-pink-500 
                             transition-all duration-300"
                  >
                    Upgrade to Pro
                  </button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
