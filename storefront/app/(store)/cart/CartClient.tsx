"use client"

/**
 * @file CartClient.tsx
 * @description Manages the shopping cart user interface with live server synchronization.
 */

import { useEffect, useState, useCallback, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useCart } from "@/context/cart-context"
import { formatPrice } from "@/lib/format"

function ArrowIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12,5 19,12 12,19" />
    </svg>
  )
}

function MinusIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>
}

function PlusIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
}

function TrashIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
}

export default function CartClient() {
  const router = useRouter()
  const { status } = useSession()
  const {
    items,
    loading,
    syncing,
    subtotal,
    priceChanges,
    stockAdjustments,
    hasUnavailableItems,
    priceChangeConfirmed,
    confirmPriceChanges,
    syncCart,
    removeItem,
    updateQuantity,
  } = useCart()

  // Delhivery Shipping Calculation State
  const [deliveryPincode, setDeliveryPincode] = useState("")
  const [shippingCharge, setShippingCharge] = useState<number | null>(null)
  const [shippingLoading, setShippingLoading] = useState(false)
  const [shippingError, setShippingError] = useState<string | null>(null)
  const [shippingDetails, setShippingDetails] = useState<{
    chargeableWeightGrams?: number
    dimensions?: { length: number; width: number; height: number }
  } | null>(null)

  // Load saved delivery pincode on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("claspo_delivery_pincode") || localStorage.getItem("claspo_delivery_pincode")
      if (saved && /^[1-9][0-9]{5}$/.test(saved)) {
        setDeliveryPincode(saved)
      }
    } catch {}
  }, [])

  // Live Delhivery rate calculation when valid 6-digit PIN code or cart items/quantities change
  useEffect(() => {
    const cleanPin = deliveryPincode.trim()
    if (!/^[1-9][0-9]{5}$/.test(cleanPin)) {
      setShippingCharge(null)
      setShippingError(null)
      setShippingDetails(null)
      return
    }

    if (items.length === 0 || subtotal <= 0) {
      setShippingCharge(null)
      setShippingError(null)
      setShippingDetails(null)
      return
    }

    let active = true
    const timer = setTimeout(async () => {
      setShippingLoading(true)
      setShippingError(null)

      try {
        const res = await fetch("/api/shipping/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pincode: cleanPin,
            items: items.map((i) => ({
              productId: i.productId || i.id,
              handle: i.id,
              quantity: i.quantity,
            })),
          }),
        })

        const data = await res.json()
        if (!active) return

        if (!res.ok || !data.success) {
          setShippingCharge(null)
          setShippingDetails(null)
          setShippingError(data.error || "Unable to calculate shipping charges. Please try again.")
        } else {
          setShippingCharge(data.shippingCharge)
          setShippingDetails({
            chargeableWeightGrams: data.chargeableWeightGrams,
            dimensions: data.dimensions,
          })
          setShippingError(null)
          try {
            sessionStorage.setItem("claspo_delivery_pincode", cleanPin)
            localStorage.setItem("claspo_delivery_pincode", cleanPin)
          } catch {}
        }
      } catch {
        if (!active) return
        setShippingCharge(null)
        setShippingDetails(null)
        setShippingError("Unable to calculate shipping charges. Please try again.")
      } finally {
        if (active) setShippingLoading(false)
      }
    }, 400)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [deliveryPincode, items, subtotal])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(
        "/login?callbackUrl=" +
          encodeURIComponent("/cart") +
          "&message=" +
          encodeURIComponent("Please log in to your CLASPO account to view your cart.")
      )
    } else if (status === "authenticated") {
      void syncCart()
    }
  }, [status, router, syncCart])

  if (status === "loading" || loading) {
    return (
      <div className="cart-page" style={{ padding: "100px 0", textAlign: "center" }}>
        <div className="W">
          <p style={{ color: "#747474", fontSize: 16 }}>Loading your cart…</p>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return null
  }

  const isEmpty = items.length === 0
  const changedIds = new Set(priceChanges.map((c) => c.id))
  const checkoutBlocked = syncing || hasUnavailableItems || !priceChangeConfirmed || subtotal <= 0

  return (
    <div className="cart-page">
      <div className="W">
        <div style={{ marginBottom: 36, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div className="lbl" style={{ marginBottom: 12 }}>YOUR CART</div>
            <h1 className="D3">Shopping Cart</h1>
          </div>
          {syncing && (
            <span style={{ fontSize: 13, color: "#747474", fontWeight: 600 }}>
              Syncing latest prices &amp; stock…
            </span>
          )}
        </div>

        {/* Price Change Notification Banner */}
        {priceChanges.length > 0 && !priceChangeConfirmed && (
          <div
            role="alert"
            style={{
              marginBottom: 24,
              padding: "16px 20px",
              borderRadius: 12,
              background: "#FFF4ED",
              border: "1.5px solid #F36B12",
              color: "#17191C",
            }}
          >
            <div style={{ fontWeight: 800, fontSize: 15, color: "#D9570A", marginBottom: 6 }}>
              Cart Prices Updated
            </div>
            <ul style={{ margin: "0 0 12px 18px", padding: 0, fontSize: 14, lineHeight: 1.6 }}>
              {priceChanges.map((c) => (
                <li key={c.id}>
                  <strong>{c.name}</strong>: Product price updated from{" "}
                  <span style={{ textDecoration: "line-through", color: "#747474" }}>
                    {formatPrice(c.previousPrice)}
                  </span>{" "}
                  to <strong style={{ color: "#F36B12" }}>{formatPrice(c.newPrice)}</strong>.
                </li>
              ))}
            </ul>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <span style={{ fontSize: 13.5, color: "#303638", fontWeight: 600 }}>
                Your cart total has been updated to {formatPrice(subtotal + (shippingCharge ?? 0))}. Please confirm before proceeding to checkout.
              </span>
              <button
                type="button"
                onClick={confirmPriceChanges}
                style={{
                  padding: "9px 18px",
                  borderRadius: 8,
                  border: "none",
                  background: "#F36B12",
                  color: "#FFFFFF",
                  fontSize: 13.5,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Confirm Updated Total
              </button>
            </div>
          </div>
        )}

        {/* Stock Adjustment Notice */}
        {stockAdjustments.length > 0 && (
          <div
            style={{
              marginBottom: 20,
              padding: "12px 18px",
              borderRadius: 10,
              background: "#FEF3C7",
              border: "1px solid #F59E0B",
              color: "#92400E",
              fontSize: 13.5,
              fontWeight: 600,
            }}
          >
            {stockAdjustments.map((s) => (
              <div key={s.id}>
                Quantity for <strong>{s.name}</strong> was adjusted from {s.previousQty} to {s.newQty} based on available stock.
              </div>
            ))}
          </div>
        )}

        {/* Unavailable Items Warning */}
        {hasUnavailableItems && (
          <div
            role="alert"
            style={{
              marginBottom: 24,
              padding: "14px 18px",
              borderRadius: 10,
              background: "#FEF2F2",
              border: "1px solid #FCA5A5",
              color: "#DC2626",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            One or more items in your cart are currently unavailable or out of stock. Please remove them to proceed to checkout.
          </div>
        )}

        {isEmpty ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <p style={{ color: "#777777", fontSize: 18, marginBottom: 32 }}>
              Your cart is empty.
            </p>
            <Link href="/products" className="btn bp">
              Continue Shopping <ArrowIcon />
            </Link>
          </div>
        ) : (
          <div className="cart-layout" style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 64, alignItems: "start" }}>
            {/* ── Line items ── */}
            <div>
              {items.map((item) => {
                const isUnavailable = item.inStock === false || Boolean(item.unavailableReason)
                const isPriceUpdated = changedIds.has(item.id)
                const atMaxStock = item.stock != null && item.stock > 0 && item.quantity >= item.stock
                const hasRegularStrike =
                  item.regularPrice != null && item.regularPrice > item.price

                return (
                  <div
                    key={`${item.productId || item.id}::${item.selectedColor?.name || ""}`}
                    className="cart-item"
                    style={{
                      border: isUnavailable
                        ? "1.5px solid #FCA5A5"
                        : isPriceUpdated
                        ? "1.5px solid #F36B12"
                        : undefined,
                      background: isUnavailable
                        ? "#FEF2F2"
                        : isPriceUpdated
                        ? "#FFF9F5"
                        : undefined,
                      borderRadius: isUnavailable || isPriceUpdated ? 10 : undefined,
                      padding: isUnavailable || isPriceUpdated ? "16px" : undefined,
                    }}
                  >
                    {/* Thumbnail */}
                    <div style={{ borderRadius: 8, overflow: "hidden", background: "#F5F5F5", border: "1px solid #E5E5E5", aspectRatio: "1", position: "relative" }}>
                      {(() => {
                        const firstUrl = item.imageUrl ? item.imageUrl.split(",")[0].trim() : ""
                        if (!firstUrl || firstUrl === "-") return false
                        if (firstUrl.startsWith("/")) return firstUrl
                        try { new URL(firstUrl); return firstUrl } catch { return false }
                      })() ? (
                        <img src={item.imageUrl.split(",")[0].trim()} alt={item.name} style={{ width: "100%", height: "100%", display: "block", objectFit: "contain", padding: "8px" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#747474", fontFamily: "monospace", padding: 8, textAlign: "center" }}>
                          {item.name}
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div>
                      <div style={{ fontFamily: "var(--font-sora)", fontWeight: 700, fontSize: 16, marginBottom: 4, color: "#17191C" }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: 13, color: "#747474", marginBottom: item.selectedColor ? 4 : 6 }}>{item.category}</div>
                      {item.selectedColor && (
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 6, fontSize: 12.5, fontWeight: 600, color: "#374151" }}>
                          <span
                            style={{
                              width: 12,
                              height: 12,
                              borderRadius: "50%",
                              backgroundColor: item.selectedColor.hex,
                              border: "1px solid #D1D5DB",
                              display: "inline-block",
                              flexShrink: 0,
                            }}
                          />
                          <span>Colour: {item.selectedColor.name}</span>
                        </div>
                      )}
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 14.5, color: "#F36B12", fontWeight: 800 }}>
                          {formatPrice(item.price)}
                        </span>
                        {hasRegularStrike && (
                          <span style={{ fontSize: 12.5, color: "#9CA3AF", textDecoration: "line-through" }}>
                            {formatPrice(item.regularPrice!)}
                          </span>
                        )}
                        {isPriceUpdated && (
                          <span style={{ fontSize: 11, fontWeight: 700, color: "#D9570A", background: "#FFE4D1", padding: "2px 6px", borderRadius: 4 }}>
                            Price Updated
                          </span>
                        )}
                      </div>
                      {isUnavailable && (
                        <div style={{ marginTop: 6, fontSize: 12.5, fontWeight: 700, color: "#DC2626" }}>
                          {item.unavailableReason === "deleted"
                            ? "This product is no longer available."
                            : item.unavailableReason === "inactive"
                            ? "This product is currently unavailable."
                            : item.unavailableReason === "color_unavailable"
                            ? "Selected colour is unavailable. Please remove it and select another colour."
                            : "Out of stock."}
                        </div>
                      )}
                    </div>

                    {/* Qty controls */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid #E5E5E5", borderRadius: 6, background: "#FFFFFF", padding: "4px 8px", opacity: isUnavailable ? 0.5 : 1 }}>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1), item.selectedColor?.name ?? null)}
                        disabled={loading || isUnavailable}
                        style={{ color: "#17191C", display: "flex", padding: 4, cursor: isUnavailable ? "not-allowed" : "pointer", background: "none", border: "none" }}
                      >
                        <MinusIcon />
                      </button>
                      <span style={{ fontFamily: "var(--font-sora)", fontWeight: 700, fontSize: 14, minWidth: 20, textAlign: "center", color: "#17191C" }}>
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedColor?.name ?? null)}
                        disabled={loading || isUnavailable || atMaxStock}
                        title={atMaxStock ? `Max available stock: ${item.stock}` : "Increase quantity"}
                        style={{ color: "#17191C", display: "flex", padding: 4, cursor: isUnavailable || atMaxStock ? "not-allowed" : "pointer", opacity: atMaxStock ? 0.35 : 1, background: "none", border: "none" }}
                      >
                        <PlusIcon />
                      </button>
                    </div>

                    {/* Subtotal + Remove */}
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{ fontFamily: "var(--font-sora)", fontWeight: 800, fontSize: 18 }}>
                        {formatPrice(item.price * item.quantity)}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId || item.id, item.selectedColor?.name ?? null)}
                        disabled={loading}
                        aria-label={`Remove ${item.name}`}
                        style={{ color: "var(--text2)", display: "flex", opacity: 0.7, transition: "opacity 0.2s", background: "none", border: "none", cursor: "pointer" }}
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* ── Summary ── */}
            <div className="cart-summary" style={{ background: "var(--cBg)", border: "1px solid var(--bd)", borderRadius: "var(--rL)", padding: 32, position: "sticky", top: 100 }}>
              <div style={{ fontFamily: "var(--font-sora)", fontSize: 14, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 24, color: "var(--text2)" }}>
                Order Summary
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 15 }}>
                <span style={{ color: "var(--text2)" }}>Subtotal</span>
                <span style={{ fontWeight: 700 }}>{formatPrice(subtotal)}</span>
              </div>

              {/* Delivery PIN Code Input */}
              <div style={{ marginBottom: 16, padding: "12px 14px", background: "var(--bg)", borderRadius: 10, border: "1px solid var(--bd)" }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text2)", marginBottom: 6 }}>
                  Delivery PIN Code (Delhivery)
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit PIN"
                    value={deliveryPincode}
                    onChange={(e) => setDeliveryPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      borderRadius: 6,
                      border: "1px solid var(--bd)",
                      fontSize: 13,
                      fontWeight: 600,
                      background: "var(--cBg)",
                      color: "var(--text)",
                      outline: "none",
                    }}
                  />
                </div>
                {deliveryPincode.length > 0 && deliveryPincode.length < 6 && (
                  <span style={{ fontSize: 11, color: "var(--text2)", marginTop: 4, display: "block" }}>
                    Enter complete 6-digit PIN code
                  </span>
                )}
              </div>

              {/* Shipping Row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 20, fontSize: 13 }}>
                <span style={{ color: "var(--text2)", flexShrink: 0 }}>
                  Shipping {shippingCharge !== null ? "(Delhivery)" : ""}
                </span>
                <span style={{ textAlign: "right" }}>
                  {shippingLoading ? (
                    <span style={{ color: "var(--text2)", fontStyle: "italic" }}>Calculating shipping…</span>
                  ) : shippingCharge !== null ? (
                    <div>
                      <span style={{ fontWeight: 700, color: "var(--text)" }}>{formatPrice(shippingCharge)}</span>
                      {shippingDetails?.chargeableWeightGrams && (
                        <div style={{ fontSize: 10.5, color: "var(--text2)", marginTop: 2 }}>
                          Chargeable: {(shippingDetails.chargeableWeightGrams / 1000).toFixed(2)} kg
                        </div>
                      )}
                    </div>
                  ) : shippingError ? (
                    <span style={{ color: "#DC2626", fontWeight: 600, fontSize: 12 }}>
                      {shippingError}
                    </span>
                  ) : (
                    <span style={{ color: "var(--text2)", fontStyle: "italic", fontSize: 12 }}>
                      Enter delivery PIN code to calculate shipping.
                    </span>
                  )}
                </span>
              </div>

              <div style={{ borderTop: "1px solid var(--bd)", paddingTop: 20, marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div>
                  <span style={{ fontFamily: "var(--font-sora)", fontWeight: 700 }}>Total</span>
                  {shippingCharge === null && (
                    <div style={{ fontSize: 10.5, color: "var(--text2)", marginTop: 2 }}>
                      *Excluding shipping charges
                    </div>
                  )}
                </div>
                <span style={{ fontFamily: "var(--font-sora)", fontWeight: 800, fontSize: 22, color: "var(--acc)" }}>
                  {formatPrice(subtotal > 0 ? subtotal + (shippingCharge ?? 0) : 0)}
                </span>
              </div>

              {checkoutBlocked ? (
                <button
                  type="button"
                  disabled
                  className="btn bp"
                  style={{ width: "100%", justifyContent: "center", opacity: 0.5, cursor: "not-allowed" }}
                >
                  {!priceChangeConfirmed
                    ? "Confirm Updated Total First"
                    : hasUnavailableItems
                    ? "Remove Unavailable Items"
                    : "Proceed to Checkout"}
                </button>
              ) : (
                <Link href="/checkout" className="btn bp" style={{ width: "100%", justifyContent: "center" }}>
                  Proceed to Checkout <ArrowIcon />
                </Link>
              )}

              <Link href="/products" style={{ display: "block", textAlign: "center", marginTop: 16, fontSize: 13, color: "var(--text2)" }}>
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
