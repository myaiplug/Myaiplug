
import { AudioAPI } from '../core.js';
const def = {
  name: 'HalfScrew',
  info: 'Tempo & pitch slow‑down (demo approximation)',
  params: [
    { label:'Tempo', min:0.5, max:1.0, value:0.75, oninput:(v)=>{} },
    { label:'Pitch', min:-600, max:0, value:-300, oninput:(v)=>{} },
  ],
  presets:[ {name:'Half‑Time', values:[0.5,-600]}, {name:'¾‑Time', values:[0.75,-300]} ]
};
export default (window.__reg = def);
registerModule(def);
