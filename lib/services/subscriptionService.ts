// Subscription management service
import type { Subscription, SubscriptionStatus } from '../types';
import { generateSecureId } from '../utils/secureId';

// In-memory storage for subscriptions
const subscriptionsStore = new Map<string, Subscription>();
const userSubscriptionIndex = new Map<string, string>(); // userId -> subscriptionId
const stripeCustomerIndex = new Map<string, string>(); // stripeCustomerId -> userId
const stripeSubscriptionIndex = new Map<string, string>(); // stripeSubscriptionId -> subscriptionId

/**
 * Create or update subscription for a user
 */
export function upsertSubscription(params: {
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  priceId: string;
  status: SubscriptionStatus;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd?: boolean;
}): Subscription {
  const {
    userId,
    stripeCustomerId,
    stripeSubscriptionId,
    priceId,
    status,
    currentPeriodEnd,
    cancelAtPeriodEnd = false,
  } = params;

  // Check if subscription already exists for this Stripe subscription
  const existingSubId = stripeSubscriptionIndex.get(stripeSubscriptionId);
  
  if (existingSubId) {
    // Update existing subscription
    const subscription = subscriptionsStore.get(existingSubId);
    if (subscription) {
      subscription.stripeCustomerId = stripeCustomerId;
      subscription.priceId = priceId;
      subscription.status = status;
      subscription.currentPeriodEnd = currentPeriodEnd;
      subscription.cancelAtPeriodEnd = cancelAtPeriodEnd;
      subscription.updatedAt = new Date();
      return subscription;
    }
  }

  // Create new subscription
  const subscriptionId = generateSecureId('sub_');
  const subscription: Subscription = {
    id: subscriptionId,
    userId,
    stripeCustomerId,
    stripeSubscriptionId,
    priceId,
    status,
    currentPeriodEnd,
    cancelAtPeriodEnd,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Store and index
  subscriptionsStore.set(subscriptionId, subscription);
  userSubscriptionIndex.set(userId, subscriptionId);
  stripeCustomerIndex.set(stripeCustomerId, userId);
  stripeSubscriptionIndex.set(stripeSubscriptionId, subscriptionId);

  return subscription;
}

/**
 * Get subscription by user ID
 */
export function getSubscriptionByUserId(userId: string): Subscription | null {
  const subscriptionId = userSubscriptionIndex.get(userId);
  if (!subscriptionId) {
    return null;
  }
  return subscriptionsStore.get(subscriptionId) || null;
}

/**
 * Get subscription by Stripe subscription ID
 */
export function getSubscriptionByStripeId(stripeSubscriptionId: string): Subscription | null {
  const subscriptionId = stripeSubscriptionIndex.get(stripeSubscriptionId);
  if (!subscriptionId) {
    return null;
  }
  return subscriptionsStore.get(subscriptionId) || null;
}

/**
 * Get user ID by Stripe customer ID
 */
export function getUserIdByStripeCustomer(stripeCustomerId: string): string | null {
  return stripeCustomerIndex.get(stripeCustomerId) || null;
}

/**
 * Check if user has active subscription
 */
export function hasActiveSubscription(userId: string): boolean {
  const subscription = getSubscriptionByUserId(userId);
  if (!subscription) {
    return false;
  }
  return subscription.status === 'active' || subscription.status === 'trialing';
}

/**
 * Update subscription status
 */
export function updateSubscriptionStatus(
  stripeSubscriptionId: string,
  status: SubscriptionStatus,
  currentPeriodEnd?: Date
): Subscription | null {
  const subscriptionId = stripeSubscriptionIndex.get(stripeSubscriptionId);
  if (!subscriptionId) {
    return null;
  }

  const subscription = subscriptionsStore.get(subscriptionId);
  if (!subscription) {
    return null;
  }

  subscription.status = status;
  if (currentPeriodEnd) {
    subscription.currentPeriodEnd = currentPeriodEnd;
  }
  subscription.updatedAt = new Date();

  return subscription;
}

/**
 * Cancel subscription
 */
export function cancelSubscription(stripeSubscriptionId: string): Subscription | null {
  return updateSubscriptionStatus(stripeSubscriptionId, 'canceled');
}

/**
 * Get all subscriptions (admin function)
 */
export function getAllSubscriptions(): Subscription[] {
  return Array.from(subscriptionsStore.values());
}
