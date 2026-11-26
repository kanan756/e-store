"use client"

import type { Order, OrderStatusHistoryItem } from "@/lib/sheets"
import { formatDateTime, TRACKING_STAGES } from "./order-utils"

interface OrderTimelineProps {
  order: Order
  history?: OrderStatusHistoryItem[]
}

const LIFECYCLE_ORDER = [
  "Pending",
  "Accepted",
  "Packing",
  "Ready to Ship",
  "Shipping",
  "Collected by Customer",
]

export default function OrderTimeline({ order, history = [] }: OrderTimelineProps) {
  const currentStatus = order.orderStatus || "Pending"

  // Special case: Rejected orders
  if (currentStatus === "Rejected") {
    const rejectHistory = history.find((h) => h.newStatus === "Rejected")
    return (
      <div
        style={{
          background: "#FEF2F2",
          border: "1px solid #FECACA",
          borderRadius: 12,
          padding: "20px 24px",
          marginBottom: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "#FEE2E2",
              color: "#DC2626",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              fontWeight: 800,
              flexShrink: 0,
            }}
          >
            ✕
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "#991B1B", margin: 0 }}>
                Order Rejected
              </h3>
              <span
                style={{
                  background: "#FEE2E2",
                  color: "#991B1B",
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: 999,
                }}
              >
                Workflow Terminated
              </span>
            </div>
            <p style={{ fontSize: 13.5, color: "#7F1D1D", margin: "0 0 10px", lineHeight: 1.5 }}>
              This order was rejected and will not enter the fulfillment/shipping workflow. All reserved product inventory was automatically restored to Passive Stock.
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 12,
                fontSize: 13,
                color: "#991B1B",
                background: "#FFFFFF",
                padding: "12px 16px",
                borderRadius: 8,
                border: "1px solid #FCA5A5",
              }}
            >
              <div>
                <span style={{ fontWeight: 600, color: "#6B7280", display: "block", fontSize: 11.5 }}>
                  REJECTED AT
                </span>
                <strong>{formatDateTime(order.rejectedAt || rejectHistory?.changedAt)}</strong>
              </div>
              <div>
                <span style={{ fontWeight: 600, color: "#6B7280", display: "block", fontSize: 11.5 }}>
                  REJECTED BY
                </span>
                <strong>{order.lastStatusUpdatedBy || rejectHistory?.changedBy || "Product Manager"}</strong>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <span style={{ fontWeight: 600, color: "#6B7280", display: "block", fontSize: 11.5 }}>
                  REASON / REMARKS
                </span>
                <span>{order.rejectionReason || rejectHistory?.remarks || "No specific reason provided."}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Pending order notice
  if (currentStatus === "Pending") {
    return (
      <div
        style={{
          background: "#FFFBEB",
          border: "1px solid #FDE68A",
          borderRadius: 12,
          padding: "18px 22px",
          marginBottom: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: "#FEF3C7",
              color: "#D97706",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              fontWeight: 800,
              flexShrink: 0,
            }}
          >
            ⏳
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#92400E", marginBottom: 2 }}>
              Awaiting Manager Acceptance
            </div>
            <div style={{ fontSize: 13, color: "#B45309" }}>
              Order tracking timeline will begin once you accept this order. Once accepted, the order can progress through Packing, Ready to Ship, Shipping, and Collection.
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentIdx = LIFECYCLE_ORDER.indexOf(currentStatus)

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #E5E7EB",
        borderRadius: 12,
        padding: "24px",
        marginBottom: 24,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10,
          marginBottom: 22,
          paddingBottom: 14,
          borderBottom: "1px solid #F3F4F6",
        }}
      >
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "#111827", margin: "0 0 4px" }}>
            Order Tracking Timeline
          </h2>
          <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>
            Chronological stages from order acceptance to final customer collection.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12.5, color: "#6B7280" }}>Current Stage:</span>
          <span
            style={{
              fontSize: 12.5,
              fontWeight: 700,
              padding: "3px 10px",
              borderRadius: 999,
              background: currentStatus === "Collected by Customer" ? "#ECFDF5" : "#EFF6FF",
              color: currentStatus === "Collected by Customer" ? "#065F46" : "#1D4ED8",
              border: `1px solid ${currentStatus === "Collected by Customer" ? "#A7F3D0" : "#BFDBFE"}`,
            }}
          >
            {currentStatus}
          </span>
        </div>
      </div>

      {/* Visual Timeline Steps */}
      <div style={{ position: "relative" }}>
        {TRACKING_STAGES.map((stage, index) => {
          const stageIdx = LIFECYCLE_ORDER.indexOf(stage.key)
          const isCompleted = currentIdx > stageIdx
          const isCurrent = currentIdx === stageIdx
          const isUpcoming = currentIdx < stageIdx

          // Find history entry for this stage
          const stageHistory = history.find((h) => h.newStatus === stage.key)
          const timestamp = order[stage.field] || stageHistory?.changedAt
          const updatedBy = stageHistory?.changedBy || (isCurrent ? order.lastStatusUpdatedBy : undefined)
          const remarks = stageHistory?.remarks

          // Circle styling
          let circleBg = "#F3F4F6"
          let circleBorder = "#D1D5DB"
          let circleColor = "#9CA3AF"
          let circleContent: React.ReactNode = index + 1

          if (isCompleted) {
            circleBg = "#059669"
            circleBorder = "#059669"
            circleColor = "#FFFFFF"
            circleContent = "✓"
          } else if (isCurrent) {
            circleBg = "#2563EB"
            circleBorder = "#2563EB"
            circleColor = "#FFFFFF"
            circleContent = "●"
          }

          const isLast = index === TRACKING_STAGES.length - 1

          return (
            <div
              key={stage.key}
              style={{
                display: "flex",
                gap: 18,
                position: "relative",
                paddingBottom: isLast ? 0 : 28,
              }}
            >
              {/* Connecting vertical line */}
              {!isLast && (
                <div
                  style={{
                    position: "absolute",
                    left: 17,
                    top: 36,
                    bottom: 0,
                    width: 2,
                    background: isCompleted ? "#059669" : "#E5E7EB",
                  }}
                />
              )}

              {/* Stage Circle Node */}
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: circleBg,
                  border: `2px solid ${circleBorder}`,
                  color: circleColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: isCompleted ? 16 : 13,
                  fontWeight: 800,
                  flexShrink: 0,
                  zIndex: 1,
                  boxShadow: isCurrent ? "0 0 0 4px rgba(37, 99, 235, 0.2)" : "none",
                }}
              >
                {circleContent}
              </div>

              {/* Stage Content */}
              <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                  <span
                    style={{
                      fontSize: 14.5,
                      fontWeight: isCurrent ? 800 : isCompleted ? 700 : 600,
                      color: isCurrent ? "#1E40AF" : isCompleted ? "#111827" : "#9CA3AF",
                    }}
                  >
                    {stage.label}
                  </span>

                  {isCompleted && (
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
                  {isCurrent && (
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
                      Current Stage
                    </span>
                  )}
                  {isUpcoming && (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "1px 8px",
                        borderRadius: 999,
                        background: "#F3F4F6",
                        color: "#9CA3AF",
                      }}
                    >
                      Upcoming
                    </span>
                  )}
                </div>

                {/* Details (Date, Time, Updated by, Remarks) */}
                {(isCompleted || isCurrent) && timestamp ? (
                  <div style={{ fontSize: 12.5, color: "#4B5563", marginTop: 4, lineHeight: 1.5 }}>
                    <div>
                      <strong>Date & Time:</strong> {formatDateTime(timestamp)}
                    </div>
                    {updatedBy && (
                      <div>
                        <strong>Updated by:</strong> {updatedBy}
                      </div>
                    )}
                    {remarks && (
                      <div style={{ color: "#374151", marginTop: 2 }}>
                        <strong>Remarks:</strong> {remarks}
                      </div>
                    )}
                  </div>
                ) : isUpcoming ? (
                  <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>
                    Pending previous stages
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>
                    Timestamp pending confirmation
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Historical Audit Trail */}
      {history.length > 0 && (
        <details
          style={{
            marginTop: 24,
            paddingTop: 16,
            borderTop: "1px solid #F3F4F6",
            fontSize: 13,
            color: "#4B5563",
          }}
        >
          <summary style={{ cursor: "pointer", fontWeight: 700, color: "#374151" }}>
            View Full Audit History Log ({history.length} {history.length === 1 ? "entry" : "entries"})
          </summary>
          <div style={{ marginTop: 12, overflowX: "auto" }}>
            <table className="pm-table" style={{ fontSize: 12.5 }}>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Transition</th>
                  <th>Updated By</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.historyId || `${h.orderId}-${h.changedAt}`}>
                    <td style={{ whiteSpace: "nowrap" }}>{formatDateTime(h.changedAt)}</td>
                    <td>
                      <span style={{ color: "#6B7280" }}>{h.previousStatus || "—"}</span>
                      <span style={{ margin: "0 6px", color: "#9CA3AF" }}>→</span>
                      <strong>{h.newStatus}</strong>
                    </td>
                    <td>{h.changedBy || "Manager"}</td>
                    <td>{h.remarks || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </div>
  )
}
