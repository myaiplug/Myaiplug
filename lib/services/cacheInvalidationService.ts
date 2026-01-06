// Cache invalidation service to break circular dependencies
// This module can be imported by both userService and leaderboardService

type CacheType = 'time_saved' | 'referrals' | 'popularity';

// Registry of cache invalidation callbacks
const cacheInvalidationCallbacks = new Map<CacheType, (() => void)[]>();

/**
 * Register a callback to be called when cache is invalidated
 */
export function registerCacheInvalidation(type: CacheType, callback: () => void): void {
  const callbacks = cacheInvalidationCallbacks.get(type) || [];
  callbacks.push(callback);
  cacheInvalidationCallbacks.set(type, callbacks);
}

/**
 * Invalidate cache for a specific type
 */
export function invalidateCache(type?: CacheType): void {
  if (type) {
    const callbacks = cacheInvalidationCallbacks.get(type) || [];
    callbacks.forEach(callback => callback());
  } else {
    // Invalidate all caches
    cacheInvalidationCallbacks.forEach(callbacks => {
      callbacks.forEach(callback => callback());
    });
  }
}
