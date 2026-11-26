import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
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

const reviewItemSchema = z.object({
  id: z.string().min(1),
  reviewerName: z.string().trim().min(1, "Reviewer name is required").max(100),
  title: z.string().trim().min(1, "Review title is required").max(150),
  description: z.string().trim().min(1, "Review description is required").max(2000),
  rating: z.number().int().min(1).max(5),
  createdAt: z.string().optional(),
})

const howToStepSchema = z.object({
  id: z.string().min(1),
  stepNumber: z.number().int().min(1),
  title: z.string().trim().max(150).optional(),
  instruction: z.string().trim().min(1, "Step instruction is required").max(2000),
})

const colorVariantSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, "Colour name is required").max(50),
  hex: z.string().trim().regex(/^#[0-9a-fA-F]{3,8}$/, "Valid hex colour code is required"),
  available: z.boolean().default(true),
  activeStock: z.number().int().min(0, "Colour active stock cannot be negative").optional().nullable(),
  stock: z.number().int().min(0, "Colour stock cannot be negative").optional().nullable(),
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
    activeStock: z.number().int().min(0).optional(),
    stock: z.number().int().min(0).optional(),
    status: z.enum(["Active", "Inactive"]).optional(),
    primaryImage: z.string().optional(),
    additionalImages: z.array(mediaItemSchema).optional(),
    primaryVideo: z.string().optional(),
    additionalVideos: z.array(videoItemSchema).optional(),
    reviews: z.array(reviewItemSchema).optional(),
    howToUse: z.array(howToStepSchema).optional(),
    colors: z
      .array(colorVariantSchema)
      .optional()
      .refine(
        (colors) => {
          if (!colors) return true
          const seen = new Set<string>()
          for (const c of colors) {
            const key = c.name.trim().toLowerCase()
            if (seen.has(key)) return false
            seen.add(key)
          }
          return true
        },
        { message: "Duplicate colour names are not allowed." }
      ),
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
      message: "Discounted price cannot be greater than the regular price.",
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

    const resolvedPrice = data.price ?? existing.price
    const resolvedDiscount =
      data.discountPrice !== undefined ? data.discountPrice : existing.discountPrice

    if (
      resolvedDiscount != null &&
      resolvedDiscount > 0 &&
      resolvedDiscount > resolvedPrice
    ) {
      return NextResponse.json(
        {
          error: "Discounted price cannot be greater than the regular price.",
        },
        { status: 400 }
      )
    }

    // Automatically synchronize primary image if additionalImages changed
    let primaryImage = data.primaryImage
    if (!primaryImage && data.additionalImages && data.additionalImages.length > 0) {
      const primaryItem = data.additionalImages.find((img) => img.isPrimary) || data.additionalImages[0]
      primaryImage = primaryItem.url
    }

    // Calculate Active Stock & Passive Stock consistently (never allow manager form to overwrite reserved qty)
    const oldPassiveStock = Math.max(0, existing.stock ?? 0)
    const oldActiveStock = Math.max(0, existing.activeStock ?? oldPassiveStock)
    const reservedQty = Math.max(0, oldActiveStock - oldPassiveStock)

    const nextActiveStock =
      data.activeStock !== undefined
        ? Math.max(0, data.activeStock)
        : existing.activeStock !== undefined
          ? oldActiveStock
          : data.stock !== undefined
            ? Math.max(0, data.stock)
            : oldActiveStock

    const nextPassiveStock =
      data.activeStock !== undefined
        ? Math.max(0, nextActiveStock - reservedQty)
        : existing.activeStock !== undefined
          ? oldPassiveStock
          : data.stock !== undefined
            ? Math.max(0, data.stock)
            : oldPassiveStock

    // Recompute colour-level Passive Stock when colour Active Stock is updated
    const existingColors = Array.isArray(existing.colors) ? existing.colors : []
    const nextColors = data.colors
      ? data.colors.map((c) => {
          const prevColor = existingColors.find(
            (ec) => ec.id === c.id || ec.name.trim().toLowerCase() === c.name.trim().toLowerCase()
          )
          const oldColPassive = prevColor?.stock != null ? Math.max(0, prevColor.stock) : null
          const oldColActive =
            prevColor?.activeStock != null
              ? Math.max(0, prevColor.activeStock)
              : oldColPassive

          const colActiveInput = c.activeStock !== undefined ? c.activeStock : c.stock
          if (colActiveInput == null) {
            return { ...c, activeStock: null, stock: null }
          }
          const colReserved =
            oldColActive != null && oldColPassive != null
              ? Math.max(0, oldColActive - oldColPassive)
              : 0
          const newColPassive = Math.max(0, colActiveInput - colReserved)
          return {
            ...c,
            activeStock: colActiveInput,
            stock: newColPassive,
          }
        })
      : undefined

    const updated = await updateProductById(productId, {
      ...data,
      activeStock: nextActiveStock,
      stock: nextPassiveStock,
      discountPrice: data.discountPrice === null ? null : (data.discountPrice ?? undefined),
      primaryImage: primaryImage ?? existing.primaryImage,
      imageUrl: primaryImage ?? existing.imageUrl,
      colors: nextColors,
    })

    if (!updated) {
      return NextResponse.json(
        { error: "Failed to update product in database" },
        { status: 500 }
      )
    }

    revalidatePath("/")
    revalidatePath("/products")
    revalidatePath("/wishlist")
    revalidatePath(`/products/${updated.handle}`)
    if (existing.handle && existing.handle !== updated.handle) {
      revalidatePath(`/products/${existing.handle}`)
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

  revalidatePath("/")
  revalidatePath("/products")
  revalidatePath("/wishlist")
  if (existing.handle) {
    revalidatePath(`/products/${existing.handle}`)
  }

  return NextResponse.json({
    success: true,
    message: isHardDelete
      ? "Product permanently deleted"
      : "Product deactivated successfully",
  })
}
