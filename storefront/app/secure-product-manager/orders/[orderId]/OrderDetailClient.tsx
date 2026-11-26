"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import type { Order, Product } from "@/lib/sheets"
import { formatPrice } from "@/lib/format"
import {
  parseOrderItems,
  formatDateTime,
  ORDER_STATUS_STYLES,
  PAYMENT_STATUS_STYLES,
} from "../order-utils"

interface OrderDetailClientProps {
  initialOrder: Order
  products: Product[]
}

export default function OrderDetailClient({ initialOrder, products }: OrderDetailClientProps) {
  const [order, setOrder] = useState<Order>(initialOrder)
  const [busy, setBusy] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [refundOnReject, setRefundOnReject] = useState(order.paymentStatus === "Paid")
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 5000)
  }

  // Enrich parsed items with catalog product info (image, ID, regular/discount price fallback)
  const enrichedItems = useMemo(() => {
    const parsed = parseOrderItems(order.items || order.product)
    return parsed.map((item) => {
      const matchedProduct =
        (item.productId
          ? products.find((p) => p.productId === item.productId || p.id === item.productId)
          : undefined) ||
        products.find((p) => p.name.trim().toLowerCase() === item.name.trim().toLowerCase())

      return {
        ...item,
        productId: item.productId || matchedProduct?.productId || matchedProduct?.id || "—",
        imageUrl:
          item.imageUrl ||
          matchedProduct?.primaryImage ||
          matchedProduct?.imageUrl ||
          matchedProduct?.additionalImages?.[0]?.url ||
          "",
        regularPrice:
          item.regularPrice != null
            ? item.regularPrice
            : matchedProduct?.price,
        discountPrice:
          item.discountPrice !== undefined
            ? item.discountPrice
            : matchedProduct?.discountPrice ?? null,
        effectivePrice:
          item.effectivePrice != null
            ? item.effectivePrice
            : matchedProduct
              ? matchedProduct.discountPrice != null &&
                matchedProduct.discountPrice > 0 &&
                matchedProduct.discountPrice < matchedProduct.price
                ? matchedProduct.discountPrice
                : matchedProduct.price
              : undefined,
      }
    })
  }, [order.items, order.product, products])

  const isPending = order.orderStatus === "Pending"
  const statusStyle = ORDER_STATUS_STYLES[order.orderStatus] || {
    bg: "#F3F4F6",
    color: "#374151",
    border: "#D1D5DB",
  }
  const payStyle = PAYMENT_STATUS_STYLES[order.paymentStatus] || {
    bg: "#F3F4F6",
    color: "#374151",
  }

  const handleAccept = async () => {
    if (!isPending || busy) return
    setBusy(true)
    try {
      const res = await fetch(
        `/api/product-manager/orders/${encodeURIComponent(order.orderId)}/accept`,
        { method: "POST" }
      )
      const data = await res.json()
      if (!res.ok) {
        showToast("error", data.error || "Failed to accept order")
        return
      }
      setOrder((prev) => ({
        ...prev,
        orderStatus: "Accepted",
        status: "Accepted",
        acceptedAt: data.acceptedAt || new Date().toISOString(),
      }))
      showToast("success", "Order accepted and database updated.")
    } catch {
      showToast("error", "Network error while accepting order.")
    } finally {
      setBusy(false)
    }
  }

  const handleRejectConfirm = async () => {
    if (!isPending || busy) return
    setBusy(true)
    try {
      const res = await fetch(
        `/api/product-manager/orders/${encodeURIComponent(order.orderId)}/reject`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rejectionReason: rejectionReason.trim(),
            refundPayment: refundOnReject,
          }),
        }
      )
      const data = await res.json()
      if (!res.ok) {
        showToast("error", data.error || "Failed to reject order")
        return
      }
      setOrder((prev) => ({
        ...prev,
        orderStatus: "Rejected",
        status: "Rejected",
        rejectedAt: data.rejectedAt || new Date().toISOString(),
        rejectionReason: rejectionReason.trim(),
        paymentStatus: data.refundIssued ? "Refunded" : prev.paymentStatus,
      }))
      setShowRejectModal(false)

      const notes: string[] = []
      if (data.stockRestored) notes.push("reserved stock restored")
      if (data.refundIssued) notes.push("Stripe refund initiated")
      if (data.refundError) notes.push(`refund warning: ${data.refundError}`)
      showToast(
        "success",
        `Order rejected${notes.length ? ` (${notes.join(", ")})` : ""}.`
      )
    } catch {
      showToast("error", "Network error while rejecting order.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      {/* Breadcrumb + Header */}
      <div style={{ marginBottom: 20 }}>
        <Link
          href="/secure-product-manager/orders"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13.5,
            fontWeight: 600,
            color: "#6B7280",
            textDecoration: "none",
            marginBottom: 12,
          }}
        >
          ← Back to Orders
        </Link>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: "#17191C", margin: 0 }}>
                Order {order.orderId}
              </h1>
              <span
                style={{
                  padding: "4px 12px",
                  borderRadius: 999,
                  fontSize: 12.5,
                  fontWeight: 700,
                  background: statusStyle.bg,
                  color: statusStyle.color,
                  border: `1px solid ${statusStyle.border}`,
                }}
              >
                {order.orderStatus}
              </span>
            </div>
            <p style={{ fontSize: 13.5, color: "#6B7280", margin: "6px 0 0" }}>
              Placed on {formatDateTime(order.createdAt)}
              {order.orderNumber ? ` • Order #${order.orderNumber}` : ""}
            </p>
          </div>

          {isPending && (
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                disabled={busy}
                onClick={handleAccept}
                style={{
                  padding: "10px 20px",
                  borderRadius: 8,
                  border: "none",
                  background: "#059669",
                  color: "#FFFFFF",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: busy ? "wait" : "pointer",
                }}
              >
                {busy ? "Processing…" : "Accept Order"}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setRejectionReason("")
                  setRefundOnReject(order.paymentStatus === "Paid")
                  setShowRejectModal(true)
                }}
                style={{
                  padding: "10px 20px",
                  borderRadius: 8,
                  border: "1px solid #DC2626",
                  background: "#FFFFFF",
                  color: "#DC2626",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: busy ? "wait" : "pointer",
                }}
              >
                Reject Order
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          style={{
            padding: "12px 18px",
            background: toast.type === "success" ? "#ECFDF5" : "#FEF2F2",
            border: `1px solid ${toast.type === "success" ? "#A7F3D0" : "#FECACA"}`,
            borderRadius: 8,
            color: toast.type === "success" ? "#065F46" : "#991B1B",
            fontSize: 14,
            fontWeight: 600,
            marginBottom: 20,
          }}
        >
          {toast.message}
        </div>
      )}

      {/* Status Timestamps Banner */}
      {(order.acceptedAt || order.rejectedAt) && (
        <div
          className="pm-card"
          style={{
            padding: "14px 20px",
            marginBottom: 20,
            background: order.acceptedAt ? "#ECFDF5" : "#FEF2F2",
            border: `1px solid ${order.acceptedAt ? "#A7F3D0" : "#FECACA"}`,
          }}
        >
          {order.acceptedAt && (
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "#065F46" }}>
              Accepted on {formatDateTime(order.acceptedAt)}
            </div>
          )}
          {order.rejectedAt && (
            <div style={{ fontSize: 13.5, color: "#991B1B" }}>
              <strong>Rejected on {formatDateTime(order.rejectedAt)}</strong>
              {order.rejectionReason ? ` — Reason: ${order.rejectionReason}` : ""}
            </div>
          )}
        </div>
      )}

      {/* Grid: Customer Info, Delivery Address, Payment Info */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 18,
          marginBottom: 24,
        }}
      >
        <div className="pm-card" style={{ padding: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 800, color: "#6B7280", textTransform: "uppercase", margin: "0 0 12px" }}>
            Customer Details
          </h2>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#17191C", marginBottom: 4 }}>
            {order.customerName || "—"}
          </div>
          <div style={{ fontSize: 13.5, color: "#4B5563", marginBottom: 4 }}>
            Email: {order.email || "—"}
          </div>
          <div style={{ fontSize: 13.5, color: "#4B5563" }}>
            Phone: {order.phoneNumber || "Not provided"}
          </div>
        </div>

        <div className="pm-card" style={{ padding: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 800, color: "#6B7280", textTransform: "uppercase", margin: "0 0 12px" }}>
            Delivery Address
          </h2>
          <div style={{ fontSize: 13.5, color: "#374151", lineHeight: 1.6, whiteSpace: "pre-line" }}>
            {order.shippingAddress || "Address collected via Stripe Checkout / Not provided"}
          </div>
        </div>

        <div className="pm-card" style={{ padding: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 800, color: "#6B7280", textTransform: "uppercase", margin: "0 0 12px" }}>
            Payment Information
          </h2>
          <div style={{ fontSize: 13.5, color: "#374151", marginBottom: 6 }}>
            Method: <strong>{order.paymentMethod || "Stripe"}</strong>
          </div>
          <div style={{ fontSize: 13.5, color: "#374151", marginBottom: 6 }}>
            Status:{" "}
            <span
              style={{
                display: "inline-block",
                padding: "2px 10px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 700,
                background: payStyle.bg,
                color: payStyle.color,
              }}
            >
              {order.paymentStatus || "Pending"}
            </span>
          </div>
          {order.transactionId && (
            <div style={{ fontSize: 12, color: "#6B7280", wordBreak: "break-all" }}>
              Payment ID: {order.transactionId}
            </div>
          )}
        </div>
      </div>

      {/* Ordered Products Table */}
      <div className="pm-card" style={{ marginBottom: 24 }}>
        <div style={{ padding: "18px 20px", borderBottom: "1px solid #E5E7EB" }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "#17191C", margin: 0 }}>
            Ordered Products ({enrichedItems.length})
          </h2>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="pm-table">
            <thead>
              <tr>
                <th style={{ width: 64 }}>Image</th>
                <th>Product</th>
                <th>Colour</th>
                <th>Qty</th>
                <th>Regular Price</th>
                <th>Discounted Price</th>
                <th style={{ textAlign: "right" }}>Line Total</th>
              </tr>
            </thead>
            <tbody>
              {enrichedItems.map((item, idx) => {
                const unitPrice = item.effectivePrice ?? item.discountPrice ?? item.regularPrice ?? 0
                const lineTotal = unitPrice * item.quantity
                return (
                  <tr key={`${item.productId}-${item.colorName || "base"}-${idx}`}>
                    <td>
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 8,
                          background: "#F3F4F6",
                          position: "relative",
                          overflow: "hidden",
                          border: "1px solid #E5E7EB",
                        }}
                      >
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            style={{ objectFit: "cover" }}
                            unoptimized
                          />
                        ) : (
                          <div
                            style={{
                              width: "100%",
                              height: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 11,
                              color: "#9CA3AF",
                            }}
                          >
                            N/A
                          </div>
                        )}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 700, color: "#17191C", fontSize: 14 }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
                        ID: {item.productId}
                      </div>
                    </td>

                    <td>
                      {item.colorName ? (
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 10px",
                            borderRadius: 999,
                            background: "#F3F4F6",
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#374151",
                          }}
                        >
                          {item.colorName}
                        </span>
                      ) : (
                        <span style={{ color: "#9CA3AF", fontSize: 13 }}>Default</span>
                      )}
                    </td>

                    <td style={{ fontWeight: 700, color: "#17191C" }}>{item.quantity}</td>

                    <td style={{ color: "#4B5563" }}>
                      {item.regularPrice != null ? formatPrice(item.regularPrice) : "—"}
                    </td>

                    <td style={{ color: "#059669", fontWeight: 600 }}>
                      {item.discountPrice != null && item.discountPrice > 0
                        ? formatPrice(item.discountPrice)
                        : "—"}
                    </td>

                    <td style={{ textAlign: "right", fontWeight: 700, color: "#17191C" }}>
                      {unitPrice > 0 ? formatPrice(lineTotal) : "—"}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Order Financial Summary */}
        <div
          style={{
            padding: "20px",
            borderTop: "1px solid #E5E7EB",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <div style={{ width: "100%", maxWidth: 320, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, color: "#4B5563" }}>
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, color: "#4B5563" }}>
              <span>Shipping Charges</span>
              <span>{formatPrice(order.shippingCharge)}</span>
            </div>
            {order.discount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, color: "#059669" }}>
                <span>Discount</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 17,
                fontWeight: 800,
                color: "#17191C",
                paddingTop: 10,
                borderTop: "1px solid #E5E7EB",
              }}
            >
              <span>Final Order Total</span>
              <span>{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reject Confirmation Modal */}
      {showRejectModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(17, 24, 39, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 12,
              maxWidth: 460,
              width: "100%",
              padding: 24,
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#17191C", margin: "0 0 8px" }}>
              Confirm Order Rejection
            </h2>
            <p style={{ fontSize: 13.5, color: "#4B5563", margin: "0 0 16px", lineHeight: 1.5 }}>
              Are you sure you want to reject order <strong>{order.orderId}</strong>? Reserved
              stock will be restored automatically.
            </p>

            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 700,
                color: "#374151",
                marginBottom: 6,
              }}
            >
              Rejection Reason (optional)
            </label>
            <textarea
              className="pm-input"
              rows={3}
              placeholder="Enter reason for rejecting this order…"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              style={{ width: "100%", marginBottom: 14, resize: "vertical" }}
            />

            {order.paymentStatus === "Paid" && order.transactionId && (
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                  color: "#374151",
                  marginBottom: 18,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={refundOnReject}
                  onChange={(e) => setRefundOnReject(e.target.checked)}
                />
                <span>Issue automatic Stripe refund ({formatPrice(order.totalAmount)})</span>
              </label>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                type="button"
                className="pm-btn pm-btn-secondary"
                onClick={() => setShowRejectModal(false)}
                disabled={busy}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectConfirm}
                disabled={busy}
                style={{
                  padding: "10px 18px",
                  borderRadius: 8,
                  border: "none",
                  background: "#DC2626",
                  color: "#FFFFFF",
                  fontSize: 13.5,
                  fontWeight: 700,
                  cursor: busy ? "wait" : "pointer",
                }}
              >
                {busy ? "Rejecting…" : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
