"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { MICROCOPY } from '@/lib/constants/microcopy';
import { getMockSocialProof } from '@/lib/utils/mockData';

function BootOverlay({ show, onDone }: { show: boolean; onDone: () => void }) {
  const [lines, setLines] = useState<string[]>([]);
  useEffect(() => {
    if (!show) return;
    const script = [
      'C> nodaw.exe --boot',
      'Initializing audio graph............. OK',
      'Loading AI modules: WARMTH | WIDENER | EQ3 | REVERB | HALFSCRW | RETUNE... OK',
      'Calibrating limiter.................. OK',
      'Priming buffers...................... OK',
      'Ready. Preparing render pipeline... OK',
      'FFmpeg plan:',
      '  ffmpeg -i input.wav -af "lowpass=f=18000, acompressor=threshold=-10dB:ratio=2:attack=5:release=50, aecho=0.8:0.9:100:0.3, dynaudnorm=f=200" -c:a aac -b:a 320k output.m4a',
      'Waiting for user input...'
    ];
    let i = 0;
    const id = setInterval(() => {
      setLines((prev) => [...prev, script[i]]);
      i++;
      if (i >= script.length) {
        clearInterval(id);
        setTimeout(onDone, 300);
      }
    }, 900);
    return () => clearInterval(id);
  }, [show, onDone]);
  if (!show) return null;
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <div className="absolute inset-0 bg-black/35" />
      <pre className="absolute right-6 top-1/2 -translate-y-1/2 text-green-300/90 text-[10px] md:text-xs bg-black/60 border border-white/10 rounded-lg p-4 w-[54%] max-w-xl overflow-hidden shadow-2xl h-[46%] md:h-[54%]">
                                                                                                                     
                                                                                                                     
NNNNNNNN        NNNNNNNN                 DDDDDDDDDDDDD                                                               
N:::::::N       N::::::N                 D::::::::::::DDD                                                            
N::::::::N      N::::::N                 D:::::::::::::::DD                                                          
N:::::::::N     N::::::N                 DDD:::::DDDDD:::::D                                                         
N::::::::::N    N::::::N   ooooooooooo     D:::::D    D:::::D  aaaaaaaaaaaaawwwwwww           wwwww           wwwwwww
N:::::::::::N   N::::::N oo:::::::::::oo   D:::::D     D:::::D a::::::::::::aw:::::w         w:::::w         w:::::w 
N:::::::N::::N  N::::::No:::::::::::::::o  D:::::D     D:::::D aaaaaaaaa:::::aw:::::w       w:::::::w       w:::::w  
N::::::N N::::N N::::::No:::::ooooo:::::o  D:::::D     D:::::D          a::::a w:::::w     w:::::::::w     w:::::w   
N::::::N  N::::N:::::::No::::o     o::::o  D:::::D     D:::::D   aaaaaaa:::::a  w:::::w   w:::::w:::::w   w:::::w    
N::::::N   N:::::::::::No::::o     o::::o  D:::::D     D:::::D aa::::::::::::a   w:::::w w:::::w w:::::w w:::::w     
N::::::N    N::::::::::No::::o     o::::o  D:::::D     D:::::Da::::aaaa::::::a    w:::::w:::::w   w:::::w:::::w      
N::::::N     N:::::::::No::::o     o::::o  D:::::D    D:::::Da::::a    a:::::a     w:::::::::w     w:::::::::w       
N::::::N      N::::::::No:::::ooooo:::::oDDD:::::DDDDD:::::D a::::a    a:::::a      w:::::::w       w:::::::w        
N::::::N       N:::::::No:::::::::::::::oD:::::::::::::::DD  a:::::aaaa::::::a       w:::::w         w:::::w         
N::::::N        N::::::N oo:::::::::::oo D::::::::::::DDD     a::::::::::aa:::a       w:::w           w:::w          
NNNNNNNN         NNNNNNN   ooooooooooo   DDDDDDDDDDDDD         aaaaaaaaaa  aaaa        www             www       
                                            

        <div className="mt-2 overflow-hidden h-full">
          <div className="animate-[scroll_24s_linear_forwards] space-y-1">
            {lines.map((l, idx) => (
              <div key={idx}>{l}</div>
            ))}
          </div>
        </div>
        <div className="mt-2 animate-pulse">Press any key to continue...</div>
      </pre>
    </div>
  );
}

function DemoInviteModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-[61] w-[92%] max-w-md bg-myai-bg-panel/90 border border-white/10 rounded-2xl p-6 text-center shadow-2xl">
        <h3 className="text-2xl font-bold mb-2">Jump into the Demo?</h3>
        <p className="text-gray-300 mb-6">Spin the knobs and hear NoDAW in real-time. You can always come back.</p>
        <div className="flex gap-3 justify-center">
          <a href="#demo" onClick={onClose} className="px-5 py-2 rounded-lg bg-gradient-to-r from-myai-primary to-myai-accent text-white font-semibold">Open Demo</a>
          <button onClick={onClose} className="px-5 py-2 rounded-lg bg-white/10 border border-white/10 text-white">Maybe later</button>
        </div>
      </div>
    </div>
  );
}

function LeftFileWindow({ show, onDone }: { show: boolean; onDone: () => void }) {
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  useEffect(() => {
    if (!show) return;
    const timers: number[] = [];
    timers.push(window.setTimeout(() => setStep(1), 600));
    timers.push(window.setTimeout(() => setStep(2), 1600));
    timers.push(window.setTimeout(() => setStep(3), 2200));
    timers.push(window.setTimeout(onDone, 3200));
    return () => { timers.forEach(clearTimeout); };
  }, [show, onDone]);
  if (!show) return null;
  const cursorAtTarget = step >= 1;
  const showClickPulse = step === 2;
  const showLoading = step >= 3;
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <div className="absolute left-6 top-1/2 -translate-y-1/2 w-[46%] max-w-lg bg-black/60 border border-white/10 rounded-xl shadow-2xl backdrop-blur-sm">
        <div className="flex items-center gap-1 px-3 py-2 border-b border-white/10">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-300/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
          <span className="ml-3 text-xs text-gray-300">Files</span>
        </div>
        <div className="relative p-4 h-48 grid grid-cols-4 gap-4 content-start">
          <div className="col-span-1 text-center">
            <div className="mx-auto w-12 h-9 rounded-t-md bg-yellow-400/80 relative">
              <div className="absolute -top-1 left-1 w-4 h-2 rounded-sm bg-yellow-300/90" />
            </div>
            <div className="text-[10px] text-gray-300 mt-1">Samples</div>
          </div>
          <div className={`col-span-1 text-center ${showClickPulse ? 'scale-[1.03]' : ''} transition-transform`}>
            <div className={`mx-auto w-10 h-12 bg-white/80 rounded-sm relative ${showClickPulse ? 'ring-2 ring-myai-accent' : ''}`}>
              <div className="absolute top-0 right-0 w-0 h-0 border-l-8 border-l-transparent border-t-8 border-t-gray-200" />
              <div className="absolute inset-x-1 bottom-1 h-1.5 bg-gray-300" />
            </div>
            <div className="text-[10px] text-gray-300 mt-1">track.wav</div>
          </div>
          {showLoading && (
            <div className="absolute right-4 bottom-3 flex items-center gap-2 text-xs text-gray-200">
              <span className="inline-block size-3 rounded-full border-2 border-white/30 border-t-transparent animate-spin" />
              Loading...
            </div>
          )}
          <div
            className="absolute w-3 h-3 bg-white rounded-full shadow-[0_0_0_2px_rgba(0,0,0,0.4)]"
            style={{ left: cursorAtTarget ? '36%' : '8%', top: cursorAtTarget ? '44%' : '70%', transition: 'left 700ms ease, top 700ms ease' }}
          />
        </div>
      </div>
    </div>
  );
}

