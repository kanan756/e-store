import { NextResponse } from "next/server"
import { z } from "zod"
import { getProductManagerSession } from "@/lib/pm-auth"
import {
  getProductById,
  updateProductById,
  deleteProductById,
} from "@/lib/sheets"

const mediaItemSchema = z.object({
  id: z.string().optional(),
  url: z.string().url(),
  publicId: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  isPrimary: z.boolean().optional(),
})

const videoItemSchema = z.object({
  id: z.string().optional(),
  url: z.string().url(),
  publicId: z.string().optional(),
  thumbnail: z.string().optional(),
  duration: z.number().optional(),
  title: z.string().optional(),
})

const updateProductSchema = z
  .object({
    productName: z.string().trim().min(2).max(150).optional(),
    slug: z.string().trim().max(100).optional(),
    sku: z.string().trim().max(50).optional(),
    category: z.string().trim().min(1).max(60).optional(),
    shortDescription: z.string().trim().max(300).optional(),
    description: z.string().trim().max(5000).optional(),
    price: z.number().min(0).optional(),
    discountPrice: z.number().min(0).optional().nullable(),
    stock: z.number().int().min(0).optional(),
    status: z.enum(["Active", "Inactive"]).optional(),
    primaryImage: z.string().optional(),
    additionalImages: z.array(mediaItemSchema).optional(),
    primaryVideo: z.string().optional(),
    additionalVideos: z.array(videoItemSchema).optional(),
  })
  .refine(
    (data) => {
      if (
        data.price != null &&
        data.discountPrice != null &&
        data.discountPrice > data.price
      ) {
        return false
      }
      return true
    },
    {
      message: "Discounted price cannot exceed regular price",
      path: ["discountPrice"],
    }
  )

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const session = await getProductManagerSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
  }

  const { productId } = await params
  const product = await getProductById(productId)
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 })
  }

  return NextResponse.json({ success: true, product })
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const session = await getProductManagerSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
  }

  const { productId } = await params
  const existing = await getProductById(productId)
  if (!existing) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 })
  }

  try {
    const body = await request.json()
    const parsed = updateProductSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      )
    }

    const data = parsed.data

    // Automatically synchronize primary image if additionalImages changed
    let primaryImage = data.primaryImage
    if (!primaryImage && data.additionalImages && data.additionalImages.length > 0) {
      const primaryItem = data.additionalImages.find((img) => img.isPrimary) || data.additionalImages[0]
      primaryImage = primaryItem.url
    }

    const updated = await updateProductById(productId, {
      ...data,
      discountPrice: data.discountPrice ?? undefined,
      primaryImage: primaryImage ?? existing.primaryImage,
      imageUrl: primaryImage ?? existing.imageUrl,
    })

    if (!updated) {
      return NextResponse.json(
        { error: "Failed to update product in database" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      product: updated,
    })
  } catch (err: any) {
    console.error("Update product error:", err)
    return NextResponse.json(
      { error: err.message || "Failed to update product" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const session = await getProductManagerSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
  }

  const { productId } = await params
  const existing = await getProductById(productId)
  if (!existing) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 })
  }

  const { searchParams } = new URL(request.url)
  const isHardDelete = searchParams.get("hard") === "true"

  // Prefer soft-delete (deactivate) to protect historical customer orders and reviews
  const success = await deleteProductById(productId, !isHardDelete)
  if (!success) {
    return NextResponse.json(
      { error: "Failed to remove product" },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    message: isHardDelete
      ? "Product permanently deleted"
      : "Product deactivated successfully",
  })
}
