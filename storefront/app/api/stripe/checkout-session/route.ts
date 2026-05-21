import { NextResponse } from "next/server"
import Stripe from "stripe"
import { z } from "zod"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-01-27.acacia" as any, 
})

const checkoutSessionSchema = z.object({
  customerName: z.string().min(1),
  email: z.string().email(),
  productSummary: z.string(),
  amount: z.number().positive(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = checkoutSessionSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
    }
    
    const { customerName, email, productSummary, amount, successUrl, cancelUrl } = parsed.data
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: "Superior Harness & Assembly LLC Order",
              description: productSummary.substring(0, 500),
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: email,
      metadata: {
        customerName,
        email,
        productSummary: productSummary.substring(0, 500), // metadata limit
        amount: amount.toString(),
      },
    })
    
    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error("Stripe session creation error:", err)
    return NextResponse.json({ error: err.message || "Failed to create checkout session" }, { status: 500 })
  }
}
