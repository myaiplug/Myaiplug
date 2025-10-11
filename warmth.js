
import { AudioAPI } from '../core.js';
const ctx = AudioAPI.ctx;
const lowshelf = ctx.createBiquadFilter(); lowshelf.type='lowshelf'; lowshelf.frequency.value=220; lowshelf.gain.value=4;
const shaper = ctx.createWaveShaper();
const curve = new Float32Array(256); for(let i=0;i<256;i++){ const x=(i-128)/128; curve[i]=Math.tanh(2.2*x); }
shaper.curve = curve; shaper.oversample='2x';
AudioAPI.connectFX(lowshelf); lowshelf.connect(shaper).connect(ctx.destination);
const def = {
  name: 'Warmth',
  info: 'Add body & gentle harmonics',
  fxLoop: 'assets/loops/warmth_fx.wav',
  params: [ { label:'Warmth', min:0, max:10, value:4, oninput:(v)=>{ lowshelf.gain.value=v; } } ],
  presets:[ {name:'Lo‑Fi Tape', values:[6]}, {name:'Subtle Glow', values:[3]}, {name:'Thick', values:[8]} ]
};
export default (window.__reg = def);
registerModule(def);
