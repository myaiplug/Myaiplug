
import { AudioAPI } from '../core.js';
const ctx = AudioAPI.ctx;
const low = ctx.createBiquadFilter(); low.type='lowshelf'; low.frequency.value=120; low.gain.value=0;
const mid = ctx.createBiquadFilter(); mid.type='peaking';  mid.frequency.value=1500; mid.Q.value=0.8; mid.gain.value=0;
const air = ctx.createBiquadFilter(); air.type='highshelf'; air.frequency.value=8000; air.gain.value=0;
AudioAPI.connectFX(low); low.connect(mid).connect(air).connect(ctx.destination);
const def = {
  name: 'EQ Lite (3‑Band)',
  info: 'Sub / Mid / Air shaping',
  params: [
    { label:'Sub', min:-12, max:12, value:0, oninput:(v)=> low.gain.value=v },
    { label:'Mid', min:-12, max:12, value:0, oninput:(v)=> mid.gain.value=v },
    { label:'Air', min:-12, max:12, value:0, oninput:(v)=> air.gain.value=v },
  ],
  presets:[ {name:'Vocal Shine', values:[-2,2,4]}, {name:'Bass Boost', values:[6,0,-1]}, {name:'Lo‑Fi', values:[-4,-3,-2]} ]
};
export default (window.__reg = def);
registerModule(def);
