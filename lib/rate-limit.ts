/**
 * Rate limiting utilities to prevent DDoS and abuse
 * Uses in-memory Map for simplicity (consider Redis for production with multiple servers)
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Cleanup old entries every 5 minutes
if (typeof window === 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetAt < now) {
        rateLimitStore.delete(key)
      }
    }
  }, 5 * 60 * 1000)
}

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the time window
   * @default 60
   */
  maxRequests?: number

  /**
   * Time window in milliseconds
   * @default 60000 (1 minute)
   */
  windowMs?: number

  /**
   * Unique identifier for this rate limiter (e.g., 'api', 'auth', 'search')
   * @default 'default'
   */
  namespace?: string
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetAt: number
}

/**
 * Check if a request is within rate limits
 * @param identifier - Unique identifier for the client (e.g., IP address, user ID)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = {}
): RateLimitResult {
  const {
    maxRequests = 60,
    windowMs = 60000, // 1 minute
    namespace = 'default'
  } = config

  const key = `${namespace}:${identifier}`
  const now = Date.now()

  const entry = rateLimitStore.get(key)

  // No entry or entry has expired
  if (!entry || entry.resetAt < now) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + windowMs
    }
    rateLimitStore.set(key, newEntry)

    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      resetAt: newEntry.resetAt
    }
  }

  // Entry exists and is still valid
  if (entry.count >= maxRequests) {
    return {
      success: false,
      limit: maxRequests,
      remaining: 0,
      resetAt: entry.resetAt
    }
  }

  // Increment count
  entry.count++

  return {
    success: true,
    limit: maxRequests,
    remaining: maxRequests - entry.count,
    resetAt: entry.resetAt
  }
}

/**
 * Get client identifier from request headers
 * Uses X-Forwarded-For if behind a proxy, otherwise uses X-Real-IP or a fallback
 */
export function getClientIdentifier(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) {
    // X-Forwarded-For can contain multiple IPs, use the first one
    return forwarded.split(',')[0].trim()
  }

  const realIp = headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  // Fallback to a random identifier (not ideal but better than nothing)
  return 'unknown-client'
}

/**
 * Rate limit configurations for different endpoints
 */
export const RATE_LIMITS = {
  // Authentication endpoints
  auth: {
    maxRequests: 10,
    windowMs: 60000, // 10 requests per minute
    namespace: 'auth'
  },

  // Search endpoints
  search: {
    maxRequests: 30,
    windowMs: 60000, // 30 requests per minute
    namespace: 'search'
  },

  // Bulk operations
  bulk: {
    maxRequests: 20,
    windowMs: 60000, // 20 requests per minute
    namespace: 'bulk'
  },

  // General API
  api: {
    maxRequests: 60,
    windowMs: 60000, // 60 requests per minute
    namespace: 'api'
  },

  // Public endpoints (more permissive)
  public: {
    maxRequests: 100,
    windowMs: 60000, // 100 requests per minute
    namespace: 'public'
  }
} as const

/**
 * Reset rate limit for a specific identifier
 * Useful for testing or manual intervention
 */
export function resetRateLimit(identifier: string, namespace: string = 'default'): void {
  const key = `${namespace}:${identifier}`
  rateLimitStore.delete(key)
}

/**
 * Get current rate limit status without incrementing
 */
export function getRateLimitStatus(
  identifier: string,
  config: RateLimitConfig = {}
): RateLimitResult {
  const {
    maxRequests = 60,
    namespace = 'default'
  } = config

  const key = `${namespace}:${identifier}`
  const now = Date.now()

  const entry = rateLimitStore.get(key)

  if (!entry || entry.resetAt < now) {
    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests,
      resetAt: now + (config.windowMs || 60000)
    }
  }

  return {
    success: entry.count < maxRequests,
    limit: maxRequests,
    remaining: Math.max(0, maxRequests - entry.count),
    resetAt: entry.resetAt
  }
}
