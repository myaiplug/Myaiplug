"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { getAudioEngine } from "@/lib/audioEngine";
import { getAllModules } from "@/lib/audioModules";
import type { AudioModule } from "@/lib/audioEngine";
import Knob from "@/components/Knob";
import { audioApi } from "@/lib/services/api";

export default function MiniStudio() {
  const [modules, setModules] = useState<AudioModule[]>([]);
  const [currentModule, setCurrentModule] = useState(0);
  const [meterLevel, setMeterLevel] = useState(30);
  const [playState, setPlayState] = useState<"dry" | "fx">("dry");
  const [knobValues, setKnobValues] = useState<number[]>([]);
  const [activeModules, setActiveModules] = useState<boolean[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [processResult, setProcessResult] = useState<any>(null);
  interface UserPreset { name: string; values: number[]; category?: string; uses?: number; }
  const [userPresets, setUserPresets] = useState<UserPreset[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const engineRef = useRef<ReturnType<typeof getAudioEngine> | null>(null);
  const animFrameRef = useRef<number | undefined>(undefined);
  const [showDiscount, setShowDiscount] = useState(false);
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [showAllModules, setShowAllModules] = useState(false);
  const [qualityMetrics, setQualityMetrics] = useState({
    peakLevel: 0,
    isClipping: false,
    lufs: -14, // Target for streaming platforms
  });
  const [showTranscription, setShowTranscription] = useState(false);
  const [transcriptionData, setTranscriptionData] = useState<any>(null);
  const [transcribing, setTranscribing] = useState(false);
  
  // Preset Chains - combinations of effects for different purposes
  interface PresetChain {
    name: string;
    description: string;
    presetId: string; // API preset identifier
    moduleIndices: number[]; // indices of modules to activate
    moduleSettings: Array<{ moduleIndex: number; paramValues: number[] }>;
  }
  
  const PRESET_CHAINS: PresetChain[] = [
    {
      name: "Warmth Master",
      description: "Professional warmth and clarity",
      presetId: "warmth-master",
      moduleIndices: [0, 2, 4], // Warmth, HalfScrew, EQ3
      moduleSettings: [
        { moduleIndex: 0, paramValues: [6] }, // Warmth: 6
        { moduleIndex: 2, paramValues: [3] }, // HalfScrew: Slight
        { moduleIndex: 4, paramValues: [2, 1, 3] }, // EQ3: slight boost
      ],
    },
    {
      name: "Vocal Polish",
      description: "Perfect for vocals and podcasts",
      presetId: "vocal-polish",
      moduleIndices: [0, 1, 4, 5], // Warmth, Widener, EQ3, Reverb
      moduleSettings: [
        { moduleIndex: 0, paramValues: [4] },
        { moduleIndex: 1, paramValues: [0.6, 0] },
        { moduleIndex: 4, paramValues: [-2, 2, 4] }, // Vocal Shine preset
        { moduleIndex: 5, paramValues: [0.25, 0.12] }, // Plate reverb
      ],
    },
    {
      name: "Bass Heavy",
      description: "Deep bass with controlled highs",
      presetId: "bass-heavy",
      moduleIndices: [0, 4], // Warmth, EQ3
      moduleSettings: [
        { moduleIndex: 0, paramValues: [8] },
        { moduleIndex: 4, paramValues: [6, 0, -1] }, // Bass Boost
      ],
    },
    {
      name: "Stereo Wide",
      description: "Maximum stereo width",
      presetId: "stereo-wide",
      moduleIndices: [1, 4, 5], // Widener, EQ3, Reverb
      moduleSettings: [
        { moduleIndex: 1, paramValues: [1.0, 0] }, // Superwide
        { moduleIndex: 4, paramValues: [0, 0, 2] },
        { moduleIndex: 5, paramValues: [0.35, 0.22] }, // Hall
      ],
    },
    {
      name: "Lo-Fi Vibe",
      description: "Vintage tape aesthetics",
      presetId: "lo-fi-vibe",
      moduleIndices: [0, 2, 4], // Warmth, HalfScrew, EQ3
      moduleSettings: [
        { moduleIndex: 0, paramValues: [6] }, // Lo-Fi Tape
        { moduleIndex: 2, paramValues: [8] }, // Heavy screw
        { moduleIndex: 4, paramValues: [-4, -3, -2] }, // Lo-Fi EQ
      ],
    },
    {
      name: "Broadcast Ready",
      description: "Radio-ready professional sound",
      presetId: "broadcast-ready",
      moduleIndices: [0, 1, 3, 4], // Warmth, Widener, reTUNE, EQ3
      moduleSettings: [
        { moduleIndex: 0, paramValues: [5] },
        { moduleIndex: 1, paramValues: [0.7, 0] },
        { moduleIndex: 3, paramValues: [0] }, // 440 Hz
        { moduleIndex: 4, paramValues: [0, 2, 2] },
      ],
    },
  ];

  // Simple helper copy for tooltips (fallback to module.info)
  const TOOLTIP: Record<string, string> = {
    "Warmth": "Adds body and soft tape-like harmonics.",
    "Stereo Widener": "Wider stereo image that stays safe in mono.",
    "EQ Lite (3‑Band)": "Quickly shape lows, mids, and airy highs.",
    "Reverb Lite": "Adds space and ambience; set amount and room size.",
    "HalfScrew": "Lo-fi pitch/tempo demo effect.",
    "reTUNE 432": "Simple pitch tuning demo (432/440/444).",
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    engineRef.current = getAudioEngine();
    const ctx = engineRef.current.getContext();
    const mods = getAllModules(
      ctx,
      (node) => engineRef.current!.connectFXIn(node),
      (node) => engineRef.current!.connectFXOut(node)
    );
    setModules(mods);
    setActiveModules(mods.map(() => true));

    if (mods.length > 0) {
      loadModule(0, mods);
    }

    const updateMeter = () => {
      if (engineRef.current) {
        const level = engineRef.current.getMeterLevel();
        setMeterLevel(level);
        
        // Update quality metrics
        const peakLevel = level / 100;
        setQualityMetrics(prev => ({
          ...prev,
          peakLevel,
          isClipping: peakLevel > 0.95, // Clipping threshold
        }));
      }
      animFrameRef.current = requestAnimationFrame(updateMeter);
    };
    updateMeter();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const loadModule = async (index: number, modulesList = modules) => {
    if (!engineRef.current || modulesList.length === 0) return;
    const normalizedIndex = ((index % modulesList.length) + modulesList.length) % modulesList.length;
    setCurrentModule(normalizedIndex);

    const mod = modulesList[normalizedIndex];
    if ((engineRef.current as any).ensureRunning) {
      await (engineRef.current as any).ensureRunning();
    }
    await engineRef.current.startPlayers();
    setKnobValues(mod.params.map((p) => p.value));

    // Load user presets for this module from localStorage
    try {
      const key = `myaiplug.presets.${mod.name}`;
      const raw = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
      setUserPresets(raw ? JSON.parse(raw) : []);
    } catch { setUserPresets([]); }
  };

  const handlePrevModule = () => loadModule(currentModule - 1);
  const handleNextModule = () => loadModule(currentModule + 1);

  const handlePlayState = (state: "dry" | "fx") => {
    if (!engineRef.current) return;
    setPlayState(state);
    if (state === "dry") {
      engineRef.current.setDry(1.0);
      engineRef.current.setFX(0.0);
    } else {
      engineRef.current.setDry(0.0);
      engineRef.current.setFX(1.0);
    }
  };

  const handleAB = () => handlePlayState(playState === "dry" ? "fx" : "dry");

  const handleKnobChange = (paramIndex: number, value: number) => {
    const mod = modules[currentModule];
    if (!mod) return;
    const newValues = [...knobValues];
    newValues[paramIndex] = value;
    setKnobValues(newValues);
    mod.params[paramIndex].oninput(value);
  };

  const applyPreset = (values: number[], markUsePresetName?: string) => {
    const mod = modules[currentModule];
    if (!mod) return;
    setKnobValues(values);
    values.forEach((v, idx) => mod.params[idx]?.oninput(v));
    if (markUsePresetName) {
      setUserPresets(prev => {
        const next = prev.map(p => p.name === markUsePresetName ? { ...p, uses: (p.uses || 0) + 1 } : p);
        try { localStorage.setItem(`myaiplug.presets.${mod.name}`, JSON.stringify(next)); } catch {}
        return next;
      });
    }
  };

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 2500);
  }, []);

  const persistPresets = (modName: string, list: UserPreset[]) => {
    try { localStorage.setItem(`myaiplug.presets.${modName}`, JSON.stringify(list)); } catch {}
  };

  const saveCurrentAsPreset = () => {
    const mod = modules[currentModule];
    if (!mod) return;
    const name = typeof window !== 'undefined' ? window.prompt(`Save preset for ${mod.name} as:`) : null;
    if (!name) return;
    const category = typeof window !== 'undefined' ? (window.prompt('Category (optional):') || undefined) : undefined;
    const values = mod.params.map((p, i) => (knobValues[i] ?? p.value));
    const next: UserPreset[] = [...userPresets, { name, values, category, uses: 0 }];
    setUserPresets(next);
    persistPresets(mod.name, next);
    showToast('Preset saved');
  };

  const deletePreset = (presetName: string) => {
    const mod = modules[currentModule];
    if (!mod) return;
    if (!confirm(`Delete preset "${presetName}"?`)) return;
    const next = userPresets.filter(p => p.name !== presetName);
    setUserPresets(next);
    persistPresets(mod.name, next);
    showToast('Preset deleted');
  };

  const renamePreset = (presetName: string) => {
    const mod = modules[currentModule];
    if (!mod) return;
    const newName = prompt('New name:', presetName);
    if (!newName || newName === presetName) return;
    const next = userPresets.map(p => p.name === presetName ? { ...p, name: newName } : p);
    setUserPresets(next);
    persistPresets(mod.name, next);
    showToast('Preset renamed');
  };

  // Frequently used (top 5 by uses)
  const frequentlyUsed = [...userPresets]
    .filter(p => (p.uses || 0) > 0)
    .sort((a, b) => (b.uses || 0) - (a.uses || 0))
    .slice(0, 5);

  // Recommendation: choose unused preset closest in vector distance to avg of frequently used
  let recommended: UserPreset | undefined;
  if (frequentlyUsed.length && userPresets.length > frequentlyUsed.length) {
    const dimension = (userPresets[0]?.values.length) || 0;
    const avg = Array(dimension).fill(0);
    frequentlyUsed.forEach(p => p.values.forEach((v, i) => { avg[i] += v; }));
    for (let i = 0; i < dimension; i++) avg[i] /= frequentlyUsed.length;
    function dist(a: number[], b: number[]) {
      return Math.sqrt(a.reduce((acc, v, i) => acc + (v - (b[i] ?? 0)) ** 2, 0));
    }
    let best: { d: number; p: UserPreset } | null = null;
    for (const p of userPresets) {
      if (frequentlyUsed.includes(p)) continue;
      const d = dist(p.values, avg);
      if (!best || d < best.d) best = { d, p };
    }
    recommended = best?.p;
  }

  const currentMod = modules[currentModule];

  const handleRecord = async () => {
    if (!engineRef.current) return;
    if (!isRecording) {
      setIsRecording(true);
      engineRef.current.startRecording();
    } else {
      const blob = await engineRef.current.stopRecording();
      setIsRecording(false);
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "nodaw_processed.webm";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        // After successful download, show discount modal
        setTimeout(() => setShowDiscount(true), 200);
      }
    }
  };

  const handleUpload = async (file: File) => {
    if (!engineRef.current) return;
    
    // Store the uploaded file for later processing
    setUploadedFile(file);
    
    // Load into audio engine for preview
    await engineRef.current.loadFromFile(file);
    await engineRef.current.startPlayers();
    
    showToast(`Loaded: ${file.name}`);
  };

  const handleProcessWithPreset = async (chain: PresetChain) => {
    if (!uploadedFile) {
      showToast('Please upload an audio file first');
      return;
    }

    setIsProcessing(true);
    try {
      // Call the API to process the audio with the selected preset
      const result = await audioApi.process(uploadedFile, chain.presetId);
      
      setProcessResult(result);
      
      // Show success with token usage
      const tokensMsg = result.processing 
        ? `Used ${result.processing.tokensUsed} tokens. ${result.processing.remainingCredits} remaining.`
        : '';
      
      showToast(`✅ Processed with ${chain.name}! ${tokensMsg}`);
      
      // Apply the preset chain locally as well
      applyPresetChain(chain);
      
      // If there's a download URL, prompt for download
      if (result.download?.url) {
        showToast(`Download ready: ${result.download.fileName}`);
      }
      
    } catch (error) {
      console.error('Processing error:', error);
      showToast(error instanceof Error ? error.message : 'Processing failed. Try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadProcessed = () => {
    if (processResult?.download?.url) {
      // Validate URL is a relative path starting with our API prefix
      // This prevents open redirect attacks
      const url = processResult.download.url;
      const isValidRelativePath = url.startsWith('/api/audio/download/') && !url.includes('://') && !url.includes('//');
      
      if (isValidRelativePath) {
        // Show info about the download
        showToast(`Downloading: ${processResult.download.fileName}`);
        
        // Create a secure download link
        const link = document.createElement('a');
        link.href = url;
        link.download = processResult.download.fileName || 'processed_audio.wav';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.warn('Invalid download URL rejected:', url);
        showToast('Invalid download URL');
      }
    } else {
      showToast('No processed file available. Process audio first.');
    }
  };

  const handleTranscribe = async (enableAnalysis: boolean = false) => {
    setTranscribing(true);
    try {
      const fileName = uploadedFile?.name || 'uploaded_audio.mp3';
      const result = await audioApi.transcribe(fileName, {
        useGenAI: true,
        enableAnalysis,
      });

      setTranscriptionData(result);
      setShowTranscription(true);
      
      // Show token usage
      if (result.pricing) {
        showToast(`Used ${result.pricing.total} credits for transcription`);
      }
      
      if (result.analysis?.isFeatured) {
        showToast('🌟 This track has hit potential!');
      }
    } catch (error) {
      console.error('Transcription error:', error);
      showToast(error instanceof Error ? error.message : 'Transcription failed. Try again.');
    } finally {
      setTranscribing(false);
    }
  };

  const toggleModuleActive = (index: number) => {
    const mod = modules[index];
    if (!mod || !mod.setActive) return;
    const next = [...activeModules];
    next[index] = !next[index];
    setActiveModules(next);
    mod.setActive(next[index]);
  };

  const applyPresetChain = (chain: PresetChain) => {
    // First, deactivate all modules
    const newActiveModules = modules.map(() => false);
    
    // Activate only modules in the chain
    chain.moduleIndices.forEach(idx => {
      newActiveModules[idx] = true;
      modules[idx]?.setActive?.(true);
    });
    
    // Apply settings for each module
    chain.moduleSettings.forEach(setting => {
      const mod = modules[setting.moduleIndex];
      if (mod && mod.params) {
        setting.paramValues.forEach((val, paramIdx) => {
          const param = mod.params[paramIdx];
          if (param && typeof param.oninput === 'function') {
            param.oninput(val);
          }
        });
      }
    });
    
    setActiveModules(newActiveModules);
    showToast(`Applied chain: ${chain.name}`);
  };

  return (
    <section id="demo" className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Interactive <span className="gradient-text">Demo</span>
          </h2>
          <p className="text-gray-400 text-lg">Try our audio modules in real-time. No upload required.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-myai-bg-panel/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_260px] gap-6">
            {/* Presets */}
            <div className="bg-black/25 border border-white/5 rounded-xl p-4 relative">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs uppercase tracking-wider text-gray-400">Presets</div>
                <button
                  onClick={saveCurrentAsPreset}
                  className="text-xs px-2 py-1 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                >
                  Save current
                </button>
              </div>
              <div className="space-y-2">
                {currentMod?.presets.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => applyPreset(preset.values)}
                    className="w-full text-left px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-myai-primary/10 hover:border-myai-primary/30 hover:shadow-lg hover:shadow-myai-primary/20 transition-all duration-200 text-sm"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
              {userPresets.length > 0 && (
                <div className="mt-4">
                  <div className="text-xs uppercase tracking-wider text-gray-400 mb-2">Your Presets</div>
                  <div className="space-y-2">
                    {userPresets.map((preset, idx) => (
                      <div key={`${preset.name}-${idx}`} className="group flex items-center gap-2">
                        <button
                          onClick={() => applyPreset(preset.values, preset.name)}
                          className="flex-1 text-left px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-myai-primary/10 hover:border-myai-primary/30 hover:shadow-lg hover:shadow-myai-primary/20 transition-all duration-200 text-sm"
                          title={`Apply preset${preset.category ? ' • ' + preset.category : ''}`}
                        >
                          {preset.name}
                          {preset.category && <span className="ml-2 text-[10px] text-gray-400 uppercase tracking-wide">{preset.category}</span>}
                          {preset.uses ? <span className="ml-2 text-[10px] text-gray-500">×{preset.uses}</span> : null}
                        </button>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => renamePreset(preset.name)}
                            className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] hover:bg-white/10"
                            title="Rename"
                          >✎</button>
                          <button
                            onClick={() => deletePreset(preset.name)}
                            className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] hover:bg-red-600/40 hover:border-red-500/60"
                            title="Delete"
                          >✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {frequentlyUsed.length > 0 && (
                <div className="mt-6">
                  <div className="text-xs uppercase tracking-wider text-gray-400 mb-2 flex items-center justify-between">
                    <span>Frequently Used</span>
                    {recommended && <span className="text-[10px] text-myai-primary/70">Try: {recommended.name}</span>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {frequentlyUsed.map(p => (
                      <button
                        key={`freq-${p.name}`}
                        onClick={() => applyPreset(p.values, p.name)}
                        className="text-xs px-2 py-1 rounded-md border border-white/10 bg-white/5 hover:bg-myai-primary/10 hover:border-myai-primary/30"
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {toast && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-2 px-3 py-1.5 rounded-md bg-black/80 border border-white/10 text-xs text-white shadow-lg animate-fade-in">
                  {toast}
                </div>
              )}
            </div>

            {/* Center - Controls */}
            <div className="bg-black/35 border border-white/5 rounded-xl p-6 flex flex-col items-center justify-center gap-6">
              <div className="text-center">
                <div className="text-sm uppercase tracking-wider text-gray-400 mb-1">Module</div>
                <h3 className="text-2xl font-bold">{currentMod?.name || "Loading..."}</h3>
              </div>

              <div className="flex gap-6 justify-center min-h-[180px] items-center">
                {currentMod?.params.map((param, idx) => {
                  const value = knobValues[idx] ?? param.value;
                  return (
                    <Knob
                      key={idx}
                      value={value}
                      min={param.min}
                      max={param.max}
                      step={(param.max - param.min) / 100}
                      onChange={(v) => handleKnobChange(idx, v)}
                      label={param.label}
                      size={96}
                      fillColor="#7C4DFF"
                      trackColor="#333333"
                      faceColor="#111122"
                      pointerColor="#FFFFFF"
                      showTicks={true}
                    />
                  );
                })}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handlePlayState("dry")}
                  className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
                    playState === "dry" ? "bg-myai-primary text-white" : "bg-white/5 border border-white/10 hover:bg-white/10"
                  }`}
                >
                  Dry
                </button>
                <button
                  onClick={handleAB}
                  className="px-6 py-2 rounded-lg font-bold bg-gradient-to-r from-myai-accent-warm to-myai-accent-warm-2 text-black hover:scale-105 transition-transform duration-200"
                >
                  A/B
                </button>
                <button
                  onClick={() => handlePlayState("fx")}
                  className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
                    playState === "fx" ? "bg-myai-primary text-white" : "bg-white/5 border border-white/10 hover:bg-white/10"
                  }`}
                >
                  Processed
                </button>
              </div>
            </div>

            {/* Info, Meter, Toggles, Upload/Record */}
            <div className="bg-black/25 border border-white/5 rounded-xl p-4">
              <div className="text-xs uppercase tracking-wider text-gray-400 mb-3">Info</div>
              <p className="text-sm text-gray-300 mb-6">{currentMod?.info || "Lite Demo — Full version in Studio"}</p>

              <div className="text-xs uppercase tracking-wider text-gray-400 mb-2">Active Modules</div>
              <div className="flex flex-wrap gap-2 mb-3">
                {modules.slice(0, showAllModules ? modules.length : 4).map((m, idx) => (
                  <div key={m.name + idx} className="relative group">
                    <button
                      onClick={() => toggleModuleActive(idx)}
                      className={`text-xs px-2 py-1 rounded-md border ${
                        activeModules[idx] ? "bg-myai-primary/20 border-myai-primary/40" : "bg-white/5 border-white/10"
                      }`}
                      title={TOOLTIP[m.name] || m.info}
                    >
                      {m.name}
                    </button>
                    <div className="pointer-events-none absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-md bg-black/80 text-white text-[11px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg border border-white/10">
                      {TOOLTIP[m.name] || m.info}
                    </div>
                  </div>
                ))}
              </div>
              {modules.length > 4 && (
                <button
                  onClick={() => setShowAllModules(!showAllModules)}
                  className="w-full text-xs px-2 py-1 mb-4 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                >
                  {showAllModules ? "Show Less" : `Load More (${modules.length - 4} more)`}
                </button>
              )}
              
              <div className="text-xs uppercase tracking-wider text-gray-400 mb-2 mt-6">
                One-Click Presets {uploadedFile && <span className="text-myai-accent">• File Ready</span>}
              </div>
              <div className="space-y-2 mb-6">
                {PRESET_CHAINS.map((chain, idx) => (
                  <div key={idx} className="flex gap-2">
                    <button
                      onClick={() => applyPresetChain(chain)}
                      className="flex-1 text-left px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-myai-accent/10 hover:border-myai-accent/30 hover:shadow-lg hover:shadow-myai-accent/20 transition-all duration-200"
                    >
                      <div className="text-sm font-semibold text-white">{chain.name}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{chain.description}</div>
                    </button>
                    {uploadedFile && (
                      <button
                        onClick={() => handleProcessWithPreset(chain)}
                        disabled={isProcessing}
                        className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-all duration-200 ${
                          isProcessing 
                            ? 'bg-gray-600 border-gray-500 cursor-not-allowed' 
                            : 'bg-myai-primary/20 border-myai-primary/40 hover:bg-myai-primary/30'
                        }`}
                        title={`Process with ${chain.name}`}
                      >
                        {isProcessing ? '...' : '▶'}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Process Result / Download */}
              {processResult && (
                <div className="mb-4 p-3 rounded-lg bg-green-900/20 border border-green-500/30">
                  <div className="text-xs uppercase tracking-wider text-green-400 mb-2">✓ Processing Complete</div>
                  <div className="text-xs text-gray-300 space-y-1">
                    {processResult.processing && (
                      <>
                        <div>Tokens used: <span className="text-white font-semibold">{processResult.processing.tokensUsed}</span></div>
                        <div>Credits remaining: <span className="text-white font-semibold">{processResult.processing.remainingCredits}</span></div>
                      </>
                    )}
                    {processResult.points > 0 && (
                      <div>Points earned: <span className="text-yellow-400 font-semibold">+{processResult.points}</span></div>
                    )}
                  </div>
                  <button
                    onClick={handleDownloadProcessed}
                    className="mt-2 w-full px-3 py-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold text-sm transition-all duration-200"
                  >
                    📥 Download Processed Audio
                  </button>
                </div>
              )}

              
              <div className="text-xs uppercase tracking-wider text-gray-400 mb-2">Level</div>
              <div className="h-2 bg-gradient-to-r from-gray-700 to-gray-600 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${qualityMetrics.isClipping ? 'bg-gradient-to-r from-red-600 to-red-400' : 'bg-gradient-to-r from-gray-500 to-gray-300'}`}
                  style={{ width: `${20 + meterLevel * 0.8}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
              
              {/* Quality Assurance Panel */}
              <div className="mt-4 p-3 rounded-lg bg-black/30 border border-white/5">
                <div className="text-xs uppercase tracking-wider text-gray-400 mb-2">Quality Check</div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Peak Level:</span>
                    <span className={`font-semibold ${qualityMetrics.peakLevel > 0.95 ? 'text-red-400' : qualityMetrics.peakLevel > 0.8 ? 'text-yellow-400' : 'text-green-400'}`}>
                      {(qualityMetrics.peakLevel * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className={`font-semibold ${qualityMetrics.isClipping ? 'text-red-400' : 'text-green-400'}`}>
                      {qualityMetrics.isClipping ? '⚠ Clipping' : '✓ Clean'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Target LUFS:</span>
                    <span className="font-semibold text-blue-400">{qualityMetrics.lufs} dB</span>
                  </div>
                </div>
                {qualityMetrics.isClipping && (
                  <div className="mt-2 p-2 rounded bg-red-500/10 border border-red-500/20">
                    <p className="text-[10px] text-red-300">⚠ Reduce gain to prevent clipping</p>
                  </div>
                )}
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3">
                  <label className="flex-1 px-4 py-2 rounded-lg font-semibold bg-white/10 border border-white/10 hover:bg-white/20 transition-all duration-200 cursor-pointer text-center">
                    Upload Dry
                    <input
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleUpload(f);
                      }}
                    />
                  </label>
                  <button
                    onClick={handleRecord}
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                      isRecording ? "bg-red-500 text-white" : "bg-white/10 border border-white/10 hover:bg-white/20"
                    }`}
                    title={isRecording ? "Stop and Download" : "Start Recording"}
                  >
                    {isRecording ? "Stop" : "Record"}
                  </button>
                </div>
                
                <button
                  onClick={() => handleTranscribe(false)}
                  disabled={transcribing}
                  className="w-full px-4 py-2 rounded-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {transcribing ? "Transcribing..." : "🎤 Get Lyrics (50 credits)"}
                </button>
                
                <button
                  onClick={() => handleTranscribe(true)}
                  disabled={transcribing}
                  className="w-full px-4 py-2 rounded-lg font-semibold bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {transcribing ? "Analyzing..." : "🎯 Full Analysis (150 credits)"}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-6">
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrevModule}
                className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex gap-2">
                {modules.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      idx === currentModule ? "bg-myai-accent-warm w-6" : "bg-gray-600"
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={handleNextModule}
                className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <a
              href="#pricing"
              className="px-6 py-3 bg-gradient-to-r from-myai-accent-warm to-myai-accent-warm-2 text-black font-bold rounded-lg hover:scale-105 transition-transform duration-200"
            >
              Open Full Studio
            </a>
          </div>
        </motion.div>
      </div>
      
      {/* Transcription Results Modal */}
      {showTranscription && transcriptionData && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowTranscription(false)} />
          <div className="relative z-[81] w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-myai-bg-panel/95 border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-2xl font-bold gradient-text">Lyrics & Analysis</h3>
              <button
                onClick={() => setShowTranscription(false)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
            </div>
            
            {/* Lyrics */}
            <div className="mb-6 p-4 rounded-lg bg-black/30 border border-white/10">
              <div className="text-sm uppercase tracking-wider text-gray-400 mb-2 flex items-center justify-between">
                <span>Transcribed Lyrics</span>
                <span className="text-xs">
                  Confidence: <span className="text-green-400 font-semibold">{(transcriptionData.transcription.confidence * 100).toFixed(0)}%</span>
                  {transcriptionData.transcription.doubleChecked && <span className="ml-2 text-blue-400">✓ Double-checked</span>}
                </span>
              </div>
              <pre className="text-sm text-white whitespace-pre-wrap font-sans">{transcriptionData.transcription.lyrics}</pre>
            </div>
            
            {/* Analysis */}
            {transcriptionData.analysis && (
              <div className="space-y-4">
                {/* Overall Score */}
                <div className="p-4 rounded-lg bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm uppercase tracking-wider text-gray-400">Overall Score</span>
                    <span className={`text-3xl font-bold ${
                      transcriptionData.analysis.overallScore >= 90 ? 'text-green-400' :
                      transcriptionData.analysis.overallScore >= 80 ? 'text-blue-400' :
                      transcriptionData.analysis.overallScore >= 70 ? 'text-yellow-400' :
                      'text-orange-400'
                    }`}>
                      {transcriptionData.analysis.overallScore}/100
                    </span>
                  </div>
                  {transcriptionData.analysis.isFeatured && (
                    <div className="mt-2 p-2 rounded bg-yellow-500/20 border border-yellow-500/40">
                      <p className="text-sm text-yellow-300">🌟 <strong>Featured Potential!</strong> This track shows exceptional quality and hit potential.</p>
                    </div>
                  )}
                </div>
                
                {/* Verse Scores */}
                <div>
                  <h4 className="text-lg font-bold mb-3">Verse Analysis</h4>
                  <div className="space-y-3">
                    {transcriptionData.analysis.verseScores.map((verse: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-lg bg-black/30 border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold">Verse {verse.verseNumber}</span>
                          <span className={`font-bold ${verse.score >= 85 ? 'text-green-400' : verse.score >= 70 ? 'text-blue-400' : 'text-yellow-400'}`}>
                            {verse.score}/100
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 mb-2">{verse.feedback}</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <div className="text-green-400 mb-1">✓ Strengths:</div>
                            <ul className="list-disc list-inside space-y-0.5 text-gray-400">
                              {verse.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}
                            </ul>
                          </div>
                          <div>
                            <div className="text-orange-400 mb-1">⚡ Improvements:</div>
                            <ul className="list-disc list-inside space-y-0.5 text-gray-400">
                              {verse.improvements.map((imp: string, i: number) => <li key={i}>{imp}</li>)}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Chorus Scores */}
                <div>
                  <h4 className="text-lg font-bold mb-3">Chorus Analysis</h4>
                  <div className="space-y-3">
                    {transcriptionData.analysis.chorusScores.map((chorus: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-lg bg-black/30 border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold">Chorus {chorus.chorusNumber}</span>
                          <span className={`font-bold ${chorus.score >= 90 ? 'text-green-400' : chorus.score >= 80 ? 'text-blue-400' : 'text-yellow-400'}`}>
                            {chorus.score}/100
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 mb-2">{chorus.feedback}</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <div className="text-green-400 mb-1">✓ Strengths:</div>
                            <ul className="list-disc list-inside space-y-0.5 text-gray-400">
                              {chorus.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}
                            </ul>
                          </div>
                          <div>
                            <div className="text-orange-400 mb-1">⚡ Improvements:</div>
                            <ul className="list-disc list-inside space-y-0.5 text-gray-400">
                              {chorus.improvements.map((imp: string, i: number) => <li key={i}>{imp}</li>)}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Expert Advice */}
                <div className="p-4 rounded-lg bg-gradient-to-br from-orange-900/30 to-pink-900/30 border border-orange-500/20">
                  <h4 className="text-lg font-bold mb-2 flex items-center gap-2">
                    <span>🎤</span>
                    <span>Veteran OG Industry Advisor</span>
                  </h4>
                  <div className="text-sm text-gray-200 whitespace-pre-line leading-relaxed">
                    {transcriptionData.analysis.expertAdvice}
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-6 p-3 rounded-lg bg-blue-900/20 border border-blue-500/20">
              <p className="text-xs text-blue-300">
                💡 <strong>Note:</strong> Cost: {transcriptionData.pricing.total} credits. 
                Analysis powered by {transcriptionData.analysis ? 'AI Industry Expert' : 'Basic Transcription'}.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {showDiscount && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowDiscount(false)} />
          <div className="relative z-[71] w-[92%] max-w-md bg-myai-bg-panel/95 border border-white/10 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-2xl font-bold mb-1">You're ready. Here's 25% off.</h3>
            <p className="text-gray-300 mb-4">Enter your name and email to receive your discount code instantly.</p>
            <div className="space-y-3">
              <input
                type="text"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder="Name"
                className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 focus:border-myai-primary outline-none"
              />
              <input
                type="email"
                value={buyerEmail}
                onChange={(e) => setBuyerEmail(e.target.value)}
                placeholder="Email"
                className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 focus:border-myai-primary outline-none"
              />
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-gray-400">Promo Code</div>
                <div className="text-lg font-mono font-bold text-myai-accent-warm">MYAI25OFF</div>
              </div>
              <button
                onClick={() => setShowDiscount(false)}
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-myai-primary to-myai-accent text-white font-semibold"
              >Copy & Continue</button>
            </div>
            <p className="mt-3 text-[11px] text-gray-500">By continuing, you agree to receive your code via email. You can unsubscribe anytime.</p>
          </div>
        </div>
      )}
    </section>
  );
}
