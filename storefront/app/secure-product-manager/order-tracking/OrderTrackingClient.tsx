"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import type { Order, Product, OrderStatusHistoryItem } from "@/lib/sheets"
import { formatPrice } from "@/lib/format"
import {
  countOrderProducts,
  formatDateTime,
  ORDER_STATUS_STYLES,
  PAYMENT_STATUS_STYLES,
  NEXT_AVAILABLE_ACTIONS,
  parseOrderItems,
} from "../orders/order-utils"
import OrderTimeline from "../orders/OrderTimeline"

type TrackingTab =
  | "Accepted"
  | "Packing"
  | "Ready to Ship"
  | "Shipping"
  | "Collected by Customer"
  | "Rejected"
  | "All"

interface TabConfig {
  id: TrackingTab
  label: string
  color: string
  badgeBg: string
}

const TABS: TabConfig[] = [
  { id: "Accepted", label: "Accepted Orders", color: "#047857", badgeBg: "#ECFDF5" },
  { id: "Packing", label: "Packing Orders", color: "#6D28D9", badgeBg: "#F5F3FF" },
  { id: "Ready to Ship", label: "Ready to Ship", color: "#1D4ED8", badgeBg: "#EFF6FF" },
  { id: "Shipping", label: "Shipping Orders", color: "#059669", badgeBg: "#F0FDF4" },
  { id: "Collected by Customer", label: "Collected Orders", color: "#065F46", badgeBg: "#ECFDF5" },
  { id: "Rejected", label: "Rejected Orders", color: "#B91C1C", badgeBg: "#FEF2F2" },
  { id: "All", label: "All Tracked Orders", color: "#374151", badgeBg: "#F3F4F6" },
]

interface OrderTrackingClientProps {
  initialOrders: Order[]
  products: Product[]
}

