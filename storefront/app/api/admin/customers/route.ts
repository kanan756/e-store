import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { verifyAdminToken } from "@/lib/admin-auth"
import { getAllCustomers } from "@/lib/sheets"

export async function GET() {
  const cookieStore = await cookies()
  const adminToken = cookieStore.get("admin_session")?.value
  const session = await getServerSession(authOptions)

  const hasCookieAuth = adminToken ? verifyAdminToken(adminToken).valid : false
  const hasSessionAdmin = (session?.user as any)?.role === "admin"

  if (!hasCookieAuth && !hasSessionAdmin) {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 })
  }

  try {
    const customers = await getAllCustomers()
    // Strip sensitive fields (passwords, tokens) before returning
    const safeCustomers = customers.map(c => ({
      userId: c.userId,
      fullName: c.fullName,
      username: c.username,
      phoneNumber: c.phoneNumber,
      email: c.email,
      provider: c.provider,
      role: c.role,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }))

    return NextResponse.json({ customers: safeCustomers })
  } catch (err) {
    console.error("Error fetching customers for admin:", err)
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 })
  }
}
