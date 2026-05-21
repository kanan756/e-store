/**
 * @file app/api/admin/inquiries/reply/route.ts
 * @description API endpoint to send email replies to inquiries from the admin panel.
 *   Validates the admin session, uses lib/email to send the email to the customer,
 *   and automatically updates the inquiry status to "Replied".
 *
 * @owner Heet-P
 */

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { updateInquiryStatus } from "@/lib/sheets"
import { sendInquiryReplyEmail } from "@/lib/email"

async function checkAuth() {
  const cookieStore = await cookies()
  const session = cookieStore.get("admin_session")
  return session?.value === "authenticated"
}

export async function POST(request: Request) {
  if (!(await checkAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  
  try {
    const { rowIndex, email, name, subject, replyMessage } = await request.json()
    
    if (!email || !replyMessage || !rowIndex) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // 1. Send the email
    await sendInquiryReplyEmail({
      to: email,
      customerName: name,
      originalSubject: subject,
      replyMessage,
    })

    // 2. Update the status in Google Sheets to "Replied"
    await updateInquiryStatus(rowIndex, "Replied")

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Failed to send reply:", err)
    return NextResponse.json({ error: "Failed to send reply email" }, { status: 500 })
  }
}
