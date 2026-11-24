import { NextResponse } from "next/server"
import crypto from "crypto"
import { z } from "zod"
import { getUserByEmail, appendPasswordReset, logUserActivity } from "@/lib/sheets"
import { sendPasswordResetEmail } from "@/lib/email"
import { rateLimit } from "@/lib/rate-limit"

const forgotSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
})

export async function POST(request: Request) {
  // Rate limit: max 5 requests per 15 minutes per IP
  const { success, resetAt } = rateLimit(request, { key: "forgot-password", limit: 5, windowMs: 15 * 60_000 })
  if (!success) {
    const retryAfter = Math.ceil((resetAt - Date.now()) / 1000)
    return NextResponse.json(
      { error: `Too many requests. Please try again in ${retryAfter}s.` },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    )
  }

  try {
    const body = await request.json()
    const parsed = forgotSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 })
    }

    const email = parsed.data.email.toLowerCase()
    const user = await getUserByEmail(email)

    // Safe response: Always return success message whether user exists or not,
    // to prevent email enumeration attacks!
    const genericResponse = NextResponse.json({
      success: true,
      message: "If an account with that email address exists, a password reset link has been sent.",
    })

    if (!user) {
      return genericResponse
    }

    // Generate single-use secure random token
    const plainToken = crypto.randomBytes(32).toString("hex")
    // Store only its SHA-256 hash in the Password Reset sheet
    const tokenHash = crypto.createHash("sha256").update(plainToken).digest("hex")
    const resetId = `rst_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour
    const now = new Date().toISOString()

    await appendPasswordReset({
      resetId,
      userId: user.userId,
      email: user.email,
      tokenHash,
      expiresAt,
      used: "false",
      createdAt: now,
    })

    await logUserActivity(
      user.userId,
      "PASSWORD_RESET_REQUEST",
      `Password reset link requested for ${user.email}`
    ).catch(() => {})

    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_STORE_URL || "http://localhost:3000"
    const resetUrl = `${baseUrl}/reset-password?token=${plainToken}&email=${encodeURIComponent(user.email)}`

    // Send email via Nodemailer
    await sendPasswordResetEmail({
      to: user.email,
      name: user.fullName,
      resetUrl,
    })

    return genericResponse
  } catch (err) {
    console.error("Forgot password error:", err)
    return NextResponse.json({ error: "An unexpected error occurred. Please try again." }, { status: 500 })
  }
}
