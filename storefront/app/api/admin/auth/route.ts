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

  const { password } = await request.json()

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 })
  }

  const response = NextResponse.json({ success: true })
  const cookieStore = await cookies()
  cookieStore.set("admin_session", "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8, // 8 hours
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
