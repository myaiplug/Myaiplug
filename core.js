
const modules = [];
let current = 0;

const els = {
  presetList: document.getElementById('presetList'),
  knobRow: document.getElementById('knobRow'),
  moduleName: document.getElementById('moduleName'),
  info: document.getElementById('info'),
  dots: document.getElementById('dots'),
  meter: document.getElementById('meterFill'),
  btnDry: document.getElementById('btnDry'),
  btnAB: document.getElementById('btnAB'),
  btnFX: document.getElementById('btnFX'),
  prev: document.getElementById('prev'),
  next: document.getElementById('next'),
};

const ctx = new (window.AudioContext||window.webkitAudioContext)();
let analyser, data, sourceDry, sourceFX, gainDry, gainFX;
let loopDryUrl = 'assets/loops/dry.wav';
let loopFXUrl = 'assets/loops/warmth_fx.wav';

async function loadLoop(url){
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  return await ctx.decodeAudioData(buf);
}

async function startPlayers(){
  const [bufDry, bufFX] = await Promise.all([loadLoop(loopDryUrl), loadLoop(loopFXUrl)]);
  sourceDry = ctx.createBufferSource(); sourceDry.buffer = bufDry; sourceDry.loop = true;
  sourceFX  = ctx.createBufferSource(); sourceFX.buffer = bufFX;  sourceFX.loop = true;
  gainDry = ctx.createGain(); gainFX = ctx.createGain();
  analyser = ctx.createAnalyser(); analyser.fftSize = 256; data = new Uint8Array(analyser.frequencyBinCount);

  gainDry.gain.value = 1.0; gainFX.gain.value = 0.0;

  sourceDry.connect(gainDry).connect(analyser).connect(ctx.destination);
  sourceFX.connect(gainFX).connect(analyser);
  sourceDry.start(0); sourceFX.start(0);

  meterStep();
}
function meterStep(){
  analyser.getByteFrequencyData(data);
  let sum=0; for(let i=0;i<24;i++) sum+=data[i];
  const lvl = Math.min(100, (sum/(24*255))*100);
  els.meter.style.width = (20+lvl*0.8)+'%';
  requestAnimationFrame(meterStep);
}

function createKnob(label, min, max, value, oninput){
  const wrap = document.createElement('div'); wrap.className='knob';
  const img = document.createElement('img'); img.src='assets/ui/knob.svg';
  const lab = document.createElement('div'); lab.className='label'; lab.innerText=label;
  wrap.appendChild(img); wrap.appendChild(lab);
  let v = value, start=null;
  function redraw(){ const deg = ((v-min)/(max-min))*270 - 135; img.style.transform = `rotate(${deg}deg)`; }
  redraw();
  function setVal(n){ v = Math.max(min, Math.min(max, n)); redraw(); oninput(v); }
  wrap.addEventListener('pointerdown', (e)=>{ start={x:e.clientX,y:e.clientY,val:v}; wrap.setPointerCapture(e.pointerId); });
  wrap.addEventListener('pointermove', (e)=>{ if(!start) return; const dy = start.y - e.clientY; setVal(start.val + dy*(max-min)/200); });
  wrap.addEventListener('pointerup', ()=> start=null);
  return {el:wrap, set:setVal};
}

function buildPresetList(presets, apply){
  els.presetList.innerHTML='';
  presets.forEach(p=>{
    const b=document.createElement('button');
    b.className='preset'; b.innerText=p.name;
    b.onclick=()=>apply(p.values);
    els.presetList.appendChild(b);
  });
}

function registerModule(def){ modules.push(def); }
function setDots(){
  els.dots.innerHTML='';
  modules.forEach((m,i)=>{
    const d=document.createElement('div'); d.className='dot'+(i===current?' active':'');
    els.dots.appendChild(d);
  });
}
async function loadModule(i){
  current = (i + modules.length) % modules.length;
  const mod = modules[current];
  els.moduleName.innerText = mod.name;
  els.info.innerText = mod.info || 'Lite Demo — Full version in Studio';
  loopFXUrl = mod.fxLoop || 'assets/loops/warmth_fx.wav';
  await startPlayers();

  els.knobRow.innerHTML='';
  const knobs=[];
  mod.params.forEach(p=>{
    const k = createKnob(p.label, p.min, p.max, p.value, (val)=> p.oninput(val));
    els.knobRow.appendChild(k.el); knobs.push(k);
  });
  buildPresetList(mod.presets || [], (vals)=>{
    vals.forEach((v,idx)=> knobs[idx] && knobs[idx].set(v));
  });
  setDots();
}

let state = 'dry';
els.btnDry.onclick = ()=>{ gainDry.gain.value=1.0; gainFX.gain.value=0.0; state='dry'; };
els.btnFX.onclick  = ()=>{ gainDry.gain.value=0.0; gainFX.gain.value=1.0; state='fx'; };
els.btnAB.onclick  = ()=>{ if(state==='dry'){ els.btnFX.click(); } else { els.btnDry.click(); } };

els.prev.onclick = ()=> loadModule(current-1);
els.next.onclick = ()=> loadModule(current+1);

export const AudioAPI = {
  ctx,
  setDry(val){ gainDry.gain.value = val; },
  setFX(val){ gainFX.gain.value = val; },
  connectDry(node){ gainDry.disconnect(); gainDry.connect(node); },
  connectFX(node){ gainFX.disconnect(); gainFX.connect(node); },
};

(async function init(){
  await import('./modules/warmth.js');
  await import('./modules/widener.js');
  await import('./modules/halfscrew.js');
  await import('./modules/retune.js');
  await import('./modules/eq3.js');
  await import('./modules/reverb.js');
  loadModule(0);
})();

// Expose for modules registration
window.registerModule = registerModule;
