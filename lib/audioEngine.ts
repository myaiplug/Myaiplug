// Audio Engine - Preserves existing Web Audio API functionality

export interface AudioModule {
  name: string;
  info: string;
  fxLoop?: string;
  params: Array<{
    label: string;
    min: number;
    max: number;
    value: number;
    oninput: (value: number) => void;
  }>;
  presets: Array<{
    name: string;
    values: number[];
  }>;
}

export class AudioEngine {
  private ctx: AudioContext;
  private analyser: AnalyserNode;
  private data: Uint8Array<ArrayBuffer>;
  private sourceDry?: AudioBufferSourceNode;
  private sourceFX?: AudioBufferSourceNode;
  private gainDry: GainNode;
  private gainFX: GainNode;
  private loopDryUrl: string = '/assets/loops/dry.wav';
  private loopFXUrl: string = '/assets/loops/warmth_fx.wav';

  constructor() {
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.gainDry = this.ctx.createGain();
    this.gainFX = this.ctx.createGain();
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 256;
    this.data = new Uint8Array(this.analyser.frequencyBinCount);

    this.gainDry.gain.value = 1.0;
    this.gainFX.gain.value = 0.0;
  }

  async loadLoop(url: string): Promise<AudioBuffer> {
    const res = await fetch(url);
    const buf = await res.arrayBuffer();
    return await this.ctx.decodeAudioData(buf);
  }

  async startPlayers(): Promise<void> {
    // Stop existing sources if they exist
    if (this.sourceDry) this.sourceDry.stop();
    if (this.sourceFX) this.sourceFX.stop();

    const [bufDry, bufFX] = await Promise.all([
      this.loadLoop(this.loopDryUrl),
      this.loadLoop(this.loopFXUrl),
    ]);

    this.sourceDry = this.ctx.createBufferSource();
    this.sourceDry.buffer = bufDry;
    this.sourceDry.loop = true;

    this.sourceFX = this.ctx.createBufferSource();
    this.sourceFX.buffer = bufFX;
    this.sourceFX.loop = true;

    this.sourceDry.connect(this.gainDry).connect(this.analyser).connect(this.ctx.destination);
    this.sourceFX.connect(this.gainFX).connect(this.analyser);
    this.sourceDry.start(0);
    this.sourceFX.start(0);
  }

  getMeterLevel(): number {
    this.analyser.getByteFrequencyData(this.data);
    let sum = 0;
    for (let i = 0; i < 24; i++) sum += this.data[i];
    return Math.min(100, (sum / (24 * 255)) * 100);
  }

  setDry(val: number): void {
    this.gainDry.gain.value = val;
  }

  setFX(val: number): void {
    this.gainFX.gain.value = val;
  }

  connectDry(node: AudioNode): void {
    this.gainDry.disconnect();
    this.gainDry.connect(node);
  }

  connectFX(node: AudioNode): void {
    this.gainFX.disconnect();
    this.gainFX.connect(node);
  }

  setFXLoop(url: string): void {
    this.loopFXUrl = url;
  }

  getContext(): AudioContext {
    return this.ctx;
  }
}

// Export singleton instance
let audioEngineInstance: AudioEngine | null = null;

export function getAudioEngine(): AudioEngine {
  if (typeof window === 'undefined') {
    // Server-side - return a mock
    return {} as AudioEngine;
  }
  
  if (!audioEngineInstance) {
    audioEngineInstance = new AudioEngine();
  }
  return audioEngineInstance;
}
