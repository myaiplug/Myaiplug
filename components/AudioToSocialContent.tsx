"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GeneratedContent {
  platform: string;
  content: string;
  hashtags?: string[];
}

export default function AudioToSocialContent() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);
  const [audioAnalysis, setAudioAnalysis] = useState<{
    title?: string;
    genre?: string;
    mood?: string;
    duration?: string;
    bpm?: number;
    key?: string;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setGeneratedContent([]);
      setAudioAnalysis(null);
    }
  };

  const handleGenerate = async () => {
    if (!audioFile) return;
    
    setGenerating(true);
    
    try {
      // Create FormData and append the audio file
      const formData = new FormData();
      formData.append('audio', audioFile);

      // Call the API endpoint
      const response = await fetch('/api/audio/upload', {
        method: 'POST',
        body: formData,
      });

      // Always try to parse JSON, but handle errors gracefully
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Server returned an invalid response. Please try again.');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process audio');
      }

      // Ensure we have the expected data structure
      if (!data.success) {
        throw new Error(data.error || 'Processing failed');
      }

      // Set the audio analysis and generated content from the API
      setAudioAnalysis(data.audioAnalysis);
      setGeneratedContent(data.generatedContent);
    } catch (error) {
      console.error('Error processing audio:', error);
      // Show error to user (could add a toast notification)
      alert(error instanceof Error ? error.message : 'Failed to process audio. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text: string, hashtags?: string[]) => {
    const fullText = hashtags ? `${text}\n\n${hashtags.join(' ')}` : text;
    navigator.clipboard.writeText(fullText);
    // Could add a toast notification here
  };

  return (
    <div className="bg-myai-bg-panel/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
      <div className="mb-6">
        <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <span className="gradient-text">Audio Upload to Social Content</span>
          <span className="text-sm text-gray-400">🎵</span>
        </h3>
        <p className="text-gray-400 text-sm">
          Upload your audio file and generate optimized social media posts for all platforms
        </p>
      </div>

      {/* File Upload */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2">
          Upload Audio File
        </label>
        <div className="relative">
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            disabled={generating}
            className="hidden"
            id="audio-upload"
          />
          <label
            htmlFor="audio-upload"
            className={`flex items-center justify-center w-full px-4 py-8 rounded-lg border-2 border-dashed transition-all duration-200 cursor-pointer ${
              generating
                ? 'border-gray-600 bg-black/20 cursor-not-allowed'
                : 'border-white/20 bg-black/40 hover:border-myai-primary hover:bg-black/60'
            }`}
          >
            <div className="text-center">
              {audioFile ? (
                <>
                  <div className="text-myai-accent text-lg mb-1">✓</div>
                  <div className="text-white font-medium">{audioFile.name}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </>
              ) : (
                <>
                  <div className="text-4xl mb-2">📁</div>
                  <div className="text-white font-medium mb-1">Click to upload audio</div>
                  <div className="text-xs text-gray-400">
                    MP3, WAV, FLAC, M4A (Max 50MB)
                  </div>
                </>
              )}
            </div>
          </label>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={!audioFile || generating}
        className={`w-full py-3 rounded-lg font-bold text-lg transition-all duration-300 ${
          generating || !audioFile
            ? 'bg-gray-600 cursor-not-allowed'
            : 'bg-gradient-to-r from-myai-primary to-myai-accent hover:scale-[1.02] hover:shadow-lg hover:shadow-myai-primary/50'
        }`}
      >
        {generating ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block size-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            Analyzing & Generating Posts...
          </span>
        ) : (
          'Generate Social Posts'
        )}
      </button>

      {/* Audio Analysis */}
      <AnimatePresence>
        {audioAnalysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-6 p-4 rounded-lg bg-black/30 border border-white/10"
          >
            <h4 className="text-sm font-semibold text-myai-accent mb-3">Audio Analysis</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {audioAnalysis.title && (
                <div>
                  <span className="text-gray-400">Title:</span>{' '}
                  <span className="text-white font-medium">{audioAnalysis.title}</span>
                </div>
              )}
              {audioAnalysis.duration && (
                <div>
                  <span className="text-gray-400">Duration:</span>{' '}
                  <span className="text-white font-medium">{audioAnalysis.duration}</span>
                </div>
              )}
              {audioAnalysis.genre && (
                <div>
                  <span className="text-gray-400">Genre:</span>{' '}
                  <span className="text-white font-medium">{audioAnalysis.genre}</span>
                </div>
              )}
              {audioAnalysis.mood && (
                <div>
                  <span className="text-gray-400">Mood:</span>{' '}
                  <span className="text-white font-medium">{audioAnalysis.mood}</span>
                </div>
              )}
              {audioAnalysis.bpm && (
                <div>
                  <span className="text-gray-400">BPM:</span>{' '}
                  <span className="text-white font-medium">{audioAnalysis.bpm}</span>
                </div>
              )}
              {audioAnalysis.key && (
                <div>
                  <span className="text-gray-400">Key:</span>{' '}
                  <span className="text-white font-medium">{audioAnalysis.key}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generated Content */}
      <AnimatePresence>
        {generatedContent.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-8 space-y-4"
          >
            <h4 className="text-lg font-bold text-white">Generated Posts</h4>
            {generatedContent.map((item, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-black/30 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold text-myai-accent">{item.platform}</div>
                  <button
                    onClick={() => copyToClipboard(item.content, item.hashtags)}
                    className="px-3 py-1 rounded-md bg-white/10 hover:bg-white/20 text-xs font-semibold transition-colors"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-white mb-2 whitespace-pre-line">{item.content}</p>
                {item.hashtags && (
                  <div className="flex flex-wrap gap-2">
                    {item.hashtags.map((tag, tagIdx) => (
                      <span key={tagIdx} className="text-xs text-myai-primary">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info */}
      <div className="mt-6 p-4 rounded-lg bg-black/20 border border-white/5">
        <p className="text-xs text-gray-400">
          <span className="font-semibold text-white">Pro Tip:</span> Our AI analyzes your audio's 
          mood, genre, and energy to create perfectly tailored posts for each platform. Content is 
          optimized for engagement with trending hashtags and best practices.
        </p>
      </div>
    </div>
  );
}
