// Audio Modules - Migrated from existing vanilla JS modules
import { AudioModule } from './audioEngine';

export function createWarmthModule(ctx: AudioContext, connectIn: (node: AudioNode) => void, connectOut: (node: AudioNode) => void): AudioModule {
  const lowshelf = ctx.createBiquadFilter();
  lowshelf.type = 'lowshelf';
  lowshelf.frequency.value = 220;
  lowshelf.gain.value = 4;

  const shaper = ctx.createWaveShaper();
  const curve = new Float32Array(256);
  for (let i = 0; i < 256; i++) {
    const x = (i - 128) / 128;
    curve[i] = Math.tanh(2.2 * x);
  }
  shaper.curve = curve;
  shaper.oversample = '2x';

  // chain: IN -> lowshelf -> shaper -> OUT
  connectIn(lowshelf);
  lowshelf.connect(shaper);
  connectOut(shaper);

  return {
    name: 'Warmth',
    info: 'Add body & gentle harmonics',
    params: [
      {
        label: 'Warmth',
        min: 0,
        max: 10,
        value: 4,
        oninput: (v) => {
          const t = ctx.currentTime;
          lowshelf.gain.cancelScheduledValues(t);
          lowshelf.gain.setValueAtTime(lowshelf.gain.value, t);
          lowshelf.gain.linearRampToValueAtTime(v, t + 0.03);
        },
      },
    ],
    presets: [
      { name: 'Lo‑Fi Tape', values: [6] },
      { name: 'Subtle Glow', values: [3] },
      { name: 'Thick', values: [8] },
    ],
  };
}

export function createWidenerModule(ctx: AudioContext, connectIn: (node: AudioNode) => void, connectOut: (node: AudioNode) => void): AudioModule {
  const splitter = ctx.createChannelSplitter(2);
  const merger = ctx.createChannelMerger(2);
  const delayR = ctx.createDelay();
  delayR.delayTime.value = 0.0008;
  const gainL = ctx.createGain();
  const gainR = ctx.createGain();
  gainL.gain.value = 1;
  gainR.gain.value = 1;

  connectIn(splitter);
  splitter.connect(gainL, 0);
  gainL.connect(merger, 0, 0);
  splitter.connect(delayR, 1);
  delayR.connect(gainR).connect(merger, 0, 1);
  connectOut(merger);

  let width = 0.5;
  let balance = 0.0;

  function update() {
    const t = ctx.currentTime;
    delayR.delayTime.cancelScheduledValues(t);
    delayR.delayTime.setValueAtTime(delayR.delayTime.value, t);
    delayR.delayTime.linearRampToValueAtTime(0.0002 + width * 0.0018, t + 0.02);
    gainL.gain.cancelScheduledValues(t);
    gainL.gain.setValueAtTime(gainL.gain.value, t);
    gainL.gain.linearRampToValueAtTime(1 - Math.max(0, balance), t + 0.02);
    gainR.gain.cancelScheduledValues(t);
    gainR.gain.setValueAtTime(gainR.gain.value, t);
    gainR.gain.linearRampToValueAtTime(1 + Math.min(0, balance), t + 0.02);
  }
  update();

  return {
    name: 'Stereo Widener',
    info: 'Obvious width boost with mono‑safe bias',
    params: [
      {
        label: 'Width',
        min: 0,
        max: 1,
        value: 0.5,
        oninput: (v) => { width = v; update(); },
      },
      {
        label: 'Balance',
        min: -0.5,
        max: 0.5,
        value: 0,
        oninput: (v) => { balance = v; update(); },
      },
    ],
    presets: [
      { name: 'Wide', values: [0.8, 0] },
      { name: 'Superwide', values: [1.0, 0] },
      { name: 'Vox L Focus', values: [0.6, -0.2] },
    ],
  };
}

export function createEQ3Module(ctx: AudioContext, connectIn: (node: AudioNode) => void, connectOut: (node: AudioNode) => void): AudioModule {
  const low = ctx.createBiquadFilter();
  low.type = 'lowshelf';
  low.frequency.value = 120;
  low.gain.value = 0;

  const mid = ctx.createBiquadFilter();
  mid.type = 'peaking';
  mid.frequency.value = 1500;
  mid.Q.value = 0.8;
  mid.gain.value = 0;

  const air = ctx.createBiquadFilter();
  air.type = 'highshelf';
  air.frequency.value = 8000;
  air.gain.value = 0;

  connectIn(low);
  low.connect(mid).connect(air);
  connectOut(air);

  return {
    name: 'EQ Lite (3‑Band)',
    info: 'Sub / Mid / Air shaping',
    params: [
      {
        label: 'Sub',
        min: -12,
        max: 12,
        value: 0,
        oninput: (v) => {
          const t = ctx.currentTime;
          low.gain.cancelScheduledValues(t);
          low.gain.setValueAtTime(low.gain.value, t);
          low.gain.linearRampToValueAtTime(v, t + 0.03);
        },
      },
      {
        label: 'Mid',
        min: -12,
        max: 12,
        value: 0,
        oninput: (v) => {
          const t = ctx.currentTime;
          mid.gain.cancelScheduledValues(t);
          mid.gain.setValueAtTime(mid.gain.value, t);
          mid.gain.linearRampToValueAtTime(v, t + 0.03);
        },
      },
      {
        label: 'Air',
        min: -12,
        max: 12,
        value: 0,
        oninput: (v) => {
          const t = ctx.currentTime;
          air.gain.cancelScheduledValues(t);
          air.gain.setValueAtTime(air.gain.value, t);
          air.gain.linearRampToValueAtTime(v, t + 0.03);
        },
      },
    ],
    presets: [
      { name: 'Vocal Shine', values: [-2, 2, 4] },
      { name: 'Bass Boost', values: [6, 0, -1] },
      { name: 'Lo‑Fi', values: [-4, -3, -2] },
    ],
  };
}

