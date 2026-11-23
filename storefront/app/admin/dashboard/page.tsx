import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { verifyAdminToken } from "@/lib/admin-auth"
import DashboardClient from "./DashboardClient"

export default async function AdminDashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("admin_session")?.value

  if (token) {
    const { valid, role } = verifyAdminToken(token)
    if (valid && role) {
      return <DashboardClient role={role} />
    }
  }

  // Fallback: verify NextAuth session
  const session = await getServerSession(authOptions)
  const sessionRole = (session?.user as any)?.role

  if (sessionRole === "admin") {
    return <DashboardClient role="admin" />
  }

  redirect("/admin")
}
