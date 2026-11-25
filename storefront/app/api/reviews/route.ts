import { NextResponse } from "next/server"
import { z } from "zod"
import { getProducts, type ProductReviewItem } from "@/lib/sheets"

const querySchema = z.object({
  productId: z.string().trim().min(1, "A valid productId is required.").max(120),
})

export interface PublicProductReview {
  id: string
  productId: string
  customerId?: string
  reviewerName: string
  rating: number
  title: string
  description: string
  createdAt?: string
  verified: boolean
}

function sanitizeReview(rev: ProductReviewItem, productId: string): PublicProductReview {
  const numericRating = Math.min(5, Math.max(1, Math.round(Number(rev.rating) || 0)))
  return {
    id: rev.id,
    productId: rev.productId || productId,
    customerId: rev.customerId || undefined,
    reviewerName: rev.reviewerName || "CLASPO Customer",
    rating: numericRating,
    title: rev.title,
    description: rev.description,
    createdAt: rev.createdAt,
    verified: rev.verified ?? Boolean(rev.orderId),
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const rawProductId = searchParams.get("productId") ?? ""
    const parsed = querySchema.safeParse({ productId: rawProductId })

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid productId", reviews: [] },
        { status: 400 }
      )
    }

    const requestedProductId = parsed.data.productId
    const products = await getProducts(true)
    const product = products.find(
      (p) => p.productId === requestedProductId || p.id === requestedProductId
    )

    if (!product) {
      return NextResponse.json(
        { error: "Product not found", reviews: [], reviewCount: 0, averageRating: 0 },
        { status: 404 }
      )
    }

    const resolvedProductId = product.productId || product.id
    const rawReviews = Array.isArray(product.reviews) ? product.reviews : []
    const reviews: PublicProductReview[] = rawReviews
      .filter((rev) => !rev.productId || rev.productId === resolvedProductId)
      .map((rev) => sanitizeReview(rev, resolvedProductId))

    const reviewCount = reviews.length
    const averageRating =
      reviewCount > 0
        ? reviews.reduce((sum, rev) => sum + rev.rating, 0) / reviewCount
        : 0

    return NextResponse.json(
      {
        success: true,
        productId: resolvedProductId,
        reviews,
        reviewCount,
        averageRating,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    )
  } catch (err: any) {
    console.error("Fetch reviews by productId error:", err)
    return NextResponse.json(
      { error: err.message || "Failed to fetch product reviews", reviews: [] },
      { status: 500 }
    )
  }
}
