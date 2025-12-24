/**
 * Stripe Webhook Handler
 * PHASE 2: Handle subscription events
 * 
 * Handles:
 * - checkout.session.completed
 * - customer.subscription.deleted
 * - invoice.payment_failed
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  handleCheckoutCompleted,
  handleSubscriptionDeleted,
  handlePaymentFailed,
  verifyWebhookSignature,
} from '@/lib/services/stripe';

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('[Webhook] Missing stripe-signature header');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const isValid = verifyWebhookSignature(body, signature);
    if (!isValid) {
      console.error('[Webhook] Invalid signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse event
    const event = JSON.parse(body);
    console.log('[Webhook] Received event:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        await handleCheckoutCompleted(
          session.id,
          session.customer,
          session.subscription,
          session.customer_email,
          session.metadata || {}
        );
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await handleSubscriptionDeleted(
          subscription.id,
          subscription.customer
        );
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        await handlePaymentFailed(
          invoice.subscription,
          invoice.customer,
          invoice.id
        );
        break;
      }

      default:
        console.log('[Webhook] Unhandled event type:', event.type);
        // Return 200 for unhandled events (don't fail)
        return NextResponse.json({ received: true });
    }

    // Success response
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Webhook] Error:', error);
    return NextResponse.json(
      {
        error: 'Webhook handler failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET - Webhook info
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/stripe/webhook',
    description: 'Stripe webhook handler for subscription events',
    events: [
      'checkout.session.completed',
      'customer.subscription.deleted',
      'invoice.payment_failed',
    ],
    note: 'This endpoint must be configured in Stripe Dashboard',
  });
}