// Demo animation component
function ProcessingDemo() {
  const [stage, setStage] = useState(0);
  const [timeSaved, setTimeSaved] = useState(0);
  
  const stages = ['Analyze', 'Clean', 'Enhance', 'Master', 'Deliver'];
  
  useEffect(() => {
    const stageInterval = setInterval(() => {
      setStage((s) => (s + 1) % stages.length);
    }, 3000);
    
    const timeInterval = setInterval(() => {
      setTimeSaved((t) => {
        const newTime = t + 1;
        return newTime > 127 ? 0 : newTime;
      });
    }, 300);
    
    return () => {
      clearInterval(stageInterval);
      clearInterval(timeInterval);
    };
  }, [stages.length]);
  
  return (
    <div className="relative w-full max-w-md mx-auto bg-myai-bg-panel/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400 uppercase tracking-wider">Processing</span>
          <span className="text-xs font-mono text-myai-accent">
            {MICROCOPY.HERO.timeSavedLabel} +00:{String(timeSaved).padStart(2, '0')}
          </span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-myai-primary to-myai-accent"
            animate={{ width: `${((stage + 1) / stages.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
      <div className="flex items-center justify-between text-sm">
        {stages.map((s, i) => (
          <div key={s} className="flex flex-col items-center gap-1">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                i <= stage
                  ? 'bg-myai-accent text-white'
                  : 'bg-white/10 text-gray-500'
              }`}
            >
              {i < stage ? '✓' : i === stage ? '...' : i + 1}
            </div>
            <span className={`text-xs ${i <= stage ? 'text-white' : 'text-gray-500'}`}>
              {s}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Hero() {
  const [boot, setBoot] = useState(true);
  const [leftWin, setLeftWin] = useState(false);
  const [invite, setInvite] = useState(false);
  const socialProof = getMockSocialProof();
  
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-myai-bg-dark/50 to-myai-bg-dark z-10 pointer-events-none" />
      <BootOverlay show={boot} onDone={() => { setBoot(false); setLeftWin(true); }} />
      <LeftFileWindow show={leftWin && !boot} onDone={() => { setLeftWin(false); setInvite(true); }} />
      {/* keyframes for scroll animation */}
      <style>{`@keyframes scroll { from { transform: translateY(0); } to { transform: translateY(-30%); } }`}</style>
      
      {/* Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Headline & CTA */}
          <div className="text-left">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="font-display text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
              >
                {MICROCOPY.HERO.headline.split('.').map((part, i, arr) => (
                  <span key={i}>
                    {part}
                    {i < arr.length - 1 && '.'}
                    {i < arr.length - 1 && <br className="hidden md:block" />}
                  </span>
                ))}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl leading-relaxed"
              >
                {MICROCOPY.HERO.subtitle}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 mb-8"
              >
                <Link href="#funnel">
                  <button className="group relative px-8 py-4 bg-gradient-to-r from-myai-primary to-myai-accent text-white font-bold rounded-xl text-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-myai-primary/50">
                    <span className="relative z-10">{MICROCOPY.HERO.ctaPrimary}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-myai-accent to-myai-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </button>
                </Link>

                <Link href="#demo">
                  <button className="px-8 py-4 border-2 border-white/20 text-white font-semibold rounded-xl text-lg hover:bg-white/5 hover:border-myai-primary/50 transition-all duration-300">
                    {MICROCOPY.HERO.ctaSecondary}
                  </button>
                </Link>
              </motion.div>

              {/* Social Proof */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="flex items-center gap-4"
              >
                <div className="flex -space-x-2">
                  {socialProof.avatars.map((avatar, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-myai-primary to-myai-accent border-2 border-myai-bg-dark flex items-center justify-center text-white text-sm font-bold"
                    >
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-400">
                  {MICROCOPY.HERO.socialProof(socialProof.creatorsCount, socialProof.hoursSaved)}
                </p>
              </motion.div>
            </motion.div>
          </div>

          {/* Right: Demo Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <ProcessingDemo />
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1, repeat: Infinity, repeatType: 'reverse' }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-gray-400 uppercase tracking-wider">Scroll to explore</span>
          <svg className="w-6 h-6 text-myai-accent animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </motion.div>
      <DemoInviteModal open={invite && !boot && !leftWin} onClose={() => setInvite(false)} />
    </section>
  );
}
