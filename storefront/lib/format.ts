export const FLAT_SHIPPING_INR = 99
export const FREE_SHIPPING_THRESHOLD_INR = 999

export function formatPrice(amount: number, showDecimals = false): string {
  const safeAmount = Number.isFinite(amount) ? amount : 0
  const hasFraction = Math.round(safeAmount * 100) % 100 !== 0
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: showDecimals || hasFraction ? 2 : 0,
    maximumFractionDigits: showDecimals || hasFraction ? 2 : 0,
  }).format(safeAmount)
}
