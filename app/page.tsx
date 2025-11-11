"use client";

import { useState } from 'react';
import Header from '@/components/Header';
import Hero from '@/sections/Hero';
import MultiStepFunnel from '@/components/MultiStepFunnel';
import HowItWorks from '@/components/HowItWorks';
import ValueTrio from '@/components/ValueTrio';
import Features from '@/sections/Features';
import AIPlayground from '@/components/AIPlayground';
import GamificationStrip from '@/components/GamificationStrip';
import Testimonials from '@/sections/Testimonials';
import ResourceVault from '@/components/ResourceVault';
import Pricing from '@/sections/Pricing';
import LeaderboardTeaser from '@/components/LeaderboardTeaser';
import CreatorProfilePreview from '@/components/CreatorProfilePreview';
import BlogSection from '@/components/BlogSection';
import FAQ from '@/components/FAQ';
import CTA from '@/sections/CTA';
import LegalModal from '@/components/LegalModal';

export default function Home() {
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState<'privacy' | 'terms' | 'refund'>('privacy');

  const openLegalModal = (type: 'privacy' | 'terms' | 'refund') => {
    setLegalModalType(type);
    setLegalModalOpen(true);
  };

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <Hero />
        <MultiStepFunnel />
        <HowItWorks />
        <ValueTrio />
        <GamificationStrip />
        <Features />
        {/* AI Playground Section */}
        <AIPlayground />
        <Testimonials />
        <ResourceVault />
        <Pricing />
        <LeaderboardTeaser />
        <CreatorProfilePreview />
        <BlogSection />
        <FAQ />
        <CTA />
        <CTA />
      
        {/* Footer */}
        <footer className="border-t border-white/10 py-12 px-6 mt-20">
          <div className="max-w-6xl mx-auto text-center">
            <div className="mb-6">
              <h3 className="font-display text-2xl font-bold mb-2">
                MyAiPlug™
              </h3>
              <p className="text-gray-400 text-sm">
                AI-powered audio/video pipeline with real QC, badges, and a public creator score
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400 mb-6">
              <a href="#how-it-works" className="hover:text-myai-accent transition-colors">How it works</a>
              <a href="#features" className="hover:text-myai-accent transition-colors">Features</a>
              <a href="#pricing" className="hover:text-myai-accent transition-colors">Pricing</a>
              <a href="#gallery" className="hover:text-myai-accent transition-colors">Gallery</a>
              <a href="#leaderboard" className="hover:text-myai-accent transition-colors">Leaderboard</a>
              <a href="#" className="hover:text-myai-accent transition-colors">Documentation</a>
              <a href="#" className="hover:text-myai-accent transition-colors">Support</a>
              <a href="#" className="hover:text-myai-accent transition-colors">Contact</a>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-400 mb-4">
              <button 
                onClick={() => openLegalModal('privacy')} 
                className="hover:text-myai-accent transition-colors underline"
              >
                Privacy Policy
              </button>
              <button 
                onClick={() => openLegalModal('terms')} 
                className="hover:text-myai-accent transition-colors underline"
              >
                Terms of Service
              </button>
              <button 
                onClick={() => openLegalModal('refund')} 
                className="hover:text-myai-accent transition-colors underline"
              >
                Refund & Delivery Policy
              </button>
            </div>
            
            <div className="text-xs text-gray-500">
              © 2025 MyAiPlug™. All rights reserved. | Plug in. Create. Release. Collect.
            </div>
          </div>
        </footer>
      </main>
      
      {/* Legal Modal */}
      <LegalModal 
        isOpen={legalModalOpen} 
        onClose={() => setLegalModalOpen(false)} 
        type={legalModalType} 
      />
    </>
  );
}
