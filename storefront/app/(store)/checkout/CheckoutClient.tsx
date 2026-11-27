"use client"

/**
 * @file CheckoutClient.tsx
 * @description Manages the checkout form, user input validation, and Stripe payment integration.
 * 
 * Logic Highlights:
 * 1. Zod Validation: Ensures all fields (firstName, email, etc.) are properly filled before submission.
 * 2. Local Storage (Save Info): Allows users to save their address for future checkouts via localStorage.
 * 3. Stripe Integration: Instead of trusting the cart prices from the frontend (which can be manipulated), 
 *    it sends only the product IDs (handles) and quantities to the server. The server fetches the real 
 *    prices from Google Sheets and creates a secure Stripe session.
 */

import { useState, useCallback, useEffect, useRef } from "react"
import type { ChangeEvent, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { z } from "zod"
import { useCart } from "@/context/cart-context"
import { formatPrice } from "@/lib/format"
import Script from "next/script"

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance
  }
}

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  handler: (response: RazorpayResponse) => void
  prefill: { name: string; email: string; contact: string }
  theme: { color: string }
  modal?: { ondismiss: () => void }
}
interface RazorpayInstance { open(): void }
interface RazorpayResponse {
  razorpay_payment_id: string
}

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  address1: string
  city: string
  province: string
  postalCode: string
}

const checkoutSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required.").max(50),
  lastName: z.string().trim().min(1, "Last name is required.").max(50),
  email: z.string().trim().email("Enter a valid email address.").max(254),
  phone: z.string().trim().min(6, "Enter a valid phone number.").max(20),
  address1: z.string().trim().min(5, "Enter a complete address.").max(200),
  city: z.string().trim().min(2, "City is required.").max(100),
  province: z.string().trim().min(2, "State is required.").max(100),
  postalCode: z.string().trim().regex(/^[1-9][0-9]{5}$/, "Enter a valid 6-digit delivery PIN code."),
})

const EMPTY_FORM: FormData = {
  firstName: "", lastName: "", email: "", phone: "",
  address1: "", city: "", province: "", postalCode: "",
}

