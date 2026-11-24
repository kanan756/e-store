/**
 * @file lib/cloudinary.ts
 * @description Cloudinary server-side SDK helper for CLASPO Product Management Portal.
 * 
 * Features:
 * - Direct authenticated uploads for product images and videos
 * - Organized folder structure: claspo/products/{productId}/images and .../videos
 * - Video thumbnail generation
 * - Secure deletion of old/orphaned assets
 * - Safe fallback if Cloudinary credentials are not configured or placeholder
 */

import { v2 as cloudinary } from "cloudinary"

const isConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET &&
  !process.env.CLOUDINARY_API_KEY.includes("placeholder")
)

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  })
}

export interface UploadResult {
  url: string
  secureUrl: string
  publicId: string
  resourceType: "image" | "video"
  format: string
  width?: number
  height?: number
  bytes?: number
  duration?: number
  thumbnailUrl?: string
}

/**
 * Upload an image or video buffer to Cloudinary
 */
export async function uploadProductMedia(
  buffer: Buffer,
  options: {
    productId: string
    resourceType: "image" | "video"
    fileName?: string
  }
): Promise<UploadResult> {
  const { productId, resourceType, fileName } = options
  const cleanId = (productId || "temp").replace(/[^a-zA-Z0-9_-]/g, "_")
  const folder = `claspo/products/${cleanId}/${resourceType}s`

  if (!isConfigured) {
    // Graceful fallback for local development without live Cloudinary keys
    const mockId = `mock_${cleanId}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    const ext = fileName ? fileName.split(".").pop() : (resourceType === "video" ? "mp4" : "jpg")
    const placeholderUrl = resourceType === "video"
      ? `https://res.cloudinary.com/demo/video/upload/sample.mp4`
      : `https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop`
    const placeholderThumb = resourceType === "video"
      ? `https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&auto=format&fit=crop`
      : placeholderUrl

    return {
      url: placeholderUrl,
      secureUrl: placeholderUrl,
      publicId: `${folder}/${mockId}`,
      resourceType,
      format: ext || "jpg",
      width: 1200,
      height: 800,
      bytes: buffer.length,
      duration: resourceType === "video" ? 15 : undefined,
      thumbnailUrl: placeholderThumb,
    }
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        overwrite: true,
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error("Cloudinary upload returned empty response"))
        }

        let thumbnailUrl: string | undefined = undefined
        if (resourceType === "video") {
          // Cloudinary automatic video thumbnail URL
          thumbnailUrl = cloudinary.url(result.public_id, {
            resource_type: "video",
            format: "jpg",
            transformation: [{ width: 640, crop: "scale" }],
          })
        }

        resolve({
          url: result.url,
          secureUrl: result.secure_url,
          publicId: result.public_id,
          resourceType,
          format: result.format,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
          duration: result.duration,
          thumbnailUrl,
        })
      }
    )

    uploadStream.end(buffer)
  })
}

/**
 * Delete a media asset from Cloudinary by its public ID
 */
export async function deleteProductMedia(
  publicId: string,
  resourceType: "image" | "video" = "image"
): Promise<boolean> {
  if (!publicId) return false
  if (!isConfigured || publicId.startsWith("mock_") || publicId.includes("/mock_")) {
    return true
  }

  try {
    const res = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    })
    return res.result === "ok" || res.result === "not found"
  } catch (err) {
    console.warn(`Failed to delete Cloudinary asset ${publicId}:`, err)
    return false
  }
}
