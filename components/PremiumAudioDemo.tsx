"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/contexts/AuthContext";
import { checkRateLimit, RATE_LIMITS } from "@/lib/services/antiAbuseService";

// Cost per effect usage in tokens
const EFFECT_COST = 5;

// Premium audio effects using Web Audio API
interface AudioEffect {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'space' | 'modulation' | 'dynamics' | 'distortion' | 'filter' | 'creative';
}

const PREMIUM_EFFECTS: AudioEffect[] = [
  { id: 'reverb', name: 'Hall Reverb', description: 'Lush concert hall ambience', icon: '🎭', category: 'space' },
  { id: 'delay', name: 'Ping Pong Delay', description: 'Stereo bouncing echoes', icon: '🏓', category: 'space' },
  { id: 'chorus', name: 'Analog Chorus', description: 'Thick vintage modulation', icon: '🌊', category: 'modulation' },
  { id: 'flanger', name: 'Jet Flanger', description: 'Whooshing jet-plane effect', icon: '✈️', category: 'modulation' },
  { id: 'phaser', name: 'Phaser', description: 'Sweeping notch filter', icon: '🌀', category: 'modulation' },
  { id: 'compressor', name: 'Compressor', description: 'Pro dynamics control', icon: '🎚️', category: 'dynamics' },
  { id: 'distortion', name: 'Tube Drive', description: 'Warm tube saturation', icon: '🔥', category: 'distortion' },
  { id: 'bitcrusher', name: 'Bit Crusher', description: 'Lo-fi digital degradation', icon: '🤖', category: 'distortion' },
  { id: 'filter', name: 'Auto Filter', description: 'Dynamic resonant filter', icon: '🎛️', category: 'filter' },
  { id: 'tremolo', name: 'Tremolo', description: 'Rhythmic amplitude modulation', icon: '📻', category: 'modulation' },
  { id: 'vocoder', name: 'Vocoder', description: 'Robotic voice effect', icon: '🎤', category: 'creative' },
  { id: 'ringmod', name: 'Ring Modulator', description: 'Metallic alien tones', icon: '👽', category: 'creative' },
];

