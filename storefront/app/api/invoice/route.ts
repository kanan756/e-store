import { NextResponse } from "next/server";
import { generateInvoicePdf } from "@/lib/pdf";
import { verifyInvoiceToken } from "@/lib/invoice-token";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const paymentId = searchParams.get("paymentId");
  const token = searchParams.get("token") ?? "";

  if (!paymentId) {
    return NextResponse.json({ error: "Missing paymentId" }, { status: 400 });
  }

  // Verify the HMAC token generated at order-creation time.
  // Prevents unauthenticated enumeration of all customer invoices by
  // payment ID — an attacker who guesses a valid paymentId still cannot
  // compute a valid token without the server secret (NEXTAUTH_SECRET).
  if (!verifyInvoiceToken(paymentId, token)) {
    return NextResponse.json({ error: "Invalid or missing download token" }, { status: 403 });
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

    const pdfBuffer = await generateInvoicePdf({
      orderId: order.orderId,
      customerName: order.customerName,
      email: order.email,
      product: order.product,
      amount: order.amount,
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
