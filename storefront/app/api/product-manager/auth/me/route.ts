import { NextResponse } from "next/server"
import { getProductManagerSession } from "@/lib/pm-auth"

export async function GET() {
  const session = await getProductManagerSession()
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      email: session.email,
      role: session.role,
      expiresAt: session.expiresAt,
    },
  })
}
