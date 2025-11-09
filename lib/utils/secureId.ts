// Secure ID generation utilities
import { randomBytes } from 'crypto';

/**
 * Generate a cryptographically secure random ID
 * @param prefix - Prefix for the ID (e.g., 'user_', 'job_')
 * @param length - Length of random part (default: 16)
 * @returns Secure random ID
 */
export function generateSecureId(prefix: string = '', length: number = 16): string {
  const randomPart = randomBytes(length).toString('base64url').substring(0, length);
  return `${prefix}${Date.now()}_${randomPart}`;
}

/**
 * Generate a secure session token
 * @returns Cryptographically secure session token
 */
export function generateSessionToken(): string {
  return `session_${Date.now()}_${randomBytes(24).toString('base64url')}`;
}

/**
 * Generate a secure random string
 * @param length - Length of the random string
 * @returns Cryptographically secure random string
 */
export function generateSecureRandom(length: number = 32): string {
  return randomBytes(length).toString('base64url').substring(0, length);
}
