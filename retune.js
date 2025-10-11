
import { AudioAPI } from '../core.js';
const def = {
  name: 'reTUNE 432',
  info: 'Fine retune (demo approximation)',
  params: [
    { label:'Cents', min:-100, max:100, value:-32, oninput:(v)=>{} },
  ],
  presets:[ {name:'A=432', values:[-32]}, {name:'Subtle', values:[-12]}, {name:'Bright', values:[12]} ]
};
export default (window.__reg = def);
registerModule(def);
