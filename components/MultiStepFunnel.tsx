'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { PRESET_LABELS, MODULE_LABELS } from '@/lib/constants/microcopy';
import { calculateJobCost } from '@/lib/constants/pricing';
import { formatCredits } from '@/lib/utils/helpers';

type Step = 'upload' | 'choose' | 'processing' | 'result';

interface JobData {
  fileName: string;
  preset: string;
  proPreview: boolean;
  effects: string[]; // Array of selected effects
  audioFile?: File;
  result?: {
    url: string;
    timeSaved: string;
    points: number;
    badge?: string;
    creditsCharged?: number;
    audioAnalysis?: {
      title: string;
      genre: string;
      mood: string;
      duration: string;
      bpm: number;
      key: string;
    };
  };
}

export default function MultiStepFunnel() {
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [jobData, setJobData] = useState<JobData>({
    fileName: '',
    preset: 'basic_chain',
    proPreview: false,
    effects: ['clean'], // Default to clean effect
  });

  const steps = [
    { id: 'upload', label: 'Upload', icon: '⬆️' },
    { id: 'choose', label: 'Choose', icon: '⚙️' },
    { id: 'processing', label: 'Processing', icon: '⚡' },
    { id: 'result', label: 'Result', icon: '✨' },
  ];

  const presets = [
    { id: 'basic_chain', name: PRESET_LABELS.basic_chain, cost: 25 },
    { id: 'podcast_polish', name: PRESET_LABELS.podcast_polish, cost: 45 },
    { id: 'reels_pack', name: PRESET_LABELS.reels_pack, cost: 80 },
  ];

  const audioEffects = [
    { 
      id: 'clean', 
      name: 'Clean Audio', 
      description: 'Remove noise, artifacts, and unwanted sounds',
      icon: '🧹'
    },
    { 
      id: 'loudness', 
      name: 'Spotify Loudness', 
      description: 'Normalize to -14 LUFS (Spotify standard)',
      icon: '📢'
    },
    { 
      id: 'bass_boost', 
      name: 'Bass Boost', 
      description: 'Enhanced bass without distortion or clipping',
      icon: '🎵'
    },
  ];

  const processingStages = [
    { name: 'Analyze', icon: '🔍' },
    { name: 'Clean', icon: '🧹' },
    { name: 'Enhance', icon: '✨' },
    { name: 'Master', icon: '🎚️' },
    { name: 'Deliver', icon: '📦' },
  ];

  // File upload with API call
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setJobData({ ...jobData, fileName: file.name, audioFile: file });
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setCurrentStep('choose'), 500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  // Real processing with API
  const startProcessing = async () => {
    if (!jobData.audioFile) {
      setError('No file selected');
      return;
    }

    setCurrentStep('processing');
    setProcessingStage(0);
    setError(null);

    try {
      // Simulate processing stages with progress
      const stageInterval = setInterval(() => {
        setProcessingStage((prev) => {
          if (prev >= processingStages.length - 1) {
            clearInterval(stageInterval);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

      // Call the audio upload API
      const formData = new FormData();
      formData.append('audio', jobData.audioFile);
      formData.append('preset', jobData.preset);
      formData.append('effects', JSON.stringify(jobData.effects));

      const response = await fetch('/api/audio/process', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = 'Failed to process audio';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // Response is not JSON, try to get text
          const errorText = await response.text();
          errorMessage = errorText || `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Complete all stages
      setProcessingStage(processingStages.length - 1);

      // Set result with API data
      setTimeout(() => {
        setJobData({
          ...jobData,
          result: {
            url: '/demo-result.mp3',
            timeSaved: '1m12s',
            points: data.pointsAwarded || 125,
            badge: data.badgeEarned || 'Upload Hero I',
            creditsCharged: data.creditsCharged || 50,
            audioAnalysis: data.audioAnalysis,
          },
        });
        setCurrentStep('result');
      }, 1000);

    } catch (err) {
      console.error('Processing error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process audio. Please try again.');
      setCurrentStep('choose'); // Go back to choose step
    }
  };

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <section id="funnel" className="py-20 px-6 bg-myai-bg-dark/50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Try it <span className="gradient-text">Now</span>
          </h2>
          <p className="text-gray-400">Experience the power of AI-powered processing in real-time</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${
                    index <= currentStepIndex
                      ? 'bg-myai-accent text-white'
                      : 'bg-white/10 text-gray-500'
                  }`}
                >
                  {step.icon}
                </div>
                <span
                  className={`text-xs mt-2 ${
                    index <= currentStepIndex ? 'text-white' : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-myai-primary to-myai-accent"
              animate={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Step Content */}
        <div className="bg-myai-bg-panel/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 min-h-[400px]">
          <AnimatePresence mode="wait">
            {/* Step 1: Upload */}
            {currentStep === 'upload' && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center justify-center h-full"
              >
                <h3 className="text-2xl font-bold mb-6">Upload Your File</h3>
                <label className="w-full max-w-md border-2 border-dashed border-white/20 rounded-xl p-12 text-center cursor-pointer hover:border-myai-accent transition-colors group">
                  <input
                    type="file"
                    className="hidden"
                    accept="audio/*,video/*"
                    onChange={handleFileSelect}
                  />
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">📁</div>
                  <p className="text-lg text-gray-300 mb-2">
                    Drag & drop or click to browse
                  </p>
                  <p className="text-sm text-gray-500">Supports audio and video files (max 50MB)</p>
                </label>
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="w-full max-w-md mt-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span>{jobData.fileName}</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-myai-primary to-myai-accent"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 2: Choose Preset */}
            {currentStep === 'choose' && (
              <motion.div
                key="choose"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <h3 className="text-2xl font-bold mb-6">Choose Your Preset</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {presets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => setJobData({ ...jobData, preset: preset.id })}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        jobData.preset === preset.id
                          ? 'border-myai-accent bg-myai-accent/10'
                          : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="text-xl font-bold mb-2">{preset.name}</div>
                      <div className="text-sm text-gray-400">{formatCredits(preset.cost)}</div>
                    </button>
                  ))}
                </div>

                {/* Audio Effects Selection */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-4">Select Audio Effects</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {audioEffects.map((effect) => (
                      <label
                        key={effect.id}
                        className={`flex items-start gap-3 p-4 rounded-lg cursor-pointer transition-all ${
                          jobData.effects.includes(effect.id)
                            ? 'bg-myai-accent/20 border-2 border-myai-accent'
                            : 'bg-white/5 border-2 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={jobData.effects.includes(effect.id)}
                          onChange={(e) => {
                            const newEffects = e.target.checked
                              ? [...jobData.effects, effect.id]
                              : jobData.effects.filter(id => id !== effect.id);
                            setJobData({ ...jobData, effects: newEffects });
                          }}
                          className="mt-1 w-5 h-5 rounded"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{effect.icon}</span>
                            <span className="font-semibold">{effect.name}</span>
                          </div>
                          <p className="text-sm text-gray-400 mt-1">{effect.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <label className="flex items-center gap-3 mb-8 p-4 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                  <input
                    type="checkbox"
                    checked={jobData.proPreview}
                    onChange={(e) =>
                      setJobData({ ...jobData, proPreview: e.target.checked })
                    }
                    className="w-5 h-5"
                  />
                  <span className="text-sm">
                    <strong>Pro Preview</strong> - Try advanced features (30s output)
                  </span>
                </label>
                <div className="flex justify-between">
                  <button
                    onClick={() => setCurrentStep('upload')}
                    className="px-6 py-3 border border-white/20 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={startProcessing}
                    className="px-8 py-3 bg-gradient-to-r from-myai-primary to-myai-accent text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-myai-primary/50 transition-all"
                  >
                    Start Processing
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Processing */}
            {currentStep === 'processing' && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center justify-center h-full"
              >
                <h3 className="text-2xl font-bold mb-8">Processing Your File</h3>
                <div className="flex items-center justify-between w-full max-w-lg mb-6">
                  {processingStages.map((stage, index) => (
                    <div key={stage.name} className="flex flex-col items-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all ${
                          index <= processingStage
                            ? 'bg-myai-accent'
                            : 'bg-white/10'
                        }`}
                      >
                        {index < processingStage ? '✓' : stage.icon}
                      </div>
                      <span className="text-xs mt-2 text-gray-400">{stage.name}</span>
                    </div>
                  ))}
                </div>
                <div className="text-center text-gray-400">
                  <p className="mb-2">Analyzing your audio file...</p>
                  <p className="text-sm">Estimated credits: ~{presets.find(p => p.id === jobData.preset)?.cost}</p>
                </div>
              </motion.div>
            )}

            {/* Step 4: Result */}
            {currentStep === 'result' && jobData.result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <h3 className="text-2xl font-bold mb-6 text-center">
                  🎉 Processing Complete!
                </h3>
                
                {/* Audio Analysis Results */}
                {jobData.result.audioAnalysis && (
                  <div className="bg-white/5 rounded-xl p-6 mb-6">
                    <h4 className="text-lg font-semibold mb-4 text-myai-accent">Audio Analysis</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Title:</span>{' '}
                        <span className="text-white font-medium">{jobData.result.audioAnalysis.title}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Genre:</span>{' '}
                        <span className="text-white font-medium">{jobData.result.audioAnalysis.genre}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Mood:</span>{' '}
                        <span className="text-white font-medium">{jobData.result.audioAnalysis.mood}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Duration:</span>{' '}
                        <span className="text-white font-medium">{jobData.result.audioAnalysis.duration}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">BPM:</span>{' '}
                        <span className="text-white font-medium">{jobData.result.audioAnalysis.bpm}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Key:</span>{' '}
                        <span className="text-white font-medium">{jobData.result.audioAnalysis.key}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Badge Award Popup */}
                {jobData.result.badge && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-xl p-4 mb-6 text-center"
                  >
                    <div className="text-4xl mb-2">🏆</div>
                    <div className="text-lg font-bold">{jobData.result.badge} Earned!</div>
                    <div className="text-sm text-gray-300">
                      +{jobData.result.points} pts, +{jobData.result.timeSaved} time saved
                    </div>
                    {jobData.result.creditsCharged && (
                      <div className="text-xs text-gray-400 mt-2">
                        {formatCredits(jobData.result.creditsCharged)} used
                      </div>
                    )}
                  </motion.div>
                )}

                {/* A/B Player (simplified) */}
                <div className="bg-white/5 rounded-xl p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-400">Compare Results</span>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-myai-accent text-white rounded-lg text-sm">
                        Processed
                      </button>
                      <button className="px-4 py-2 bg-white/10 rounded-lg text-sm">
                        Original
                      </button>
                    </div>
                  </div>
                  <div className="h-20 bg-white/5 rounded-lg flex items-center justify-center">
                    <div className="text-gray-500">🎵 Audio Player</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button className="px-6 py-3 bg-gradient-to-r from-myai-primary to-myai-accent text-white font-semibold rounded-lg hover:shadow-lg transition-all">
                    Download
                  </button>
                  <button className="px-6 py-3 border border-white/20 rounded-lg hover:bg-white/5 transition-colors">
                    Add to Portfolio
                  </button>
                  <button className="px-6 py-3 border border-white/20 rounded-lg hover:bg-white/5 transition-colors">
                    Share
                  </button>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-400 mb-4">
                    Ready to unlock more powerful features?
                  </p>
                  <button 
                    onClick={() => {
                      setCurrentStep('upload');
                      setJobData({ fileName: '', preset: 'basic_chain', proPreview: false, effects: ['clean'] });
                      setUploadProgress(0);
                    }}
                    className="px-6 py-2 bg-white/10 rounded-lg text-sm hover:bg-white/20 transition-colors"
                  >
                    Process Another File →
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
