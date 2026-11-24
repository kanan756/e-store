import { NextResponse } from "next/server"
import crypto from "crypto"
import { z } from "zod"
import bcrypt from "bcryptjs"
import {
  getUserByEmail,
  updateUser,
  getPasswordResetByTokenHash,
  markPasswordResetAsUsed,
  logUserActivity,
} from "@/lib/sheets"
import { rateLimit } from "@/lib/rate-limit"

const resetSchema = z.object({
  email: z.string().trim().email(),
  token: z.string().min(10, "Invalid reset token"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export async function POST(request: Request) {
  // Rate limit: max 5 attempts per 15 minutes
  const { success, resetAt } = rateLimit(request, { key: "reset-password", limit: 5, windowMs: 15 * 60_000 })
  if (!success) {
    const retryAfter = Math.ceil((resetAt - Date.now()) / 1000)
    return NextResponse.json(
      { error: `Too many attempts. Please try again in ${retryAfter}s.` },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    )
  }

  try {
    const body = await request.json()
    const parsed = resetSchema.safeParse(body)
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message || "Invalid input"
      return NextResponse.json({ error: msg }, { status: 400 })
    }

    const { email, token, password } = parsed.data
    const cleanEmail = email.toLowerCase()

    // 1. Compute SHA-256 token hash to look up in Password Reset sheet
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex")
    const resetRecord = await getPasswordResetByTokenHash(tokenHash, cleanEmail)

    if (!resetRecord) {
      return NextResponse.json({ error: "Password reset link is invalid or has expired." }, { status: 400 })
    }

    if (resetRecord.used === "true") {
      return NextResponse.json({ error: "This password reset link has already been used." }, { status: 400 })
    }

    if (!resetRecord.expiresAt || new Date(resetRecord.expiresAt).getTime() < Date.now()) {
      return NextResponse.json({ error: "Password reset link has expired. Please request a new one." }, { status: 400 })
    }

    // 2. Fetch User from Users sheet
    const user = await getUserByEmail(cleanEmail)
    if (!user) {
      return NextResponse.json({ error: "User account could not be found." }, { status: 404 })
    }

    // 3. Hash new password
    const newPasswordHash = await bcrypt.hash(password, 10)

    // 4. Update user's passwordHash in Users sheet
    await updateUser(user.userId, {
      passwordHash: newPasswordHash,
    })

    // 5. Mark reset token as used in Password Reset sheet
    await markPasswordResetAsUsed(resetRecord.resetId)

    // 6. Log activity
    await logUserActivity(
      user.userId,
      "PASSWORD_RESET_SUCCESS",
      "Customer completed password reset successfully"
    ).catch(() => {})

    return NextResponse.json({
      success: true,
      message: "Password reset successful! You can now log in with your new password.",
    })
  } catch (err) {
    console.error("Reset password error:", err)
    return NextResponse.json({ error: "Failed to reset password. Please try again." }, { status: 500 })
  }
}
