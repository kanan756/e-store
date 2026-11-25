import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { getProductManagerSession } from "@/lib/pm-auth"
import { restoreStockForOrder, updateOrderStatusByPaymentId } from "@/lib/sheets"

const restockSchema = z.object({
  orderId: z.string().trim().min(1).optional(),
  paymentId: z.string().trim().min(1).optional(),
  approvedForRestock: z.boolean().default(true),
  markCancelled: z.boolean().default(true),
  items: z
    .array(
      z.object({
        productId: z.string().trim().min(1),
        quantity: z.number().int().positive(),
        colorName: z.string().trim().optional(),
      })
    )
    .optional(),
})

export async function POST(request: Request) {
  const session = await getProductManagerSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsed = restockSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid restock request" },
        { status: 400 }
      )
    }

    const { orderId, paymentId, approvedForRestock, markCancelled, items } = parsed.data
    if (!orderId && !paymentId) {
      return NextResponse.json(
        { error: "Either orderId or paymentId is required." },
        { status: 400 }
      )
    }

    if (!approvedForRestock) {
      return NextResponse.json({
        success: true,
        restocked: false,
        message: "Restock skipped because items were not approved for restocking.",
      })
    }

    const result = await restoreStockForOrder({
      eventId: `manual_restock_${orderId || paymentId}`,
      orderId,
      paymentId,
      items,
    })

    if (result.alreadyProcessed) {
      return NextResponse.json(
        { error: "Stock has already been restored for this order." },
        { status: 409 }
      )
    }

    if (result.skippedNoDeduction) {
      return NextResponse.json(
        { error: "No prior stock deduction found for this order." },
        { status: 404 }
      )
    }

    if (markCancelled && paymentId) {
      await updateOrderStatusByPaymentId(paymentId, "Refunded", "Cancelled")
    }

    revalidatePath("/")
    revalidatePath("/products")
    revalidatePath("/shop")
    for (const updated of result.updatedProducts) {
      if (updated.handle) {
        revalidatePath(`/products/${updated.handle}`)
      }
    }

    return NextResponse.json({
      success: true,
      restocked: true,
      updatedProducts: result.updatedProducts,
      transactions: result.transactions,
    })
  } catch (err: any) {
    console.error("Order restock error:", err)
    return NextResponse.json(
      { error: err.message || "Failed to restore stock" },
      { status: 500 }
    )
  }
}
