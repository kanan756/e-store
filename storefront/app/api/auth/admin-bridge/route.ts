import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createAdminToken } from "@/lib/admin-auth"

export async function POST() {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role

  if (role === "admin") {
    const response = NextResponse.json({ success: true, role: "admin" })
    response.cookies.set("admin_session", createAdminToken("admin"), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 8 * 60 * 60,
      path: "/",
      sameSite: "strict",
    })
    return response
  }

  return NextResponse.json({ error: "Not an administrator" }, { status: 403 })
}
