import { NextResponse } from "next/server"
import { z } from "zod"
import {
  authenticateProductManager,
  signPMSession,
  setPMSessionCookie,
} from "@/lib/pm-auth"

const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input data" },
        { status: 400 }
      )
    }

    const forwarded = request.headers.get("x-forwarded-for")
    const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1"

    const { success, error, session } = await authenticateProductManager(
      parsed.data.email,
      parsed.data.password,
      ip
    )

    if (!success || !session) {
      const isRateLimit = error?.toLowerCase().includes("too many")
      return NextResponse.json(
        { error: error || "Authentication failed" },
        { status: isRateLimit ? 429 : 401 }
      )
    }

    const token = signPMSession(session)
    const response = NextResponse.json({
      success: true,
      message: "Authentication successful",
      user: {
        email: session.email,
        role: session.role,
      },
    })

    setPMSessionCookie(response, token)
    return response
  } catch (err: any) {
    console.error("PM login route error:", err)
    return NextResponse.json(
      { error: "An unexpected error occurred during login. Please try again." },
      { status: 500 }
    )
  }
}
