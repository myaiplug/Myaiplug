import Hero from '@/sections/Hero';
import Features from '@/sections/Features';
import MiniStudio from '@/components/MiniStudio';
import Testimonials from '@/sections/Testimonials';
import Pricing from '@/sections/Pricing';
import CTA from '@/sections/CTA';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Features />
  {/* NoDAW Demo section placeholder or component goes here */}
      <Testimonials />
      <Pricing />
      <CTA />
      
      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6 mt-20">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-6">
            <h3 className="font-display text-2xl font-bold mb-2">
              MyAiPlug™ <span className="gradient-text">NoDAW</span>
            </h3>
            <p className="text-gray-400 text-sm">
              The Creators Hub for Audio, Video, and AI Tools
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400 mb-6">
            <a href="#" className="hover:text-myai-accent transition-colors">About</a>
            <a href="#" className="hover:text-myai-accent transition-colors">Features</a>
            <a href="#pricing" className="hover:text-myai-accent transition-colors">Pricing</a>
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
  );
}