export default function CheckoutClient() {
  const {
    items,
    subtotal,
    clearCart,
    syncCart,
    syncing,
    priceChanges,
    hasUnavailableItems,
    priceChangeConfirmed,
    confirmPriceChanges,
  } = useCart()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const isSubmitting = useRef(false)
  const [error, setError] = useState("")
  const [saveInfo, setSaveInfo] = useState(false)

  // Delhivery Shipping Calculation State
  const [shippingCharge, setShippingCharge] = useState<number | null>(null)
  const [shippingLoading, setShippingLoading] = useState(false)
  const [shippingError, setShippingError] = useState<string | null>(null)
  const [shippingDetails, setShippingDetails] = useState<{
    chargeableWeightGrams?: number
    dimensions?: { length: number; width: number; height: number }
  } | null>(null)

  // Redirect to login if not authenticated, otherwise sync latest prices/stock
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=" + encodeURIComponent("/checkout") + "&message=" + encodeURIComponent("Please log in to your CLASPO account to complete checkout."))
    } else if (status === "authenticated") {
      void syncCart()
    }
  }, [status, router, syncCart])

  // Load saved address or prefill from user session & prefill delivery pincode from Cart
  useEffect(() => {
    try {
      const savedPincode = sessionStorage.getItem("claspo_delivery_pincode") || localStorage.getItem("claspo_delivery_pincode") || ""
      const saved = localStorage.getItem("clientStore_savedInfo")
      if (saved) {
        const parsed = JSON.parse(saved)
        setForm({
          ...parsed,
          postalCode: parsed.postalCode || savedPincode,
        })
        setSaveInfo(true)
      } else {
        const fullName = session?.user?.name || ""
        const parts = fullName.trim().split(" ")
        setForm((prev) => ({
          ...prev,
          firstName: prev.firstName || parts[0] || "",
          lastName: prev.lastName || parts.slice(1).join(" ") || "",
          email: prev.email || session?.user?.email || "",
          postalCode: prev.postalCode || savedPincode,
        }))
      }
    } catch {}
  }, [session])

  // Live Delhivery rate calculation when a valid 6-digit PIN code is present
  useEffect(() => {
    const cleanPin = form.postalCode.trim()
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
  }, [form.postalCode, items, subtotal])



  const set = (field: keyof FormData) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      if (items.length === 0 || isSubmitting.current || syncing || hasUnavailableItems || !priceChangeConfirmed) return

      isSubmitting.current = true
      setLoading(true)
      setError("")

      try {
        const parsed = checkoutSchema.safeParse(form)
        if (!parsed.success) {
          setError(parsed.error.issues[0]?.message ?? "Please check your details.")
          setLoading(false)
          isSubmitting.current = false
          return
        }

        const details = parsed.data

        if (saveInfo) {
          localStorage.setItem("clientStore_savedInfo", JSON.stringify(details))
        } else {
          localStorage.removeItem("clientStore_savedInfo")
        }

        if (shippingLoading) {
          setError("Please wait while Delhivery shipping charges are calculated.")
          setLoading(false)
          isSubmitting.current = false
          return
        }

        if (shippingCharge === null || shippingError) {
          setError(shippingError || "Please enter a valid serviceable 6-digit delivery PIN code to calculate shipping.")
          setLoading(false)
          isSubmitting.current = false
          return
        }

        const fullShippingAddress = [
          details.address1,
          details.city,
          details.province,
          details.postalCode,
          "India",
        ]
          .filter(Boolean)
          .join(", ")

        const expectedTotal = subtotal + shippingCharge

        const res = await fetch("/api/stripe/checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerName: `${details.firstName} ${details.lastName}`,
            email: details.email,
            deliveryPincode: details.postalCode,
            shippingAddress: fullShippingAddress,
            phoneNumber: details.phone,
            expectedTotal,
            // Send product IDs/handles + quantities so the server resolves
            // live prices, dimensions, and stock from Google Sheets.
            items: items.map((i) => ({
              handle: i.id,
              productId: i.productId,
              name: i.name,
              quantity: i.quantity,
              selectedColor: i.selectedColor ?? null,
            })),
            successUrl: `${window.location.origin}/order-confirmed?session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${window.location.origin}/checkout`,
          }),
        })
        const data = await res.json()
        if (res.status === 409 && data.code === "PRICE_CHANGED") {
          await syncCart()
          throw new Error(data.error || "Prices have changed. Please review your updated total.")
        }
        if (!res.ok) throw new Error(data.error || "Failed to initialize Stripe checkout")
        if (data.url) {
          // Store token in sessionStorage so order-confirmed can build the
          // invoice download URL without exposing it in the browser history.
          if (data.downloadToken) {
            sessionStorage.setItem("invoice_token", data.downloadToken)
          }
          clearCart()
          window.location.href = data.url
        } else {
          throw new Error("No checkout URL returned")
        }
      } catch (err: any) {
        setError(err.message || "Something went wrong. Please try again.")
        setLoading(false)
        isSubmitting.current = false
      }
    },
    [items, form, clearCart, saveInfo, syncing, hasUnavailableItems, priceChangeConfirmed, subtotal, syncCart, shippingCharge, shippingLoading, shippingError]
  )

  if (status === "loading") {
    return (
      <div className="checkout-page" style={{ padding: "100px 0", textAlign: "center" }}>
        <div className="W">
          <p style={{ color: "var(--text2)", fontSize: 16 }}>Loading checkout...</p>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return null
  }

  if (items.length === 0) {
    return (
      <div className="checkout-page">
        <div className="W" style={{ textAlign: "center" }}>
          <p style={{ color: "var(--text2)" }}>Your cart is empty.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="checkout-page">
      <div className="W">
        <div style={{ marginBottom: 48 }}>
          <div className="lbl" style={{ marginBottom: 16 }}>SECURE CHECKOUT</div>
          <h1 className="D3">Complete Your Order</h1>
        </div>

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
              Prices Updated Since Adding to Cart
            </div>
            <ul style={{ margin: "0 0 12px 18px", padding: 0, fontSize: 14, lineHeight: 1.6 }}>
              {priceChanges.map((c) => (
                <li key={c.id}>
                  <strong>{c.name}</strong>: updated from {formatPrice(c.previousPrice)} to{" "}
                  <strong style={{ color: "#F36B12" }}>{formatPrice(c.newPrice)}</strong>.
                </li>
              ))}
            </ul>
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
              Confirm Updated Total ({formatPrice(subtotal + (shippingCharge ?? 0))})
            </button>
          </div>
        )}

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
            Some items in your cart are unavailable or out of stock. Please return to your cart to remove them before paying.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="checkout-layout" style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 64, alignItems: "start" }}>

            {/* ── Details form ─────────────────────────────────────────── */}
            <div>
              <h2 style={{ fontFamily: "var(--font-sora)", fontSize: 20, fontWeight: 700, marginBottom: 28 }}>
                Your Details
              </h2>

              <div className="fields-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
                <Field label="First Name" placeholder="John" value={form.firstName} onChange={set("firstName")} required maxLength={50} />
                <Field label="Last Name" placeholder="Smith" value={form.lastName} onChange={set("lastName")} required maxLength={50} />
              </div>

              <div className="fields-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
                <Field label="Email Address" type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} required maxLength={254} />
                <Field label="Phone Number" type="tel" placeholder="+1 555 000 0000" value={form.phone} onChange={set("phone")} required maxLength={20} />
              </div>

              <div style={{ marginBottom: 18 }}>
                <Field label="Address" placeholder="123 Street Name, Area" value={form.address1} onChange={set("address1")} required maxLength={200} />
              </div>

              <div className="fields-3col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18, marginBottom: 24 }}>
                <Field label="City" placeholder="New York" value={form.city} onChange={set("city")} required maxLength={100} />
                <Field label="State / Province" placeholder="NY" value={form.province} onChange={set("province")} required maxLength={100} />
                <Field label="Postal Code" placeholder="10001" value={form.postalCode} onChange={set("postalCode")} required maxLength={10} />
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", marginBottom: 32 }}>
                <input type="checkbox" checked={saveInfo} onChange={(e) => setSaveInfo(e.target.checked)} style={{ accentColor: "var(--acc)", width: 16, height: 16 }} />
                <span style={{ fontSize: 14, color: "var(--text2)", fontWeight: 500 }}>Save this information for next time</span>
              </label>

              {error && (
                <div style={{ marginTop: 20, padding: "14px 18px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, color: "#ef4444", fontSize: 14 }}>
                  {error}
                </div>
              )}
            </div>

            {/* ── Order summary ─────────────────────────────────────────── */}
            <div className="checkout-summary" style={{ background: "var(--cBg)", border: "1px solid var(--bd)", borderRadius: "var(--rL)", padding: 32, position: "sticky", top: 100 }}>
              <div style={{ fontFamily: "var(--font-sora)", fontSize: 14, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20, color: "var(--text2)" }}>
                Order Summary
              </div>

              {items.map((item) => (
                <div key={`${item.productId || item.id}::${item.selectedColor?.name || ""}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12, fontSize: 14 }}>
                  <span style={{ color: "var(--text2)", display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <span>{item.name}</span>
                    {item.selectedColor && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: "#374151", background: "#F3F4F6", padding: "1px 7px", borderRadius: 999 }}>
                        <span
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            backgroundColor: item.selectedColor.hex,
                            border: "1px solid #D1D5DB",
                            display: "inline-block",
                          }}
                        />
                        {item.selectedColor.name}
                      </span>
                    )}
                    <span>× {item.quantity}</span>
                  </span>
                  <span style={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12, fontSize: 13, color: "var(--text2)", marginTop: 12 }}>
                <span style={{ flexShrink: 0 }}>
                  Shipping {shippingCharge !== null ? "" : ""}
                </span>
                <span style={{ textAlign: "right" }}>
                  {shippingLoading ? (
                    <span style={{ fontStyle: "italic" }}>Calculating shipping…</span>
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
                    <span style={{ fontStyle: "italic", fontSize: 12 }}>
                      Enter delivery PIN code to calculate shipping.
                    </span>
                  )}
                </span>
              </div>

              <div style={{ borderTop: "1px solid var(--bd)", marginTop: 16, paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div>
                  <span style={{ fontFamily: "var(--font-sora)", fontWeight: 700 }}>Total</span>
                  {shippingCharge === null && (
                    <div style={{ fontSize: 10.5, color: "var(--text2)", marginTop: 2 }}>
                      *Shipping not calculated yet
                    </div>
                  )}
                </div>
                <span style={{ fontFamily: "var(--font-sora)", fontWeight: 800, fontSize: 20, color: "var(--acc)" }}>
                  {formatPrice(subtotal + (shippingCharge ?? 0))}
                </span>
              </div>

              <button
                type="submit"
                className="btn bp"
                disabled={
                  loading ||
                  syncing ||
                  hasUnavailableItems ||
                  !priceChangeConfirmed ||
                  shippingLoading ||
                  shippingCharge === null ||
                  Boolean(shippingError)
                }
                style={{
                  width: "100%",
                  justifyContent: "center",
                  marginTop: 24,
                  opacity:
                    loading ||
                    syncing ||
                    hasUnavailableItems ||
                    !priceChangeConfirmed ||
                    shippingLoading ||
                    shippingCharge === null ||
                    Boolean(shippingError)
                      ? 0.55
                      : 1,
                }}
              >
                {syncing
                  ? "Syncing Prices…"
                  : loading
                  ? "Processing Payment…"
                  : !priceChangeConfirmed
                  ? "Confirm Updated Total Above"
                  : shippingLoading
                  ? "Calculating Shipping…"
                  : shippingError
                  ? "Shipping Unavailable"
                  : shippingCharge === null
                  ? "Enter 6-Digit Delivery PIN"
                  : `Pay Now (${formatPrice(subtotal + shippingCharge)})`}
              </button>

              <p style={{ textAlign: "center", marginTop: 12, fontSize: 12, color: "var(--textM)" }}>
                Secured by Stripe
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Reusable field ─────────────────────────────────────────────────────────────
function Field({
  label, placeholder, value, onChange, type = "text", required = false, maxLength,
}: {
  label: string
  placeholder?: string
  value: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  type?: string
  required?: boolean
  maxLength?: number
}) {
  return (
    <div className="form-field">
      <label className="form-label">{label}</label>
      <input
        type={type}
        className="form-input"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        maxLength={maxLength}
        autoComplete="on"
      />
    </div>
  )
}
