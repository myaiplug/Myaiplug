/**
 * Stripe Checkout API
 * PHASE 2: Create checkout session for Pro subscription
 */

import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession, STRIPE_CONFIG } from '@/lib/services/stripe';
import { getOptionalUserId } from '@/lib/services/auth';

export async function POST(request: NextRequest) {
  try {
    // Get user ID
    const userId = await getOptionalUserId(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get base URL for success/cancel redirects
    const baseUrl = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    // Create checkout session
    const { url, sessionId } = await createCheckoutSession(
      userId,
      `${baseUrl}/stripe?success=true&session_id={CHECKOUT_SESSION_ID}`,
      `${baseUrl}/stripe?cancelled=true`
    );

    return NextResponse.json({
      success: true,
      checkoutUrl: url,
      sessionId,
    });
  } catch (error) {
    console.error('[Checkout] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET - Checkout info
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/stripe/checkout',
    description: 'Create Stripe checkout session for Pro subscription',
    method: 'POST',
    authentication: 'Required',
    product: STRIPE_CONFIG.productName,
    price: `$${(STRIPE_CONFIG.monthlyPriceAmount / 100).toFixed(2)}/month`,
    features: STRIPE_CONFIG.features,
  });
}
