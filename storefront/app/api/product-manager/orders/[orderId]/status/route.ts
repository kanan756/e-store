/**
 * @file app/api/product-manager/orders/[orderId]/status/route.ts
 * @description Protected API route for manager to transition an order through the lifecycle:
 *   Pending -> Accepted -> Packing -> Ready to Ship -> Shipping -> Collected by Customer
 *   Pending -> Rejected
 */

import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { getProductManagerSession } from "@/lib/pm-auth"
import {
  getAllOrders,
  transitionOrderStatus,
  restoreStockForOrder,
  ALLOWED_STATUS_TRANSITIONS,
} from "@/lib/sheets"

const transitionSchema = z.object({
  status: z.enum([
    "Accepted",
    "Rejected",
    "Packing",
    "Ready to Ship",
    "Shipping",
    "Collected by Customer",
  ]),
  remarks: z.string().trim().max(500).optional(),
  rejectionReason: z.string().trim().max(500).optional(),
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

  let body: any = {}
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = transitionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Validation failed" },
      { status: 400 }
    )
  }

  const { status: targetStatus, remarks, rejectionReason, refundPayment } = parsed.data

  // Fetch current order from database to validate state
  const orders = await getAllOrders()
  const order = orders.find((o) => o.orderId === orderId)
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  const currentStatus = order.orderStatus || "Pending"

  // Prevent duplicate status updates
  if (currentStatus === targetStatus) {
    return NextResponse.json(
      { error: `Order is already in "${targetStatus}" status.` },
      { status: 409 }
    )
  }

  // Validate allowed status transition sequence
  const allowedNext = ALLOWED_STATUS_TRANSITIONS[currentStatus] || []
  if (!allowedNext.includes(targetStatus)) {
    return NextResponse.json(
      {
        error: `Invalid transition: cannot move order from "${currentStatus}" to "${targetStatus}".`,
      },
      { status: 400 }
    )
  }

  // Payment safety rule: Do not allow failed-payment orders to enter fulfillment stages
  if (
    order.paymentStatus === "Failed" &&
    ["Accepted", "Packing", "Ready to Ship", "Shipping", "Collected by Customer"].includes(targetStatus)
  ) {
    return NextResponse.json(
      {
        error: "Cannot process fulfillment for an order with Failed payment status.",
      },
      { status: 400 }
    )
  }

  // Perform database transition and record in OrderStatusHistory
  const result = await transitionOrderStatus({
    orderId,
    newStatus: targetStatus,
    changedBy: session.email,
    remarks: remarks || (targetStatus === "Rejected" ? rejectionReason : `Status updated to ${targetStatus}`),
    rejectionReason,
  })

  if (!result.success) {
    return NextResponse.json(
      { error: result.error || `Failed to transition order to ${targetStatus}` },
      { status: 500 }
    )
  }

  // If rejected, restore reserved stock and optionally initiate Stripe refund
  let stockRestored = false
  let refundIssued = false
  let refundError: string | undefined

  if (targetStatus === "Rejected") {
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
    } catch (stockErr) {
      console.error("Stock restore failed on rejection:", stockErr)
    }

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
      } catch (stripeErr: any) {
        console.error("Stripe refund failed:", stripeErr)
        refundError = stripeErr.message || "Stripe refund failed"
      }
    }
  }

  // Revalidate relevant pages
  revalidatePath("/secure-product-manager/orders")
  revalidatePath(`/secure-product-manager/orders/${orderId}`)
  revalidatePath("/secure-product-manager/order-tracking")
  revalidatePath("/track-order")
  revalidatePath("/account")

  return NextResponse.json({
    success: true,
    message: `Order status successfully updated to ${targetStatus}`,
    orderId,
    newStatus: targetStatus,
    order: result.order,
    stockRestored,
    refundIssued,
    refundError,
  })
}
