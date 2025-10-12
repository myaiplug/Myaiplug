// Audio Modules - Migrated from existing vanilla JS modules
import { AudioModule } from './audioEngine';

export function createWarmthModule(ctx: AudioContext, connectFX: (node: AudioNode) => void): AudioModule {
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

  connectFX(lowshelf);
  lowshelf.connect(shaper).connect(ctx.destination);

  return {
    name: 'Warmth',
    info: 'Add body & gentle harmonics',
    fxLoop: '/assets/loops/warmth_fx.wav',
    params: [
      {
        label: 'Warmth',
        min: 0,
        max: 10,
        value: 4,
        oninput: (v) => { lowshelf.gain.value = v; },
      },
    ],
    presets: [
      { name: 'Lo‑Fi Tape', values: [6] },
      { name: 'Subtle Glow', values: [3] },
      { name: 'Thick', values: [8] },
    ],
  };
}

export function createWidenerModule(ctx: AudioContext, connectFX: (node: AudioNode) => void): AudioModule {
  const splitter = ctx.createChannelSplitter(2);
  const merger = ctx.createChannelMerger(2);
  const delayR = ctx.createDelay();
  delayR.delayTime.value = 0.0008;
  const gainL = ctx.createGain();
  const gainR = ctx.createGain();
  gainL.gain.value = 1;
  gainR.gain.value = 1;

  connectFX(splitter);
  splitter.connect(gainL, 0);
  gainL.connect(merger, 0, 0);
  splitter.connect(delayR, 1);
  delayR.connect(gainR).connect(merger, 0, 1);
  merger.connect(ctx.destination);

  let width = 0.5;
  let balance = 0.0;

  function update() {
    delayR.delayTime.value = 0.0002 + width * 0.0018;
    gainL.gain.value = 1 - Math.max(0, balance);
    gainR.gain.value = 1 + Math.min(0, balance);
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

export function createEQ3Module(ctx: AudioContext, connectFX: (node: AudioNode) => void): AudioModule {
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

  connectFX(low);
  low.connect(mid).connect(air).connect(ctx.destination);

  return {
    name: 'EQ Lite (3‑Band)',
    info: 'Sub / Mid / Air shaping',
    params: [
      {
        label: 'Sub',
        min: -12,
        max: 12,
        value: 0,
        oninput: (v) => { low.gain.value = v; },
      },
      {
        label: 'Mid',
        min: -12,
        max: 12,
        value: 0,
        oninput: (v) => { mid.gain.value = v; },
      },
      {
        label: 'Air',
        min: -12,
        max: 12,
        value: 0,
        oninput: (v) => { air.gain.value = v; },
      },
    ],
    presets: [
      { name: 'Vocal Shine', values: [-2, 2, 4] },
      { name: 'Bass Boost', values: [6, 0, -1] },
      { name: 'Lo‑Fi', values: [-4, -3, -2] },
    ],
  };
}

export function createReverbModule(ctx: AudioContext, connectFX: (node: AudioNode) => void): AudioModule {
  const delay = ctx.createDelay();
  delay.delayTime.value = 0.18;
  const fb = ctx.createGain();
  fb.gain.value = 0.25;
  delay.connect(fb).connect(delay);
  const mix = ctx.createGain();
  mix.gain.value = 0.2;

  connectFX(delay);
  delay.connect(mix).connect(ctx.destination);

  return {
    name: 'Reverb Lite',
    info: 'Quick space (demo)',
    params: [
      {
        label: 'Wet',
        min: 0,
        max: 1,
        value: 0.2,
        oninput: (v) => { mix.gain.value = v; },
      },
      {
        label: 'Room',
        min: 0.05,
        max: 0.5,
        value: 0.18,
        oninput: (v) => { delay.delayTime.value = v; },
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
export function createHalfscrewModule(ctx: AudioContext, connectFX: (node: AudioNode) => void): AudioModule {
  const gain = ctx.createGain();
  gain.gain.value = 0.8;
  connectFX(gain);
  gain.connect(ctx.destination);

  return {
    name: 'HalfScrew',
    info: 'Pitch & tempo demo',
    params: [
      {
        label: 'Screw',
        min: 0,
        max: 10,
        value: 5,
        oninput: (v) => { gain.gain.value = 0.5 + (v / 10) * 0.5; },
      },
    ],
    presets: [
      { name: 'Slight', values: [3] },
      { name: 'Medium', values: [5] },
      { name: 'Heavy', values: [8] },
    ],
  };
}

export function createRetuneModule(ctx: AudioContext, connectFX: (node: AudioNode) => void): AudioModule {
  const gain = ctx.createGain();
  gain.gain.value = 1.0;
  connectFX(gain);
  gain.connect(ctx.destination);

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

export function getAllModules(ctx: AudioContext, connectFX: (node: AudioNode) => void): AudioModule[] {
  return [
    createWarmthModule(ctx, connectFX),
    createWidenerModule(ctx, connectFX),
    createHalfscrewModule(ctx, connectFX),
    createRetuneModule(ctx, connectFX),
    createEQ3Module(ctx, connectFX),
    createReverbModule(ctx, connectFX),
  ];
}
