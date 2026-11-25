import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import {
  getProductByHandle,
  getOrdersByEmail,
  updateProductById,
  type Order,
  type Product,
  type ProductReviewItem,
} from "@/lib/sheets"
import { stripEmoji } from "@/lib/sanitize"

const submitReviewSchema = z.object({
  rating: z.number().int().min(1, "Please select a rating between 1 and 5").max(5),
  title: z.string().trim().min(2, "Review title must be at least 2 characters").max(150).transform(stripEmoji),
  description: z.string().trim().min(5, "Review description must be at least 5 characters").max(2000).transform(stripEmoji),
})

function orderContainsProduct(order: Order, product: Product): boolean {
  if (order.paymentStatus === "Failed" || order.orderStatus === "Cancelled") {
    return false
  }
  const raw = (order.items || order.product || "").toLowerCase()
  if (!raw) return false

  const productNameLower = product.name.trim().toLowerCase()
  const segments = raw
    .split(",")
    .map((s) => s.trim().replace(/\s+x\d+$/i, "").trim())
    .filter(Boolean)

  return segments.some((seg) => seg === productNameLower) || raw.includes(productNameLower)
}

function findCustomerDuplicateReview(
  reviews: ProductReviewItem[],
  email: string,
  matchingOrderId?: string
): boolean {
  const cleanEmail = email.trim().toLowerCase()
  return reviews.some(
    (r) =>
      (r.reviewerEmail && r.reviewerEmail.trim().toLowerCase() === cleanEmail) ||
      (matchingOrderId && r.orderId && r.orderId === matchingOrderId)
  )
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ handle: string }> }
) {
  try {
    const { handle } = await params
    const product = await getProductByHandle(handle)
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({
        authenticated: false,
        hasPurchased: false,
        alreadyReviewed: false,
        canReview: false,
      })
    }

    const email = session.user.email.toLowerCase()
    const orders = await getOrdersByEmail(email).catch(() => [])
    const matchingOrder = orders.find((o) => orderContainsProduct(o, product))
    const hasPurchased = Boolean(matchingOrder)
    const reviews = Array.isArray(product.reviews) ? product.reviews : []
    const alreadyReviewed = findCustomerDuplicateReview(reviews, email, matchingOrder?.orderId)

    return NextResponse.json({
      authenticated: true,
      hasPurchased,
      alreadyReviewed,
      canReview: hasPurchased && !alreadyReviewed,
    })
  } catch (err: any) {
    console.error("Review eligibility check error:", err)
    return NextResponse.json({ error: "Failed to check review eligibility" }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ handle: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Please log in to your CLASPO account to submit a review." },
        { status: 401 }
      )
    }

    const { handle } = await params
    const product = await getProductByHandle(handle)
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const body = await request.json()
    const parsed = submitReviewSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid review data" },
        { status: 400 }
      )
    }

    const email = session.user.email.toLowerCase()
    const orders = await getOrdersByEmail(email).catch(() => [])
    const matchingOrder = orders.find((o) => orderContainsProduct(o, product))

    if (!matchingOrder) {
      return NextResponse.json(
        { error: "Only verified customers who have purchased this product can submit a review." },
        { status: 403 }
      )
    }

    const existingReviews = Array.isArray(product.reviews) ? product.reviews : []
    if (findCustomerDuplicateReview(existingReviews, email, matchingOrder.orderId)) {
      return NextResponse.json(
        { error: "You have already submitted a review for this product." },
        { status: 409 }
      )
    }

    const newReview: ProductReviewItem = {
      id: `rev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      reviewerName: session.user.name?.trim() || email.split("@")[0] || "CLASPO Customer",
      reviewerEmail: email,
      orderId: matchingOrder.orderId,
      title: parsed.data.title,
      description: parsed.data.description,
      rating: parsed.data.rating,
      createdAt: new Date().toISOString(),
    }

    const updatedReviews = [newReview, ...existingReviews]
    const updatedProduct = await updateProductById(product.id, { reviews: updatedReviews })

    if (!updatedProduct) {
      return NextResponse.json({ error: "Failed to save review" }, { status: 500 })
    }

    revalidatePath(`/products/${product.handle}`)
    revalidatePath(`/products`)

    return NextResponse.json({
      success: true,
      message: "Thank you! Your review has been published.",
      review: newReview,
      reviews: updatedReviews,
    })
  } catch (err: any) {
    console.error("Submit review error:", err)
    return NextResponse.json(
      { error: err.message || "Failed to submit review" },
      { status: 500 }
    )
  }
}
