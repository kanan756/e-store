import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getCustomerByEmail, getCustomerByUsername, updateCustomer } from "@/lib/sheets"
import bcrypt from "bcryptjs"
import { z } from "zod"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const customer = await getCustomerByEmail(session.user.email)
  if (!customer) {
    return NextResponse.json({
      name: session.user.name || "Customer",
      email: session.user.email,
      username: (session.user as any).username || "",
      phoneNumber: "",
      provider: "google",
      role: (session.user as any).role || "customer",
    })
  }

  return NextResponse.json({
    userId: customer.userId,
    fullName: customer.fullName,
    username: customer.username,
    phoneNumber: customer.phoneNumber,
    email: customer.email,
    provider: customer.provider,
    role: customer.role,
    createdAt: customer.createdAt,
  })
}

const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters").max(100),
  phoneNumber: z.string().trim().min(7, "Valid phone number required").max(20),
  username: z.string().trim().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/).optional(),
})

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsed = updateProfileSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 })
    }

    const customer = await getCustomerByEmail(session.user.email)
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    const { fullName, phoneNumber, username } = parsed.data
    const updates: any = { fullName, phoneNumber }

    if (username && username.toLowerCase() !== customer.username.toLowerCase()) {
      const taken = await getCustomerByUsername(username.toLowerCase())
      if (taken && taken.userId !== customer.userId) {
        return NextResponse.json({ error: "Username is already taken" }, { status: 409 })
      }
      updates.username = username.toLowerCase()
    }

    await updateCustomer(customer.userId, updates)
    return NextResponse.json({ success: true, message: "Profile updated successfully" })
  } catch (err) {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters").regex(/[A-Z]/, "Must have an uppercase letter").regex(/[0-9]/, "Must have a number"),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "New passwords do not match",
  path: ["confirmPassword"],
})

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsed = changePasswordSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 })
    }

    const customer = await getCustomerByEmail(session.user.email)
    if (!customer || !customer.passwordHash) {
      return NextResponse.json({ error: "Password change not available for OAuth accounts" }, { status: 400 })
    }

    const match = await bcrypt.compare(parsed.data.currentPassword, customer.passwordHash)
    if (!match) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
    }

    const newHash = await bcrypt.hash(parsed.data.newPassword, 10)
    await updateCustomer(customer.userId, { passwordHash: newHash })

    return NextResponse.json({ success: true, message: "Password updated successfully" })
  } catch (err) {
    return NextResponse.json({ error: "Failed to change password" }, { status: 500 })
  }
}
