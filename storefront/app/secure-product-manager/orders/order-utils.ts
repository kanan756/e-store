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
  Rejected: { bg: "#FEF2F2", color: "#B91C1C", border: "#FECACA" },
  Processing: { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" },
  Shipped: { bg: "#F5F3FF", color: "#6D28D9", border: "#DDD6FE" },
  Delivered: { bg: "#ECFDF5", color: "#065F46", border: "#6EE7B7" },
  Cancelled: { bg: "#F3F4F6", color: "#4B5563", border: "#D1D5DB" },
}

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
