"use client"

import Image from "next/image"
import Link from "next/link"
import { useCart } from "@/context/cart-context"
import { formatPrice } from "@/lib/medusa-client"

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

export default function CartPage() {
  const { cart, loading, error, removeItem, updateQuantity } = useCart()

  const items = cart?.items ?? []
  const subtotal = cart?.subtotal ?? 0
  const isEmpty = items.length === 0

  return (
    <div className="cart-page">
      <div className="W">
        <div style={{ marginBottom: 48 }}>
          <div className="lbl" style={{ marginBottom: 16 }}>YOUR CART</div>
          <h1 className="D3">Shopping Cart</h1>
        </div>

        {error && (
          <div style={{ marginBottom: 24, padding: "14px 18px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, color: "#ef4444", fontSize: 14 }}>
            {error}
          </div>
        )}

        {isEmpty ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <p style={{ color: "var(--text2)", fontSize: 18, marginBottom: 32 }}>
              Your cart is empty.
            </p>
            <Link href="/products" className="btn bp">
              Continue Shopping <ArrowIcon />
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 64, alignItems: "start" }}>

            {/* ── Line items ─────────────────────────────────────────── */}
            <div>
              {items.map((item) => (
                <div key={item.id} className="cart-item">
                  {/* Thumbnail */}
                  <div style={{ borderRadius: 12, overflow: "hidden", background: "var(--bg2)", aspectRatio: "1", position: "relative" }}>
                    {item.thumbnail ? (
                      <Image
                        src={item.thumbnail}
                        alt={item.title}
                        fill
                        sizes="100px"
                        style={{ objectFit: "cover" }}
                      />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "var(--textM)", fontFamily: "monospace", padding: 8, textAlign: "center" }}>
                        {item.title}
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div>
                    <div style={{ fontFamily: "var(--font-sora)", fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
                      {item.title}
                    </div>
                    {item.description && (
                      <div style={{ fontSize: 13, color: "var(--text2)", marginBottom: 8 }}>
                        {item.description}
                      </div>
                    )}
                    <div style={{ fontSize: 14, color: "var(--acc)", fontWeight: 600 }}>
                      {item.unit_price != null ? formatPrice(item.unit_price) : "—"}
                    </div>
                  </div>

                  {/* Qty controls */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1.5px solid var(--bd)", borderRadius: 9999, padding: "4px 12px" }}>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={loading}
                      style={{ color: "var(--text2)", display: "flex", padding: 4 }}
                    >
                      <MinusIcon />
                    </button>
                    <span style={{ fontFamily: "var(--font-sora)", fontWeight: 700, fontSize: 14, minWidth: 20, textAlign: "center" }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={loading}
                      style={{ color: "var(--text2)", display: "flex", padding: 4 }}
                    >
                      <PlusIcon />
                    </button>
                  </div>

                  {/* Remove */}
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ fontFamily: "var(--font-sora)", fontWeight: 800, fontSize: 18 }}>
                      {item.unit_price != null
                        ? formatPrice(item.unit_price * item.quantity)
                        : "—"}
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      disabled={loading}
                      style={{ color: "var(--text2)", display: "flex", opacity: 0.6, transition: "opacity 0.2s" }}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Summary ─────────────────────────────────────────────── */}
            <div style={{ background: "var(--cBg)", border: "1px solid var(--bd)", borderRadius: "var(--rL)", padding: 32, position: "sticky", top: 100 }}>
              <div style={{ fontFamily: "var(--font-sora)", fontSize: 14, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 24, color: "var(--text2)" }}>
                Order Summary
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 15 }}>
                <span style={{ color: "var(--text2)" }}>Subtotal</span>
                <span style={{ fontWeight: 700 }}>{formatPrice(subtotal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24, fontSize: 13, color: "var(--text2)" }}>
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>

              <div style={{ borderTop: "1px solid var(--bd)", paddingTop: 20, marginBottom: 24, display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontFamily: "var(--font-sora)", fontWeight: 700 }}>Total</span>
                <span style={{ fontFamily: "var(--font-sora)", fontWeight: 800, fontSize: 22, color: "var(--acc)" }}>
                  {formatPrice(subtotal)}
                </span>
              </div>

              <Link href="/checkout" className="btn bp" style={{ width: "100%", justifyContent: "center" }}>
                Proceed to Checkout <ArrowIcon />
              </Link>
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
