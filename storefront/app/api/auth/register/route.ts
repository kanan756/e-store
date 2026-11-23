import { NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { getCustomerByEmail, getCustomerByUsername, appendCustomer } from "@/lib/sheets"
import { rateLimit } from "@/lib/rate-limit"

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "info@claspo.store").trim().toLowerCase()

const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters").max(100),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  phoneNumber: z.string().trim().min(7, "Please enter a valid phone number").max(20),
  email: z.string().trim().email("Please enter a valid email address").max(254),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
  terms: z.boolean().refine((val) => val === true, "You must agree to the Terms and Conditions"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export async function POST(request: Request) {
  // Rate limit: max 10 registrations per 15 minutes per IP
  const { success, resetAt } = rateLimit(request, { key: "customer-register", limit: 10, windowMs: 15 * 60_000 })
  if (!success) {
    const retryAfter = Math.ceil((resetAt - Date.now()) / 1000)
    return NextResponse.json(
      { error: `Too many registration attempts. Please try again in ${retryAfter}s.` },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    )
  }

  try {
    const body = await request.json()
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Invalid input data"
      return NextResponse.json({ error: firstError }, { status: 400 })
    }

    const { fullName, username, phoneNumber, email, password } = parsed.data
    const cleanEmail = email.toLowerCase()
    const cleanUsername = username.toLowerCase()

    // 1. Prevent customer registering as admin email
    if (cleanEmail === ADMIN_EMAIL) {
      return NextResponse.json({ error: "Registration is not permitted with this email address" }, { status: 400 })
    }

    // 2. Check duplicate email
    const existingEmail = await getCustomerByEmail(cleanEmail)
    if (existingEmail) {
      return NextResponse.json({ error: "An account with this email address already exists" }, { status: 409 })
    }

    // 3. Check duplicate username
    const existingUser = await getCustomerByUsername(cleanUsername)
    if (existingUser) {
      return NextResponse.json({ error: "This username is already taken. Please choose another." }, { status: 409 })
    }

    // 4. Hash password
    const passwordHash = await bcrypt.hash(password, 10)
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    const now = new Date().toISOString()

    // 5. Append customer to database (Google Sheets / local fallback)
    const created = await appendCustomer({
      userId,
      fullName,
      username: cleanUsername,
      phoneNumber,
      email: cleanEmail,
      passwordHash,
      provider: "credentials",
      role: "customer",
      createdAt: now,
      updatedAt: now,
    })

    return NextResponse.json({
      success: true,
      message: "Account created successfully",
      user: {
        id: created.userId,
        email: created.email,
        name: created.fullName,
        username: created.username,
      },
    })
  } catch (err) {
    console.error("Registration error:", err)
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 })
  }
}
