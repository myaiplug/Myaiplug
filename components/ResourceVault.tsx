"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface Resource {
  title: string;
  description: string;
  type: 'template' | 'guide' | 'code' | 'prompt' | 'workflow' | 'cheatsheet';
  isPro: boolean;
}

const RESOURCES: Resource[] = [
  { title: 'Album Launch Template', description: 'Complete checklist and timeline', type: 'template', isPro: false },
  { title: 'Social Media Calendar', description: 'Pre-built posting schedule', type: 'template', isPro: false },
  { title: 'EPK Template', description: 'Professional press kit template', type: 'template', isPro: true },
  { title: 'Mixing Guide', description: 'Pro mixing techniques', type: 'guide', isPro: true },
  { title: 'Playlist Pitching Guide', description: 'Get your music on playlists', type: 'guide', isPro: false },
  { title: 'API Integration Code', description: 'Sample API implementation', type: 'code', isPro: true },
  { title: 'ChatGPT Prompts Pack', description: '100+ music industry prompts', type: 'prompt', isPro: true },
  { title: 'Release Workflow', description: 'Step-by-step release process', type: 'workflow', isPro: false },
  { title: 'Audio Settings Cheatsheet', description: 'Quick reference guide', type: 'cheatsheet', isPro: false },
  { title: 'Mastering Cheatsheet', description: 'Pro mastering settings', type: 'cheatsheet', isPro: true },
];

function SignInModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative z-51 w-[92%] max-w-md bg-myai-bg-panel/95 border border-white/10 rounded-2xl p-6 shadow-2xl"
        >
          <h3 className="text-2xl font-bold mb-2">🔐 Vault Access Required</h3>
          <p className="text-gray-300 mb-6">
            Sign in to unlock the Resource Vault and access exclusive templates, guides, and tools.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-white/10 border border-white/10 hover:bg-white/20 text-white transition-colors"
            >
              Cancel
            </button>
            <a
              href="/signin"
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-myai-primary to-myai-accent text-white font-semibold hover:scale-105 transition-transform"
            >
              Sign In
            </a>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function ResourceVault() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [crankRotation, setCrankRotation] = useState(0);
  const [showSignInModal, setShowSignInModal] = useState(false);

  const handleVaultClick = () => {
    if (!isAuthenticated) {
      router.push('/signin');
      return;
    }

    // Animate crank rotation
    setCrankRotation((prev) => prev + 360);

    // Open vault after crank animation
    setTimeout(() => {
      setIsVaultOpen(true);
    }, 800);
  };

  const getTypeIcon = (type: Resource['type']) => {
    const icons = {
      template: '📋',
      guide: '📖',
      code: '💻',
      prompt: '🤖',
      workflow: '🔄',
      cheatsheet: '📝',
    };
    return icons[type];
  };

  return (
    <section className="relative py-24 px-6 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-myai-bg-dark/50 to-transparent pointer-events-none" />
      
      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            The Resource <span className="gradient-text">Vault</span>
          </h2>
          <p className="text-gray-400">
            Exclusive templates, guides, and tools for creators
          </p>
        </div>

        {/* Vault Visual */}
        <div className="relative max-w-2xl mx-auto mb-12">
          <motion.div
            className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-white/10 overflow-hidden cursor-pointer group"
            onClick={handleVaultClick}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            {/* Vault Door */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 flex items-center justify-center"
              animate={{
                x: isVaultOpen ? '-100%' : 0,
              }}
              transition={{ duration: 1, ease: 'easeInOut' }}
            >
              {/* Vault Lock/Crank */}
              <div className="relative">
                <motion.div
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-600 to-yellow-800 border-4 border-yellow-900 flex items-center justify-center shadow-2xl"
                  animate={{ rotate: crankRotation }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                >
                  <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center">
                    <div className="text-3xl">🔒</div>
                  </div>
                  {/* Crank handle */}
                  <div className="absolute top-0 right-0 w-8 h-8 bg-yellow-700 rounded-full border-2 border-yellow-900" />
                </motion.div>
                
                {!isVaultOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
                    className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-sm text-gray-400 whitespace-nowrap"
                  >
                    Click to unlock
                  </motion.div>
                )}
              </div>

              {/* Decorative bolts */}
              <div className="absolute top-4 left-4 w-3 h-3 rounded-full bg-gray-600" />
              <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-gray-600" />
              <div className="absolute bottom-4 left-4 w-3 h-3 rounded-full bg-gray-600" />
              <div className="absolute bottom-4 right-4 w-3 h-3 rounded-full bg-gray-600" />
            </motion.div>

            {/* Vault Contents (revealed when open) */}
            <AnimatePresence>
              {isVaultOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="absolute inset-0 bg-gradient-to-br from-myai-primary/10 to-myai-accent/10 backdrop-blur-sm flex items-center justify-center"
                >
                  <div className="text-center">
                    <div className="text-5xl mb-3">📦</div>
                    <div className="text-xl font-bold">Vault Unlocked!</div>
                    <div className="text-sm text-gray-400 mt-1">Scroll down to explore</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Resources Grid */}
        <AnimatePresence>
          {isVaultOpen && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {RESOURCES.map((resource, idx) => (
                <motion.div
                  key={resource.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.3 }}
                  className={`relative p-5 rounded-xl border transition-all duration-300 ${
                    resource.isPro && !isAuthenticated
                      ? 'bg-gray-900/50 border-white/5 opacity-60'
                      : 'bg-myai-bg-panel/40 border-white/10 hover:border-myai-primary/50 hover:shadow-lg hover:shadow-myai-primary/10'
                  }`}
                >
                  {resource.isPro && (
                    <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-gradient-to-r from-myai-accent-warm to-myai-accent-warm-2 text-black text-xs font-bold">
                      Pro
                    </div>
                  )}
                  
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{getTypeIcon(resource.type)}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{resource.title}</h4>
                      <p className="text-sm text-gray-400 mb-3">{resource.description}</p>
                      <button
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                          resource.isPro && !isAuthenticated
                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                            : 'bg-white/10 hover:bg-white/20 border border-white/10'
                        }`}
                        disabled={resource.isPro && !isAuthenticated}
                      >
                        {resource.isPro && !isAuthenticated ? '🔒 Locked' : 'Download'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA if not authenticated */}
        {isVaultOpen && !isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-12 text-center"
          >
            <div className="inline-block p-6 rounded-2xl bg-gradient-to-br from-myai-primary/20 to-myai-accent/20 border border-white/10">
              <h3 className="text-xl font-bold mb-2">Unlock Pro Resources</h3>
              <p className="text-gray-400 mb-4">
                Upgrade to Pro to access exclusive templates, guides, and tools
              </p>
              <a
                href="/pricing"
                className="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-myai-primary to-myai-accent text-white font-bold hover:scale-105 transition-transform"
              >
                View Pricing
              </a>
            </div>
          </motion.div>
        )}
      </div>

      {/* Sign In Modal */}
      <SignInModal isOpen={showSignInModal} onClose={() => setShowSignInModal(false)} />
    </section>
  );
}
