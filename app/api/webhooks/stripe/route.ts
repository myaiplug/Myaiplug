import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { env } from '@/lib/config/env';
import {
  upsertSubscription,
  updateSubscriptionStatus,
  getUserIdByStripeCustomer,
  getSubscriptionByStripeId,
} from '@/lib/services/subscriptionService';
import { grantMonthlyProTokens, freezeTokenUsage, unfreezeTokenUsage } from '@/lib/services/tokenService';
import { syncUserTierWithSubscription, getUserByEmail } from '@/lib/services/userService';

// Initialize Stripe
const stripe = env.stripeSecretKey ? new Stripe(env.stripeSecretKey, {
  apiVersion: '2024-12-18.acacia',
}) : null;

/**
 * Read the raw body from the request
 */
async function getRawBody(request: NextRequest): Promise<string> {
  const text = await request.text();
  return text;
}

/**
 * Stripe webhook handler
 */
export async function POST(request: NextRequest) {
  // Check if Stripe is configured
  if (!stripe || !env.stripeWebhookSecret) {
    console.error('Stripe not configured');
    return NextResponse.json(
      { error: 'Stripe not configured' },
      { status: 500 }
    );
  }

  try {
    // Get raw body and signature
    const rawBody = await getRawBody(request);
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('Missing Stripe signature');
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        env.stripeWebhookSecret
      );
    } catch (err) {
      const error = err as Error;
      console.error('Webhook signature verification failed:', error.message);
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${error.message}` },
        { status: 400 }
      );
    }

    // Log event for debugging
    console.log(`Received Stripe event: ${event.type}`);

    // Handle the event
    try {
      switch (event.type) {
        case 'customer.subscription.created':
          await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.updated':
          await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.deleted':
          await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;

        case 'invoice.payment_succeeded':
          await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;

        case 'invoice.payment_failed':
          await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (err) {
      const error = err as Error;
      console.error(`Error handling event ${event.type}:`, error);
      return NextResponse.json(
        { error: `Error processing event: ${error.message}` },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    const error = err as Error;
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: `Webhook error: ${error.message}` },
      { status: 500 }
    );
  }
}

/**
 * Handle customer.subscription.created event
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('Processing subscription.created:', subscription.id);

  const userId = await getUserIdFromSubscription(subscription);
  if (!userId) {
    console.error('Could not find user for subscription:', subscription.id);
    return;
  }

  // Ensure subscription has at least one item before accessing it
  const firstItem = subscription.items?.data && subscription.items.data.length > 0
    ? subscription.items.data[0]
    : null;

  if (!firstItem || !firstItem.price) {
    console.error('Subscription has no valid items or price information:', subscription.id);
    return;
  }

  // Create subscription record
  const priceId = typeof firstItem.price === 'string'
    ? firstItem.price
    : firstItem.price.id;

  upsertSubscription({
    userId,
    stripeCustomerId: typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id,
    stripeSubscriptionId: subscription.id,
    priceId,
    status: subscription.status,
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  });

  // Update user tier
  syncUserTierWithSubscription(userId);

  // Grant initial tokens with idempotency check
  const grant = grantMonthlyProTokens(
    userId, 
    subscription.id,
    new Date(subscription.current_period_end * 1000)
  );
  if (grant) {
    console.log(`Granted ${grant.amount} tokens to user ${userId}`);
  }

  console.log(`Subscription created for user ${userId}`);
}

/**
 * Handle customer.subscription.updated event
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Processing subscription.updated:', subscription.id);

  const userId = await getUserIdFromSubscription(subscription);
  if (!userId) {
    console.error('Could not find user for subscription:', subscription.id);
    return;
  }

  // Update subscription record
  const priceId = typeof subscription.items.data[0].price === 'string'
    ? subscription.items.data[0].price
    : subscription.items.data[0].price.id;

  upsertSubscription({
    userId,
    stripeCustomerId: typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id,
    stripeSubscriptionId: subscription.id,
    priceId,
    status: subscription.status,
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  });

  // Update user tier based on subscription status
  syncUserTierWithSubscription(userId);

  console.log(`Subscription updated for user ${userId}, status: ${subscription.status}`);
}

/**
 * Handle customer.subscription.deleted event
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Processing subscription.deleted:', subscription.id);

  const userId = await getUserIdFromSubscription(subscription);
  if (!userId) {
    console.error('Could not find user for subscription:', subscription.id);
    return;
  }

  // Update subscription status
  updateSubscriptionStatus(subscription.id, 'canceled');

  // Downgrade user to free tier
  syncUserTierWithSubscription(userId);

  console.log(`Subscription deleted for user ${userId}, downgraded to free tier`);
}

/**
 * Handle invoice.payment_succeeded event
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Processing invoice.payment_succeeded:', invoice.id);

  // Only process subscription invoices
  if (!invoice.subscription) {
    console.log('Invoice is not for a subscription, skipping');
    return;
  }

  const subscriptionId = typeof invoice.subscription === 'string'
    ? invoice.subscription
    : invoice.subscription.id;

  const subscription = getSubscriptionByStripeId(subscriptionId);
  if (!subscription) {
    console.error('Subscription not found:', subscriptionId);
    return;
  }

  // Mark subscription as active
  updateSubscriptionStatus(subscriptionId, 'active');

  // Update user tier
  syncUserTierWithSubscription(subscription.userId);

  // Unfreeze token usage if it was frozen
  unfreezeTokenUsage(subscription.userId);

  // Grant monthly tokens with idempotency check for renewals
  const isRenewal = invoice.billing_reason === 'subscription_cycle';
  if (isRenewal) {
    const periodEnd = invoice.period_end ? new Date(invoice.period_end * 1000) : undefined;
    const grant = grantMonthlyProTokens(subscription.userId, subscriptionId, periodEnd);
    if (grant) {
      console.log(`Granted ${grant.amount} monthly tokens to user ${subscription.userId}`);
    } else {
      console.log(`Tokens already granted for this period for user ${subscription.userId}`);
    }
  }

  console.log(`Payment succeeded for subscription ${subscriptionId}`);
}

/**
 * Handle invoice.payment_failed event
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Processing invoice.payment_failed:', invoice.id);

  // Only process subscription invoices
  if (!invoice.subscription) {
    console.log('Invoice is not for a subscription, skipping');
    return;
  }

  const subscriptionId = typeof invoice.subscription === 'string'
    ? invoice.subscription
    : invoice.subscription.id;

  const subscription = getSubscriptionByStripeId(subscriptionId);
  if (!subscription) {
    console.error('Subscription not found:', subscriptionId);
    return;
  }

  // Mark subscription as past_due
  updateSubscriptionStatus(subscriptionId, 'past_due');

  // Freeze token usage (but don't delete data)
  freezeTokenUsage(subscription.userId);

  console.log(`Payment failed for subscription ${subscriptionId}, tokens frozen`);
}

/**
 * Get user ID from Stripe subscription
 */
async function getUserIdFromSubscription(subscription: Stripe.Subscription): Promise<string | null> {
  const customerId = typeof subscription.customer === 'string'
    ? subscription.customer
    : subscription.customer.id;

  // First, try to get user from our subscription records
  let userId = getUserIdByStripeCustomer(customerId);
  if (userId) {
    return userId;
  }

  // If not found, try to get from Stripe customer metadata
  if (!stripe) return null;

  try {
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) {
      return null;
    }

    // Check metadata for user_id
    if (customer.metadata?.user_id) {
      return customer.metadata.user_id;
    }

    // Fallback: try to find user by email
    if (customer.email) {
      const user = getUserByEmail(customer.email);
      if (user) {
        return user.id;
      }
    }
  } catch (err) {
    console.error('Error retrieving Stripe customer:', err);
  }

  return null;
}
