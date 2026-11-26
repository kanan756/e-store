/**
 * @file app/api/product-manager/orders/[orderId]/accept/route.ts
 * @description Protected API route for product manager to accept a pending order.
 * POST – Accepts an order: sets orderStatus to Accepted, records acceptedAt timestamp.
 */

import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { getProductManagerSession } from "@/lib/pm-auth"
import { acceptOrder, getAllOrders } from "@/lib/sheets"

export async function POST(
  _request: Request,
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

  // Guard: check that order exists and is in a state that can be accepted
  const orders = await getAllOrders()
  const order = orders.find((o) => o.orderId === orderId)

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  if (order.orderStatus === "Accepted") {
    return NextResponse.json(
      { error: "Order has already been accepted" },
      { status: 409 }
    )
  }

  if (order.orderStatus === "Rejected") {
    return NextResponse.json(
      { error: "Cannot accept a rejected order" },
      { status: 409 }
    )
  }

  const result = await acceptOrder(orderId, session.email)

  if (!result.success) {
    return NextResponse.json(
      { error: result.error || "Failed to accept order" },
      { status: 500 }
    )
  }

  revalidatePath("/secure-product-manager/orders")
  revalidatePath(`/secure-product-manager/orders/${orderId}`)
  revalidatePath("/secure-product-manager/order-tracking")
  revalidatePath("/track-order")
  revalidatePath("/account")

  return NextResponse.json({
    success: true,
    message: "Order accepted successfully",
    orderId,
    acceptedAt: new Date().toISOString(),
  })
}
