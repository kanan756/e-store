"use client"

import { useState, useCallback, useEffect } from "react"
import type { ChangeEvent, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { medusa, formatPrice } from "@/lib/medusa-client"
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
  order_id?: string
  handler: (response: RazorpayResponse) => void
  prefill: { name: string; email: string; contact: string }
  theme: { color: string }
  modal?: { ondismiss: () => void }
}

interface RazorpayInstance {
  open(): void
}

interface RazorpayResponse {
  razorpay_payment_id: string
  razorpay_order_id?: string
  razorpay_signature?: string
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
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian phone number."),
  address1: z.string().trim().min(5, "Enter a complete address.").max(200),
  city: z.string().trim().min(2, "City is required.").max(100),
  province: z.string().trim().min(2, "State is required.").max(100),
  postalCode: z.string().trim().regex(/^\d{6}$/, "Enter a valid 6-digit pincode."),
})

const EMPTY_FORM: FormData = {
  firstName: "", lastName: "", email: "", phone: "",
  address1: "", city: "", province: "", postalCode: "",
}

export default function CheckoutPage() {
  const { cart, clearCart } = useCart()
  const router = useRouter()
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Load Razorpay script
  useEffect(() => {
    const s = document.createElement("script")
    s.src = "https://checkout.razorpay.com/v1/checkout.js"
    s.async = true
    document.body.appendChild(s)
    return () => { document.body.removeChild(s) }
  }, [])

  const set = (field: keyof FormData) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      if (!cart || loading) return
      setLoading(true)
      setError("")

      try {
        const parsed = checkoutSchema.safeParse(form)
        if (!parsed.success) {
          setError(parsed.error.issues[0]?.message ?? "Please check your details and try again.")
          setLoading(false)
          return
        }

        const details = parsed.data

        // 1. Attach guest details to cart
        await medusa.carts.update(cart.id, {
          email: details.email,
          shipping_address: {
            first_name: details.firstName,
            last_name: details.lastName,
            address_1: details.address1,
            city: details.city,
            province: details.province,
            country_code: "in",
            postal_code: details.postalCode,
            phone: details.phone,
          },
        })

        // 1.5 Fetch and add shipping method (Required by Medusa to complete an order)
        const { shipping_options } = await medusa.fulfillment.listCartOptions(cart.id)
        if (shipping_options && shipping_options.length > 0) {
          await medusa.carts.addShippingMethod(cart.id, {
            option_id: shipping_options[0].id,
          })
        }

        // 2. Create payment sessions
        await medusa.carts.createPaymentSessions(cart.id)

        // 3. Select Payment Provider
        await medusa.carts.setPaymentSession(cart.id, {
          provider_id: process.env.NEXT_PUBLIC_MEDUSA_PAYMENT_PROVIDER_ID || "pp_system_default",
        })

        // 4. Open Razorpay modal
        const subtotal = cart.subtotal ?? 0
        const options: RazorpayOptions = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "",
          amount: subtotal,
          currency: "INR",
          name: "Client Store",
          description: "Order payment",
          handler: async (response: RazorpayResponse) => {
            try {
              // 5. Complete the cart to create the order
              await medusa.carts.complete(cart.id)
              clearCart()
              router.push(`/order-confirmed?payment_id=${encodeURIComponent(response.razorpay_payment_id)}`)
            } catch {
              // Medusa V2 sometimes throws a 400 state error even when the order was successfully created.
              // Let's verify if the cart actually completed before showing an error.
              try {
                const { cart: verifyCart } = await medusa.carts.retrieve(cart.id)
                if (verifyCart?.completed_at) {
                  clearCart()
                  router.push(`/order-confirmed?payment_id=${encodeURIComponent(response.razorpay_payment_id)}`)
                  return
                }
              } catch (e) {
                // ignore
              }
              
              setError("Payment was received, but we couldn't finalize the order. Please contact support.")
              setLoading(false)
            }
          },
          prefill: {
            name: `${details.firstName} ${details.lastName}`,
            email: details.email,
            contact: details.phone,
          },
          theme: { color: "#2563EB" },
          modal: {
            ondismiss: () => setLoading(false),
          },
        }

        if (!window.Razorpay) {
          setError("Payment service is still loading. Please refresh and try again.")
          setLoading(false)
          return
        }
        const rzp = new window.Razorpay(options)
        rzp.open()
      } catch {
        setError("Something went wrong. Please try again.")
        setLoading(false)
      }
    },
    [cart, form, loading, clearCart, router]
  )

  if (!cart || cart.items?.length === 0) {
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 64, alignItems: "start" }}>

            {/* ── Guest details form ────────────────────────────────────── */}
            <div>
              <h2 style={{ fontFamily: "var(--font-sora)", fontSize: 20, fontWeight: 700, marginBottom: 28 }}>
                Your Details
              </h2>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
                <Field label="First Name" placeholder="Heet" value={form.firstName} onChange={set("firstName")} required maxLength={50} />
                <Field label="Last Name" placeholder="Parikh" value={form.lastName} onChange={set("lastName")} required maxLength={50} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
                <Field label="Email Address" type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} required maxLength={254} />
                <Field label="Phone Number" type="tel" placeholder="9999999999" value={form.phone} onChange={set("phone")} required maxLength={10} />
              </div>

              <div style={{ marginBottom: 18 }}>
                <Field label="Address Line 1" placeholder="123 Street Name, Area" value={form.address1} onChange={set("address1")} required maxLength={200} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18 }}>
                <Field label="City" placeholder="Ahmedabad" value={form.city} onChange={set("city")} required maxLength={100} />
                <Field label="State" placeholder="Gujarat" value={form.province} onChange={set("province")} required maxLength={100} />
                <Field label="Pincode" placeholder="380001" value={form.postalCode} onChange={set("postalCode")} required maxLength={6} />
              </div>

              {error && (
                <div style={{ marginTop: 20, padding: "14px 18px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, color: "#ef4444", fontSize: 14 }}>
                  {error}
                </div>
              )}
            </div>

            {/* ── Order summary ─────────────────────────────────────────── */}
            <div style={{ background: "var(--cBg)", border: "1px solid var(--bd)", borderRadius: "var(--rL)", padding: 32, position: "sticky", top: 100 }}>
              <div style={{ fontFamily: "var(--font-sora)", fontSize: 14, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20, color: "var(--text2)" }}>
                Order Summary
              </div>

              {cart.items?.map((item) => (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 14 }}>
                  <span style={{ color: "var(--text2)" }}>
                    {item.title} × {item.quantity}
                  </span>
                  <span style={{ fontWeight: 600 }}>
                    {item.unit_price != null ? formatPrice(item.unit_price * item.quantity) : "—"}
                  </span>
                </div>
              ))}

              <div style={{ borderTop: "1px solid var(--bd)", marginTop: 16, paddingTop: 16, display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontFamily: "var(--font-sora)", fontWeight: 700 }}>Total</span>
                <span style={{ fontFamily: "var(--font-sora)", fontWeight: 800, fontSize: 22, color: "var(--acc)" }}>
                  {formatPrice(cart.subtotal ?? 0)}
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
                Secured by Razorpay
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
