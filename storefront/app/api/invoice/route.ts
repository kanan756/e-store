import { NextResponse } from "next/server";
import { generateInvoicePdf, InvoiceLineItem } from "@/lib/pdf";
import { verifyInvoiceToken } from "@/lib/invoice-token";

function parseProductString(product: string): Array<{ name: string; quantity: number }> {
  return product
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((segment) => {
      const m = segment.match(/^(.+)\s+x(\d+)$/i);
      return m
        ? { name: m[1].trim(), quantity: parseInt(m[2], 10) }
        : { name: segment, quantity: 1 };
    });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const paymentId = searchParams.get("paymentId");
  const token = searchParams.get("token") ?? "";

  if (!paymentId) {
    return NextResponse.json({ error: "Missing paymentId" }, { status: 400 });
  }

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

    const { getOrderByPaymentId, getProducts } = await import("@/lib/sheets");
    const [order, products] = await Promise.all([
      getOrderByPaymentId(lookupId),
      getProducts().catch(() => []),
    ]);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const productMap = new Map(products.map((p) => [p.name.toLowerCase(), p.price]));
    const parsed = parseProductString(order.product);

    const items: InvoiceLineItem[] = parsed.map((entry) => ({
      name: entry.name,
      quantity: entry.quantity,
      unitPrice: productMap.get(entry.name.toLowerCase()) ?? 0,
    }));

    const pdfBuffer = await generateInvoicePdf({
      orderId: order.orderId,
      customerName: order.customerName,
      email: order.email,
      items,
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
