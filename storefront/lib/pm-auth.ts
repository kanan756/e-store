/**
 * @file lib/pm-auth.ts
 * @description Dedicated private authentication service for CLASPO Product Management Portal.
 * 
 * Security Architecture:
 * - Single authorized account (info@claspo.store)
 * - Server-side bcrypt password hash validation
 * - Cryptographically signed HTTP-only, SameSite=Lax session cookies
 * - 8-hour session expiration
 * - Built-in rate limiting for failed authentication attempts
 * - Strict separation from customer NextAuth sessions
 */

import crypto from "crypto"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const PM_COOKIE_NAME = "claspo_pm_session"
const SESSION_DURATION_SECONDS = 8 * 60 * 60 // 8 hours

export interface PMSession {
  email: string
  role: "product_manager"
  issuedAt: number
  expiresAt: number
}

// In-memory rate limiting map for login attempts: ip -> { count, resetAt }
const loginAttempts = new Map<string, { count: number; resetAt: number }>()

function getSecretKey(): string {
  return (
    process.env.PRODUCT_MANAGER_SESSION_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "claspo_secure_pm_default_token_secret_2026_x!"
  )
}

/**
 * Sign session data with HMAC-SHA256
 */
export function signPMSession(session: PMSession): string {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url")
  const hmac = crypto.createHmac("sha256", getSecretKey())
  hmac.update(payload)
  const signature = hmac.digest("base64url")
  return `${payload}.${signature}`
}

/**
 * Verify and decode session token
 */
export function verifyPMSessionToken(token: string): PMSession | null {
  if (!token || typeof token !== "string" || !token.includes(".")) {
    return null
  }

  const [payload, signature] = token.split(".")
  if (!payload || !signature) return null

  const hmac = crypto.createHmac("sha256", getSecretKey())
  hmac.update(payload)
  const expectedSig = hmac.digest("base64url")

  // Constant-time comparison to prevent timing attacks
  const sigBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expectedSig)

  if (sigBuffer.length !== expectedBuffer.length) {
    return null
  }

  if (!crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
    return null
  }

  try {
    const session: PMSession = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"))
    const now = Math.floor(Date.now() / 1000)

    if (session.expiresAt < now) {
      return null // Expired
    }

    if (session.role !== "product_manager") {
      return null
    }

    const authorizedEmail = (process.env.PRODUCT_MANAGER_EMAIL || "info@claspo.store").trim().toLowerCase()
    if (session.email.toLowerCase() !== authorizedEmail) {
      return null
    }

    return session
  } catch {
    return null
  }
}

/**
 * Check and record login rate limiting (max 5 failed attempts per 15 minutes per IP)
 */
export function checkPMLoginRateLimit(ip: string): { allowed: boolean; remainingSeconds?: number } {
  const now = Date.now()
  const entry = loginAttempts.get(ip)

  if (!entry) {
    return { allowed: true }
  }

  if (now > entry.resetAt) {
    loginAttempts.delete(ip)
    return { allowed: true }
  }

  if (entry.count >= 5) {
    return {
      allowed: false,
      remainingSeconds: Math.ceil((entry.resetAt - now) / 1000),
    }
  }

  return { allowed: true }
}

export function recordFailedPMLoginAttempt(ip: string): void {
  const now = Date.now()
  const entry = loginAttempts.get(ip)
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 })
  } else {
    entry.count += 1
  }
}

export function clearPMLoginAttempts(ip: string): void {
  loginAttempts.delete(ip)
}

/**
 * Validate submitted credentials against server environment configuration
 */
export async function authenticateProductManager(
  email: string,
  pass: string,
  ip = "unknown"
): Promise<{ success: boolean; error?: string; session?: PMSession }> {
  const rateLimit = checkPMLoginRateLimit(ip)
  if (!rateLimit.allowed) {
    return {
      success: false,
      error: `Too many failed login attempts. Please try again in ${rateLimit.remainingSeconds} seconds.`,
    }
  }

  const authorizedEmail = (process.env.PRODUCT_MANAGER_EMAIL || "info@claspo.store").trim().toLowerCase()
  const cleanEmail = email.trim().toLowerCase()

  if (cleanEmail !== authorizedEmail) {
    recordFailedPMLoginAttempt(ip)
    return { success: false, error: "Invalid credentials or unauthorized account." }
  }

  const passwordHash = (process.env.PRODUCT_MANAGER_PASSWORD_HASH || "").replace(/^"|"$/g, "").trim()
  if (!passwordHash) {
    return {
      success: false,
      error: "Product manager password hash is not configured in server environment.",
    }
  }

  const isValidPassword = await bcrypt.compare(pass, passwordHash).catch(() => false)
  if (!isValidPassword) {
    recordFailedPMLoginAttempt(ip)
    return { success: false, error: "Invalid credentials or unauthorized account." }
  }

  // Clear failed attempt tracking on successful login
  clearPMLoginAttempts(ip)

  const now = Math.floor(Date.now() / 1000)
  const session: PMSession = {
    email: authorizedEmail,
    role: "product_manager",
    issuedAt: now,
    expiresAt: now + SESSION_DURATION_SECONDS,
  }

  return { success: true, session }
}

/**
 * Helper to get current manager session in server components or route handlers
 */
export async function getProductManagerSession(): Promise<PMSession | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(PM_COOKIE_NAME)?.value
    if (!token) return null
    return verifyPMSessionToken(token)
  } catch {
    return null
  }
}

/**
 * Set HTTP-only secure session cookie on a NextResponse
 */
export function setPMSessionCookie(response: NextResponse, token: string): void {
  const isProduction = process.env.NODE_ENV === "production"
  response.cookies.set({
    name: PM_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  })
}

/**
 * Clear the session cookie on logout
 */
export function clearPMSessionCookie(response: NextResponse): void {
  response.cookies.set({
    name: PM_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })
}
