/**
 * @file app/api/orders/route.ts
 * @description Public-facing API route for order operations.
 *   POST – Called after a successful Razorpay payment to record a new order
 *          in the Google Sheet. Validates input with Zod before writing.
 *          Returns the generated orderId on success.
 *   GET  – Fetches all orders belonging to a specific customer email.
 *          Used by the /track-order page after Google OAuth sign-in.
 *          Requires ?email= query parameter.
 *
 * @owner Heet-P
 * @lastModified May 16, 2026
 */

import { NextResponse } from "next/server"
import { appendOrder } from "@/lib/sheets"
import { z } from "zod"
import { rateLimit } from "@/lib/rate-limit"

const orderSchema = z.object({
  customerName: z.string().min(1),
  email: z.string().email(),
  product: z.string().min(1),
  amount: z.number().positive(),
  paymentId: z.string().min(1),
})

export async function POST(request: Request) {
  // Rate limit: max 10 order submissions per IP per minute
  const { success, resetAt } = rateLimit(request, { key: "orders", limit: 10, windowMs: 60_000 })
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)) } }
    )
  }

  try {
    const body = await request.json()
    const parsed = orderSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid order data" }, { status: 400 })
    }

    const { paymentId, amount } = parsed.data;
    
    // Verify Razorpay Payment (payment IDs start with "pay_")
    if (paymentId.startsWith("pay_")) {
      try {
        const Razorpay = (await import("razorpay")).default;
        const rzp = new Razorpay({
          key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
          key_secret: process.env.RAZORPAY_KEY_SECRET || "",
        });
        const payment = await rzp.payments.fetch(paymentId);
        if (!payment || (payment.status !== "captured" && payment.status !== "authorized")) {
          return NextResponse.json({ error: "Invalid payment status" }, { status: 400 });
        }
        if (Number(payment.amount) / 100 !== amount) {
          return NextResponse.json({ error: "Payment amount mismatch" }, { status: 400 });
        }
      } catch (err) {
        console.error("Razorpay verification failed:", err);
        return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
      }
    }

    const orderId = await appendOrder(parsed.data)

    // Send the automated bill / confirmation email
    try {
      const { sendOrderConfirmationEmail } = await import("@/lib/email")
      await sendOrderConfirmationEmail({
        to: parsed.data.email,
        customerName: parsed.data.customerName,
        orderId,
        product: parsed.data.product,
        amount: parsed.data.amount,
      })
    } catch (emailErr) {
      console.error("Failed to send confirmation email:", emailErr)
    }

    return NextResponse.json({ orderId, success: true })
  } catch (err) {
    console.error("Failed to write order to Google Sheets:", err)
    return NextResponse.json({ error: "Failed to save order" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get("email")

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 })
  }

  try {
    const { getOrdersByEmail } = await import("@/lib/sheets")
    const orders = await getOrdersByEmail(email)
    return NextResponse.json({ orders })
  } catch (err) {
    console.error("Failed to fetch orders:", err)
    return NextResponse.json({ orders: [] }, { status: 500 })
  }
}
