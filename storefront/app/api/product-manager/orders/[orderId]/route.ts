/**
 * @file app/api/product-manager/orders/[orderId]/route.ts
 * @description Protected API route to fetch a single order's full detail.
 * GET – Returns full order data including all items and customer details.
 */

import { NextResponse } from "next/server"
import { getProductManagerSession } from "@/lib/pm-auth"
import { getAllOrders, getOrderStatusHistory } from "@/lib/sheets"

export async function GET(
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

  try {
    const orders = await getAllOrders()
    const order = orders.find((o) => o.orderId === orderId)

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Parse items JSON if present
    let parsedItems: any[] = []
    try {
      const raw = order.items
      if (raw && raw.startsWith("[")) {
        parsedItems = JSON.parse(raw)
      }
    } catch {
      // items is a plain text summary
    }

    const history = await getOrderStatusHistory(orderId)

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        parsedItems,
        history,
      },
    })
  } catch (err: any) {
    console.error("Failed to fetch order detail:", err)
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}
