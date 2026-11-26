import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { getProductManagerSession } from "@/lib/pm-auth"
import {
  getProducts,
  getProductMetrics,
  createProduct,
  getProductById,
} from "@/lib/sheets"

const mediaItemSchema = z.object({
  id: z.string().optional(),
  url: z.string().url("Valid image URL required"),
  publicId: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  isPrimary: z.boolean().optional(),
})

const videoItemSchema = z.object({
  id: z.string().optional(),
  url: z.string().url("Valid video URL required"),
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

const createProductSchema = z
  .object({
    productId: z.string().trim().optional(),
    productName: z.string().trim().min(2, "Product name is required (minimum 2 characters)").max(150),
    slug: z.string().trim().max(100).optional(),
    sku: z.string().trim().max(50).optional(),
    category: z.string().trim().min(1, "Category is required").max(60),
    shortDescription: z.string().trim().max(300).optional(),
    description: z.string().trim().max(5000).optional(),
    price: z.number().min(0, "Price cannot be negative"),
    discountPrice: z.number().min(0, "Discounted price cannot be negative").optional().nullable(),
    activeStock: z.number().int().min(0, "Active stock cannot be negative").optional(),
    stock: z.number().int().min(0, "Stock cannot be negative").optional(),
    length: z.number().positive("Length must be a positive number (cm)"),
    width: z.number().positive("Width must be a positive number (cm)"),
    height: z.number().positive("Height must be a positive number (cm)"),
    actualWeight: z.number().positive("Actual weight must be a positive number"),
    weightUnit: z.enum(["g", "kg"]).default("g"),
    status: z.enum(["Active", "Inactive"]).default("Active"),
    primaryImage: z.string().optional(),
    additionalImages: z.array(mediaItemSchema).default([]),
    primaryVideo: z.string().optional(),
    additionalVideos: z.array(videoItemSchema).default([]),
    reviews: z.array(reviewItemSchema).default([]),
    howToUse: z.array(howToStepSchema).default([]),
    colors: z
      .array(colorVariantSchema)
      .default([])
      .refine(
        (colors) => {
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
      if (data.discountPrice != null && data.discountPrice > data.price) {
        return false
      }
      return true
    },
    {
      message: "Discounted price cannot be greater than the regular price.",
      path: ["discountPrice"],
    }
  )

export async function GET(request: Request) {
  const session = await getProductManagerSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")?.toLowerCase().trim() || ""
    const category = searchParams.get("category") || ""
    const status = searchParams.get("status") || ""
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "10", 10)))

    // Fetch all products (including inactive for manager)
    let products = await getProducts(true)
    const metrics = await getProductMetrics()

    // Filter by search
    if (search) {
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.id.toLowerCase().includes(search) ||
          (p.sku && p.sku.toLowerCase().includes(search)) ||
          p.category.toLowerCase().includes(search)
      )
    }

    // Filter by category
    if (category && category !== "All") {
      products = products.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase()
      )
    }

    // Filter by status
    if (status && status !== "All") {
      if (status === "Active") {
        products = products.filter((p) => p.status === "Active")
      } else if (status === "Inactive") {
        products = products.filter((p) => p.status === "Inactive")
      } else if (status === "OutOfStock") {
        products = products.filter((p) => (p.stock ?? 0) <= 0)
      }
    }

    const totalFiltered = products.length
    const totalPages = Math.ceil(totalFiltered / limit) || 1
    const startIndex = (page - 1) * limit
    const paginatedProducts = products.slice(startIndex, startIndex + limit)

    // Collect all distinct categories for filter dropdown
    const allProducts = await getProducts(true)
    const distinctCategories = Array.from(
      new Set(allProducts.map((p) => p.category).filter(Boolean))
    ).sort()

    return NextResponse.json({
      success: true,
      products: paginatedProducts,
      pagination: {
        page,
        limit,
        total: totalFiltered,
        totalPages,
      },
      metrics,
      categories: distinctCategories,
    })
  } catch (err: any) {
    console.error("Failed to fetch products for manager:", err)
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const session = await getProductManagerSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsed = createProductSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      )
    }

    const data = parsed.data

    // Check unique productId if supplied
    if (data.productId) {
      const existing = await getProductById(data.productId)
      if (existing) {
        return NextResponse.json(
          { error: `Product ID "${data.productId}" already exists. Please choose another.` },
          { status: 409 }
        )
      }
    }

    // Derive primary image
    let primaryImage = data.primaryImage || ""
    if (!primaryImage && data.additionalImages.length > 0) {
      const primaryItem = data.additionalImages.find((img) => img.isPrimary) || data.additionalImages[0]
      primaryImage = primaryItem.url
    }

    // Derive primary video
    let primaryVideo = data.primaryVideo || ""
    if (!primaryVideo && data.additionalVideos.length > 0) {
      primaryVideo = data.additionalVideos[0].url
    }

    const resolvedActiveStock = data.activeStock ?? data.stock ?? 0
    const normalizedColors = data.colors.map((c) => {
      const colActive = c.activeStock ?? c.stock ?? null
      return {
        ...c,
        activeStock: colActive,
        stock: colActive,
      }
    })

    const created = await createProduct({
      productId: data.productId,
      productName: data.productName,
      slug: data.slug,
      sku: data.sku,
      category: data.category,
      shortDescription: data.shortDescription,
      description: data.description,
      price: data.price,
      discountPrice: data.discountPrice != null ? data.discountPrice : undefined,
      activeStock: resolvedActiveStock,
      stock: resolvedActiveStock,
      primaryImage,
      additionalImages: data.additionalImages,
      primaryVideo,
      additionalVideos: data.additionalVideos,
      reviews: data.reviews,
      howToUse: data.howToUse,
      colors: normalizedColors,
      status: data.status,
      length: data.length,
      width: data.width,
      height: data.height,
      actualWeight: data.actualWeight,
      weightUnit: data.weightUnit,
    })

    revalidatePath("/")
    revalidatePath("/products")
    revalidatePath("/wishlist")
    revalidatePath(`/products/${created.handle}`)

    return NextResponse.json({
      success: true,
      message: "Product created successfully",
      product: created,
    })
  } catch (err: any) {
    console.error("Create product error:", err)
    return NextResponse.json(
      { error: err.message || "Failed to create product" },
      { status: 500 }
    )
  }
}
