import type { Order } from "@/lib/sheets"

export interface ParsedOrderItem {
  productId: string
  name: string
  imageUrl?: string
  colorName?: string
  colorId?: string
  quantity: number
  regularPrice?: number
  discountPrice?: number | null
  effectivePrice?: number
}

export function parseOrderItems(itemsField: string): ParsedOrderItem[] {
  if (!itemsField) return []
  const trimmed = itemsField.trim()
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed)) {
        return parsed
          .filter((x) => x && typeof x === "object")
          .map((x) => ({
            productId: String(x.productId || x.pid || ""),
            name: String(x.name || "Product"),
            imageUrl: typeof x.imageUrl === "string" ? x.imageUrl : undefined,
            colorName: typeof x.colorName === "string" ? x.colorName : (typeof x.cname === "string" ? x.cname : undefined),
            colorId: typeof x.colorId === "string" ? x.colorId : (typeof x.cid === "string" ? x.cid : undefined),
            quantity: Math.max(1, Math.floor(Number(x.quantity ?? x.qty) || 1)),
            regularPrice: x.regularPrice != null ? Number(x.regularPrice) : undefined,
            discountPrice: x.discountPrice != null ? Number(x.discountPrice) : null,
            effectivePrice: x.effectivePrice != null ? Number(x.effectivePrice) : undefined,
          }))
      }
    } catch {
      // fall through to summary parser
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
        productId: "",
        name: colorMatch ? colorMatch[1].trim() : base,
        colorName: colorMatch ? colorMatch[2].trim() : undefined,
        quantity,
      }
    })
}

export function countOrderProducts(order: Order): number {
  const parsed = parseOrderItems(order.items || order.product)
  if (parsed.length === 0) return 1
  return parsed.reduce((sum, item) => sum + item.quantity, 0)
}

export const ORDER_STATUS_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  Pending: { bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA" },
  Accepted: { bg: "#ECFDF5", color: "#047857", border: "#A7F3D0" },
  Packing: { bg: "#F5F3FF", color: "#6D28D9", border: "#DDD6FE" },
  "Ready to Ship": { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" },
  Shipping: { bg: "#F0FDF4", color: "#059669", border: "#86EFAC" },
  "Collected by Customer": { bg: "#ECFDF5", color: "#065F46", border: "#34D399" },
  Rejected: { bg: "#FEF2F2", color: "#B91C1C", border: "#FECACA" },
  Processing: { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" },
  Shipped: { bg: "#F5F3FF", color: "#6D28D9", border: "#DDD6FE" },
  Delivered: { bg: "#ECFDF5", color: "#065F46", border: "#6EE7B7" },
  Cancelled: { bg: "#F3F4F6", color: "#4B5563", border: "#D1D5DB" },
}

export const NEXT_AVAILABLE_ACTIONS: Record<
  string,
  { nextStatus: string; label: string; bg: string; border: string; color: string } | null
> = {
  Accepted: {
    nextStatus: "Packing",
    label: "Start Packing",
    bg: "#6D28D9",
    border: "#6D28D9",
    color: "#FFFFFF",
  },
  Packing: {
    nextStatus: "Ready to Ship",
    label: "Ready to Ship",
    bg: "#2563EB",
    border: "#2563EB",
    color: "#FFFFFF",
  },
  "Ready to Ship": {
    nextStatus: "Shipping",
    label: "Ship Order",
    bg: "#059669",
    border: "#059669",
    color: "#FFFFFF",
  },
  Shipping: {
    nextStatus: "Collected by Customer",
    label: "Mark as Collected",
    bg: "#047857",
    border: "#047857",
    color: "#FFFFFF",
  },
}

export const TRACKING_STAGES = [
  { key: "Accepted", label: "Order Accepted", field: "acceptedAt" as const },
  { key: "Packing", label: "Packing", field: "packingAt" as const },
  { key: "Ready to Ship", label: "Ready to Ship", field: "readyToShipAt" as const },
  { key: "Shipping", label: "Shipping", field: "shippingAt" as const },
  { key: "Collected by Customer", label: "Collected by Customer", field: "collectedAt" as const },
] as const

export const PAYMENT_STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  Paid: { bg: "#ECFDF5", color: "#065F46" },
  Refunded: { bg: "#FEF2F2", color: "#991B1B" },
  Pending: { bg: "#FFFBEB", color: "#92400E" },
  Failed: { bg: "#FEF2F2", color: "#B91C1C" },
}

export function formatDateTime(iso?: string): string {
  if (!iso) return "—"
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
