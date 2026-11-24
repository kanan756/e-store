import { NextResponse } from "next/server"
import { clearPMSessionCookie } from "@/lib/pm-auth"

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully",
  })
  clearPMSessionCookie(response)
  return response
}
