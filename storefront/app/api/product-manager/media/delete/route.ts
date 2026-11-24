import { NextResponse } from "next/server"
import { z } from "zod"
import { getProductManagerSession } from "@/lib/pm-auth"
import { deleteProductMedia } from "@/lib/cloudinary"

const deleteSchema = z.object({
  publicId: z.string().min(1, "Public ID required"),
  resourceType: z.enum(["image", "video"]).default("image"),
})

export async function POST(request: Request) {
  const session = await getProductManagerSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsed = deleteSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid payload" },
        { status: 400 }
      )
    }

    const success = await deleteProductMedia(
      parsed.data.publicId,
      parsed.data.resourceType
    )

    return NextResponse.json({ success })
  } catch (err: any) {
    console.error("Media deletion error:", err)
    return NextResponse.json(
      { error: "Failed to delete media asset" },
      { status: 500 }
    )
  }
}
