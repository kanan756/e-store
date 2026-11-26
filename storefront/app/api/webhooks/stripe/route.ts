import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import Stripe from "stripe"
import {
  appendOrder,
  deductStockForOrder,
  getOrderByPaymentId,
  getProducts,
  restoreStockForOrder,
  updateOrderStatusByPaymentId,
  type StockOrderLineInput,
} from "@/lib/sheets"
import { getEffectivePricing } from "@/lib/pricing"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2025-01-27.acacia" as any,
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ""

function parseOrderItemsFromMetadata(
  rawOrderItems?: string,
  productSummary?: string
): StockOrderLineInput[] {
  if (rawOrderItems) {
    try {
      const parsed = JSON.parse(rawOrderItems)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
          .filter((item) => item && (item.pid || item.name) && Number(item.qty) > 0)
          .map((item) => ({
            productId: typeof item.pid === "string" ? item.pid : undefined,
            name: typeof item.name === "string" ? item.name : undefined,
            quantity: Math.max(1, Math.floor(Number(item.qty))),
            colorId: typeof item.cid === "string" && item.cid ? item.cid : undefined,
            colorName: typeof item.cname === "string" && item.cname ? item.cname : undefined,
          }))
      }
    } catch {
      // Fall back to productSummary parsing below
    }
  }

  if (!productSummary) return []
  return productSummary
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const qtyMatch = part.match(/^(.*?)\s+x(\d+)$/i)
      const base = qtyMatch ? qtyMatch[1].trim() : part
      const quantity = qtyMatch ? Math.max(1, parseInt(qtyMatch[2], 10)) : 1
      const colorMatch = base.match(/^(.*?)\s*\(([^)]+)\)$/)
      return {
        name: colorMatch ? colorMatch[1].trim() : base,
        colorName: colorMatch ? colorMatch[2].trim() : undefined,
        quantity,
      }
    })
}

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get("stripe-signature")

    if (!signature) {
      return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 })
    }

    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`)
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session

      if (session.payment_status !== "paid") {
        console.log(`Checkout session ${session.id} not paid (status=${session.payment_status}). Skipping stock deduction.`)
        return NextResponse.json({ received: true, message: "Payment not settled yet" })
      }

      const paymentIntentId = session.payment_intent as string
      if (!paymentIntentId) {
        console.warn("Missing payment intent ID on session", session.id)
        return NextResponse.json({ received: true, message: "No payment intent" })
      }

      const {
        customerName,
        email,
        productSummary,
        orderItems,
        userId,
        subtotal,
        shippingCharge,
      } = session.metadata || {}

      if (!customerName || !email) {
        console.error("Missing metadata in session", session.id)
        return NextResponse.json({ error: "Missing metadata in session" }, { status: 400 })
      }

      const existingOrder = await getOrderByPaymentId(paymentIntentId)
      const orderId = existingOrder?.orderId || `ORD-${Date.now()}`

      const lineItems = parseOrderItemsFromMetadata(orderItems, productSummary)

      // Snapshot product details & historical prices before stock deduction
      const catalogProducts = await getProducts(true)
      const structuredItems = lineItems.map((line) => {
        const matched =
          (line.productId
            ? catalogProducts.find((p) => p.productId === line.productId || p.id === line.productId)
            : undefined) ||
          (line.name
            ? catalogProducts.find((p) => p.name.trim().toLowerCase() === line.name!.trim().toLowerCase())
            : undefined)

        const pricing = matched ? getEffectivePricing(matched) : null
        return {
          productId: matched?.productId || matched?.id || line.productId || "",
          name: matched?.name || line.name || "Product",
          imageUrl: matched?.primaryImage || matched?.imageUrl || matched?.additionalImages?.[0]?.url || "",
          colorName: line.colorName || "",
          colorId: line.colorId || "",
          quantity: line.quantity,
          regularPrice: pricing ? pricing.regularPrice : undefined,
          discountPrice: pricing && pricing.hasDiscount ? pricing.sellingPrice : null,
          effectivePrice: pricing ? pricing.sellingPrice : undefined,
        }
      })

      const deductionResult = await deductStockForOrder({
        eventId: event.id,
        orderId,
        paymentId: paymentIntentId,
        items: lineItems,
      })

      if (existingOrder || deductionResult.alreadyProcessed) {
        console.log(`Order/stock for payment ${paymentIntentId} already processed. Skipping duplicate.`)
        return NextResponse.json({ received: true, message: "Order already processed" })
      }

      const confirmedAmount =
        session.amount_total != null ? session.amount_total / 100 : 0
      const parsedShipping = shippingCharge != null ? Number(shippingCharge) : 0
      const parsedSubtotal =
        subtotal != null
          ? Number(subtotal)
          : Math.max(0, confirmedAmount - parsedShipping)

      const shippingDetails = (session as any).shipping_details || session.customer_details
      const addrObj = shippingDetails?.address
      const formattedAddress = addrObj
        ? [addrObj.line1, addrObj.line2, addrObj.city, addrObj.state, addrObj.postal_code, addrObj.country]
            .filter(Boolean)
            .join(", ")
        : ""
      const phoneNumber = session.customer_details?.phone || ""

      try {
        await appendOrder({
          orderId,
          userId: userId || undefined,
          customerName,
          email,
          phoneNumber,
          shippingAddress: formattedAddress,
          items: structuredItems.length > 0 ? JSON.stringify(structuredItems) : (productSummary || "Stripe Order"),
          product: productSummary || "Stripe Order",
          subtotal: parsedSubtotal,
          shippingCharge: parsedShipping,
          totalAmount: confirmedAmount,
          amount: confirmedAmount,
          paymentMethod: "Stripe",
          paymentStatus: "Paid",
          orderStatus: "Pending",
          paymentId: paymentIntentId,
        })
      } catch (orderErr) {
        // Roll back reserved stock if order creation fails so stock & orders never go inconsistent
        await restoreStockForOrder({
          eventId: `rollback_${event.id}`,
          orderId,
          paymentId: paymentIntentId,
        }).catch(() => {})
        throw orderErr
      }

      revalidatePath("/")
      revalidatePath("/products")
      revalidatePath("/shop")
      revalidatePath("/secure-product-manager/orders")
      for (const updated of deductionResult.updatedProducts) {
        if (updated.handle) {
          revalidatePath(`/products/${updated.handle}`)
        }
      }

      try {
        const { sendOrderConfirmationEmail } = await import("@/lib/email")
        await sendOrderConfirmationEmail({
          to: email,
          customerName,
          orderId,
          product: productSummary || "Stripe Order",
          amount: confirmedAmount,
        })
      } catch (emailErr) {
        console.error("Failed to send confirmation email:", emailErr)
      }

      console.log(`Successfully processed order ${orderId} and deducted stock for payment ${paymentIntentId}`)
    } else if (event.type === "charge.refunded") {
      const charge = event.data.object as Stripe.Charge
      const paymentIntentId = typeof charge.payment_intent === "string" ? charge.payment_intent : ""

      // Only restore stock automatically on full refunds.
      // Partial refunds require explicit manager approval via /api/product-manager/orders/restock.
      const isFullRefund =
        Boolean(charge.refunded) &&
        charge.amount > 0 &&
        charge.amount_refunded >= charge.amount

      if (paymentIntentId && isFullRefund) {
        const existingOrder = await getOrderByPaymentId(paymentIntentId)
        const restoreResult = await restoreStockForOrder({
          eventId: event.id,
          orderId: existingOrder?.orderId,
          paymentId: paymentIntentId,
        })

        await updateOrderStatusByPaymentId(paymentIntentId, "Refunded", "Cancelled")

        if (!restoreResult.alreadyProcessed && restoreResult.updatedProducts.length > 0) {
          revalidatePath("/")
          revalidatePath("/products")
          revalidatePath("/shop")
          for (const updated of restoreResult.updatedProducts) {
            if (updated.handle) {
              revalidatePath(`/products/${updated.handle}`)
            }
          }
        }
        console.log(`Processed full refund restock for payment ${paymentIntentId}`)
      } else {
        console.log(`Partial or unlinked refund received for charge ${charge.id}; automatic restock skipped.`)
      }
    } else if (
      event.type === "checkout.session.expired" ||
      event.type === "payment_intent.payment_failed"
    ) {
      // Release any stock reservation if one existed for this payment intent
      const obj = event.data.object as { payment_intent?: string; id?: string }
      const failedPaymentId =
        event.type === "payment_intent.payment_failed"
          ? obj.id
          : typeof obj.payment_intent === "string"
            ? obj.payment_intent
            : ""

      if (failedPaymentId) {
        const existingOrder = await getOrderByPaymentId(failedPaymentId)
        await restoreStockForOrder({
          eventId: event.id,
          orderId: existingOrder?.orderId,
          paymentId: failedPaymentId,
        }).catch(() => {})
        await updateOrderStatusByPaymentId(failedPaymentId, "Failed", "Cancelled").catch(() => {})
      }
      console.log(`Payment event ${event.type} handled; reservation released if present.`)
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error("Stripe webhook error:", err)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}
