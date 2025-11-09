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
  result?: {
    url: string;
    timeSaved: string;
    points: number;
    badge?: string;
  };
}

export default function MultiStepFunnel() {
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState(0);
  const [jobData, setJobData] = useState<JobData>({
    fileName: '',
    preset: 'basic_chain',
    proPreview: false,
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

  const processingStages = [
    { name: 'Analyze', icon: '🔍' },
    { name: 'Clean', icon: '🧹' },
    { name: 'Enhance', icon: '✨' },
    { name: 'Master', icon: '🎚️' },
    { name: 'Deliver', icon: '📦' },
  ];

  // Simulated file upload
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setJobData({ ...jobData, fileName: file.name });
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

  // Simulated processing
  const startProcessing = () => {
    setCurrentStep('processing');
    setProcessingStage(0);

    // Simulate processing stages
    const interval = setInterval(() => {
      setProcessingStage((prev) => {
        if (prev >= processingStages.length - 1) {
          clearInterval(interval);
          setTimeout(() => {
            setJobData({
              ...jobData,
              result: {
                url: '/demo-result.mp3',
                timeSaved: '1m12s',
                points: 125,
                badge: 'Upload Hero I',
              },
            });
            setCurrentStep('result');
          }, 1000);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);
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
                  <p className="text-sm text-gray-500">Supports audio and video files</p>
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
                  <p className="mb-2">Estimated time remaining: ~30 seconds</p>
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
                  <button className="px-6 py-2 bg-white/10 rounded-lg text-sm hover:bg-white/20 transition-colors">
                    Unlock Level 2 (Pro Chains) →
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
