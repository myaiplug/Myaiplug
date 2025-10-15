"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';

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
{` _   _       ____    ____        _
| \ | | ___ |  _ \\  / ___| _ __(_)_ __   __ _
|  \| |/ _ \\| | | | \\___ \\| '__| | '_ \\ / _
| |\\  | (_) | |_| |  ___) | |  | | | | | (_)
|_| \\_|\\___/|____/  |____/|_|  |_|_| |_|\\__, |
                                            |___/`}

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

export default function Hero() {
  const [boot, setBoot] = useState(true);
  const [leftWin, setLeftWin] = useState(false);
  const [invite, setInvite] = useState(false);
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-myai-bg-dark/50 to-myai-bg-dark z-10 pointer-events-none" />
  <BootOverlay show={boot} onDone={() => { setBoot(false); setLeftWin(true); }} />
  <LeftFileWindow show={leftWin && !boot} onDone={() => { setLeftWin(false); setInvite(true); }} />
  {/* keyframes for scroll animation */}
  <style>{`@keyframes scroll { from { transform: translateY(0); } to { transform: translateY(-30%); } }`}</style>
      
      {/* Content */}
      <div className="relative z-20 max-w-6xl mx-auto px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {/* Removed top badge/pill above brand per request */}

          {/* Main Heading with small brand label above NoDAW */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="font-display text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
          >
            <span className="relative inline-block align-top">
              <span className="absolute -top-1 md:-top-1 left-0.5 text-[10px] md:text-[11px] font-black tracking-tight leading-none uppercase text-white/90">
                MyAiPlug™
              </span>
              <span className="gradient-text block">NoDAW</span>
            </span>
          </motion.h1>

          {/* Subheading with cyan highlighter and emphasized words */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-snug"
          >
            Studio-grade AI audio tools that transform your sound.
            <br />
            <span className="tracking-wide uppercase font-extrabold">
              Plug in. <span className="relative inline-block">
                <span className="relative z-10">CREATE</span>
                <span className="absolute inset-x-0 bottom-0 h-2 bg-cyan-400/30 blur-[2px] rounded"></span>
              </span>. Release. <span className="relative inline-block">
                <span className="relative z-10">COLLECT</span>
                <span className="absolute inset-x-0 bottom-0 h-2 bg-cyan-400/30 blur-[2px] rounded"></span>
              </span>.
            </span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="#demo">
              <button className="group relative px-8 py-4 bg-gradient-to-r from-myai-primary to-myai-accent text-white font-bold rounded-xl text-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-myai-primary/50">
                <span className="relative z-10">Try NoDAW Free</span>
                <div className="absolute inset-0 bg-gradient-to-r from-myai-accent to-myai-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </Link>

            <Link href="#pricing">
              <button className="px-8 py-4 border-2 border-myai-primary/50 text-white font-semibold rounded-xl text-lg hover:bg-myai-primary/10 hover:border-myai-primary transition-all duration-300">
                View Pricing
              </button>
            </Link>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="mt-12 flex flex-wrap justify-center items-center gap-8 text-sm text-gray-400"
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Secure Card Payments</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>7-Day Refund Guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Instant Access</span>
            </div>
          </motion.div>
        </motion.div>
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
