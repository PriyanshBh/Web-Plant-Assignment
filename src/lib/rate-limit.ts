/**
 * In-memory sliding window rate limiter for auth endpoints.
 * In a distributed multi-instance production setup, this would be backed by Redis / Upstash.
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Periodic cleanup of expired rate limit entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
      if (now > record.resetAt) {
        rateLimitMap.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitOptions {
  windowMs?: number; // Time window in milliseconds (default 60s)
  max?: number;      // Max allowed requests in the window (default 15)
}

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = {}
): { allowed: boolean; remaining: number; resetInMs: number } {
  const windowMs = options.windowMs || 60 * 1000;
  const max = options.max || 15;
  const now = Date.now();

  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return { allowed: true, remaining: max - 1, resetInMs: windowMs };
  }

  if (record.count >= max) {
    return {
      allowed: false,
      remaining: 0,
      resetInMs: Math.max(0, record.resetAt - now),
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: max - record.count,
    resetInMs: Math.max(0, record.resetAt - now),
  };
}
