/**
 * @file lib/rate-limit.ts
 * @description Simple in-memory sliding-window rate limiter for Next.js API routes.
 *   Uses a Map keyed by IP address to track request counts within a time window.
 *   Suitable for single-instance deployments (Vercel Serverless / local dev).
 *
 *   Usage:
 *     const { success } = rateLimit(request, { limit: 5, windowMs: 60_000 })
 *     if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 })
 *
 *   Default limits:
 *     - Contact form  : 5 submissions per 60 seconds per IP
 *     - Order POST    : 10 per 60 seconds per IP
 *     - Admin login   : 5 attempts per 5 minutes per IP
 *
 * @owner Heet-P
 * @lastModified May 16, 2026
 */

interface RateLimitEntry {
  count: number      // number of requests made in current window
  resetAt: number    // timestamp (ms) when the window resets
}

// In-memory store — Map<"key:ip", entry>
// Each unique (key + ip) combination has its own counter
const store = new Map<string, RateLimitEntry>()

// Periodically clean up expired entries to avoid memory leaks
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) store.delete(key)
  }
}, 5 * 60 * 1000) // clean every 5 minutes

interface RateLimitOptions {
  limit: number      // max requests allowed per window
  windowMs: number   // time window in milliseconds
  key?: string       // optional namespace (e.g. "contact", "login")
}

interface RateLimitResult {
  success: boolean   // true = request allowed, false = rate limit exceeded
  remaining: number  // how many requests remain in this window
  resetAt: number    // when the window resets (ms timestamp)
}

/**
 * Check whether the incoming request is within the rate limit.
 * @param request - The incoming Next.js Request object
 * @param options - { limit, windowMs, key }
 */
export function rateLimit(request: Request, options: RateLimitOptions): RateLimitResult {
  const { limit, windowMs, key = "default" } = options

  // Extract IP from headers (works on Vercel + local dev)
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "anonymous"

  const storeKey = `${key}:${ip}`
  const now = Date.now()
  const entry = store.get(storeKey)

  if (!entry || entry.resetAt < now) {
    // First request in this window — initialise counter
    const newEntry: RateLimitEntry = { count: 1, resetAt: now + windowMs }
    store.set(storeKey, newEntry)
    return { success: true, remaining: limit - 1, resetAt: newEntry.resetAt }
  }

  if (entry.count >= limit) {
    // Limit exceeded — reject
    return { success: false, remaining: 0, resetAt: entry.resetAt }
  }

  // Increment counter and allow
  entry.count++
  return { success: true, remaining: limit - entry.count, resetAt: entry.resetAt }
}
