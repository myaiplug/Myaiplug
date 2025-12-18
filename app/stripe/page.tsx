"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';

export default function StripePage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'cancelled' | 'info'>('info');

  useEffect(() => {
    // Check for success/cancelled query params
    if (searchParams.get('success') === 'true') {
      setStatus('success');
    } else if (searchParams.get('cancelled') === 'true') {
      setStatus('cancelled');
    }
  }, [searchParams]);

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

          {/* Success Message */}
          {status === 'success' && (
            <div className="mb-12 p-6 bg-green-500/10 border border-green-500/30 rounded-lg">
              <h1 className="text-3xl font-display font-bold mb-4 text-green-400">
                🎉 Welcome to Pro!
              </h1>
              <p className="text-gray-300 leading-relaxed">
                Your subscription has been activated successfully. You now have access to:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 text-gray-300">
                <li>50 stem separations per day</li>
                <li>5-stem model (vocals, drums, bass, instruments, FX)</li>
                <li>Up to 10-minute audio files</li>
                <li>Priority processing</li>
              </ul>
              <Link 
                href="/dashboard" 
                className="inline-block mt-6 px-6 py-3 bg-myai-accent hover:bg-myai-primary transition-colors rounded-lg font-semibold"
              >
                Go to Dashboard
              </Link>
            </div>
          )}

          {/* Cancelled Message */}
          {status === 'cancelled' && (
            <div className="mb-12 p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <h1 className="text-3xl font-display font-bold mb-4 text-yellow-400">
                Checkout Cancelled
              </h1>
              <p className="text-gray-300 leading-relaxed">
                Your checkout was cancelled. No charges have been made to your account.
              </p>
              <Link 
                href="/" 
                className="inline-block mt-6 px-6 py-3 bg-myai-accent hover:bg-myai-primary transition-colors rounded-lg font-semibold"
              >
                Return Home
              </Link>
            </div>
          )}

          {/* Page Header */}
          {status === 'info' && (
            <div className="mb-12">
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                Stripe <span className="gradient-text">Payment Information</span>
              </h1>
            </div>
          )}

          {/* Content */}
          <div className="space-y-8 text-gray-300">
            <section>
              <h2 className="text-2xl font-bold mb-4 text-myai-accent">Secure Payment Processing</h2>
              <p className="leading-relaxed">
                MyAiPlug™ uses Stripe as our payment processor to ensure secure and reliable transactions. Stripe is a PCI-DSS Level 1 certified payment service provider, the highest level of certification available in the payments industry.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-myai-accent">What is Stripe?</h2>
              <p className="leading-relaxed">
                Stripe is a leading online payment processing platform trusted by millions of businesses worldwide. It handles all credit card and payment processing for MyAiPlug, ensuring your financial information is protected with industry-leading security measures.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-myai-accent">Payment Security</h2>
              <ul className="list-disc list-inside space-y-2 leading-relaxed">
                <li>Your credit card information is never stored on our servers</li>
                <li>All payment data is encrypted using TLS/SSL protocols</li>
                <li>Stripe maintains PCI-DSS compliance for secure payment processing</li>
                <li>Advanced fraud detection and prevention systems protect your transactions</li>
                <li>Two-factor authentication available for added security</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-myai-accent">Accepted Payment Methods</h2>
              <p className="leading-relaxed mb-3">
                Through Stripe, we accept the following payment methods:
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed">
                <li>Visa, Mastercard, American Express, Discover</li>
                <li>Digital wallets (Apple Pay, Google Pay)</li>
                <li>Bank transfers (where available)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-myai-accent">Subscription Management</h2>
              <p className="leading-relaxed">
                All subscription billing is handled through Stripe. You can manage your subscription, update payment methods, and view billing history directly from your account dashboard. Subscriptions automatically renew unless canceled before the next billing cycle.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-myai-accent">Billing Support</h2>
              <p className="leading-relaxed">
                For billing inquiries, disputes, or payment issues, please contact our support team. We work closely with Stripe to resolve any payment-related concerns quickly and efficiently.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-myai-accent">Contact</h2>
              <p className="leading-relaxed">
                For payment-related questions, email: <a href="mailto:support@myaiplug.com" className="text-myai-accent hover:text-myai-primary transition-colors hover:underline">support@myaiplug.com</a>
              </p>
              <p className="leading-relaxed mt-4">
                Learn more about Stripe security: <a href="https://stripe.com/docs/security/stripe" target="_blank" rel="noopener noreferrer" className="text-myai-accent hover:text-myai-primary transition-colors hover:underline">stripe.com/security</a>
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
              <Link href="/refund" className="text-myai-accent hover:text-myai-primary transition-colors">
                Refund & Delivery Policy
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
