/**
 * Upgrade to Pro Button
 * PHASE 2: Minimal upgrade button component
 */

'use client';

import { useState } from 'react';

interface UpgradeButtonProps {
  className?: string;
}

export default function UpgradeButton({ className = '' }: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async () => {
    try {
      setLoading(true);
      setError(null);

      // Call checkout endpoint
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create checkout session');
      }

      const data = await response.json();
      
      // Redirect to Stripe checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      console.error('[Upgrade] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to start checkout');
      setLoading(false);
    }
  };

  return (
    <div className="inline-block">
      <button
        onClick={handleUpgrade}
        disabled={loading}
        className={`px-6 py-3 bg-myai-accent hover:bg-myai-primary transition-colors rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {loading ? 'Loading...' : 'Upgrade to Pro - $29/month'}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}
