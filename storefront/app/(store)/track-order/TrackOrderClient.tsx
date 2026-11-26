"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { useEffect, useState } from "react"
import type { Order, OrderStatusHistoryItem } from "@/lib/sheets"
import { formatPrice } from "@/lib/format"

// Types for Customer Order display
interface EnrichedCustomerOrder extends Order {
  history?: OrderStatusHistoryItem[]
}

const TRACKING_STEPS = [
  { key: "Accepted", label: "Order Accepted", field: "acceptedAt" as const },
  { key: "Packing", label: "Packing", field: "packingAt" as const },
  { key: "Ready to Ship", label: "Ready to Ship", field: "readyToShipAt" as const },
  { key: "Shipping", label: "Shipping", field: "shippingAt" as const },
  { key: "Collected by Customer", label: "Collected by Customer", field: "collectedAt" as const },
] as const

const LIFECYCLE_ORDER = [
  "Pending",
  "Accepted",
  "Packing",
  "Ready to Ship",
  "Shipping",
  "Collected by Customer",
]

function formatCustomerDateTime(iso?: string): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function parseCustomerOrderProducts(itemsField: string): { name: string; quantity: number; color?: string }[] {
  if (!itemsField) return []
  const trimmed = itemsField.trim()
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed)) {
        return parsed.map((x) => ({
          name: String(x.name || "Product"),
          quantity: Math.max(1, Math.floor(Number(x.quantity ?? x.qty) || 1)),
          color: x.colorName || x.cname,
        }))
      }
    } catch {
      // fallback to text parser
    }
  }

  return trimmed
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((part) => {
      const qtyMatch = part.match(/^(.*?)\s+x(\d+)$/i)
      const base = qtyMatch ? qtyMatch[1].trim() : part
      const quantity = qtyMatch ? Math.max(1, parseInt(qtyMatch[2], 10)) : 1
      const colorMatch = base.match(/^(.*?)\s*\(([^)]+)\)$/)
      return {
        name: colorMatch ? colorMatch[1].trim() : base,
        color: colorMatch ? colorMatch[2].trim() : undefined,
        quantity,
      }
    })
}

function StatusBadge({ status }: { status: string }) {
  let color = "#4B5563"
  let bg = "#F3F4F6"
  let border = "#D1D5DB"

  switch (status) {
    case "Pending":
      color = "#C2410C"
      bg = "#FFF7ED"
      border = "#FED7AA"
      break
    case "Accepted":
      color = "#047857"
      bg = "#ECFDF5"
      border = "#A7F3D0"
      break
    case "Packing":
      color = "#6D28D9"
      bg = "#F5F3FF"
      border = "#DDD6FE"
      break
    case "Ready to Ship":
      color = "#1D4ED8"
      bg = "#EFF6FF"
      border = "#BFDBFE"
      break
    case "Shipping":
      color = "#059669"
      bg = "#F0FDF4"
      border = "#86EFAC"
      break
    case "Collected by Customer":
    case "Delivered":
      color = "#065F46"
      bg = "#ECFDF5"
      border = "#34D399"
      break
    case "Rejected":
      color = "#B91C1C"
      bg = "#FEF2F2"
      border = "#FECACA"
      break
    case "Cancelled":
      color = "#4B5563"
      bg = "#F3F4F6"
      border = "#D1D5DB"
      break
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 12px",
        borderRadius: 999,
        fontSize: 12.5,
        fontWeight: 700,
        color,
        background: bg,
        border: `1px solid ${border}`,
      }}
    >
      {status}
    </span>
  )
}

