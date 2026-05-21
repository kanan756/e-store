"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import type { ChangeEvent, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useCart } from "@/context/cart-context"

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
  postalCode: z.string().trim().min(4, "Enter a valid postal code.").max(10),
})

const EMPTY_FORM: FormData = {
  firstName: "", lastName: "", email: "", phone: "",
  address1: "", city: "", province: "", postalCode: "",
}

function formatPrice(rs: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR",
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(rs)
}

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart()
  const router = useRouter()
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const isSubmitting = useRef(false)
  const [error, setError] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "razorpay">("stripe")
  const [saveInfo, setSaveInfo] = useState(false)

  // Load saved address
  useEffect(() => {
    try {
      const saved = localStorage.getItem("clientStore_savedInfo")
      if (saved) {
        setForm(JSON.parse(saved))
        setSaveInfo(true)
      }
    } catch {}
  }, [])

  // Load Razorpay script
  useEffect(() => {
    const s = document.createElement("script")
    s.src = "https://checkout.razorpay.com/v1/checkout.js"
    s.async = true
    document.body.appendChild(s)
    return () => { document.body.removeChild(s) }
  }, [])

  const set = (field: keyof FormData) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      if (items.length === 0 || isSubmitting.current) return
      
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

        if (!window.Razorpay) {
          setError("Payment service is still loading. Please refresh and try again.")
          setLoading(false)
          isSubmitting.current = false
          return
        }
        // Build a readable product list string for Google Sheets
        const productSummary = items
          .map((i) => `${i.name} x${i.quantity}`)
          .join(", ")

        if (paymentMethod === "stripe") {
          const res = await fetch("/api/stripe/checkout-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              customerName: `${details.firstName} ${details.lastName}`,
              email: details.email,
              productSummary,
              amount: subtotal,
              successUrl: `${window.location.origin}/order-confirmed?session_id={CHECKOUT_SESSION_ID}`,
              cancelUrl: `${window.location.origin}/checkout`,
            }),
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data.error || "Failed to initialize Stripe checkout")
          if (data.url) {
            clearCart() // clear cart before redirecting
            window.location.href = data.url
          } else {
            throw new Error("No checkout URL returned")
          }
          return
        }

        if (!window.Razorpay) {
          setError("Payment service is still loading. Please refresh and try again.")
          setLoading(false)
          isSubmitting.current = false
          return
        }

        const options: RazorpayOptions = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "",
          amount: subtotal * 100, // Razorpay expects paise; price stored in Rs
          currency: "INR",

          name: "Superior Harnessing & Assembly",
          description: productSummary,
          handler: async (response: RazorpayResponse) => {
            try {
              // Write order to Google Sheets
              const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  customerName: `${details.firstName} ${details.lastName}`,
                  email: details.email,
                  product: productSummary,
                  amount: subtotal,
                  paymentId: response.razorpay_payment_id,
                }),
              })

              const data = await res.json()
              if (!res.ok) throw new Error(data.error)

              clearCart()
              router.push(`/order-confirmed?order_id=${encodeURIComponent(data.orderId)}&payment_id=${encodeURIComponent(response.razorpay_payment_id)}`)
            } catch {
              setError("Payment received but order save failed. Please contact support with your payment ID: " + response.razorpay_payment_id)
              setLoading(false)
              isSubmitting.current = false
            }
          },
          prefill: {
            name: `${details.firstName} ${details.lastName}`,
            email: details.email,
            contact: details.phone,
          },
          theme: { color: "#006d37" },
          modal: {
            ondismiss: () => {
              setLoading(false)
              isSubmitting.current = false
            },
          },
        }

        const rzp = new window.Razorpay(options)
        rzp.open()
      } catch (err: any) {
        setError(err.message || "Something went wrong. Please try again.")
        setLoading(false)
        isSubmitting.current = false
      }
    },
    [items, subtotal, form, clearCart, router, paymentMethod, saveInfo]
  )

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

              <h2 style={{ fontFamily: "var(--font-sora)", fontSize: 20, fontWeight: 700, marginBottom: 28, marginTop: 40 }}>
                Payment Method
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 18 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px", border: paymentMethod === "stripe" ? "2px solid var(--acc)" : "1px solid var(--bd)", borderRadius: "var(--rL)", cursor: "pointer", background: paymentMethod === "stripe" ? "rgba(0,109,55,0.05)" : "transparent" }}>
                  <input type="radio" name="paymentMethod" value="stripe" checked={paymentMethod === "stripe"} onChange={() => setPaymentMethod("stripe")} style={{ accentColor: "var(--acc)", width: 18, height: 18 }} />
                  <span style={{ fontWeight: 600 }}>Credit Card / Apple Pay (Stripe)</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px", border: paymentMethod === "razorpay" ? "2px solid var(--acc)" : "1px solid var(--bd)", borderRadius: "var(--rL)", cursor: "pointer", background: paymentMethod === "razorpay" ? "rgba(0,109,55,0.05)" : "transparent" }}>
                  <input type="radio" name="paymentMethod" value="razorpay" checked={paymentMethod === "razorpay"} onChange={() => setPaymentMethod("razorpay")} style={{ accentColor: "var(--acc)", width: 18, height: 18 }} />
                  <span style={{ fontWeight: 600 }}>UPI / Wallets / Cards (Razorpay)</span>
                </label>
              </div>
            </div>

            {/* ── Order summary ─────────────────────────────────────────── */}
            <div className="checkout-summary" style={{ background: "var(--cBg)", border: "1px solid var(--bd)", borderRadius: "var(--rL)", padding: 32, position: "sticky", top: 100 }}>
              <div style={{ fontFamily: "var(--font-sora)", fontSize: 14, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20, color: "var(--text2)" }}>
                Order Summary
              </div>

              {items.map((item) => (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 14 }}>
                  <span style={{ color: "var(--text2)" }}>
                    {item.name} × {item.quantity}
                  </span>
                  <span style={{ fontWeight: 600 }}>
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}

              <div style={{ borderTop: "1px solid var(--bd)", marginTop: 16, paddingTop: 16, display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontFamily: "var(--font-sora)", fontWeight: 700 }}>Total</span>
                <span style={{ fontFamily: "var(--font-sora)", fontWeight: 800, fontSize: 22, color: "var(--acc)" }}>
                  {formatPrice(subtotal)}
                </span>
              </div>

              <button
                type="submit"
                className="btn bp"
                disabled={loading}
                style={{ width: "100%", justifyContent: "center", marginTop: 24 }}
              >
                {loading ? "Processing…" : "Pay Now"}
              </button>

              <p style={{ textAlign: "center", marginTop: 12, fontSize: 12, color: "var(--textM)" }}>
                Secured by {paymentMethod === "stripe" ? "Stripe" : "Razorpay"}
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
