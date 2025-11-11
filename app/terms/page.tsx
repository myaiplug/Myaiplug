"use client";

import Link from 'next/link';
import Header from '@/components/Header';

export default function TermsOfServicePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen py-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Back Link */}
          <Link 
            href="/" 
            className="inline-flex items-center text-myai-accent hover:text-myai-primary transition-colors mb-8"
          >
            <span className="mr-2">←</span> Back to Home
          </Link>

          {/* Page Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Terms of <span className="gradient-text">Service</span>
            </h1>
            <p className="text-gray-400">Effective Date: November 9, 2025</p>
          </div>

          {/* Content */}
          <div className="space-y-8 text-gray-300">
            <p className="leading-relaxed">
              Welcome to <strong>MyAiPlug™</strong> — an AI-powered creative platform providing tools for audio, video, and image processing.
            </p>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-myai-accent">Overview</h2>
              <p className="leading-relaxed">
                By using MyAiPlug, you agree to these Terms of Service which govern your use of our site and applications.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-myai-accent">Eligibility</h2>
              <p className="leading-relaxed">
                Users must be at least 13 years old and legally able to form a contract.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-myai-accent">Use of Services</h2>
              <ul className="list-disc list-inside space-y-2 leading-relaxed">
                <li>Upload only content you own or have rights to use.</li>
                <li>Do not upload illegal or harmful content.</li>
                <li>Outputs remain your property; we retain processing rights for service operation.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-myai-accent">Accounts & Security</h2>
              <p className="leading-relaxed">
                You are responsible for your login credentials and all activity on your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-myai-accent">Payments & Subscriptions</h2>
              <p className="leading-relaxed">
                Subscriptions and credits are processed securely via Stripe and renew automatically unless canceled prior to renewal.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-myai-accent">Refund Policy</h2>
              <p className="leading-relaxed">
                Refunds are limited to verified technical failures or duplicate billing. See our Refund Policy for details.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-myai-accent">Delivery Policy</h2>
              <p className="leading-relaxed">
                All services are digital and delivered instantly through our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-myai-accent">Intellectual Property</h2>
              <p className="leading-relaxed">
                All software, design, and branding remain the property of MyAiPlug.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-myai-accent">Contact</h2>
              <p className="leading-relaxed">
                Email: <a href="mailto:support@myaiplug.com" className="text-myai-accent hover:text-myai-primary transition-colors hover:underline">support@myaiplug.com</a>
              </p>
            </section>
          </div>

          {/* Footer Navigation */}
          <div className="mt-16 pt-8 border-t border-white/10">
            <div className="flex flex-wrap gap-4 justify-center text-sm">
              <Link href="/privacy" className="text-myai-accent hover:text-myai-primary transition-colors">
                Privacy Policy
              </Link>
              <span className="text-gray-600">•</span>
              <Link href="/refund" className="text-myai-accent hover:text-myai-primary transition-colors">
                Refund & Delivery Policy
              </Link>
              <span className="text-gray-600">•</span>
              <Link href="/stripe" className="text-myai-accent hover:text-myai-primary transition-colors">
                Stripe Information
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
