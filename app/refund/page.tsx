"use client";

import Link from 'next/link';
import Header from '@/components/Header';

export default function RefundPolicyPage() {
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
              Refund & <span className="gradient-text">Delivery Policy</span>
            </h1>
          </div>

          {/* Content */}
          <div className="space-y-8 text-gray-300">
            <section>
              <h2 className="text-2xl font-bold mb-4 text-myai-accent">Refunds</h2>
              <p className="leading-relaxed">
                All purchases and subscriptions are digital and processed instantly. Refunds are issued only for duplicate charges, technical errors, or billing mistakes reported within 7 days.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-myai-accent">Delivery</h2>
              <p className="leading-relaxed">
                Services are delivered digitally. Files are available for download immediately after processing. No physical items are shipped.
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
              <Link href="/terms" className="text-myai-accent hover:text-myai-primary transition-colors">
                Terms of Service
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
