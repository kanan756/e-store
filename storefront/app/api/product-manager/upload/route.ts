import { NextResponse } from "next/server"
import { getProductManagerSession } from "@/lib/pm-auth"
import { uploadProductMedia } from "@/lib/cloudinary"

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"]

const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100MB

export async function POST(request: Request) {
  const session = await getProductManagerSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const productId = (formData.get("productId") as string) || "new_product"
    const requestedType = (formData.get("resourceType") as string) || "image"

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    const mimeType = file.type.toLowerCase()
    const isImage = ALLOWED_IMAGE_TYPES.includes(mimeType)
    const isVideo = ALLOWED_VIDEO_TYPES.includes(mimeType)

    if (!isImage && !isVideo) {
      return NextResponse.json(
        {
          error: `Unsupported file format (${file.type}). Allowed formats: JPG, JPEG, PNG, WebP for images; MP4, MOV, WebM for videos.`,
        },
        { status: 400 }
      )
    }

    const resourceType: "image" | "video" = isVideo ? "video" : "image"

    if (resourceType === "image" && file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: "Image size exceeds maximum limit of 10MB." },
        { status: 400 }
      )
    }

    if (resourceType === "video" && file.size > MAX_VIDEO_SIZE) {
      return NextResponse.json(
        { error: "Video size exceeds maximum limit of 100MB." },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const result = await uploadProductMedia(buffer, {
      productId,
      resourceType,
      fileName: file.name,
    })

    return NextResponse.json({
      success: true,
      media: {
        id: `m_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        url: result.secureUrl,
        publicId: result.publicId,
        resourceType: result.resourceType,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        duration: result.duration,
        thumbnail: result.thumbnailUrl,
        title: file.name,
      },
    })
  } catch (err: any) {
    console.error("Product manager upload error:", err)
    return NextResponse.json(
      { error: err.message || "Failed to upload file to media storage" },
      { status: 500 }
    )
  }
}
