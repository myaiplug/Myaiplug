
import { AudioAPI } from '../core.js';
const ctx = AudioAPI.ctx;
const delay = ctx.createDelay(); delay.delayTime.value=0.18;
const fb = ctx.createGain(); fb.gain.value=0.25; delay.connect(fb).connect(delay);
const mix = ctx.createGain(); mix.gain.value=0.2;
AudioAPI.connectFX(delay); delay.connect(mix).connect(ctx.destination);
const def = {
  name: 'Reverb Lite',
  info: 'Quick space (demo)',
  params: [
    { label:'Wet', min:0, max:1, value:0.2, oninput:(v)=> mix.gain.value=v },
    { label:'Room', min:0.05, max:0.5, value:0.18, oninput:(v)=> delay.delayTime.value=v },
  ],
  presets:[ {name:'Plate', values:[0.25,0.12]}, {name:'Hall', values:[0.35,0.22]}, {name:'Huge', values:[0.5,0.35]} ]
};
export default (window.__reg = def);
registerModule(def);
