/**
 * Authentication Utilities
 * Server-side helpers for extracting and validating user identity
 */

import { NextRequest } from 'next/server';

/**
 * Extract user ID from Supabase Auth token
 * In production, this would validate the JWT and extract the user ID
 * For now, we'll support both Authorization header and form data
 * 
 * @param request - Next.js request object
 * @returns userId or null if not authenticated
 */
export async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  // Try to get from Authorization header (Supabase Auth pattern)
  const authHeader = request.headers.get('authorization');
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // In production, validate JWT token with Supabase
    // const token = authHeader.substring(7);
    // const { data: { user }, error } = await supabase.auth.getUser(token);
    // if (user) return user.id;
    
    // For development: extract from mock session or form data
    // This maintains backward compatibility
  }

  // Fallback: check if userId is in form data (for testing/backward compatibility)
  // In production, remove this fallback and require proper auth
  try {
    if (request.headers.get('content-type')?.includes('multipart/form-data')) {
      const formData = await request.formData();
      const userId = formData.get('userId') as string;
      if (userId) {
        return userId;
      }
    }
  } catch (error) {
    // Ignore form data parsing errors
  }

  return null;
}

/**
 * Require authentication - throws if user is not authenticated
 */
export async function requireAuth(request: NextRequest): Promise<string> {
  const userId = await getUserIdFromRequest(request);
  
  if (!userId) {
    throw new Error('Authentication required');
  }
  
  return userId;
}

/**
 * Get user ID with optional auth
 * Returns null if not authenticated, does not throw
 */
export async function getOptionalUserId(request: NextRequest): Promise<string | null> {
  return getUserIdFromRequest(request);
}
