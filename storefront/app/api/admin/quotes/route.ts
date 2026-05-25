/**
 * @file app/api/admin/quotes/route.ts
 * @description Admin-protected API for quote request management.
 *   GET – Fetches all quote requests from the Google Sheet.
 *   PUT – Updates the status of a quote (e.g. New → Reviewed → Quoted → Closed).
 *
 *   Authentication: cookie-based session (`admin_session=authenticated`).
 *
 * @owner Heet-P
 * @lastModified May 25, 2026
 */

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getAllQuotes, updateQuoteStatus } from "@/lib/sheets"
import { z } from "zod"

async function checkAuth() {
  const cookieStore = await cookies()
  const session = cookieStore.get("admin_session")
  if (!session?.value) return false
  const { verifyAdminToken } = await import("@/app/api/admin/auth/route")
  return verifyAdminToken(session.value)
}

export async function GET() {
  if (!(await checkAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const quotes = await getAllQuotes()
    return NextResponse.json({ quotes })
  } catch {
    return NextResponse.json({ error: "Failed to fetch quotes" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  if (!(await checkAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const { rowIndex, status } = await request.json()
    if (!Number.isInteger(rowIndex) || rowIndex < 2) {
      return NextResponse.json({ error: "Invalid rowIndex" }, { status: 400 })
    }
    const parsed = z.string().min(1).safeParse(status)
    if (!parsed.success) return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    await updateQuoteStatus(rowIndex, parsed.data)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to update quote status" }, { status: 500 })
  }
}
