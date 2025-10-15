"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { getAudioEngine } from "@/lib/audioEngine";
import { getAllModules } from "@/lib/audioModules";
import type { AudioModule } from "@/lib/audioEngine";
import Knob from "@/components/Knob";

export default function MiniStudio() {
  const [modules, setModules] = useState<AudioModule[]>([]);
  const [currentModule, setCurrentModule] = useState(0);
  const [meterLevel, setMeterLevel] = useState(30);
  const [playState, setPlayState] = useState<"dry" | "fx">("dry");
  const [knobValues, setKnobValues] = useState<number[]>([]);
  const [activeModules, setActiveModules] = useState<boolean[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  interface UserPreset { name: string; values: number[]; category?: string; uses?: number; }
  const [userPresets, setUserPresets] = useState<UserPreset[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const engineRef = useRef<ReturnType<typeof getAudioEngine> | null>(null);
  const animFrameRef = useRef<number | undefined>(undefined);
  const [showDiscount, setShowDiscount] = useState(false);
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");

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
        setMeterLevel(engineRef.current.getMeterLevel());
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
    await engineRef.current.loadFromFile(file);
    await engineRef.current.startPlayers();
  };

  const toggleModuleActive = (index: number) => {
    const mod = modules[index];
    if (!mod || !mod.setActive) return;
    const next = [...activeModules];
    next[index] = !next[index];
    setActiveModules(next);
    mod.setActive(next[index]);
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
              <div className="flex flex-wrap gap-2 mb-6">
                {modules.map((m, idx) => (
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

              <div className="text-xs uppercase tracking-wider text-gray-400 mb-2">Level</div>
              <div className="h-2 bg-gradient-to-r from-gray-700 to-gray-600 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-gray-500 to-gray-300"
                  style={{ width: `${20 + meterLevel * 0.8}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>

              <div className="mt-6 flex items-center gap-3">
                <label className="px-6 py-2 rounded-lg font-semibold bg-white/10 border border-white/10 hover:bg-white/20 transition-all duration-200 cursor-pointer">
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
                  className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
                    isRecording ? "bg-red-500 text-white" : "bg-white/10 border border-white/10 hover:bg-white/20"
                  }`}
                  title={isRecording ? "Stop and Download" : "Start Recording"}
                >
                  {isRecording ? "Stop & Download" : "Record Mix"}
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
                <div className="text-lg font-mono font-bold text-myai-accent-warm">NODAW25OFF</div>
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
