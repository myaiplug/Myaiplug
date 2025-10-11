
import { AudioAPI } from '../core.js';
const ctx = AudioAPI.ctx;
const splitter = ctx.createChannelSplitter(2);
const merger   = ctx.createChannelMerger(2);
const delayR   = ctx.createDelay(); delayR.delayTime.value = 0.0008;
const gainL = ctx.createGain(); const gainR = ctx.createGain(); gainL.gain.value=1; gainR.gain.value=1;
AudioAPI.connectFX(splitter);
splitter.connect(gainL,0); gainL.connect(merger,0,0);
splitter.connect(delayR,1); delayR.connect(gainR).connect(merger,0,1);
merger.connect(ctx.destination);
let width=0.5, balance=0.0;
function update(){
  delayR.delayTime.value = 0.0002 + width*0.0018;
  gainL.gain.value = 1 - Math.max(0,balance);
  gainR.gain.value = 1 + Math.min(0,balance);
}
update();
const def = {
  name: 'Stereo Widener',
  info: 'Obvious width boost with mono‑safe bias',
  params: [
    { label:'Width',   min:0, max:1, value:0.5, oninput:(v)=>{ width=v; update(); } },
    { label:'Balance', min:-0.5, max:0.5, value:0, oninput:(v)=>{ balance=v; update(); } },
  ],
  presets:[ {name:'Wide', values:[0.8,0]}, {name:'Superwide', values:[1.0,0]}, {name:'Vox L Focus', values:[0.6,-0.2]} ]
};
export default (window.__reg = def);
registerModule(def);
