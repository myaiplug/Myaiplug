// Audio Engine - Preserves existing Web Audio API functionality

export interface AudioModule {
  name: string;
  info: string;
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
  // Optional: engine can toggle module output contribution
  setActive?: (active: boolean) => void;
}

export class AudioEngine {
  private ctx: AudioContext;
  private analyser: AnalyserNode;
  private data: Uint8Array<ArrayBuffer>;
  private source?: AudioBufferSourceNode;
  private gainDry: GainNode;
  private gainFX: GainNode;
  private mixBus: GainNode;
  private limiter: DynamicsCompressorNode;
  private fxInput: GainNode;
  private recorderDest: MediaStreamAudioDestinationNode;
  private mediaRecorder?: MediaRecorder;
  private recordChunks: Blob[] = [];
  private isRecording = false;
  private loopUrl: string = '/assets/loops/dry.wav';
  private userBuffer?: AudioBuffer;

  constructor() {
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  this.gainDry = this.ctx.createGain();
  this.gainFX = this.ctx.createGain();
  this.mixBus = this.ctx.createGain();
  this.limiter = this.ctx.createDynamicsCompressor();
  // Configure as transparent limiter
  this.limiter.threshold.value = -1.0; // dB
  this.limiter.knee.value = 0.0;
  this.limiter.ratio.value = 20.0;
  this.limiter.attack.value = 0.003;
  this.limiter.release.value = 0.06;
    this.fxInput = this.ctx.createGain();
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 256;
    this.data = new Uint8Array(this.analyser.frequencyBinCount);

    this.gainDry.gain.value = 1.0;
    this.gainFX.gain.value = 0.0;

    // Mix bus: dry + fx -> mix -> limiter -> analyser -> destination + recorder
    this.recorderDest = this.ctx.createMediaStreamDestination();
    this.gainDry.connect(this.mixBus);
    this.gainFX.connect(this.mixBus);
    this.mixBus.connect(this.limiter).connect(this.analyser);
    this.analyser.connect(this.ctx.destination);
    this.analyser.connect(this.recorderDest);
  }

  async loadLoop(url: string): Promise<AudioBuffer> {
    const res = await fetch(url);
    const buf = await res.arrayBuffer();
    return await this.ctx.decodeAudioData(buf);
  }

  async startPlayers(): Promise<void> {
    // Stop existing source if exists
    if (this.source) {
      try { this.source.stop(); } catch {}
    }

    const buf = this.userBuffer ? this.userBuffer : await this.loadLoop(this.loopUrl);

    this.source = this.ctx.createBufferSource();
    this.source.buffer = buf;
    this.source.loop = true;

    // Fan-out: dry path and FX path
    this.source.connect(this.gainDry);
    this.source.connect(this.fxInput);

    // Route to analyser (mix bus)
    this.gainDry.connect(this.analyser);
    this.gainFX.connect(this.analyser);

    this.source.start(0);
  }

  async ensureRunning(): Promise<void> {
    if (this.ctx.state === 'suspended') {
      try { await this.ctx.resume(); } catch {}
    }
  }

  getMeterLevel(): number {
    this.analyser.getByteFrequencyData(this.data);
    let sum = 0;
    for (let i = 0; i < 24; i++) sum += this.data[i];
    return Math.min(100, (sum / (24 * 255)) * 100);
  }

  setDry(val: number): void {
    const t = this.ctx.currentTime;
    this.gainDry.gain.cancelScheduledValues(t);
    this.gainDry.gain.setValueAtTime(this.gainDry.gain.value, t);
    this.gainDry.gain.linearRampToValueAtTime(val, t + 0.03);
  }

  setFX(val: number): void {
    const t = this.ctx.currentTime;
    this.gainFX.gain.cancelScheduledValues(t);
    this.gainFX.gain.setValueAtTime(this.gainFX.gain.value, t);
    this.gainFX.gain.linearRampToValueAtTime(val, t + 0.03);
  }

  // Connect the FX input (beginning of processing chain)
  connectFXIn(node: AudioNode): void {
    try { this.fxInput.disconnect(); } catch {}
    this.fxInput.connect(node);
  }

  // Connect the FX chain output into the engine's FX gain/mix bus
  connectFXOut(node: AudioNode): void {
    try { node.disconnect(); } catch {}
    node.connect(this.gainFX);
  }

  setLoop(url: string): void {
    this.loopUrl = url;
  }

  async loadFromFile(file: File): Promise<void> {
    const ab = await file.arrayBuffer();
    this.userBuffer = await this.ctx.decodeAudioData(ab.slice(0));
  }

  getContext(): AudioContext {
    return this.ctx;
  }

  // Recording the mixed/analyzed output (typically the current mix)
  async record(seconds: number = 10): Promise<Blob> {
    if (this.isRecording) throw new Error('Already recording');
    const stream = this.recorderDest.stream;
    const mime = this.getSupportedMimeType();
    this.mediaRecorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
    this.recordChunks = [];
    this.isRecording = true;

    return new Promise<Blob>((resolve, reject) => {
      if (!this.mediaRecorder) return reject(new Error('MediaRecorder not initialized'));

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) this.recordChunks.push(e.data);
      };
      this.mediaRecorder.onerror = (e) => {
        this.isRecording = false;
        reject((e as any).error || new Error('Recorder error'));
      };
      this.mediaRecorder.onstop = () => {
        this.isRecording = false;
        const blob = new Blob(this.recordChunks, { type: mime || 'audio/webm' });
        resolve(blob);
      };

      this.mediaRecorder.start();
      setTimeout(() => {
        try { this.mediaRecorder?.stop(); } catch (e) { reject(e as any); }
      }, Math.max(0, seconds * 1000));
    });
  }

  // Manual recording controls
  startRecording(): void {
    if (this.isRecording) return;
    const stream = this.recorderDest.stream;
    const mime = this.getSupportedMimeType();
    this.mediaRecorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
    this.recordChunks = [];
    this.isRecording = true;
    if (!this.mediaRecorder) return;
    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) this.recordChunks.push(e.data);
    };
    this.mediaRecorder.start();
  }

  async stopRecording(): Promise<Blob | null> {
    if (!this.isRecording || !this.mediaRecorder) return null;
    const mime = this.getSupportedMimeType();
    return new Promise<Blob | null>((resolve) => {
      this.mediaRecorder!.onstop = () => {
        this.isRecording = false;
        const blob = new Blob(this.recordChunks, { type: mime || 'audio/webm' });
        resolve(blob);
      };
      try { this.mediaRecorder!.stop(); } catch { resolve(null); }
    });
  }

  private getSupportedMimeType(): string | null {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/ogg',
    ];
    for (const t of types) {
      if ((window as any).MediaRecorder && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t)) return t;
    }
    return null;
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
