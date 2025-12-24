/**
 * HeroWaveformSplit Component
 * PHASE 3: Premium landing page hero with razor blade split animation
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WaveformPlayer from '@/components/audio/WaveformPlayer';
import { splitAudioDemo } from '@/lib/api/split';
import Link from 'next/link';

interface HeroWaveformSplitProps {
  trackTitle?: string;
  audioSrc?: string;
}

export default function HeroWaveformSplit({
  trackTitle = 'Demo Track',
  audioSrc = '/audio/landing-demo.mp3',
}: HeroWaveformSplitProps) {
  const [state, setState] = useState<'idle' | 'splitting' | 'success' | 'error' | 'limit'>('idle');
  const [vocalsBlob, setVocalsBlob] = useState<Blob | null>(null);
  const [instrumentalBlob, setInstrumentalBlob] = useState<Blob | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [upgradeUrl, setUpgradeUrl] = useState('');
  const [showParticles, setShowParticles] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleSplit = async () => {
    if (state !== 'idle') return;

    setState('splitting');
    setShowParticles(true);

    // Start particle animation
    if (canvasRef.current) {
      animateParticles(canvasRef.current);
    }

    try {
      // Call demo API (or real API if user is authenticated)
      const result = await splitAudioDemo();

      if (result.success && result.vocals && result.instrumental) {
        // Convert blobs to object URLs
        setVocalsBlob(result.vocals);
        setInstrumentalBlob(result.instrumental);
        
        // Wait for animation to finish
        setTimeout(() => {
          setState('success');
          setShowParticles(false);
        }, 900);
      } else if (result.upgradeUrl) {
        // Rate limited
        setState('limit');
        setErrorMessage(result.error || 'Daily limit reached');
        setUpgradeUrl(result.upgradeUrl);
        setShowParticles(false);
      } else {
        // Error
        setState('error');
        setErrorMessage(result.error || 'Failed to split audio');
        setShowParticles(false);
      }
    } catch (error) {
      console.error('[HeroWaveformSplit] Error:', error);
      setState('error');
      setErrorMessage('An unexpected error occurred');
      setShowParticles(false);
    }
  };

  const handleReset = () => {
    setState('idle');
    setVocalsBlob(null);
    setInstrumentalBlob(null);
    setErrorMessage('');
    setUpgradeUrl('');
    setShowParticles(false);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Particle Canvas Overlay */}
      <AnimatePresence>
        {showParticles && (
          <motion.canvas
            ref={canvasRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none z-50"
            width={800}
            height={400}
          />
        )}
      </AnimatePresence>

      {/* Original Waveform (idle state) */}
      <AnimatePresence mode="wait">
        {state === 'idle' && (
          <motion.div
            key="original"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ 
              opacity: 0, 
              scale: 0.95,
              filter: 'blur(8px)',
              transition: { duration: 0.6 }
            }}
            className="space-y-6"
          >
            <WaveformPlayer
              src={audioSrc}
              title={trackTitle}
              variant="original"
            />

            {/* Razor Blade Split Button */}
            <motion.button
              onClick={handleSplit}
              className="group relative w-full py-6 px-8 bg-gradient-to-r from-purple-600 to-pink-600 
                       rounded-2xl font-bold text-xl text-white overflow-hidden
                       hover:from-purple-500 hover:to-pink-500 transition-all duration-300
                       hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Animated Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Content */}
              <div className="relative z-10 flex items-center justify-center gap-4">
                {/* Razor Blade Icon */}
                <svg 
                  className="w-8 h-8 group-hover:rotate-12 transition-transform duration-300" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" 
                  />
                </svg>
                <span>Split Into Stems</span>
              </div>
            </motion.button>

            {/* Info Text */}
            <p className="text-center text-sm text-gray-400">
              Experience AI-powered stem separation. Click to split vocals from instrumental.
            </p>
          </motion.div>
        )}

        {/* Splitting State */}
        {state === 'splitting' && (
          <motion.div
            key="splitting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 space-y-6"
          >
            {/* Animated Slash Icon */}
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <svg 
                className="w-20 h-20 text-purple-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" 
                />
              </svg>
            </motion.div>
            
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-2">
                Splitting Audio
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  ...
                </motion.span>
              </h3>
              <p className="text-gray-400">Our AI is separating your track into stems</p>
            </div>
          </motion.div>
        )}

        {/* Success State - Two Waveforms */}
        {state === 'success' && vocalsBlob && instrumentalBlob && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Desktop: Side by Side, Mobile: Stacked */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <WaveformPlayer
                src={URL.createObjectURL(instrumentalBlob)}
                title="🎵 Instrumental"
                variant="instrumental"
                autoPlay={false}
              />
              <WaveformPlayer
                src={URL.createObjectURL(vocalsBlob)}
                title="🎤 Vocals"
                variant="vocals"
                autoPlay={false}
              />
            </div>

            {/* Reset Button */}
            <div className="flex gap-4">
              <button
                onClick={handleReset}
                className="flex-1 py-3 px-6 border-2 border-white/20 rounded-xl text-white font-semibold
                         hover:bg-white/5 hover:border-purple-500/50 transition-all duration-300"
              >
                Try Another Track
              </button>
              <Link href="/dashboard" className="flex-1">
                <button
                  className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl 
                           text-white font-semibold hover:from-purple-500 hover:to-pink-500 
                           transition-all duration-300"
                >
                  Get Started Free
                </button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Error State */}
        {state === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-12 text-center space-y-4"
          >
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <h3 className="text-2xl font-bold text-white">Oops! Something went wrong</h3>
            <p className="text-gray-400">{errorMessage}</p>
            <button
              onClick={handleReset}
              className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-semibold
                       transition-all duration-300"
            >
              Try Again
            </button>
          </motion.div>
        )}

        {/* Limit Hit State */}
        {state === 'limit' && (
          <motion.div
            key="limit"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-12 text-center space-y-6"
          >
            <div className="text-yellow-400 text-6xl mb-4">🎵</div>
            <h3 className="text-2xl font-bold text-white">Daily Limit Reached</h3>
            <p className="text-gray-400 max-w-md mx-auto">{errorMessage}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleReset}
                className="px-8 py-3 border-2 border-white/20 rounded-xl text-white font-semibold
                         hover:bg-white/5 transition-all duration-300"
              >
                Go Back
              </button>
              <Link href={upgradeUrl}>
                <button
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl 
                           text-white font-semibold hover:from-purple-500 hover:to-pink-500 
                           transition-all duration-300"
                >
                  Upgrade to Pro
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Particle disintegration animation
 * Creates a canvas-based particle effect
 */
function animateParticles(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const particles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    color: string;
  }> = [];

  // Create particles across the canvas
  const particleCount = 80;
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      life: 1,
      color: Math.random() > 0.5 ? '#A855F7' : '#38BDF8',
    });
  }

  let animationId: number;
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    let allDead = true;
    particles.forEach(particle => {
      if (particle.life > 0) {
        allDead = false;
        
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= 0.015;
        
        // Draw particle
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.life;
        ctx.fillRect(particle.x, particle.y, 3, 3);
      }
    });

    ctx.globalAlpha = 1;

    if (!allDead) {
      animationId = requestAnimationFrame(animate);
    }
  };

  animate();

  // Return cleanup function
  return () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
  };
}
