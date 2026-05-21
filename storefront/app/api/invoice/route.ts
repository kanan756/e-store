import { NextResponse } from "next/server";
import { getAllOrders } from "@/lib/sheets";
import { generateInvoicePdf } from "@/lib/pdf";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const paymentId = searchParams.get("paymentId");

  if (!paymentId) {
    return NextResponse.json({ error: "Missing paymentId" }, { status: 400 });
  }

  try {
    let lookupId = paymentId;
    if (paymentId.startsWith("cs_")) {
      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2025-01-27.acacia" as any });
      const session = await stripe.checkout.sessions.retrieve(paymentId);
      if (session.payment_intent) {
        lookupId = session.payment_intent as string;
      }
    }

    const { getOrderByPaymentId } = await import("@/lib/sheets");
    const order = await getOrderByPaymentId(lookupId);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const isStripe = order.comments.includes("pi_") || order.comments.includes("cs_");

    const pdfBuffer = await generateInvoicePdf({
      orderId: order.orderId,
      customerName: order.customerName,
      email: order.email,
      product: order.product,
      amount: order.amount,
      isStripe,
    });

    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Invoice_${order.orderId}.pdf"`,
      },
    });
  } catch (err) {
    console.error("Failed to generate invoice:", err);
    return NextResponse.json({ error: "Failed to generate invoice" }, { status: 500 });
  }
}
