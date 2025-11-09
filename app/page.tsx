import Header from '@/components/Header';
import Hero from '@/sections/Hero';
import MultiStepFunnel from '@/components/MultiStepFunnel';
import ValueTrio from '@/components/ValueTrio';
import Features from '@/sections/Features';
import MiniStudio from '@/components/MiniStudio';
import GamificationStrip from '@/components/GamificationStrip';
import Testimonials from '@/sections/Testimonials';
import Trust from '@/sections/Trust';
import Pricing from '@/sections/Pricing';
import LeaderboardTeaser from '@/components/LeaderboardTeaser';
import CreatorProfilePreview from '@/components/CreatorProfilePreview';
import CTA from '@/sections/CTA';

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <Hero />
        <MultiStepFunnel />
        <ValueTrio />
        <GamificationStrip />
        <Features />
        {/* Demo Section */}
        <section id="demo" className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="font-display text-3xl md:text-4xl font-bold">
                Experience <span className="gradient-text">NoDAW</span>
              </h2>
              <p className="text-gray-400 mt-2">Tweak the knobs and hear changes in real time.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-myai-bg-panel/40 backdrop-blur-xl shadow-[0_10px_60px_-15px_rgba(0,0,0,0.5)] p-4 md:p-6">
              <MiniStudio />
            </div>
          </div>
        </section>
        <Testimonials />
        <Trust />
        <Pricing />
        <LeaderboardTeaser />
        <CreatorProfilePreview />
        <CTA />
        <CTA />
      
        {/* Footer */}
        <footer className="border-t border-white/10 py-12 px-6 mt-20">
          <div className="max-w-6xl mx-auto text-center">
            <div className="mb-6">
              <h3 className="font-display text-2xl font-bold mb-2">
                MyAiPlug™ <span className="gradient-text">NoDAW</span>
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
            
            <div className="text-xs text-gray-500">
              © 2025 MyAiPlug™. All rights reserved. | Plug in. Create. Release. Collect.
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
