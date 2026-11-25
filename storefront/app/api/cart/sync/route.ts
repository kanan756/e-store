import { NextResponse } from "next/server"
import { z } from "zod"
import { getProducts, type Product } from "@/lib/sheets"
import { getEffectivePricing } from "@/lib/pricing"
import { FLAT_SHIPPING_INR } from "@/lib/format"

const syncSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().min(1),
      productId: z.string().optional(),
      price: z.number().min(0),
      quantity: z.number().int().min(1).max(1000),
      selectedColor: z
        .object({
          id: z.string().optional(),
          name: z.string(),
          hex: z.string().optional(),
        })
        .nullable()
        .optional(),
    })
  ),
})

function findMatchingProduct(
  products: Product[],
  item: { id: string; productId?: string }
): Product | undefined {
  if (item.productId) {
    const byPid = products.find(
      (p) => p.productId === item.productId || p.id === item.productId
    )
    if (byPid) return byPid
  }
  return products.find(
    (p) =>
      p.id === item.id ||
      p.productId === item.id ||
      p.handle === item.id ||
      p.slug === item.id
  )
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = syncSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid cart items" },
        { status: 400 }
      )
    }

    const allProducts = await getProducts(true)

    const syncedItems = parsed.data.items.map((item) => {
      const product = findMatchingProduct(allProducts, item)

      if (!product) {
        return {
          id: item.id,
          productId: item.productId || item.id,
          found: false,
          available: false,
          unavailableReason: "deleted" as const,
          priceChanged: false,
          previousPrice: item.price,
          newPrice: item.price,
          stockAdjusted: false,
          adjustedQuantity: item.quantity,
          stock: 0,
        }
      }

      const pricing = getEffectivePricing(product)
      let stock = product.stock ?? (product.inStock ? 100 : 0)
      const isInactive = product.status === "Inactive"
      const isOutOfStock = !product.inStock || stock <= 0

      const productColors = Array.isArray(product.colors) ? product.colors : []
      let resolvedColor = item.selectedColor ?? null
      let colorUnavailable = false

      if (productColors.length > 0) {
        if (item.selectedColor?.name) {
          const matchedColor = productColors.find(
            (c) =>
              (item.selectedColor?.id && c.id === item.selectedColor.id) ||
              c.name.trim().toLowerCase() === item.selectedColor!.name.trim().toLowerCase()
          )
          if (
            !matchedColor ||
            matchedColor.available === false ||
            (matchedColor.stock != null && matchedColor.stock <= 0)
          ) {
            colorUnavailable = true
          } else {
            resolvedColor = {
              id: matchedColor.id,
              name: matchedColor.name,
              hex: matchedColor.hex,
            }
            if (matchedColor.stock != null) {
              stock = Math.min(stock, matchedColor.stock)
            }
          }
        } else {
          colorUnavailable = true
        }
      } else {
        resolvedColor = null
      }

      let unavailableReason: "inactive" | "out_of_stock" | "color_unavailable" | null = null
      if (isInactive) unavailableReason = "inactive"
      else if (isOutOfStock) unavailableReason = "out_of_stock"
      else if (colorUnavailable) unavailableReason = "color_unavailable"

      const available = !isInactive && !isOutOfStock && !colorUnavailable && pricing.sellingPrice > 0
      const priceChanged =
        Math.round(item.price * 100) !== Math.round(pricing.sellingPrice * 100)

      const stockAdjusted = available && item.quantity > stock
      const adjustedQuantity = available ? Math.min(item.quantity, stock) : item.quantity

      return {
        id: product.handle || product.id,
        legacyId: item.id,
        productId: product.productId || product.id,
        name: product.name,
        category: product.category,
        imageUrl: product.primaryImage || product.imageUrl || "",
        regularPrice: pricing.regularPrice,
        discountPrice: pricing.discountPrice,
        price: pricing.sellingPrice,
        stock,
        inStock: product.inStock && !colorUnavailable,
        status: product.status || "Active",
        selectedColor: resolvedColor,
        found: true,
        available,
        unavailableReason,
        priceChanged,
        previousPrice: item.price,
        newPrice: pricing.sellingPrice,
        stockAdjusted,
        adjustedQuantity,
      }
    })

    const subtotal = syncedItems
      .filter((i) => i.available)
      .reduce((sum, i) => sum + (i.price ?? 0) * i.adjustedQuantity, 0)
    const shippingCharge = syncedItems.some((i) => i.available) ? FLAT_SHIPPING_INR : 0
    const total = subtotal + shippingCharge

    return NextResponse.json({
      success: true,
      items: syncedItems,
      subtotal,
      shippingCharge,
      total,
    })
  } catch (err: any) {
    console.error("Cart sync error:", err)
    return NextResponse.json(
      { error: err.message || "Failed to synchronize cart" },
      { status: 500 }
    )
  }
}
