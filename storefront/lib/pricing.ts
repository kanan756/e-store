import type { Product } from "@/lib/sheets"

export interface EffectivePricing {
  regularPrice: number
  discountPrice: number | null
  sellingPrice: number
  hasDiscount: boolean
  discountPercent: number
}

export function getEffectivePricing(product: Pick<Product, "price" | "discountPrice">): EffectivePricing {
  const regularPrice = Number.isFinite(Number(product.price)) ? Number(product.price) : 0
  const parsedDiscount =
    product.discountPrice != null && Number.isFinite(Number(product.discountPrice))
      ? Number(product.discountPrice)
      : null
  const hasDiscount = Boolean(
    parsedDiscount !== null && parsedDiscount > 0 && parsedDiscount < regularPrice
  )
  const sellingPrice = hasDiscount ? parsedDiscount! : regularPrice
  const discountPercent = hasDiscount
    ? Math.round(((regularPrice - parsedDiscount!) / regularPrice) * 100)
    : 0

  return {
    regularPrice,
    discountPrice: hasDiscount ? parsedDiscount : null,
    sellingPrice,
    hasDiscount,
    discountPercent,
  }
}
