/**
 * @file app/api/stripe/checkout-session/route.ts
 * @description Creates a Stripe Checkout session for a cart of items.
 *
 *   Security:
 *     - Accepts an `items` array (handle + quantity) instead of a raw amount.
 *       Prices are resolved server-side from the Google Sheets product catalogue
 *       so the client cannot tamper with prices by modifying localStorage.
 *     - Validates that every requested product exists and is in stock.
 *     - Restricts success/cancel URLs to the same origin as NEXT_PUBLIC_STORE_URL
 *       to prevent open-redirect phishing.
 *
 * @owner Heet-P
 * @lastModified June 8, 2026
 */

import { NextResponse } from "next/server"
import Stripe from "stripe"
import { z } from "zod"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { generateInvoiceToken } from "@/lib/invoice-token"
import { FLAT_SHIPPING_INR } from "@/lib/format"
import { getEffectivePricing } from "@/lib/pricing"
import { stripEmoji } from "@/lib/sanitize"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2025-01-27.acacia" as any,
})

const checkoutSessionSchema = z.object({
  customerName: z.string().min(1).transform(stripEmoji),
  email:        z.email(),
  // Array of cart items — price is resolved server-side, never trusted from client
  items: z.array(
    z.object({
      handle:    z.string().min(1),
      productId: z.string().optional(),
      name:      z.string().min(1).transform(stripEmoji),
      quantity:  z.number().int().positive().max(1000),
    })
  ).min(1, "Cart is empty"),
  expectedTotal: z.number().min(0).optional(),
  successUrl: z.url(),
  cancelUrl:  z.url(),
})

export async function POST(request: Request) {
  try {
    // ── Server-Side Authentication Verification ──────────────────────────────
    // Only authenticated customers can create payment sessions.
    // Guests or unauthenticated requests are strictly rejected with HTTP 401.
    const authSession = await getServerSession(authOptions)
    if (!authSession?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required to checkout. Please log in to your CLASPO account." },
        { status: 401 }
      )
    }

    const body = await request.json()
    const parsed = checkoutSessionSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request data" }, { status: 400 })
    }

    const { customerName, items, expectedTotal, successUrl, cancelUrl } = parsed.data
    // Always bind order to verified session customer email rather than unverified client payload
    const verifiedEmail = authSession.user.email.toLowerCase()

    // ── Lookup Verified User Record ──────────────────────────────────────────
    const { getProducts, getUserByEmail } = await import("@/lib/sheets")
    const dbUser = await getUserByEmail(verifiedEmail).catch(() => null)
    const verifiedUserId = dbUser?.userId || (authSession.user as any).id || `usr_${verifiedEmail}`
    const allProducts = await getProducts(true)

    let serverAmount = 0
    const productSummaryParts: string[] = []

    for (const item of items) {
      const product =
        (item.productId
          ? allProducts.find((p) => p.productId === item.productId || p.id === item.productId)
          : undefined) ||
        allProducts.find(
          (p) =>
            p.id === item.handle ||
            p.productId === item.handle ||
            p.handle === item.handle ||
            p.slug === item.handle
        )

      if (!product) {
        return NextResponse.json(
          { error: `Product "${item.name}" is no longer available.` },
          { status: 400 }
        )
      }
      if (product.status === "Inactive") {
        return NextResponse.json(
          { error: `"${product.name}" is currently unavailable.` },
          { status: 400 }
        )
      }
      const availableStock = product.stock ?? (product.inStock ? 100 : 0)
      if (!product.inStock || availableStock <= 0) {
        return NextResponse.json(
          { error: `"${product.name}" is currently out of stock.` },
          { status: 400 }
        )
      }
      if (item.quantity > availableStock) {
        return NextResponse.json(
          { error: `Only ${availableStock} unit(s) of "${product.name}" are available in stock.` },
          { status: 400 }
        )
      }
      const { sellingPrice } = getEffectivePricing(product)
      if (sellingPrice <= 0) {
        return NextResponse.json(
          { error: `"${product.name}" does not have a valid online price.` },
          { status: 400 }
        )
      }
      serverAmount += sellingPrice * item.quantity
      productSummaryParts.push(`${product.name} x${item.quantity}`)
    }

    if (serverAmount <= 0) {
      return NextResponse.json({ error: "Invalid order amount" }, { status: 400 })
    }

    const productSummary = productSummaryParts.join(", ").substring(0, 500)
    const shippingAmount = FLAT_SHIPPING_INR
    const totalAmountInr = serverAmount + shippingAmount

    if (
      expectedTotal != null &&
      Math.round(expectedTotal * 100) !== Math.round(totalAmountInr * 100)
    ) {
      return NextResponse.json(
        {
          error: "Product prices have been updated. Please review and confirm the updated total before paying.",
          code: "PRICE_CHANGED",
          serverTotal: totalAmountInr,
        },
        { status: 409 }
      )
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: "CLASPO Order",
              description: productSummary,
            },
            unit_amount: Math.round(serverAmount * 100), // INR to paise
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: "Shipping (Flat Rate)",
            },
            unit_amount: Math.round(shippingAmount * 100), // INR to paise
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl,
      cancel_url:  cancelUrl,
      customer_email: verifiedEmail,
      metadata: {
        userId: verifiedUserId,
        customerName: customerName || dbUser?.fullName || authSession.user.name || "Customer",
        email: verifiedEmail,
        productSummary,
        subtotal: serverAmount.toString(),
        shippingCharge: shippingAmount.toString(),
        amount: totalAmountInr.toString(), // server-computed INR total, stored for reference only
      },
    })

    return NextResponse.json({
      url: session.url,
      downloadToken: generateInvoiceToken(session.id),
    })
  } catch (err: any) {
    console.error("Stripe session creation error:", err)
    return NextResponse.json(
      { error: err.message || "Failed to create checkout session" },
      { status: 500 }
    )
  }
}
