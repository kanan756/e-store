/**
 * @file app/api/product-manager/orders/[orderId]/history/route.ts
 * @description Protected API route to retrieve the complete audit tracking history of an order.
 */

import { NextResponse } from "next/server"
import { getProductManagerSession } from "@/lib/pm-auth"
import { getOrderStatusHistory } from "@/lib/sheets"

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
    const history = await getOrderStatusHistory(orderId)
    // Sort chronological: oldest first
    const sorted = history.sort((a, b) => {
      const ta = new Date(a.changedAt || 0).getTime()
      const tb = new Date(b.changedAt || 0).getTime()
      return ta - tb
    })

    return NextResponse.json({
      success: true,
      orderId,
      history: sorted,
    })
  } catch (err: any) {
    console.error("Failed to fetch order status history:", err)
    return NextResponse.json(
      { error: "Failed to retrieve order status history" },
      { status: 500 }
    )
  }
}
