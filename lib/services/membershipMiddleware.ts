/**
 * Membership Middleware
 * Provides middleware functions for protecting audio API endpoints with membership checks
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyMembership, generateLimitExceededMessage } from './verifyMembership';
import { hasExceededLimit, logUsage } from './logUsage';

export interface MembershipCheckResult {
  allowed: boolean;
  membership?: any;
  error?: string;
  remainingUsage?: number;
}

/**
 * Verify membership and check usage limits for an action
 * @param userId - The user ID
 * @param action - The action being performed
 * @param actionKey - The limit key (e.g., 'stemSplitPerDay')
 */
export async function checkMembershipAndUsage(
  userId: string,
  action: 'stem_split' | 'half_screw' | 'clean_audio',
  actionKey: 'stemSplitPerDay' | 'halfScrewPerDay' | 'cleanPerDay'
): Promise<MembershipCheckResult> {
  // Get membership tier
  const membership = await verifyMembership(userId);

  // Check daily limit
  const limit = membership.limits[actionKey];
  const exceeded = hasExceededLimit(userId, action, limit);

  if (exceeded) {
    const errorMessage = generateLimitExceededMessage(membership, action);
    return {
      allowed: false,
      membership,
      error: errorMessage,
      remainingUsage: 0,
    };
  }

  // Calculate remaining usage
  const currentUsage = await import('./logUsage').then(m => m.countUsage(userId, action));
  const remainingUsage = Math.max(0, limit - currentUsage);

  return {
    allowed: true,
    membership,
    remainingUsage,
  };
}

/**
 * Extract user ID from request
 * This is a helper that works with the existing auth system
 */
export function getUserIdFromRequest(request: NextRequest): string | null {
  // Get session token from Authorization header
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  // In a real implementation, we'd validate the token and extract userId
  // For now, we'll accept a userId in the form data or use a demo user
  // This matches the existing auth pattern in the codebase
  
  return null; // Will be populated by the auth middleware
}

/**
 * Create a membership error response
 */
export function createMembershipErrorResponse(
  error: string,
  remainingUsage: number = 0
): NextResponse {
  return NextResponse.json(
    {
      error,
      membershipError: true,
      remainingUsage,
      upgradeUrl: '/pricing',
    },
    { status: 429 }
  );
}

/**
 * Log successful usage after processing
 */
export function logSuccessfulUsage(
  userId: string,
  action: 'stem_split' | 'half_screw' | 'clean_audio',
  endpoint: string,
  metadata?: Record<string, any>
): void {
  logUsage(userId, action, endpoint, metadata);
}
