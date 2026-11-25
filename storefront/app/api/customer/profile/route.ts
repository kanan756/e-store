import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getUserByEmail, getUserByUsername, updateUser, logUserActivity } from "@/lib/sheets"
import bcrypt from "bcryptjs"
import { z } from "zod"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await getUserByEmail(session.user.email)
  if (!user) {
    return NextResponse.json({
      fullName: session.user.name || "Customer",
      email: session.user.email,
      username: (session.user as any).username || "",
      phoneNumber: "",
      provider: "google",
      profileImage: session.user.image || "",
    })
  }

  return NextResponse.json({
    userId: user.userId,
    fullName: user.fullName,
    username: user.username,
    phoneNumber: user.phoneNumber,
    email: user.email,
    provider: user.provider,
    profileImage: user.profileImage,
    createdAt: user.createdAt,
  })
}

const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters").max(100),
  phoneNumber: z.string().trim().max(20).optional().default(""),
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

    const user = await getUserByEmail(session.user.email)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { fullName, phoneNumber, username } = parsed.data
    const updates: any = { fullName, phoneNumber }

    if (username && username.toLowerCase() !== user.username.toLowerCase()) {
      const taken = await getUserByUsername(username.toLowerCase())
      if (taken && taken.userId !== user.userId) {
        return NextResponse.json({ error: "Username is already taken" }, { status: 409 })
      }
      updates.username = username.toLowerCase()
    }

    await updateUser(user.userId, updates)

    await logUserActivity(
      user.userId,
      "PROFILE_UPDATE",
      `Updated profile details (name: ${fullName})`
    ).catch(() => {})

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

    const user = await getUserByEmail(session.user.email)
    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Password change not available for OAuth accounts" }, { status: 400 })
    }

    const match = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash)
    if (!match) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
    }

    const newHash = await bcrypt.hash(parsed.data.newPassword, 10)
    await updateUser(user.userId, { passwordHash: newHash })

    await logUserActivity(
      user.userId,
      "PASSWORD_CHANGE",
      "Customer updated account password"
    ).catch(() => {})

    return NextResponse.json({ success: true, message: "Password updated successfully" })
  } catch (err) {
    return NextResponse.json({ error: "Failed to change password" }, { status: 500 })
  }
}