export default function PremiumAudioDemo() {
  const { user } = useAuth();
  const [selectedEffect, setSelectedEffect] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [showTokenError, setShowTokenError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [userTokens, setUserTokens] = useState(100); // Mock token count
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | OscillatorNode | null>(null);
  const effectNodesRef = useRef<Map<string, AudioNode[]>>(new Map());
  const analyserRef = useRef<AnalyserNode | null>(null);
  const [waveformData, setWaveformData] = useState<number[]>(new Array(64).fill(0));
  const animFrameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Initialize audio context
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    audioContextRef.current = new AudioContext();
    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 128;
    
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      audioContextRef.current?.close();
    };
  }, []);

  const updateWaveform = useCallback(() => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    const normalized = Array.from(dataArray).map(v => v / 255);
    setWaveformData(normalized);
    
    animFrameRef.current = requestAnimationFrame(updateWaveform);
  }, []);

  const createEffectChain = (effectId: string, ctx: AudioContext): AudioNode[] => {
    const nodes: AudioNode[] = [];
    
    switch (effectId) {
      case 'reverb': {
        const convolver = ctx.createConvolver();
        const wetGain = ctx.createGain();
        wetGain.gain.value = 0.5;
        nodes.push(convolver, wetGain);
        
        // Create impulse response for reverb
        const sampleRate = ctx.sampleRate;
        const length = sampleRate * 2.5;
        const impulse = ctx.createBuffer(2, length, sampleRate);
        for (let channel = 0; channel < 2; channel++) {
          const data = impulse.getChannelData(channel);
          for (let i = 0; i < length; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
          }
        }
        convolver.buffer = impulse;
        convolver.connect(wetGain);
        break;
      }
      
      case 'delay': {
        const delayL = ctx.createDelay(1.0);
        const delayR = ctx.createDelay(1.0);
        const feedbackL = ctx.createGain();
        const feedbackR = ctx.createGain();
        const merger = ctx.createChannelMerger(2);
        const splitter = ctx.createChannelSplitter(2);
        
        delayL.delayTime.value = 0.375;
        delayR.delayTime.value = 0.5;
        feedbackL.gain.value = 0.3;
        feedbackR.gain.value = 0.3;
        
        splitter.connect(delayL, 0);
        splitter.connect(delayR, 1);
        delayL.connect(feedbackL).connect(delayR).connect(feedbackR).connect(delayL);
        delayL.connect(merger, 0, 0);
        delayR.connect(merger, 0, 1);
        
        nodes.push(splitter, delayL, delayR, feedbackL, feedbackR, merger);
        break;
      }
      
      case 'chorus': {
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        const delay = ctx.createDelay(0.05);
        const wetGain = ctx.createGain();
        
        lfo.frequency.value = 0.5;
        lfoGain.gain.value = 0.005;
        delay.delayTime.value = 0.025;
        wetGain.gain.value = 0.7;
        
        lfo.connect(lfoGain).connect(delay.delayTime);
        delay.connect(wetGain);
        lfo.start();
        
        nodes.push(delay, wetGain, lfo, lfoGain);
        break;
      }
      
      case 'flanger': {
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        const delay = ctx.createDelay(0.02);
        const feedback = ctx.createGain();
        const wetGain = ctx.createGain();
        
        lfo.frequency.value = 0.2;
        lfoGain.gain.value = 0.003;
        delay.delayTime.value = 0.005;
        feedback.gain.value = 0.5;
        wetGain.gain.value = 0.8;
        
        lfo.connect(lfoGain).connect(delay.delayTime);
        delay.connect(feedback).connect(delay);
        delay.connect(wetGain);
        lfo.start();
        
        nodes.push(delay, feedback, wetGain, lfo, lfoGain);
        break;
      }
      
      case 'phaser': {
        const filters = Array.from({ length: 4 }, () => {
          const filter = ctx.createBiquadFilter();
          filter.type = 'allpass';
          filter.frequency.value = 1000;
          filter.Q.value = 10;
          return filter;
        });
        
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.value = 0.3;
        lfoGain.gain.value = 500;
        
        filters.forEach(filter => {
          lfo.connect(lfoGain).connect(filter.frequency as AudioParam);
        });
        
        // Chain filters
        for (let i = 0; i < filters.length - 1; i++) {
          filters[i].connect(filters[i + 1]);
        }
        
        lfo.start();
        nodes.push(...filters, lfo, lfoGain);
        break;
      }
      
      case 'compressor': {
        const compressor = ctx.createDynamicsCompressor();
        compressor.threshold.value = -24;
        compressor.knee.value = 30;
        compressor.ratio.value = 12;
        compressor.attack.value = 0.003;
        compressor.release.value = 0.25;
        nodes.push(compressor);
        break;
      }
      
      case 'distortion': {
        const shaper = ctx.createWaveShaper();
        const preGain = ctx.createGain();
        const postGain = ctx.createGain();
        
        preGain.gain.value = 5;
        postGain.gain.value = 0.3;
        
        const curve = new Float32Array(256);
        for (let i = 0; i < 256; i++) {
          const x = (i - 128) / 128;
          curve[i] = Math.tanh(3 * x);
        }
        shaper.curve = curve;
        shaper.oversample = '4x';
        
        preGain.connect(shaper).connect(postGain);
        nodes.push(preGain, shaper, postGain);
        break;
      }
      
      case 'bitcrusher': {
        const crusher = ctx.createScriptProcessor(4096, 1, 1);
        const bits = 4;
        const normFreq = 0.1;
        let phaser = 0;
        let last = 0;
        
        crusher.onaudioprocess = (e) => {
          const input = e.inputBuffer.getChannelData(0);
          const output = e.outputBuffer.getChannelData(0);
          const step = Math.pow(0.5, bits);
          
          for (let i = 0; i < input.length; i++) {
            phaser += normFreq;
            if (phaser >= 1.0) {
              phaser -= 1.0;
              last = step * Math.floor(input[i] / step + 0.5);
            }
            output[i] = last;
          }
        };
        
        nodes.push(crusher);
        break;
      }
      
      case 'filter': {
        const filter = ctx.createBiquadFilter();
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        
        filter.type = 'lowpass';
        filter.frequency.value = 1000;
        filter.Q.value = 15;
        
        lfo.frequency.value = 0.4;
        lfoGain.gain.value = 800;
        
        lfo.connect(lfoGain).connect(filter.frequency as AudioParam);
        lfo.start();
        
        nodes.push(filter, lfo, lfoGain);
        break;
      }
      
      case 'tremolo': {
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        const amplitudeGain = ctx.createGain();
        
        lfo.frequency.value = 5;
        lfoGain.gain.value = 0.5;
        amplitudeGain.gain.value = 0.5;
        
        lfo.connect(lfoGain).connect(amplitudeGain.gain);
        lfo.start();
        
        nodes.push(amplitudeGain, lfo, lfoGain);
        break;
      }
      
      case 'vocoder': {
        // Simplified vocoder effect using filters
        const carrier = ctx.createOscillator();
        const carrierGain = ctx.createGain();
        carrier.frequency.value = 440;
        carrierGain.gain.value = 0.3;
        carrier.connect(carrierGain);
        carrier.start();
        nodes.push(carrier, carrierGain);
        break;
      }
      
      case 'ringmod': {
        const modulator = ctx.createOscillator();
        const modulatorGain = ctx.createGain();
        modulator.frequency.value = 30;
        modulatorGain.gain.value = 1.0;
        modulator.connect(modulatorGain);
        modulator.start();
        nodes.push(modulator, modulatorGain);
        break;
      }
    }
    
    return nodes;
  };

  const applyEffect = async (effectId: string) => {
    if (!user) {
      setShowAuthPrompt(true);
      return;
    }

    // Check rate limit
    const rateLimit = checkRateLimit(`audio_effect_${user.id}`, RATE_LIMITS.JOB_CREATE.max, RATE_LIMITS.JOB_CREATE.window);
    if (!rateLimit.allowed) {
      setShowTokenError(true);
      setTimeout(() => setShowTokenError(false), 3000);
      return;
    }

    // Check if user has enough tokens
    if (userTokens < EFFECT_COST) {
      setShowTokenError(true);
      setTimeout(() => setShowTokenError(false), 3000);
      return;
    }

    setIsProcessing(true);
    setSelectedEffect(effectId);

    try {
      const ctx = audioContextRef.current;
      if (!ctx) return;

      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      // Stop previous source if exists
      if (sourceNodeRef.current) {
        try {
          sourceNodeRef.current.stop();
          sourceNodeRef.current.disconnect();
        } catch (e) {}
      }

      // Clean up previous effect nodes
      effectNodesRef.current.forEach(nodes => {
        nodes.forEach(node => {
          try {
            node.disconnect();
          } catch (e) {}
        });
      });
      effectNodesRef.current.clear();

      // Create oscillator as test signal
      const oscillator = ctx.createOscillator();
      const oscillatorGain = ctx.createGain();
      oscillator.type = 'sawtooth';
      oscillator.frequency.value = 220;
      oscillatorGain.gain.value = 0.3;

      // Create effect chain
      const effectNodes = createEffectChain(effectId, ctx);
      effectNodesRef.current.set(effectId, effectNodes);

      // Connect: oscillator -> effect chain -> analyser -> destination
      oscillator.connect(oscillatorGain);
      
      let currentNode: AudioNode = oscillatorGain;
      effectNodes.forEach(node => {
        currentNode.connect(node);
        currentNode = node;
      });

      if (analyserRef.current) {
        currentNode.connect(analyserRef.current);
        analyserRef.current.connect(ctx.destination);
      } else {
        currentNode.connect(ctx.destination);
      }

      oscillator.start();
      sourceNodeRef.current = oscillator;
      setIsPlaying(true);

      // Start waveform animation
      updateWaveform();

      // Deduct tokens
      setUserTokens(prev => prev - EFFECT_COST);
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);

      // Stop after 5 seconds
      setTimeout(() => {
        try {
          oscillator.stop();
          setIsPlaying(false);
          if (animFrameRef.current) {
            cancelAnimationFrame(animFrameRef.current);
          }
        } catch (e) {}
      }, 5000);

    } catch (error) {
      console.error('Error applying effect:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const stopPlayback = () => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
      } catch (e) {}
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
  };

  const categories = ['all', 'space', 'modulation', 'dynamics', 'distortion', 'filter', 'creative'];
  
  const filteredEffects = activeCategory === 'all' 
    ? PREMIUM_EFFECTS 
    : PREMIUM_EFFECTS.filter(e => e.category === activeCategory);

  return (
    <section id="premium-audio-demo" className="py-20 px-6 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-myai-primary/5 via-transparent to-myai-accent/5 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-myai-primary/20 to-myai-accent/20 border border-myai-primary/30 rounded-full px-4 py-2 mb-4">
            <span className="text-2xl">✨</span>
            <span className="text-sm font-semibold uppercase tracking-wider">Premium Feature</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            One-Click <span className="gradient-text">Audio Effects</span>
          </h2>
          <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto">
            Professional-grade audio processing powered by advanced Web Audio API. Each effect costs {EFFECT_COST} tokens.
          </p>
        </motion.div>

        {/* Token Display */}
        {user && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex justify-center mb-8"
          >
            <div className="bg-myai-bg-panel/50 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 flex items-center gap-3">
              <span className="text-2xl">🎫</span>
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">Your Tokens</div>
                <div className="text-2xl font-bold gradient-text">{userTokens}</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-2 mb-12"
        >
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                activeCategory === cat
                  ? 'bg-gradient-to-r from-myai-primary to-myai-accent text-white shadow-lg shadow-myai-primary/30'
                  : 'bg-white/5 border border-white/10 hover:bg-white/10'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </motion.div>

        {/* Effects Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-12"
        >
          {filteredEffects.map((effect, idx) => (
            <motion.button
              key={effect.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              onClick={() => applyEffect(effect.id)}
              disabled={isProcessing || (isPlaying && selectedEffect !== effect.id)}
              className={`group relative bg-myai-bg-panel/50 backdrop-blur-xl border rounded-2xl p-6 hover:scale-105 transition-all duration-300 ${
                selectedEffect === effect.id && isPlaying
                  ? 'border-myai-primary shadow-2xl shadow-myai-primary/30 ring-2 ring-myai-primary/50'
                  : 'border-white/10 hover:border-myai-primary/50 hover:shadow-xl hover:shadow-myai-primary/20'
              } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
            >
              {/* Effect Icon */}
              <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">
                {effect.icon}
              </div>
              
              {/* Effect Name */}
              <h3 className="font-bold text-lg mb-2 group-hover:gradient-text transition-all">
                {effect.name}
              </h3>
              
              {/* Effect Description */}
              <p className="text-sm text-gray-400 mb-3">
                {effect.description}
              </p>
              
              {/* Token Cost */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-myai-accent">🎫</span>
                  <span className="font-semibold">{EFFECT_COST} tokens</span>
                </div>
                
                {selectedEffect === effect.id && isPlaying && (
                  <div className="flex items-center gap-1 text-xs text-green-400">
                    <span className="animate-pulse">●</span>
                    <span>Active</span>
                  </div>
                )}
              </div>

              {/* Processing Overlay */}
              {isProcessing && selectedEffect === effect.id && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-myai-primary border-t-transparent" />
                </div>
              )}
            </motion.button>
          ))}
        </motion.div>

        {/* Waveform Visualizer */}
        <AnimatePresence>
          {isPlaying && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-myai-bg-panel/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-12"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-xl mb-1">Live Audio Processing</h3>
                  <p className="text-sm text-gray-400">Effect: {PREMIUM_EFFECTS.find(e => e.id === selectedEffect)?.name}</p>
                </div>
                <button
                  onClick={stopPlayback}
                  className="px-6 py-3 bg-red-500/20 border border-red-500/50 rounded-lg font-semibold hover:bg-red-500/30 transition-colors"
                >
                  Stop
                </button>
              </div>
              
              <div className="flex items-end justify-center gap-1 h-32">
                {waveformData.map((value, idx) => (
                  <motion.div
                    key={idx}
                    className="bg-gradient-to-t from-myai-primary to-myai-accent rounded-t"
                    style={{ width: `${100 / waveformData.length}%` }}
                    animate={{ height: `${Math.max(value * 100, 2)}%` }}
                    transition={{ duration: 0.1 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Auth Prompt Modal */}
        <AnimatePresence>
          {showAuthPrompt && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={() => setShowAuthPrompt(false)}
            >
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative z-10 bg-myai-bg-panel border border-white/10 rounded-2xl p-8 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center">
                  <div className="text-6xl mb-4">🔒</div>
                  <h3 className="text-2xl font-bold mb-3">Sign In Required</h3>
                  <p className="text-gray-400 mb-6">
                    Premium audio effects require an account. Sign in or create a free account to get started with 100 free tokens.
                  </p>
                  <div className="flex gap-3">
                    <a
                      href="/signin"
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-myai-primary to-myai-accent text-white font-bold rounded-lg hover:scale-105 transition-transform"
                    >
                      Sign In
                    </a>
                    <a
                      href="/signup"
                      className="flex-1 px-6 py-3 bg-white/10 border border-white/20 rounded-lg font-semibold hover:bg-white/20 transition-colors"
                    >
                      Sign Up
                    </a>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Token Error Toast */}
        <AnimatePresence>
          {showTokenError && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-red-500/90 backdrop-blur-xl border border-red-400/50 rounded-xl px-6 py-4 shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <div className="font-bold">Insufficient Tokens</div>
                  <div className="text-sm opacity-90">You need {EFFECT_COST} tokens to use this effect.</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Toast */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-green-500/90 backdrop-blur-xl border border-green-400/50 rounded-xl px-6 py-4 shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <div className="font-bold">Effect Applied!</div>
                  <div className="text-sm opacity-90">{EFFECT_COST} tokens deducted</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-myai-primary/10 to-myai-accent/10 border border-myai-primary/30 rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-3">Need More Tokens?</h3>
            <p className="text-gray-400 mb-6">
              Upgrade to Pro and get 1,000 tokens monthly, or purchase token packs.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="#pricing"
                className="px-8 py-4 bg-gradient-to-r from-myai-primary to-myai-accent text-white font-bold rounded-lg hover:scale-105 transition-transform"
              >
                View Plans
              </a>
              <a
                href="/dashboard"
                className="px-8 py-4 bg-white/10 border border-white/20 rounded-lg font-semibold hover:bg-white/20 transition-colors"
              >
                Buy Token Pack
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
