/**
 * @file app/api/shipping/calculate/route.ts
 * @description Secure server-side shipping rate calculation endpoint for Delhivery.
 *
 * Rules:
 *   - PIN code is strictly validated (6 digits).
 *   - Product weights, dimensions, and prices are fetched strictly from server-side database.
 *     Client-supplied weights, dimensions, and prices are NEVER trusted.
 *   - Stops calculation and names the offending product if any product is missing dimensions/weight.
 *   - No fake or automatic ₹0 free shipping.
 */

import { NextResponse } from "next/server"
import { z } from "zod"
import { getProducts } from "@/lib/sheets"
import {
  calculateDelhiveryShippingRate,
  isValidPincode,
} from "@/lib/delhivery"

const calculateShippingSchema = z.object({
  pincode: z.string().trim().min(6).max(6),
  items: z
    .array(
      z.object({
        productId: z.string().optional(),
        handle: z.string().optional(),
        quantity: z.number().int().positive().max(1000),
      })
    )
    .min(1, "At least one product item is required."),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = calculateShippingSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message || "Invalid shipping calculation request.",
        },
        { status: 400 }
      )
    }

    const { pincode, items } = parsed.data

    if (!isValidPincode(pincode)) {
      return NextResponse.json(
        {
          success: false,
          error: "Please enter a valid 6-digit delivery PIN code.",
        },
        { status: 400 }
      )
    }

    // Fetch up-to-date products from Google Sheets
    const catalogProducts = await getProducts(true)

    // Resolve products and build item array
    const resolvedItems: Array<{ product: (typeof catalogProducts)[0]; quantity: number }> = []

    for (const item of items) {
      const match =
        (item.productId
          ? catalogProducts.find((p) => p.productId === item.productId || p.id === item.productId)
          : undefined) ||
        (item.handle
          ? catalogProducts.find(
              (p) =>
                p.handle === item.handle ||
                p.slug === item.handle ||
                p.id === item.handle ||
                p.productId === item.handle
            )
          : undefined)

      if (!match) {
        return NextResponse.json(
          {
            success: false,
            error: "One or more products in your cart could not be found in the catalog.",
          },
          { status: 400 }
        )
      }

      resolvedItems.push({
        product: match,
        quantity: item.quantity,
      })
    }

    // Calculate shipping rate using Delhivery shipping service
    const rateResult = await calculateDelhiveryShippingRate({
      destinationPincode: pincode,
      items: resolvedItems,
    })

    if (!rateResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: rateResult.error || "Unable to calculate shipping charges. Please try again.",
          unserviceable: rateResult.serviceable === false,
          unconfigured: rateResult.unconfigured === true,
          chargeableWeightGrams: rateResult.chargeableWeightGrams,
          dimensions: rateResult.dimensions,
        },
        { status: 422 }
      )
    }

    return NextResponse.json({
      success: true,
      shippingCharge: rateResult.shippingCharge,
      currency: rateResult.currency || "INR",
      shippingProvider: rateResult.shippingProvider,
      chargeableWeightGrams: rateResult.chargeableWeightGrams,
      actualWeightGrams: rateResult.actualWeightGrams,
      volumetricWeightGrams: rateResult.volumetricWeightGrams,
      dimensions: rateResult.dimensions,
      pincode: rateResult.destinationPincode,
      originPincode: rateResult.originPincode,
    })
  } catch (err: any) {
    console.error("Shipping calculate API error:", err)
    return NextResponse.json(
      {
        success: false,
        error: "Unable to calculate shipping charges. Please try again.",
      },
      { status: 500 }
    )
  }
}
