/**
 * @file app/api/product-manager/orders/[orderId]/reject/route.ts
 * @description Protected API route for product manager to reject a pending order.
 * POST – Rejects an order, optionally with a reason. Restores reserved stock.
 *        Initiates Stripe refund if payment was collected.
 */

import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { getProductManagerSession } from "@/lib/pm-auth"
import { rejectOrder, getAllOrders, restoreStockForOrder } from "@/lib/sheets"

const rejectSchema = z.object({
  rejectionReason: z.string().trim().max(500).optional().default(""),
  refundPayment: z.boolean().default(true),
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const session = await getProductManagerSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
  }

  const { orderId } = await params

  if (!orderId) {
    return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
  }

  let body: { rejectionReason?: string; refundPayment?: boolean } = {}
  try {
    body = await request.json()
  } catch {
    // empty body is fine
  }

  const parsed = rejectSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid request" },
      { status: 400 }
    )
  }

  const { rejectionReason, refundPayment } = parsed.data

  // Fetch and validate order
  const orders = await getAllOrders()
  const order = orders.find((o) => o.orderId === orderId)

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  if (order.orderStatus === "Rejected") {
    return NextResponse.json({ error: "Order is already rejected" }, { status: 409 })
  }

  if (order.orderStatus === "Accepted") {
    return NextResponse.json(
      { error: "Cannot reject an already accepted order" },
      { status: 409 }
    )
  }

  // 1. Reject the order in the database
  const rejectResult = await rejectOrder(orderId, rejectionReason, session.email)
  if (!rejectResult.success) {
    return NextResponse.json(
      { error: rejectResult.error || "Failed to reject order" },
      { status: 500 }
    )
  }

  // 2. Restore reserved stock
  let stockRestored = false
  try {
    const restoreResult = await restoreStockForOrder({
      eventId: `manager_reject_${orderId}`,
      orderId,
      paymentId: order.transactionId || undefined,
    })
    stockRestored = !restoreResult.alreadyProcessed && !restoreResult.skippedNoDeduction
    revalidatePath("/")
    revalidatePath("/products")
    revalidatePath("/shop")
  } catch (err) {
    console.error("Stock restore failed on rejection:", err)
  }

  // 3. Issue Stripe refund if requested and payment was collected
  let refundIssued = false
  let refundError: string | undefined
  if (refundPayment && order.transactionId && order.paymentStatus === "Paid") {
    try {
      const Stripe = (await import("stripe")).default
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
        apiVersion: "2025-01-27.acacia" as any,
      })
      await stripe.refunds.create({
        payment_intent: order.transactionId,
        reason: "requested_by_customer",
      })
      refundIssued = true
    } catch (err: any) {
      console.error("Stripe refund failed:", err)
      refundError = err.message || "Refund failed"
    }
  }

  revalidatePath("/secure-product-manager/orders")
  revalidatePath(`/secure-product-manager/orders/${orderId}`)
  revalidatePath("/secure-product-manager/order-tracking")
  revalidatePath("/track-order")
  revalidatePath("/account")

  return NextResponse.json({
    success: true,
    message: "Order rejected successfully",
    orderId,
    rejectedAt: new Date().toISOString(),
    stockRestored,
    refundIssued,
    refundError,
  })
}
