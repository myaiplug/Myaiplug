// Token management service
import type { TokenGrant } from '../types';
import { generateSecureId } from '../utils/secureId';

// In-memory storage for tokens
const tokenBalances = new Map<string, number>(); // userId -> balance
const tokenGrants = new Map<string, TokenGrant[]>(); // userId -> grants[]
const tokenFreezes = new Map<string, boolean>(); // userId -> isFrozen
const grantedThisPeriod = new Map<string, Set<string>>(); // userId -> Set<subscriptionId_period>

// Token amounts for different events
export const TOKEN_AMOUNTS = {
  MONTHLY_PRO: 500, // Monthly token grant for Pro subscribers
  SIGNUP_BONUS: 50, // Bonus tokens for new users
} as const;

/**
 * Get token balance for a user
 */
export function getTokenBalance(userId: string): number {
  return tokenBalances.get(userId) || 0;
}

/**
 * Grant tokens to a user
 */
export function grantTokens(params: {
  userId: string;
  amount: number;
  reason: string;
  subscriptionId?: string;
}): TokenGrant {
  const { userId, amount, reason, subscriptionId } = params;

  // Create grant record
  const grant: TokenGrant = {
    id: generateSecureId('grant_'),
    userId,
    amount,
    reason,
    subscriptionId,
    createdAt: new Date(),
  };

  // Update balance
  const currentBalance = tokenBalances.get(userId) || 0;
  tokenBalances.set(userId, currentBalance + amount);

  // Store grant
  const userGrants = tokenGrants.get(userId) || [];
  userGrants.push(grant);
  tokenGrants.set(userId, userGrants);

  return grant;
}

/**
 * Deduct tokens from a user
 */
export function deductTokens(userId: string, amount: number): boolean {
  // Check if user is frozen
  if (isTokenUsageFrozen(userId)) {
    return false; // Cannot use tokens when frozen
  }

  const currentBalance = tokenBalances.get(userId) || 0;
  
  if (currentBalance < amount) {
    return false; // Insufficient balance
  }

  tokenBalances.set(userId, currentBalance - amount);
  return true;
}

/**
 * Set token balance for a user (useful for testing or admin actions)
 */
export function setTokenBalance(userId: string, balance: number): void {
  tokenBalances.set(userId, Math.max(0, balance));
}

/**
 * Freeze token usage (for past_due subscriptions)
 */
export function freezeTokenUsage(userId: string): boolean {
  tokenFreezes.set(userId, true);
  return true;
}

/**
 * Unfreeze token usage
 */
export function unfreezeTokenUsage(userId: string): boolean {
  tokenFreezes.delete(userId);
  return true;
}

/**
 * Check if token usage is frozen for a user
 */
export function isTokenUsageFrozen(userId: string): boolean {
  return tokenFreezes.get(userId) === true;
}

/**
 * Get all token grants for a user
 */
export function getTokenGrants(userId: string): TokenGrant[] {
  return tokenGrants.get(userId) || [];
}

/**
 * Check if user has sufficient tokens
 */
export function hasSufficientTokens(userId: string, required: number): boolean {
  if (isTokenUsageFrozen(userId)) {
    return false;
  }
  const balance = getTokenBalance(userId);
  return balance >= required;
}

/**
 * Grant monthly Pro subscription tokens (with idempotency check)
 */
export function grantMonthlyProTokens(userId: string, subscriptionId: string, periodEnd?: Date): TokenGrant | null {
  // Create idempotency key based on subscription and billing period
  const periodKey = periodEnd ? periodEnd.toISOString().slice(0, 7) : new Date().toISOString().slice(0, 7);
  const idempotencyKey = `${subscriptionId}_${periodKey}`;
  
  // Check if tokens were already granted for this period
  const userGrants = grantedThisPeriod.get(userId) || new Set();
  if (userGrants.has(idempotencyKey)) {
    console.log(`Tokens already granted for ${userId} in period ${periodKey}`);
    return null; // Already granted, skip to prevent duplicates
  }
  
  // Grant tokens
  const grant = grantTokens({
    userId,
    amount: TOKEN_AMOUNTS.MONTHLY_PRO,
    reason: 'Monthly Pro subscription token grant',
    subscriptionId,
  });
  
  // Mark as granted for this period
  userGrants.add(idempotencyKey);
  grantedThisPeriod.set(userId, userGrants);
  
  return grant;
}

/**
 * Grant signup bonus tokens
 */
export function grantSignupBonus(userId: string): TokenGrant {
  return grantTokens({
    userId,
    amount: TOKEN_AMOUNTS.SIGNUP_BONUS,
    reason: 'Welcome bonus',
  });
}
