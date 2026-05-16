/**
 * @file app/api/admin/products/route.ts
 * @description Admin-protected CRUD API for product management.
 *   GET    – Fetches all products from the Google Sheet.
 *   POST   – Validates and appends a new product row to the sheet.
 *   PUT    – Updates an existing product row (identified by rowIndex).
 *   DELETE – Clears a product row from the sheet.
 *
 *   All requests are validated with Zod before touching the sheet.
 *   Authentication: cookie-based session (`admin_session=authenticated`).
 *
 * @owner Heet-P
 * @lastModified May 16, 2026
 */

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getProducts, appendProduct, updateProduct, deleteProduct } from "@/lib/sheets"
import { z } from "zod"

async function checkAuth() {
  const cookieStore = await cookies()
  const session = cookieStore.get("admin_session")
  return session?.value === "authenticated"
}

const productSchema = z.object({
  name: z.string().min(1),
  category: z.string().default(""),
  description: z.string().default(""),
  imageUrl: z.string().default(""),
  price: z.number().min(0),
  handle: z.string().default(""),
})

export async function GET() {
  if (!(await checkAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const products = await getProducts()
    return NextResponse.json({ products })
  } catch {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  if (!(await checkAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const body = await request.json()
    const parsed = productSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
    await appendProduct(parsed.data)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to add product" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  if (!(await checkAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const body = await request.json()
    const { rowIndex, ...productData } = body
    const parsed = productSchema.safeParse(productData)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
    await updateProduct(rowIndex, parsed.data)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  if (!(await checkAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const { rowIndex } = await request.json()
    await deleteProduct(rowIndex)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
