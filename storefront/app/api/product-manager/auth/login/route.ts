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
    const contentType = request.headers.get("content-type") || ""
    const isFormSubmit =
      contentType.includes("application/x-www-form-urlencoded") ||
      contentType.includes("multipart/form-data")

    let rawEmail = ""
    let rawPassword = ""

    if (isFormSubmit) {
      const formData = await request.formData()
      rawEmail = String(formData.get("email") || "")
      rawPassword = String(formData.get("password") || "")
    } else {
      const body = await request.json().catch(() => ({}))
      rawEmail = body?.email || ""
      rawPassword = body?.password || ""
    }

    const parsed = loginSchema.safeParse({ email: rawEmail, password: rawPassword })
    if (!parsed.success) {
      if (isFormSubmit) {
        return NextResponse.redirect(
          new URL("/secure-product-login?error=invalid_credentials", request.url),
          303
        )
      }
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
      if (isFormSubmit) {
        return NextResponse.redirect(
          new URL("/secure-product-login?error=invalid_credentials", request.url),
          303
        )
      }
      const isRateLimit = error?.toLowerCase().includes("too many")
      return NextResponse.json(
        { error: error || "Authentication failed" },
        { status: isRateLimit ? 429 : 401 }
      )
    }

    const token = signPMSession(session)
    const proto = request.headers.get("x-forwarded-proto") || (request.url.startsWith("https:") ? "https" : "http")
    const host = request.headers.get("host") || ""
    const isLocal = host.includes("localhost") || host.includes("127.0.0.1") || host.includes("192.168.")
    const isSecure = proto === "https" && !isLocal

    if (isFormSubmit) {
      const redirectUrl = new URL("/secure-product-manager", request.url)
      const redirectResponse = NextResponse.redirect(redirectUrl, 303)
      setPMSessionCookie(redirectResponse, token, isSecure)
      return redirectResponse
    }

    const response = NextResponse.json({
      success: true,
      message: "Authentication successful",
      user: {
        email: session.email,
        role: session.role,
      },
    })

    setPMSessionCookie(response, token, isSecure)
    return response
  } catch (err: any) {
    console.error("PM login route error:", err)
    return NextResponse.json(
      { error: "An unexpected error occurred during login. Please try again." },
      { status: 500 }
    )
  }
}
