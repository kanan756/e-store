import { NextResponse } from "next/server"
import crypto from "crypto"
import { z } from "zod"
import { getCustomerByEmail, updateCustomer } from "@/lib/sheets"
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
    const customer = await getCustomerByEmail(email)

    // Safe response: Always return success message whether user exists or not,
    // to prevent email enumeration attacks!
    const genericResponse = NextResponse.json({
      success: true,
      message: "If an account with that email address exists, a password reset link has been sent.",
    })

    if (!customer) {
      return genericResponse
    }

    // Generate single-use secure random token and 1-hour expiry
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000).toISOString()

    await updateCustomer(customer.userId, {
      resetToken,
      resetTokenExpiry,
    })

    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_STORE_URL || "http://localhost:3000"
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(customer.email)}`

    // Send email via Nodemailer
    await sendPasswordResetEmail({
      to: customer.email,
      name: customer.fullName,
      resetUrl,
    })

    return genericResponse
  } catch (err) {
    console.error("Forgot password error:", err)
    return NextResponse.json({ error: "An unexpected error occurred. Please try again." }, { status: 500 })
  }
}
