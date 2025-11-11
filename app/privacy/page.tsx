"use client";

import Link from 'next/link';
import Header from '@/components/Header';

export default function PrivacyPolicyPage() {
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
              Privacy <span className="gradient-text">Policy</span>
            </h1>
            <p className="text-gray-400">Effective Date: November 9, 2025</p>
          </div>

          {/* Content */}
          <div className="space-y-8 text-gray-300">
            <section>
              <h2 className="text-2xl font-bold mb-4 text-myai-accent">Overview</h2>
              <p className="leading-relaxed">
                MyAiPlug™ respects your privacy. This policy describes how we handle data collected from users.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-myai-accent">Data We Collect</h2>
              <ul className="list-disc list-inside space-y-2 leading-relaxed">
                <li>Account details (name, email)</li>
                <li>Uploaded files for processing</li>
                <li>Usage analytics and performance metrics</li>
                <li>Payment information (handled securely by Stripe)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-myai-accent">How We Use Data</h2>
              <ul className="list-disc list-inside space-y-2 leading-relaxed">
                <li>To operate and improve our services</li>
                <li>To communicate with users</li>
                <li>To process payments securely</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-myai-accent">Data Retention</h2>
              <p className="leading-relaxed">
                Uploaded files are deleted after processing. Account and billing data are retained as required by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-myai-accent">Cookies</h2>
              <p className="leading-relaxed">
                Cookies are used for authentication and analytics. You may disable them in your browser settings.
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
              <Link href="/terms" className="text-myai-accent hover:text-myai-primary transition-colors">
                Terms of Service
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