export default function OrderTrackingClient({
  initialOrders,
  products,
}: OrderTrackingClientProps) {
  const [orders, setOrders] = useState<Order[]>(() =>
    [...initialOrders].sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    )
  )
  const [activeTab, setActiveTab] = useState<TrackingTab>("Accepted")
  const [searchTerm, setSearchTerm] = useState("")
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null)

  // Drawer modal for viewing complete details & tracking history
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [selectedOrderHistory, setSelectedOrderHistory] = useState<OrderStatusHistoryItem[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  // Remarks modal for advance transition
  const [transitionTarget, setTransitionTarget] = useState<{
    order: Order
    nextStatus: string
    label: string
  } | null>(null)
  const [transitionRemarks, setTransitionRemarks] = useState("")

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 5000)
  }

  // Calculate counts for each tab
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = {
      Accepted: 0,
      Packing: 0,
      "Ready to Ship": 0,
      Shipping: 0,
      "Collected by Customer": 0,
      Rejected: 0,
      All: 0,
    }
    for (const o of orders) {
      const st = o.orderStatus
      if (st && counts[st] !== undefined) {
        counts[st]++
      }
      if (st !== "Pending") {
        counts.All++
      }
    }
    return counts
  }, [orders])

  // Filter orders by active tab and search query
  const filteredOrders = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    return orders.filter((o) => {
      // Tab filter
      if (activeTab === "All") {
        if (o.orderStatus === "Pending") return false // tracking begins after acceptance/rejection
      } else if (o.orderStatus !== activeTab) {
        return false
      }

      // Search filter
      if (!q) return true
      return (
        o.orderId.toLowerCase().includes(q) ||
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q)
      )
    })
  }, [orders, activeTab, searchTerm])

  // Load order history whenever an order is selected
  useEffect(() => {
    if (!selectedOrder) {
      setSelectedOrderHistory([])
      return
    }

    let isMounted = true
    setLoadingHistory(true)
    fetch(`/api/product-manager/orders/${encodeURIComponent(selectedOrder.orderId)}/history`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && Array.isArray(data.history)) {
          setSelectedOrderHistory(data.history)
        }
      })
      .catch(() => {
        // fallback to empty history
      })
      .finally(() => {
        if (isMounted) setLoadingHistory(false)
      })

    return () => {
      isMounted = false
    }
  }, [selectedOrder?.orderId])

  // Execute status transition
  const handleAdvanceStatus = async (order: Order, targetStatus: string, remarks?: string) => {
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
            remarks: remarks || `Order advanced to ${targetStatus}`,
          }),
        }
      )
      const data = await res.json()
      if (!res.ok) {
        showToast("error", data.error || `Failed to advance order to ${targetStatus}`)
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

      if (selectedOrder && selectedOrder.orderId === order.orderId) {
        setSelectedOrder(updatedOrder)
        if (data.historyItem) {
          setSelectedOrderHistory((prev) => [data.historyItem, ...prev])
        }
      }

      showToast("success", `Order ${order.orderId} moved to "${targetStatus}".`)
      setTransitionTarget(null)
      setTransitionRemarks("")
    } catch {
      showToast("error", `Network error while updating status to ${targetStatus}.`)
    } finally {
      setProcessingId(null)
    }
  }

  // Parse items for selected order drawer
  const selectedOrderEnrichedItems = useMemo(() => {
    if (!selectedOrder) return []
    const parsed = parseOrderItems(selectedOrder.items || selectedOrder.product)
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
        regularPrice: item.regularPrice ?? matchedProduct?.price,
        discountPrice: item.discountPrice ?? matchedProduct?.discountPrice ?? null,
        effectivePrice:
          item.effectivePrice ??
          (matchedProduct?.discountPrice && matchedProduct.discountPrice > 0
            ? matchedProduct.discountPrice
            : matchedProduct?.price),
      }
    })
  }, [selectedOrder, products])

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 14,
          marginBottom: 24,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span style={{ fontSize: 24 }}>🚚</span>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#17191C", margin: 0 }}>
              Order Tracking Management
            </h1>
          </div>
          <p style={{ fontSize: 14, color: "#6B7280", margin: 0 }}>
            Manage the fulfillment sequence from order acceptance through packing, shipping, and collection.
          </p>
        </div>
        <div>
          <Link
            href="/secure-product-manager/orders"
            className="pm-btn pm-btn-secondary"
            style={{ fontSize: 13, fontWeight: 700 }}
          >
            ← Back to All Orders
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
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
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
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Status Sections / Tabs */}
      <div
        style={{
          display: "flex",
          gap: 8,
          overflowX: "auto",
          paddingBottom: 4,
          marginBottom: 20,
          borderBottom: "1px solid #E5E7EB",
        }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          const count = tabCounts[tab.id] || 0
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 16px",
                border: "none",
                background: "none",
                borderBottom: isActive ? `3px solid ${tab.color}` : "3px solid transparent",
                color: isActive ? tab.color : "#4B5563",
                fontWeight: isActive ? 800 : 600,
                fontSize: 13.5,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.15s ease",
              }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  padding: "2px 8px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 700,
                  background: isActive ? tab.color : tab.badgeBg,
                  color: isActive ? "#FFFFFF" : tab.color,
                }}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Search Bar */}
      <div
        className="pm-card"
        style={{
          padding: "14px 18px",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div style={{ flex: 1, position: "relative" }}>
          <input
            type="text"
            className="pm-input"
            placeholder="Search within this section by Order ID, customer name, or email…"
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
      </div>

      {/* Orders Table */}
      <div className="pm-card">
        {filteredOrders.length === 0 ? (
          <div style={{ padding: "60px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
              No orders found in &quot;{TABS.find((t) => t.id === activeTab)?.label}&quot;
            </div>
            <p style={{ fontSize: 13.5, color: "#6B7280", margin: 0 }}>
              {searchTerm
                ? "No orders match your search criteria in this status tab."
                : "There are currently no orders at this stage of the fulfillment process."}
            </p>
          </div>
        ) : (
          <div className="pm-desktop-table" style={{ overflowX: "auto" }}>
            <table className="pm-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer Name</th>
                  <th>Order Date</th>
                  <th>Products</th>
                  <th>Total Amount</th>
                  <th>Payment Status</th>
                  <th>Current Order Status</th>
                  <th>Last Status Update</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
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
                  const nextAction = NEXT_AVAILABLE_ACTIONS[order.orderStatus]
                  const isBusy = processingId === order.orderId

                  // Last update timestamp
                  const lastUpdateTs =
                    order.lastStatusUpdatedAt ||
                    order.collectedAt ||
                    order.shippingAt ||
                    order.readyToShipAt ||
                    order.packingAt ||
                    order.acceptedAt ||
                    order.rejectedAt ||
                    order.createdAt

                  return (
                    <tr key={order.orderId}>
                      {/* Order ID */}
                      <td>
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            fontWeight: 700,
                            color: "#F36B12",
                            cursor: "pointer",
                            fontSize: 13.5,
                            textAlign: "left",
                          }}
                        >
                          {order.orderId}
                        </button>
                        {order.orderNumber && (
                          <div style={{ fontSize: 11.5, color: "#6B7280" }}>
                            #{order.orderNumber}
                          </div>
                        )}
                      </td>

                      {/* Customer Name */}
                      <td style={{ fontWeight: 600, color: "#17191C" }}>
                        {order.customerName || "—"}
                        <div style={{ fontSize: 11.5, color: "#6B7280", fontWeight: 400 }}>
                          {order.email}
                        </div>
                      </td>

                      {/* Order Date */}
                      <td style={{ fontSize: 12.5, color: "#4B5563", whiteSpace: "nowrap" }}>
                        {formatDateTime(order.createdAt)}
                      </td>

                      {/* Products */}
                      <td style={{ fontWeight: 600, color: "#374151" }}>
                        {productCount} {productCount === 1 ? "item" : "items"}
                      </td>

                      {/* Total Amount */}
                      <td style={{ fontWeight: 700, color: "#17191C", whiteSpace: "nowrap" }}>
                        {formatPrice(order.totalAmount)}
                      </td>

                      {/* Payment Status */}
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

                      {/* Current Order Status */}
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
                          {order.orderStatus}
                        </span>
                      </td>

                      {/* Last Status Update */}
                      <td style={{ fontSize: 12, color: "#4B5563", whiteSpace: "nowrap" }}>
                        <div>{formatDateTime(lastUpdateTs)}</div>
                        {order.lastStatusUpdatedBy && (
                          <div style={{ fontSize: 11, color: "#9CA3AF" }}>
                            by {order.lastStatusUpdatedBy.split("@")[0]}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                        <div style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="pm-btn pm-btn-secondary"
                            style={{ padding: "6px 12px", fontSize: 12.5 }}
                          >
                            View Details
                          </button>

                          {nextAction && (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => {
                                setTransitionRemarks("")
                                setTransitionTarget({
                                  order,
                                  nextStatus: nextAction.nextStatus,
                                  label: nextAction.label,
                                })
                              }}
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

      {/* Advance Transition Remarks Modal */}
      {transitionTarget && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(17, 24, 39, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1100,
            padding: 16,
          }}
        >
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 12,
              maxWidth: 480,
              width: "100%",
              padding: 24,
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#17191C", margin: "0 0 8px" }}>
              Advance Order to &quot;{transitionTarget.nextStatus}&quot;
            </h2>
            <p style={{ fontSize: 13.5, color: "#4B5563", margin: "0 0 16px", lineHeight: 1.5 }}>
              Moving order <strong>{transitionTarget.order.orderId}</strong> from{" "}
              <em>{transitionTarget.order.orderStatus}</em> to{" "}
              <strong>{transitionTarget.nextStatus}</strong>.
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
              Tracking Remarks (optional)
            </label>
            <textarea
              className="pm-input"
              rows={3}
              placeholder="e.g. Courier: FedEx, Tracking: 123456789, package ready for pickup…"
              value={transitionRemarks}
              onChange={(e) => setTransitionRemarks(e.target.value)}
              style={{ width: "100%", marginBottom: 18, resize: "vertical" }}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                type="button"
                className="pm-btn pm-btn-secondary"
                onClick={() => setTransitionTarget(null)}
                disabled={Boolean(processingId)}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  handleAdvanceStatus(
                    transitionTarget.order,
                    transitionTarget.nextStatus,
                    transitionRemarks.trim() || undefined
                  )
                }
                disabled={Boolean(processingId)}
                style={{
                  padding: "10px 18px",
                  borderRadius: 8,
                  border: "none",
                  background: "#2563EB",
                  color: "#FFFFFF",
                  fontSize: 13.5,
                  fontWeight: 700,
                  cursor: processingId ? "wait" : "pointer",
                }}
              >
                {processingId ? "Updating…" : `Confirm Advance to ${transitionTarget.nextStatus}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slide-over / Modal Order Details & History Panel */}
      {selectedOrder && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(17, 24, 39, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            zIndex: 1050,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedOrder(null)
          }}
        >
          <div
            style={{
              background: "#FFFFFF",
              width: "100%",
              maxWidth: 720,
              height: "100%",
              overflowY: "auto",
              boxShadow: "-8px 0 24px rgba(0,0,0,0.15)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Panel Header */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #E5E7EB",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                position: "sticky",
                top: 0,
                background: "#FFFFFF",
                zIndex: 10,
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: "#17191C", margin: 0 }}>
                    Order {selectedOrder.orderId}
                  </h2>
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 700,
                      background: ORDER_STATUS_STYLES[selectedOrder.orderStatus]?.bg || "#F3F4F6",
                      color: ORDER_STATUS_STYLES[selectedOrder.orderStatus]?.color || "#374151",
                      border: `1px solid ${ORDER_STATUS_STYLES[selectedOrder.orderStatus]?.border || "#D1D5DB"}`,
                    }}
                  >
                    {selectedOrder.orderStatus}
                  </span>
                </div>
                <div style={{ fontSize: 12.5, color: "#6B7280", marginTop: 4 }}>
                  Placed on {formatDateTime(selectedOrder.createdAt)}
                  {selectedOrder.orderNumber ? ` • #${selectedOrder.orderNumber}` : ""}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 24,
                  cursor: "pointer",
                  color: "#9CA3AF",
                  padding: "0 6px",
                  lineHeight: 1,
                }}
                aria-label="Close panel"
              >
                ✕
              </button>
            </div>

            {/* Panel Body */}
            <div style={{ padding: "24px", flex: 1 }}>
              {/* Order Tracking Timeline */}
              <div style={{ marginBottom: 24 }}>
                <OrderTimeline
                  order={selectedOrder}
                  history={selectedOrderHistory}
                />
              </div>

              {/* Next Action in Drawer if available */}
              {NEXT_AVAILABLE_ACTIONS[selectedOrder.orderStatus] && (
                <div
                  style={{
                    padding: "16px 20px",
                    background: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    borderRadius: 10,
                    marginBottom: 24,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 12,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "#1E293B" }}>
                      Next Fulfillment Stage
                    </div>
                    <div style={{ fontSize: 12.5, color: "#64748B" }}>
                      Advance order to &quot;{NEXT_AVAILABLE_ACTIONS[selectedOrder.orderStatus]?.nextStatus}&quot;
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={processingId === selectedOrder.orderId}
                    onClick={() => {
                      const next = NEXT_AVAILABLE_ACTIONS[selectedOrder.orderStatus]!
                      setTransitionRemarks("")
                      setTransitionTarget({
                        order: selectedOrder,
                        nextStatus: next.nextStatus,
                        label: next.label,
                      })
                    }}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 6,
                      border: `1px solid ${NEXT_AVAILABLE_ACTIONS[selectedOrder.orderStatus]?.border}`,
                      background: NEXT_AVAILABLE_ACTIONS[selectedOrder.orderStatus]?.bg,
                      color: NEXT_AVAILABLE_ACTIONS[selectedOrder.orderStatus]?.color,
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: processingId === selectedOrder.orderId ? "wait" : "pointer",
                    }}
                  >
                    Advance to: {NEXT_AVAILABLE_ACTIONS[selectedOrder.orderStatus]?.label} →
                  </button>
                </div>
              )}

              {/* Customer & Delivery Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: 16,
                  marginBottom: 24,
                }}
              >
                <div style={{ background: "#F9FAFB", padding: 16, borderRadius: 8 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", marginBottom: 6 }}>
                    Customer Info
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>
                    {selectedOrder.customerName || "—"}
                  </div>
                  <div style={{ fontSize: 13, color: "#4B5563", marginTop: 2 }}>
                    {selectedOrder.email || "—"}
                  </div>
                  <div style={{ fontSize: 13, color: "#4B5563", marginTop: 2 }}>
                    {selectedOrder.phoneNumber || "No phone provided"}
                  </div>
                </div>

                <div style={{ background: "#F9FAFB", padding: 16, borderRadius: 8 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", marginBottom: 6 }}>
                    Delivery Address
                  </div>
                  <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.5, whiteSpace: "pre-line" }}>
                    {selectedOrder.shippingAddress || "Provided via checkout / not specified"}
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div
                style={{
                  background: "#F9FAFB",
                  padding: 16,
                  borderRadius: 8,
                  marginBottom: 24,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: "#6B7280", textTransform: "uppercase" }}>
                    Payment Method & Status
                  </div>
                  <div style={{ fontSize: 13.5, color: "#111827", marginTop: 2 }}>
                    {selectedOrder.paymentMethod || "Stripe"} • <strong>{selectedOrder.paymentStatus || "Pending"}</strong>
                  </div>
                  {selectedOrder.transactionId && (
                    <div style={{ fontSize: 11.5, color: "#6B7280", marginTop: 2 }}>
                      Txn: {selectedOrder.transactionId}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11.5, color: "#6B7280", textTransform: "uppercase" }}>
                    Total Amount
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#111827" }}>
                    {formatPrice(selectedOrder.totalAmount)}
                  </div>
                </div>
              </div>

              {/* Ordered Products Table */}
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: "#374151", margin: "0 0 10px" }}>
                  Ordered Products ({selectedOrderEnrichedItems.length})
                </h3>
                <div style={{ overflowX: "auto", border: "1px solid #E5E7EB", borderRadius: 8 }}>
                  <table className="pm-table" style={{ fontSize: 13 }}>
                    <thead>
                      <tr>
                        <th style={{ width: 48 }}>Item</th>
                        <th>Product</th>
                        <th>Colour</th>
                        <th>Qty</th>
                        <th style={{ textAlign: "right" }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrderEnrichedItems.map((item, idx) => {
                        const unitPrice = item.effectivePrice ?? item.discountPrice ?? item.regularPrice ?? 0
                        return (
                          <tr key={`${item.productId}-${idx}`}>
                            <td>
                              <div
                                style={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: 6,
                                  background: "#F3F4F6",
                                  position: "relative",
                                  overflow: "hidden",
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
                                      fontSize: 10,
                                      color: "#9CA3AF",
                                    }}
                                  >
                                    N/A
                                  </div>
                                )}
                              </div>
                            </td>
                            <td>
                              <div style={{ fontWeight: 700, color: "#111827" }}>{item.name}</div>
                              {item.productId && (
                                <div style={{ fontSize: 11, color: "#9CA3AF" }}>ID: {item.productId}</div>
                              )}
                            </td>
                            <td>
                              {item.colorName ? (
                                <span
                                  style={{
                                    padding: "2px 8px",
                                    borderRadius: 999,
                                    background: "#F3F4F6",
                                    fontSize: 11.5,
                                    fontWeight: 600,
                                    color: "#374151",
                                  }}
                                >
                                  {item.colorName}
                                </span>
                              ) : (
                                <span style={{ color: "#9CA3AF" }}>Default</span>
                              )}
                            </td>
                            <td style={{ fontWeight: 700 }}>{item.quantity}</td>
                            <td style={{ textAlign: "right", fontWeight: 700 }}>
                              {unitPrice > 0 ? formatPrice(unitPrice * item.quantity) : "—"}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Full details page link */}
              <div style={{ textAlign: "center", paddingTop: 10 }}>
                <Link
                  href={`/secure-product-manager/orders/${encodeURIComponent(selectedOrder.orderId)}`}
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#F36B12",
                    textDecoration: "none",
                  }}
                >
                  Open Full Order Management Page →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