function OrderTrackingTimeline({ order }: { order: EnrichedCustomerOrder }) {
  const currentStatus = order.orderStatus || order.status || "Pending"

  // 1. Rejected status display
  if (currentStatus === "Rejected") {
    return (
      <div
        style={{
          marginTop: 18,
          background: "#FEF2F2",
          border: "1px solid #FECACA",
          borderRadius: 12,
          padding: "16px 20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "#FEE2E2",
              color: "#DC2626",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 14,
            }}
          >
            ✕
          </div>
          <span style={{ fontWeight: 800, color: "#991B1B", fontSize: 15 }}>
            Order Rejected
          </span>
          {order.rejectedAt && (
            <span style={{ fontSize: 12, color: "#7F1D1D" }}>
              • {formatCustomerDateTime(order.rejectedAt)}
            </span>
          )}
        </div>
        <p style={{ fontSize: 13.5, color: "#7F1D1D", margin: "0 0 10px", lineHeight: 1.5 }}>
          We regret to inform you that this order could not be fulfilled.
        </p>
        <div
          style={{
            background: "#FFFFFF",
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid #FCA5A5",
            fontSize: 13,
            color: "#991B1B",
          }}
        >
          <strong>Reason: </strong>
          <span>{order.rejectionReason || "No specific reason provided."}</span>
        </div>
      </div>
    )
  }

  // 2. Pending status display
  if (currentStatus === "Pending") {
    return (
      <div
        style={{
          marginTop: 18,
          background: "#FFFBEB",
          border: "1px solid #FDE68A",
          borderRadius: 12,
          padding: "16px 20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "#FEF3C7",
              color: "#D97706",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 14,
            }}
          >
            ⏳
          </div>
          <div>
            <div style={{ fontWeight: 700, color: "#92400E", fontSize: 14 }}>
              Order Received — Awaiting Confirmation
            </div>
            <div style={{ fontSize: 12.5, color: "#B45309", marginTop: 2 }}>
              Your order has been placed. Real-time fulfillment tracking will begin once our store manager accepts the order.
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 3. Accepted through Collected timeline
  const currentIdx = LIFECYCLE_ORDER.indexOf(currentStatus)
  const historyList = order.history || []

  // Check if expected delivery info is actually available
  const expectedDelivery = (order as any).expectedDelivery || (order as any).estimatedDelivery

  return (
    <div style={{ marginTop: 22 }}>
      {/* Expected Delivery Banner (only shown if actually available) */}
      {expectedDelivery && (
        <div
          style={{
            padding: "10px 16px",
            background: "#EFF6FF",
            border: "1px solid #BFDBFE",
            borderRadius: 8,
            marginBottom: 20,
            fontSize: 13,
            color: "#1E40AF",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>📅</span>
          <span>
            <strong>Expected Delivery:</strong> {expectedDelivery}
          </span>
        </div>
      )}

      {/* Visual Tracking Sequence */}
      <div style={{ position: "relative", paddingLeft: 8 }}>
        {TRACKING_STEPS.map((stage, idx) => {
          const stageIdx = LIFECYCLE_ORDER.indexOf(stage.key)
          const isDone = currentIdx > stageIdx
          const isActive = currentIdx === stageIdx
          const isUpcoming = currentIdx < stageIdx

          // Timestamp lookup
          const stageHistory = historyList.find((h) => h.newStatus === stage.key)
          const timestamp = order[stage.field] || stageHistory?.changedAt

          const isLast = idx === TRACKING_STEPS.length - 1

          return (
            <div
              key={stage.key}
              style={{
                display: "flex",
                gap: 16,
                position: "relative",
                paddingBottom: isLast ? 0 : 24,
              }}
            >
              {/* Vertical connector line */}
              {!isLast && (
                <div
                  style={{
                    position: "absolute",
                    left: 15,
                    top: 32,
                    bottom: 0,
                    width: 2,
                    background: isDone ? "#059669" : "#E5E7EB",
                  }}
                />
              )}

              {/* Node indicator */}
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: isDone ? "#059669" : isActive ? "#2563EB" : "#F3F4F6",
                  border: `2px solid ${isDone ? "#059669" : isActive ? "#2563EB" : "#D1D5DB"}`,
                  color: isDone || isActive ? "#FFFFFF" : "#9CA3AF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: isDone ? 14 : 12,
                  fontWeight: 800,
                  flexShrink: 0,
                  zIndex: 1,
                  boxShadow: isActive ? "0 0 0 4px rgba(37, 99, 235, 0.15)" : "none",
                }}
              >
                {isDone ? "✓" : isActive ? "●" : idx + 1}
              </div>

              {/* Step info */}
              <div style={{ flex: 1, paddingTop: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: isActive ? 800 : isDone ? 700 : 500,
                      color: isActive ? "#1D4ED8" : isDone ? "#111827" : "#9CA3AF",
                    }}
                  >
                    {stage.label}
                  </span>
                  {isActive && (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "1px 8px",
                        borderRadius: 999,
                        background: "#EFF6FF",
                        color: "#1D4ED8",
                      }}
                    >
                      In Progress
                    </span>
                  )}
                  {isDone && (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "1px 8px",
                        borderRadius: 999,
                        background: "#ECFDF5",
                        color: "#065F46",
                      }}
                    >
                      Completed
                    </span>
                  )}
                </div>

                {/* Completed / Active Timestamp */}
                {(isDone || isActive) && timestamp ? (
                  <div style={{ fontSize: 12, color: "#6B7280", marginTop: 3 }}>
                    Completed on {formatCustomerDateTime(timestamp)}
                  </div>
                ) : isUpcoming ? (
                  <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 3 }}>
                    Upcoming stage
                  </div>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function OrderCard({ order }: { order: EnrichedCustomerOrder }) {
  const [open, setOpen] = useState(false)
  const currentStatus = order.orderStatus || order.status || "Pending"
  const products = parseCustomerOrderProducts(order.items || order.product)
  const totalAmount = order.totalAmount || order.amount || 0

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: `1px solid ${open ? "#F36B12" : "#E5E7EB"}`,
        borderRadius: 14,
        overflow: "hidden",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        boxShadow: open ? "0 4px 16px rgba(0,0,0,0.06)" : "0 1px 3px rgba(0,0,0,0.02)",
      }}
    >
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          padding: "20px 24px",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: "#F36B12" }}>
              {order.orderId}
            </span>
            {order.orderNumber && (
              <span style={{ fontSize: 12, color: "#6B7280" }}>#{order.orderNumber}</span>
            )}
          </div>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#111827", marginBottom: 8 }}>
            {products.length > 0
              ? products.map((p) => `${p.name} × ${p.quantity}`).join(", ")
              : order.product}
          </div>
          <StatusBadge status={currentStatus} />
        </div>

        <div style={{ textAlign: "right", flexShrink: 0 }}>
          {totalAmount > 0 && (
            <div style={{ fontWeight: 800, fontSize: 19, color: "#111827" }}>
              {formatPrice(totalAmount)}
            </div>
          )}
          <div style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>
            {formatCustomerDateTime(order.createdAt)}
          </div>
          <div style={{ fontSize: 14, color: "#9CA3AF", marginTop: 6 }}>
            {open ? "▲ Hide tracking" : "▼ Track order"}
          </div>
        </div>
      </div>

      {open && (
        <div style={{ padding: "0 24px 24px", borderTop: "1px solid #F3F4F6" }}>
          {/* Visual Tracking Timeline */}
          <OrderTrackingTimeline order={order} />

          {/* Ordered Products Breakdown */}
          {products.length > 0 && (
            <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid #F3F4F6" }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", marginBottom: 8 }}>
                Items Ordered
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {products.map((p, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 13.5,
                      color: "#374151",
                    }}
                  >
                    <span>
                      {p.name} {p.color ? `(${p.color})` : ""}
                    </span>
                    <span style={{ fontWeight: 600 }}>Qty: {p.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Delivery Address (read-only) */}
          {order.shippingAddress && (
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid #F3F4F6" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", marginBottom: 4 }}>
                Delivery Address
              </div>
              <div style={{ fontSize: 13, color: "#4B5563", lineHeight: 1.5, whiteSpace: "pre-line" }}>
                {order.shippingAddress}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function TrackOrderClient() {
  const { data: session, status } = useSession()
  const [orders, setOrders] = useState<EnrichedCustomerOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!session?.user?.email) return
    setLoading(true)
    setError("")
    fetch(`/api/orders?email=${encodeURIComponent(session.user.email)}`)
      .then((r) => r.json())
      .then((data) => {
        setOrders(data.orders ?? [])
        setLoading(false)
      })
      .catch(() => {
        setError("Failed to load your orders. Please try again.")
        setLoading(false)
      })
  }, [session])

  return (
    <div
      style={{
        minHeight: "100vh",
        paddingTop: 120,
        paddingBottom: 80,
        background: "#FAFAFA",
        fontFamily: "var(--font-dm-sans, system-ui)",
      }}
    >
      <div className="W" style={{ maxWidth: 740 }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: "#F36B12",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 10,
            }}
          >
            SHIPMENT TRACKING
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "#111827", margin: "0 0 10px" }}>
            Track Your Orders
          </h1>
          <p style={{ fontSize: 14.5, color: "#6B7280", margin: 0, lineHeight: 1.5 }}>
            Real-time fulfillment tracking from order acceptance through packaging, shipping, and collection.
          </p>
        </div>

        {status === "loading" && (
          <div style={{ textAlign: "center", padding: 60, color: "#6B7280" }}>
            Loading your profile…
          </div>
        )}

        {status === "unauthenticated" && (
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E5E7EB",
              borderRadius: 16,
              padding: 48,
              textAlign: "center",
              boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#F36B12" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="56" height="56">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h2 style={{ fontWeight: 800, fontSize: 20, marginBottom: 8, color: "#111827" }}>
              Sign in to track your order
            </h2>
            <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 28, maxWidth: 420, margin: "0 auto 28px" }}>
              We use your account email to match your orders securely.
            </p>
            <button
              type="button"
              onClick={() => signIn("google")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 28px",
                background: "#F36B12",
                color: "#FFFFFF",
                border: "none",
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(243, 107, 18, 0.3)",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.8 33.9 29.4 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6-6C34.5 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.9 0 20.4-7.9 20.4-21 0-1.4-.1-2.7-.4-4z"/>
                <path fill="#FF3D00" d="M6.3 14.7l7 5.1C15.1 15.7 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6-6C34.5 5.1 29.5 3 24 3 16.3 3 9.6 7.9 6.3 14.7z"/>
                <path fill="#4CAF50" d="M24 45c5.4 0 10.3-1.9 14.1-5.1l-6.5-5.5C29.6 36 26.9 37 24 37c-5.3 0-9.8-3.1-11.3-7.5l-7 5.4C9.6 41.1 16.3 45 24 45z"/>
                <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.5-2.5 4.5-4.6 6l6.5 5.5C40.9 36.2 44 30.6 44 24c0-1.4-.1-2.7-.4-4z"/>
              </svg>
              Continue with Google
            </button>
          </div>
        )}

        {status === "authenticated" && (
          <div>
            {/* Authenticated user pill */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#FFFFFF",
                border: "1px solid #E5E7EB",
                borderRadius: 12,
                padding: "12px 18px",
                marginBottom: 28,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {session.user?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={session.user.image}
                    alt=""
                    style={{ width: 34, height: 34, borderRadius: "50%" }}
                  />
                ) : (
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      background: "#F3F4F6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      color: "#4B5563",
                    }}
                  >
                    {(session.user?.name || session.user?.email || "U")[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: "#111827" }}>
                    {session.user?.name || "Customer"}
                  </div>
                  <div style={{ fontSize: 12, color: "#6B7280" }}>{session.user?.email}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => signOut()}
                style={{
                  padding: "6px 12px",
                  background: "transparent",
                  border: "1px solid #E5E7EB",
                  borderRadius: 6,
                  color: "#6B7280",
                  fontSize: 12.5,
                  cursor: "pointer",
                }}
              >
                Sign Out
              </button>
            </div>

            {loading && (
              <div style={{ textAlign: "center", padding: 40, color: "#6B7280" }}>
                Loading your orders…
              </div>
            )}

            {error && (
              <div
                style={{
                  padding: "14px 18px",
                  background: "#FEF2F2",
                  border: "1px solid #FECACA",
                  borderRadius: 12,
                  color: "#991B1B",
                  fontSize: 14,
                  marginBottom: 20,
                }}
              >
                {error}
              </div>
            )}

            {!loading && !error && orders.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 20px",
                  background: "#FFFFFF",
                  border: "1px solid #E5E7EB",
                  borderRadius: 16,
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "#111827", margin: "0 0 6px" }}>
                  No orders found
                </h3>
                <p style={{ fontSize: 14, color: "#6B7280", margin: 0 }}>
                  We could not find any orders associated with {session.user?.email}.
                </p>
              </div>
            )}

            {!loading && orders.length > 0 && (
              <div style={{ display: "grid", gap: 18 }}>
                <div style={{ fontSize: 13, color: "#6B7280", fontWeight: 600 }}>
                  Showing {orders.length} order{orders.length !== 1 ? "s" : ""}
                </div>
                {[...orders].reverse().map((order) => (
                  <OrderCard key={order.orderId} order={order} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
