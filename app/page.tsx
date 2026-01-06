"use client";

import Header from '@/components/Header';
import Hero from '@/sections/Hero';
import PremiumAudioDemo from '@/components/PremiumAudioDemo';
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
import FeaturedShowcase from '@/components/FeaturedShowcase';
import MiniStudio from '@/components/MiniStudio';
import Link from 'next/link';
import Script from 'next/script';

export default function Home() {

  return (
    <>
      {/* JSON-LD Structured Data for SEO */}
      <Script
        id="structured-data-organization"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "MyAiPlug",
            "url": "https://myaiplug.com",
            "logo": "https://myaiplug.com/favicon.svg",
            "description": "Professional AI-powered audio tools for creators. Stem splitting, audio effects, video processing, and content automation.",
            "sameAs": [
              "https://twitter.com/myaiplug",
              "https://github.com/myaiplug"
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "Customer Support",
              "email": "support@myaiplug.com"
            }
          })
        }}
      />
      <Script
        id="structured-data-webapp"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "MyAiPlug",
            "url": "https://myaiplug.com",
            "applicationCategory": "MultimediaApplication",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
              "description": "Free tier available with premium upgrades"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "ratingCount": "1247",
              "bestRating": "5"
            },
            "featureList": [
              "AI-powered stem splitting",
              "Audio effects processing",
              "Video content creation",
              "Social media automation",
              "Professional audio quality control"
            ]
          })
        }}
      />
      <Script
        id="structured-data-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://myaiplug.com"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Features",
                "item": "https://myaiplug.com/#features"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": "Pricing",
                "item": "https://myaiplug.com/#pricing"
              },
              {
                "@type": "ListItem",
                "position": 4,
                "name": "Blog",
                "item": "https://myaiplug.com/blog"
              }
            ]
          })
        }}
      />
      <Header />
      <main className="min-h-screen">
        <Hero />
        {/* Premium Audio Effects Demo - Featured */}
        <PremiumAudioDemo />
        <MultiStepFunnel />
        <HowItWorks />
        <ValueTrio />
        <GamificationStrip />
        <Features />
        {/* AI Playground Section */}
        <AIPlayground />
        {/* Audio Demo Section */}
        <MiniStudio />
        <Testimonials />
        <ResourceVault />
        <Pricing />
        <FeaturedShowcase />
        <LeaderboardTeaser />
        <CreatorProfilePreview />
        <BlogSection />
        <FAQ />
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
              <Link 
                href="/privacy" 
                className="hover:text-myai-accent transition-colors underline"
              >
                Privacy Policy
              </Link>
              <Link 
                href="/terms" 
                className="hover:text-myai-accent transition-colors underline"
              >
                Terms of Service
              </Link>
              <Link 
                href="/refund" 
                className="hover:text-myai-accent transition-colors underline"
              >
                Refund & Delivery Policy
              </Link>
              <Link 
                href="/stripe" 
                className="hover:text-myai-accent transition-colors underline"
              >
                Stripe Information
              </Link>
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
