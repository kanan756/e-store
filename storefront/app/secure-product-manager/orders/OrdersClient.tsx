"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import type { Order } from "@/lib/sheets"
import { formatPrice } from "@/lib/format"
import {
  countOrderProducts,
  formatDateTime,
  ORDER_STATUS_STYLES,
  PAYMENT_STATUS_STYLES,
  NEXT_AVAILABLE_ACTIONS,
} from "./order-utils"

const ALL_STATUSES = [
  "All",
  "Pending",
  "Accepted",
  "Packing",
  "Ready to Ship",
  "Shipping",
  "Collected by Customer",
  "Rejected",
  "Cancelled",
]

interface OrdersClientProps {
  initialOrders: Order[]
}

export default function OrdersClient({ initialOrders }: OrdersClientProps) {
  const [orders, setOrders] = useState<Order[]>(() =>
    [...initialOrders].sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    )
  )
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [rejectModalOrder, setRejectModalOrder] = useState<Order | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [refundOnReject, setRefundOnReject] = useState(true)
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 5000)
  }

  const metrics = useMemo(() => {
    let pending = 0
    let inFulfillment = 0
    let collected = 0
    let rejected = 0
    for (const o of orders) {
      const st = o.orderStatus
      if (st === "Pending") pending++
      else if (st === "Accepted" || st === "Packing" || st === "Ready to Ship" || st === "Shipping") {
        inFulfillment++
      } else if (st === "Collected by Customer" || st === "Delivered") {
        collected++
      } else if (st === "Rejected" || st === "Cancelled") {
        rejected++
      }
    }
    return { total: orders.length, pending, inFulfillment, collected, rejected }
  }, [orders])

  const filteredOrders = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    return orders.filter((o) => {
      const matchesSearch =
        !q ||
        o.orderId.toLowerCase().includes(q) ||
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q)

      const matchesStatus =
        statusFilter === "All" ||
        o.orderStatus.toLowerCase() === statusFilter.toLowerCase()

      return matchesSearch && matchesStatus
    })
  }, [orders, searchTerm, statusFilter])

  // Status transition handler for lifecycle actions (Accept, Packing, Ready to Ship, Shipping, Collected)
  const handleTransition = async (order: Order, targetStatus: string, remarks?: string) => {
    if (processingId) return
    setProcessingId(order.orderId)
    try {
      const res = await fetch(
        `/api/product-manager/orders/${encodeURIComponent(order.orderId)}/status`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: targetStatus,
            remarks: remarks || `Order transitioned to ${targetStatus} from Orders list`,
          }),
        }
      )
      const data = await res.json()
      if (!res.ok) {
        showToast("error", data.error || `Failed to transition order to ${targetStatus}`)
        return
      }

      const updatedOrder: Order = data.order || {
        ...order,
        orderStatus: targetStatus,
        status: targetStatus,
      }

      setOrders((prev) =>
        prev.map((o) => (o.orderId === order.orderId ? updatedOrder : o))
      )
      showToast("success", `Order ${order.orderId} moved to "${targetStatus}".`)
    } catch {
      showToast("error", `Network error while updating status to ${targetStatus}.`)
    } finally {
      setProcessingId(null)
    }
  }

  const handleRejectConfirm = async () => {
    if (!rejectModalOrder || processingId) return
    const targetOrder = rejectModalOrder
    setProcessingId(targetOrder.orderId)
    try {
      const res = await fetch(
        `/api/product-manager/orders/${encodeURIComponent(targetOrder.orderId)}/status`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "Rejected",
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

      const updatedOrder: Order = data.order || {
        ...targetOrder,
        orderStatus: "Rejected",
        status: "Rejected",
        rejectedAt: new Date().toISOString(),
        rejectionReason: rejectionReason.trim(),
        paymentStatus: data.refundIssued ? "Refunded" : targetOrder.paymentStatus,
      }

      setOrders((prev) =>
        prev.map((o) => (o.orderId === targetOrder.orderId ? updatedOrder : o))
      )
      const extras: string[] = []
      if (data.stockRestored) extras.push("stock restored")
      if (data.refundIssued) extras.push("Stripe refund initiated")
      if (data.refundError) extras.push(`refund warning: ${data.refundError}`)

      showToast(
        "success",
        `Order ${targetOrder.orderId} rejected${extras.length ? ` (${extras.join(", ")})` : ""}.`
      )
      setRejectModalOrder(null)
      setRejectionReason("")
    } catch {
      showToast("error", "Network error while rejecting order.")
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div>
      {/* Page Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 14,
          marginBottom: 28,
        }}
      >
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#17191C", margin: "0 0 6px" }}>
            Customer Orders
          </h1>
          <p style={{ fontSize: 14, color: "#6B7280", margin: 0 }}>
            Manage customer orders and progress fulfillment through each tracking stage.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link
            href="/secure-product-manager/order-tracking"
            className="pm-btn pm-btn-secondary"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 700 }}
          >
            🚚 Order Tracking Board →
          </Link>
        </div>
      </div>

      {/* Toast Notification */}
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
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "inherit",
              fontWeight: 700,
              fontSize: 16,
            }}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      )}

      {/* Stat Cards */}
      <div className="pm-stats-grid">
        <div className="pm-stat-card">
          <div className="pm-stat-header">
            <span className="pm-stat-label">Total Orders</span>
          </div>
          <div className="pm-stat-value">{metrics.total}</div>
        </div>

        <div className="pm-stat-card">
          <div className="pm-stat-header">
            <span className="pm-stat-label">Pending Review</span>
          </div>
          <div className="pm-stat-value" style={{ color: "#C2410C" }}>
            {metrics.pending}
          </div>
        </div>

        <div className="pm-stat-card">
          <div className="pm-stat-header">
            <span className="pm-stat-label">In Fulfillment</span>
          </div>
          <div className="pm-stat-value" style={{ color: "#2563EB" }}>
            {metrics.inFulfillment}
          </div>
        </div>

        <div className="pm-stat-card">
          <div className="pm-stat-header">
            <span className="pm-stat-label">Collected</span>
          </div>
          <div className="pm-stat-value" style={{ color: "#059669" }}>
            {metrics.collected}
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div
        className="pm-card"
        style={{
          padding: "16px 20px",
          marginBottom: 24,
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: "1 1 240px", minWidth: 0, position: "relative" }}>
          <input
            type="text"
            className="pm-input"
            placeholder="Search by Order ID, customer name, or email…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: 38 }}
          />
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9CA3AF"
            strokeWidth="2"
            style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        <div style={{ flex: "0 1 240px", minWidth: 0, width: "100%", maxWidth: 260 }}>
          <select
            className="pm-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>
                Status: {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="pm-card">
        {filteredOrders.length === 0 ? (
          <div style={{ padding: "60px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
              No orders found
            </div>
            <p style={{ fontSize: 14, color: "#6B7280", margin: 0 }}>
              {orders.length === 0
                ? "Customer orders placed through the store will appear here."
                : "No orders match your current search or status filter."}
            </p>
          </div>
        ) : (
          <div className="pm-desktop-table" style={{ overflowX: "auto" }}>
            <table className="pm-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer Name</th>
                  <th>Customer Email</th>
                  <th>Order Date</th>
                  <th>Products</th>
                  <th>Total Amount</th>
                  <th>Payment Status</th>
                  <th>Order Status</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const statusStyle = ORDER_STATUS_STYLES[order.orderStatus] || {
                    bg: "#F3F4F6",
                    color: "#374151",
                    border: "#D1D5DB",
                  }
                  const payStyle = PAYMENT_STATUS_STYLES[order.paymentStatus] || {
                    bg: "#F3F4F6",
                    color: "#374151",
                  }
                  const productCount = countOrderProducts(order)
                  const isAwaitingAcceptance =
                    order.orderStatus === "Pending" ||
                    (order.orderStatus === "Processing" && !order.acceptedAt)
                  const nextAction =
                    order.orderStatus === "Processing" && order.acceptedAt
                      ? NEXT_AVAILABLE_ACTIONS["Accepted"]
                      : NEXT_AVAILABLE_ACTIONS[order.orderStatus]
                  const isBusy = processingId === order.orderId

                  return (
                    <tr key={order.orderId}>
                      <td>
                        <Link
                          href={`/secure-product-manager/orders/${encodeURIComponent(order.orderId)}`}
                          style={{
                            fontWeight: 700,
                            color: "#F36B12",
                            textDecoration: "none",
                            fontSize: 13.5,
                          }}
                        >
                          {order.orderId}
                        </Link>
                        {order.orderNumber && (
                          <div style={{ fontSize: 11.5, color: "#6B7280" }}>
                            #{order.orderNumber}
                          </div>
                        )}
                      </td>

                      <td style={{ fontWeight: 600, color: "#17191C" }}>
                        {order.customerName || "—"}
                      </td>

                      <td style={{ fontSize: 13, color: "#4B5563" }}>{order.email || "—"}</td>

                      <td style={{ fontSize: 12.5, color: "#4B5563", whiteSpace: "nowrap" }}>
                        {formatDateTime(order.createdAt)}
                      </td>

                      <td style={{ fontWeight: 600, color: "#374151" }}>
                        {productCount} {productCount === 1 ? "item" : "items"}
                      </td>

                      <td style={{ fontWeight: 700, color: "#17191C", whiteSpace: "nowrap" }}>
                        {formatPrice(order.totalAmount)}
                      </td>

                      <td>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 10px",
                            borderRadius: 999,
                            fontSize: 12,
                            fontWeight: 700,
                            background: payStyle.bg,
                            color: payStyle.color,
                          }}
                        >
                          {order.paymentStatus || "Pending"}
                        </span>
                      </td>

                      <td>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 10px",
                            borderRadius: 999,
                            fontSize: 12,
                            fontWeight: 700,
                            background: statusStyle.bg,
                            color: statusStyle.color,
                            border: `1px solid ${statusStyle.border}`,
                          }}
                        >
                          {order.orderStatus || "Pending"}
                        </span>
                      </td>

                      <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                        <div style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                          <Link
                            href={`/secure-product-manager/orders/${encodeURIComponent(order.orderId)}`}
                            className="pm-btn pm-btn-secondary"
                            style={{ padding: "6px 12px", fontSize: 12.5 }}
                          >
                            View
                          </Link>

                          {/* For Pending or Unprocessed orders: Accept / Reject */}
                          {isAwaitingAcceptance && (
                            <>
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => handleTransition(order, "Accepted")}
                                style={{
                                  padding: "6px 12px",
                                  fontSize: 12.5,
                                  fontWeight: 700,
                                  borderRadius: 6,
                                  border: "1px solid #059669",
                                  background: "#059669",
                                  color: "#FFFFFF",
                                  cursor: isBusy ? "wait" : "pointer",
                                }}
                              >
                                {isBusy ? "…" : "Accept Order"}
                              </button>
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => {
                                  setRejectModalOrder(order)
                                  setRejectionReason("")
                                  setRefundOnReject(order.paymentStatus === "Paid")
                                }}
                                style={{
                                  padding: "6px 12px",
                                  fontSize: 12.5,
                                  fontWeight: 700,
                                  borderRadius: 6,
                                  border: "1px solid #DC2626",
                                  background: "#FFFFFF",
                                  color: "#DC2626",
                                  cursor: isBusy ? "wait" : "pointer",
                                }}
                              >
                                Reject Order
                              </button>
                            </>
                          )}

                          {/* For Accepted, Packing, Ready to Ship, Shipping: Next available action */}
                          {!isAwaitingAcceptance && nextAction && (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleTransition(order, nextAction.nextStatus)}
                              style={{
                                padding: "6px 12px",
                                fontSize: 12.5,
                                fontWeight: 700,
                                borderRadius: 6,
                                border: `1px solid ${nextAction.border}`,
                                background: nextAction.bg,
                                color: nextAction.color,
                                cursor: isBusy ? "wait" : "pointer",
                              }}
                              title={`Advance to ${nextAction.nextStatus}`}
                            >
                              {isBusy ? "…" : nextAction.label}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject Confirmation Modal */}
      {rejectModalOrder && (
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
              Are you sure you want to reject order <strong>{rejectModalOrder.orderId}</strong> for{" "}
              <strong>{rejectModalOrder.customerName}</strong>? Reserved stock will be restored
              automatically.
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
              placeholder="e.g. Out of stock, address unserviceable, suspected fraud…"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              style={{ width: "100%", marginBottom: 14, resize: "vertical" }}
            />

            {rejectModalOrder.paymentStatus === "Paid" && rejectModalOrder.transactionId && (
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
                <span>Issue automatic Stripe refund ({formatPrice(rejectModalOrder.totalAmount)})</span>
              </label>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                type="button"
                className="pm-btn pm-btn-secondary"
                onClick={() => setRejectModalOrder(null)}
                disabled={Boolean(processingId)}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectConfirm}
                disabled={Boolean(processingId)}
                style={{
                  padding: "10px 18px",
                  borderRadius: 8,
                  border: "none",
                  background: "#DC2626",
                  color: "#FFFFFF",
                  fontSize: 13.5,
                  fontWeight: 700,
                  cursor: processingId ? "wait" : "pointer",
                }}
              >
                {processingId ? "Rejecting…" : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
