/**
 * @file lib/email.ts
 * @description Nodemailer-based email service for the Client Store.
 *   Sends branded HTML order-status notification emails to customers via
 *   Gmail SMTP (App Password auth).  Admin always receives a CC copy.
 *
 *   Exported functions:
 *     - sendOrderStatusEmail : Sends a styled HTML email with order details,
 *       a status badge, and a "Track Your Order" CTA link.
 *
 *   Required env vars:
 *     GMAIL_USER         – sender Gmail address
 *     GMAIL_APP_PASSWORD – 16-char Gmail App Password (not account password)
 *     EMAIL_FROM_NAME    – display name shown in the From header
 *
 * @owner Heet-P
 * @lastModified May 16, 2026
 */

import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

const STATUS_ICONS: Record<string, string> = {
  Processing:  "⏳",
  Packed:      "📦",
  Shipped:     "🚚",
  "In Transit":"✈️",
  Delivered:   "✅",
  Cancelled:   "❌",
}

const STATUS_COLORS: Record<string, string> = {
  Processing:  "#f59e0b",
  Packed:      "#8b5cf6",
  Shipped:     "#2563eb",
  "In Transit":"#0891b2",
  Delivered:   "#16a34a",
  Cancelled:   "#ef4444",
}

export async function sendOrderStatusEmail({
  to,
  customerName,
  orderId,
  product,
  status,
  comments,
}: {
  to: string
  customerName: string
  orderId: string
  product: string
  status: string
  comments?: string
}) {
  const icon = STATUS_ICONS[status] ?? "📋"
  const color = STATUS_COLORS[status] ?? "#2563eb"
  const fromName = process.env.EMAIL_FROM_NAME ?? "Client Store"
  const storeUrl = process.env.NEXT_PUBLIC_STORE_URL ?? "https://clientstore.com"

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Order Update</title></head>
<body style="margin:0;padding:0;background:#0f0f13;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f13;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#1e1e2a;border-radius:16px;overflow:hidden;border:1px solid #252535;">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#1e1e2a,#252535);padding:36px 40px;text-align:center;border-bottom:1px solid #252535;">
          <div style="font-size:40px;margin-bottom:12px;">${icon}</div>
          <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.02em;">Order Status Update</h1>
          <p style="margin:8px 0 0;color:#8888aa;font-size:14px;">${fromName}</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:36px 40px;">
          <p style="color:#ccccdd;font-size:16px;margin:0 0 24px;">Hi <strong style="color:#ffffff;">${customerName}</strong>,</p>
          <p style="color:#8888aa;font-size:14px;margin:0 0 28px;line-height:1.6;">
            Your order has been updated. Here are the latest details:
          </p>

          <!-- Status Badge -->
          <div style="text-align:center;margin-bottom:32px;">
            <span style="display:inline-block;padding:10px 24px;border-radius:999px;font-size:16px;font-weight:800;background:${color}20;color:${color};border:2px solid ${color}40;">
              ${icon} ${status}
            </span>
          </div>

          <!-- Order Details -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#252535;border-radius:12px;overflow:hidden;margin-bottom:24px;">
            <tr style="border-bottom:1px solid #2a2a3a;">
              <td style="padding:14px 18px;color:#8888aa;font-size:13px;width:120px;">Order ID</td>
              <td style="padding:14px 18px;color:#60a5fa;font-size:13px;font-family:monospace;">${orderId}</td>
            </tr>
            <tr style="border-bottom:1px solid #2a2a3a;">
              <td style="padding:14px 18px;color:#8888aa;font-size:13px;">Product</td>
              <td style="padding:14px 18px;color:#ffffff;font-size:13px;">${product}</td>
            </tr>
            <tr>
              <td style="padding:14px 18px;color:#8888aa;font-size:13px;">Status</td>
              <td style="padding:14px 18px;color:${color};font-size:13px;font-weight:700;">${status}</td>
            </tr>
          </table>

          ${comments ? `
          <!-- Comment -->
          <div style="background:${color}10;border:1px solid ${color}30;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
            <p style="margin:0 0 6px;color:${color};font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;">Update from our team</p>
            <p style="margin:0;color:#ccccdd;font-size:14px;line-height:1.6;">${comments}</p>
          </div>
          ` : ""}

          <!-- CTA -->
          <div style="text-align:center;margin-top:32px;">
            <a href="${storeUrl}/track-order" style="display:inline-block;padding:14px 28px;background:linear-gradient(135deg,#2563eb,#7c3aed);color:#ffffff;text-decoration:none;border-radius:10px;font-size:15px;font-weight:700;">
              Track Your Order →
            </a>
          </div>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:24px 40px;border-top:1px solid #252535;text-align:center;">
          <p style="margin:0;color:#555566;font-size:12px;">
            You received this email because you placed an order at ${fromName}.<br>
            Questions? Reply to this email.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
`

  await transporter.sendMail({
    from: `"${fromName}" <${process.env.GMAIL_USER}>`,
    to,
    cc: process.env.GMAIL_USER, // Admin always gets a copy
    subject: `${icon} Your order ${orderId} is now: ${status}`,
    html,
  })
}
