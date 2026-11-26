/**
 * @file app/api/product-manager/orders/route.ts
 * @description Protected API route for product manager to view all orders.
 * GET – Returns all orders with pagination, search, and status filters.
 */

import { NextResponse } from "next/server"
import { getProductManagerSession } from "@/lib/pm-auth"
import { getAllOrders } from "@/lib/sheets"

export async function GET(request: Request) {
  const session = await getProductManagerSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")?.toLowerCase().trim() || ""
    const statusFilter = searchParams.get("status") || ""
    const paymentFilter = searchParams.get("paymentStatus") || ""
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "20", 10)))

    let orders = await getAllOrders()

    // Sort newest first
    orders = orders.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime()
      const dateB = new Date(b.createdAt || 0).getTime()
      return dateB - dateA
    })

    // Filter by search (orderId, customerName, email, orderNumber)
    if (search) {
      orders = orders.filter(
        (o) =>
          o.orderId.toLowerCase().includes(search) ||
          o.orderNumber.toLowerCase().includes(search) ||
          o.customerName.toLowerCase().includes(search) ||
          o.email.toLowerCase().includes(search)
      )
    }

    // Filter by order status
    if (statusFilter && statusFilter !== "All") {
      orders = orders.filter(
        (o) => o.orderStatus.toLowerCase() === statusFilter.toLowerCase()
      )
    }

    // Filter by payment status
    if (paymentFilter && paymentFilter !== "All") {
      orders = orders.filter(
        (o) => o.paymentStatus.toLowerCase() === paymentFilter.toLowerCase()
      )
    }

    const total = orders.length
    const totalPages = Math.ceil(total / limit) || 1
    const start = (page - 1) * limit
    const paginated = orders.slice(start, start + limit)

    // Compute summary counts for dashboard
    const statusCounts: Record<string, number> = {}
    for (const o of orders) {
      const s = o.orderStatus || "Processing"
      statusCounts[s] = (statusCounts[s] || 0) + 1
    }

    return NextResponse.json({
      success: true,
      orders: paginated,
      pagination: { page, limit, total, totalPages },
      statusCounts,
    })
  } catch (err: any) {
    console.error("Failed to fetch orders for manager:", err)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}
