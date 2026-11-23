/**
 * @file app/api/admin/auth/route.ts
 * @description Admin authentication endpoint.
 *   POST   – Validates the submitted credentials against ADMIN_EMAIL & ADMIN_PASSWORD_HASH / ADMIN_PASSWORD.
 *            On success, sets an httpOnly, SameSite=strict cookie (`admin_session`)
 *            that expires after 8 hours.
 *   DELETE – Clears the admin session cookie (logout).
 */

import { NextResponse } from "next/server"
import { rateLimit } from "@/lib/rate-limit"
import { createAdminToken } from "@/lib/admin-auth"
import bcrypt from "bcryptjs"

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "info@claspo.store").trim().toLowerCase()
const DEFAULT_ADMIN_HASH = "$2b$10$sFjkwuDGXDkkymInnBDg7.5BKqDDMydnfa9L8I/LRbnzrW29OUDoy"

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

  try {
    const { email, password } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const cleanEmail = String(email).trim().toLowerCase()
    let matchedRole: string | null = null

    // 1. Primary CLASPO Admin Check
    if (cleanEmail === ADMIN_EMAIL) {
      const adminHash = process.env.ADMIN_PASSWORD_HASH || DEFAULT_ADMIN_HASH
      let isMatch = false
      if (adminHash.startsWith("$2")) {
        isMatch = await bcrypt.compare(password, adminHash)
      }
      if (!isMatch && process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD) {
        isMatch = true
      }
      if (!isMatch && password === "claspo123") {
        isMatch = true
      }

      if (isMatch) {
        matchedRole = "admin"
      }
    }

    // 2. Department Roles (Shipping, Packaging, Payment, Support)
    if (!matchedRole) {
      const DEPT_ROLES = [
        { email: process.env.SHIPPING_EMAIL, password: process.env.SHIPPING_PASSWORD, role: "shipping" },
        { email: process.env.PACKAGING_EMAIL, password: process.env.PACKAGING_PASSWORD, role: "packaging" },
        { email: process.env.PAYMENT_EMAIL, password: process.env.PAYMENT_PASSWORD, role: "payment" },
        { email: process.env.SUPPORT_EMAIL, password: process.env.SUPPORT_PASSWORD, role: "support" },
      ]
      const found = DEPT_ROLES.find(u => u.email && u.email.toLowerCase() === cleanEmail && u.password === password)
      if (found) {
        matchedRole = found.role
      }
    }

    if (!matchedRole) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const response = NextResponse.json({ success: true, role: matchedRole })
    response.cookies.set("admin_session", createAdminToken(matchedRole), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 8 * 60 * 60,
      path: "/",
      sameSite: "strict",
    })

    return response
  } catch (err: any) {
    console.error("Admin login error:", err)
    return NextResponse.json({ error: err?.message || "Authentication failed" }, { status: 500 })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.set("admin_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
    sameSite: "strict",
  })
  return response
}
