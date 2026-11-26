/**
 * @file app/api/products/route.ts
 * @description Public (unauthenticated) API for fetching all products.
 *   GET – Returns all products from Google Sheets. Cached for 60 seconds.
 *   Used by the /products listing page and product search.
 *
 * @owner Heet-P
 * @lastModified May 16, 2026
 */

import { NextResponse } from "next/server"
import { getProducts } from "@/lib/sheets"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    const products = await getProducts()
    // Never expose Active Stock to customer-facing APIs
    const sanitized = products.map(({ activeStock: _a, colors, ...rest }) => ({
      ...rest,
      colors: Array.isArray(colors)
        ? colors.map(({ activeStock: _ca, ...cRest }) => cRest)
        : colors,
    }))
    return NextResponse.json({ products: sanitized })
  } catch (err) {
    console.error("Failed to fetch products from Google Sheets:", err)
    return NextResponse.json({ products: [] }, { status: 500 })
  }
}
