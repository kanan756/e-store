/**
 * @file app/api/admin/inquiries/route.ts
 * @description Admin-protected API for managing contact form inquiries.
 *   GET – Returns all inquiries from the Inquiries sheet (admin only).
 *   PUT – Updates the status of a specific inquiry row.
 *         Status lifecycle: New → In Progress → Replied → Closed
 *
 *   Authentication: cookie-based session (`admin_session=authenticated`).
 *
 * @owner Heet-P
 * @lastModified May 16, 2026
 */

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getAllInquiries, updateInquiryStatus } from "@/lib/sheets"

async function checkAuth() {
  const cookieStore = await cookies()
  const session = cookieStore.get("admin_session")
  return session?.value === "authenticated"
}

export async function GET() {
  if (!(await checkAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const inquiries = await getAllInquiries()
    return NextResponse.json({ inquiries })
  } catch {
    return NextResponse.json({ error: "Failed to fetch inquiries" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  if (!(await checkAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const { rowIndex, status } = await request.json()
    await updateInquiryStatus(rowIndex, status)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to update inquiry" }, { status: 500 })
  }
}
