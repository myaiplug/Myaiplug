"use client";

import { useEffect, useState, useRef } from "react";
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
  const engineRef = useRef<ReturnType<typeof getAudioEngine> | null>(null);
  const animFrameRef = useRef<number | undefined>(undefined);

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

  const applyPreset = (values: number[]) => {
    const mod = modules[currentModule];
    if (!mod) return;
    setKnobValues(values);
    values.forEach((v, idx) => mod.params[idx]?.oninput(v));
  };

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
            <div className="bg-black/25 border border-white/5 rounded-xl p-4">
              <div className="text-xs uppercase tracking-wider text-gray-400 mb-3">Presets</div>
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
                  <button
                    key={m.name + idx}
                    onClick={() => toggleModuleActive(idx)}
                    className={`text-xs px-2 py-1 rounded-md border ${
                      activeModules[idx] ? "bg-myai-primary/20 border-myai-primary/40" : "bg-white/5 border-white/10"
                    }`}
                    title={m.info}
                  >
                    {m.name}
                  </button>
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
    </section>
  );
}
