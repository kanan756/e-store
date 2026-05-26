/**
 * @file app/api/admin/auth/route.ts
 * @description Admin authentication endpoint.
 *   POST   – Validates the submitted password against ADMIN_PASSWORD env var.
 *            On success, sets an httpOnly, SameSite=strict cookie (`admin_session`)
 *            that expires after 8 hours.
 *   DELETE – Clears the admin session cookie (logout).
 *
 *   Security:
 *     - Rate limited: max 5 login attempts per IP per 5 minutes (brute-force protection)
 *     - Cookie is httpOnly (not accessible to JS), secure in production, SameSite=strict
 *     - Password compared server-side only, never echoed back
 *
 * @owner Heet-P
 * @lastModified May 16, 2026
 */

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { rateLimit } from "@/lib/rate-limit"
import crypto from "crypto"

const SESSION_TTL_MS = 8 * 60 * 60 * 1000 // 8 hours

// Creates a stateless, signed session token that is safe across serverless
// instances — no in-memory store required.
// Format: base64(payload).<hmac-sha256 hex>
// payload: "admin:<expiry unix ms>"
function createAdminToken(): string {
  const expiry  = Date.now() + SESSION_TTL_MS
  const payload = Buffer.from(`admin:${expiry}`).toString("base64url")
  const secret  = process.env.NEXTAUTH_SECRET ?? ""
  const sig     = crypto.createHmac("sha256", secret).update(payload).digest("hex")
  return `${payload}.${sig}`
}

export function verifyAdminToken(token: string): boolean {
  try {
    const [payload, sig] = token.split(".")
    if (!payload || !sig) return false

    const secret      = process.env.NEXTAUTH_SECRET ?? ""
    const expectedSig = crypto.createHmac("sha256", secret).update(payload).digest("hex")

    // Constant-time comparison prevents timing-based token forgery
    const sigMatch = crypto.timingSafeEqual(
      Buffer.from(sig.padEnd(64, "0"), "hex"),
      Buffer.from(expectedSig, "hex")
    )
    if (!sigMatch) return false

    const decoded = Buffer.from(payload, "base64url").toString()
    const expiry  = parseInt(decoded.split(":")[1] ?? "0", 10)
    return Date.now() < expiry
  } catch {
    return false
  }
}

export async function POST(request: Request) {
  // Rate limit: max 5 login attempts per IP per 5 minutes (brute-force protection)
  const { success, resetAt } = rateLimit(request, { key: "admin-login", limit: 5, windowMs: 5 * 60_000 })
  if (!success) {
    const retryAfter = Math.ceil((resetAt - Date.now()) / 1000)
    return NextResponse.json(
      { error: `Too many login attempts. Try again in ${retryAfter}s.` },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    )
  }

  const { email, password } = await request.json()

  if (
    email !== process.env.ADMIN_EMAIL ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
  }

  const response = NextResponse.json({ success: true })
  const cookieStore = await cookies()
  cookieStore.set("admin_session", createAdminToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_MS / 1000,
    path: "/",
    sameSite: "strict",
  })
  return response
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete("admin_session")
  return NextResponse.json({ success: true })
}