export function createReverbModule(ctx: AudioContext, connectIn: (node: AudioNode) => void, connectOut: (node: AudioNode) => void): AudioModule {
  const delay = ctx.createDelay();
  delay.delayTime.value = 0.18;
  const fb = ctx.createGain();
  fb.gain.value = 0.25;
  delay.connect(fb).connect(delay);
  const mix = ctx.createGain();
  mix.gain.value = 0.2;

  connectIn(delay);
  delay.connect(mix);
  connectOut(mix);

  return {
    name: 'Reverb Lite',
    info: 'Quick space (demo)',
    params: [
      {
        label: 'Wet',
        min: 0,
        max: 1,
        value: 0.2,
        oninput: (v) => {
          const t = ctx.currentTime;
          mix.gain.cancelScheduledValues(t);
          mix.gain.setValueAtTime(mix.gain.value, t);
          mix.gain.linearRampToValueAtTime(v, t + 0.03);
        },
      },
      {
        label: 'Room',
        min: 0.05,
        max: 0.5,
        value: 0.18,
        oninput: (v) => {
          const t = ctx.currentTime;
          delay.delayTime.cancelScheduledValues(t);
          delay.delayTime.setValueAtTime(delay.delayTime.value, t);
          delay.delayTime.linearRampToValueAtTime(v, t + 0.03);
        },
      },
    ],
    presets: [
      { name: 'Plate', values: [0.25, 0.12] },
      { name: 'Hall', values: [0.35, 0.22] },
      { name: 'Huge', values: [0.5, 0.35] },
    ],
  };
}

// Note: HalfScrew and reTUNE modules would require more complex DSP
// For now, creating placeholder modules
export function createHalfscrewModule(ctx: AudioContext, connectIn: (node: AudioNode) => void, connectOut: (node: AudioNode) => void): AudioModule {
  const gain = ctx.createGain();
  gain.gain.value = 0.8;
  connectIn(gain);
  connectOut(gain);

  return {
    name: 'HalfScrew',
    info: 'Pitch & tempo demo',
    params: [
      {
        label: 'Screw',
        min: 0,
        max: 10,
        value: 5,
        oninput: (v) => {
          const t = ctx.currentTime;
          const target = 0.5 + (v / 10) * 0.5;
          gain.gain.cancelScheduledValues(t);
          gain.gain.setValueAtTime(gain.gain.value, t);
          gain.gain.linearRampToValueAtTime(target, t + 0.02);
        },
      },
    ],
    presets: [
      { name: 'Slight', values: [3] },
      { name: 'Medium', values: [5] },
      { name: 'Heavy', values: [8] },
    ],
  };
}

export function createRetuneModule(ctx: AudioContext, connectIn: (node: AudioNode) => void, connectOut: (node: AudioNode) => void): AudioModule {
  const gain = ctx.createGain();
  gain.gain.value = 1.0;
  connectIn(gain);
  connectOut(gain);

  return {
    name: 'reTUNE 432',
    info: 'Pitch shift demo',
    params: [
      {
        label: 'Tune',
        min: -12,
        max: 12,
        value: 0,
        oninput: (v) => { gain.gain.value = 1.0; }, // Placeholder
      },
    ],
    presets: [
      { name: '432 Hz', values: [-0.32] },
      { name: '440 Hz', values: [0] },
      { name: '444 Hz', values: [0.16] },
    ],
  };
}

export function getAllModules(ctx: AudioContext, connectIn: (node: AudioNode) => void, connectOut: (node: AudioNode) => void): AudioModule[] {
  return [
    createWarmthModule(ctx, connectIn, connectOut),
    createWidenerModule(ctx, connectIn, connectOut),
    createHalfscrewModule(ctx, connectIn, connectOut),
    createRetuneModule(ctx, connectIn, connectOut),
    createEQ3Module(ctx, connectIn, connectOut),
    createReverbModule(ctx, connectIn, connectOut),
  ];
}
