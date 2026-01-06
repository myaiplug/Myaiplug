/**
 * Stripe Integration Service
 * PHASE 2: Minimal Stripe integration for subscriptions
 * 
 * Features:
 * - Single product, single price
 * - No trials, no coupons
 * - Cancel anytime
 */

import { env } from '../config/env';
import { updateMembership, getMembership } from './database';
import type { MembershipTier } from '../types/entitlements';

// Initialize Stripe (server-side only)
// In production, use: import Stripe from 'stripe';
// const stripe = new Stripe(env.stripeSecretKey!, { apiVersion: '2023-10-16' });

/**
 * Stripe Product Configuration
 * PHASE 2: Single product, single price
 */
export const STRIPE_CONFIG = {
  // Product details
  productName: 'MyAiPlug Pro',
  productDescription: 'Unlock unlimited AI audio processing with 5-stem separation',
  
  // Price details (in cents)
  monthlyPriceAmount: 2900, // $29.00/month
  currency: 'usd',
  
  // Features for display
  features: [
    '50 stem separations per day',
    '5-stem model (vocals, drums, bass, instruments, FX)',
    'Up to 10-minute audio files',
    'Async job queue',
    'Priority processing',
  ],
};

/**
 * Create Stripe checkout session
 * Returns checkout URL for redirect
 */
export async function createCheckoutSession(
  userId: string,
  successUrl: string,
  cancelUrl: string
): Promise<{ url: string; sessionId: string }> {
  if (!env.stripeSecretKey || !env.stripePublishableKey) {
    throw new Error('Stripe not configured. Please set STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
  }

  // In production, use actual Stripe SDK:
  // const session = await stripe.checkout.sessions.create({
  //   mode: 'subscription',
  //   customer_email: email, // or use existing customer_id
  //   line_items: [{
  //     price: priceId, // From Stripe Dashboard
  //     quantity: 1,
  //   }],
  //   success_url: successUrl,
  //   cancel_url: cancelUrl,
  //   metadata: { userId },
  // });
  // return { url: session.url!, sessionId: session.id };

  // Phase 2 stub - returns mock checkout URL
  console.log('[Stripe] Creating checkout session for user:', userId);
  console.log('[Stripe] Success URL:', successUrl);
  console.log('[Stripe] Cancel URL:', cancelUrl);
  
  return {
    url: `${successUrl}?session_id=mock_session_${Date.now()}`,
    sessionId: `mock_session_${Date.now()}`,
  };
}

/**
 * Handle successful checkout
 * Called by webhook: checkout.session.completed
 */
export async function handleCheckoutCompleted(
  sessionId: string,
  customerId: string,
  subscriptionId: string,
  customerEmail: string,
  metadata: Record<string, any>
): Promise<void> {
  const userId = metadata.userId;
  
  if (!userId) {
    console.error('[Stripe] checkout.session.completed missing userId in metadata');
    throw new Error('Missing userId in session metadata');
  }

  console.log('[Stripe] Checkout completed:', { userId, customerId, subscriptionId });

  // Update membership to Pro tier
  await updateMembership(userId, 'pro', {
    customerId,
    subscriptionId,
  });

  console.log('[Stripe] Upgraded user to Pro tier:', userId);
}

/**
 * Handle subscription cancellation
 * Called by webhook: customer.subscription.deleted
 */
export async function handleSubscriptionDeleted(
  subscriptionId: string,
  customerId: string
): Promise<void> {
  console.log('[Stripe] Subscription deleted:', { subscriptionId, customerId });

  // Find membership by subscriptionId
  const { getMembershipBySubscriptionId } = await import('./database');
  const membership = await getMembershipBySubscriptionId(subscriptionId);
  
  if (!membership) {
    console.error('[Stripe] No membership found for subscriptionId:', subscriptionId);
    return;
  }

  // Downgrade to free tier
  await updateMembership(membership.userId, 'free', {
    customerId,
    subscriptionId: undefined,
  });
  
  console.log('[Stripe] Downgraded user to free tier:', membership.userId);
}

/**
 * Handle payment failure
 * Called by webhook: invoice.payment_failed
 */
export async function handlePaymentFailed(
  subscriptionId: string,
  customerId: string,
  invoiceId: string
): Promise<void> {
  console.log('[Stripe] Payment failed:', { subscriptionId, customerId, invoiceId });

  // Find membership by subscriptionId
  const { getMembershipBySubscriptionId } = await import('./database');
  const membership = await getMembershipBySubscriptionId(subscriptionId);
  
  if (!membership) {
    console.error('[Stripe] No membership found for subscriptionId:', subscriptionId);
    return;
  }

  // Downgrade to free tier on payment failure
  await updateMembership(membership.userId, 'free', {
    customerId,
    subscriptionId: undefined,
  });
  
  console.log('[Stripe] Downgraded user to free tier (payment failed):', membership.userId);
}

/**
 * Cancel subscription
 * User-initiated cancellation
 */
export async function cancelSubscription(userId: string): Promise<void> {
  const membership = await getMembership(userId);
  
  if (!membership?.stripeSubscriptionId) {
    throw new Error('No active subscription found');
  }

  // In production:
  // await stripe.subscriptions.cancel(membership.stripeSubscriptionId);
  
  console.log('[Stripe] Cancelled subscription:', membership.stripeSubscriptionId);
  
  // Update membership immediately
  await updateMembership(userId, 'free', {
    customerId: membership.stripeCustomerId,
    subscriptionId: undefined,
  });
}

/**
 * Get subscription status
 * For displaying in user profile
 */
export async function getSubscriptionStatus(userId: string): Promise<{
  tier: MembershipTier;
  status: 'active' | 'inactive';
  subscriptionId?: string;
  currentPeriodEnd?: Date;
}> {
  const membership = await getMembership(userId);
  
  if (!membership) {
    return {
      tier: 'free',
      status: 'inactive',
    };
  }

  // In production: Fetch subscription from Stripe
  // const subscription = await stripe.subscriptions.retrieve(membership.stripeSubscriptionId);
  
  return {
    tier: membership.tier,
    status: membership.stripeSubscriptionId ? 'active' : 'inactive',
    subscriptionId: membership.stripeSubscriptionId,
    // currentPeriodEnd: subscription.current_period_end
  };
}

/**
 * Verify webhook signature
 * CRITICAL: Must verify all webhooks are from Stripe
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string
): boolean {
  if (!env.stripeWebhookSecret) {
    console.warn('[Stripe] Webhook secret not configured - skipping verification');
    return true; // In development only
  }

  // In production:
  // try {
  //   stripe.webhooks.constructEvent(payload, signature, env.stripeWebhookSecret);
  //   return true;
  // } catch (err) {
  //   console.error('[Stripe] Webhook signature verification failed:', err);
  //   return false;
  // }

  return true; // Phase 2 stub
}
