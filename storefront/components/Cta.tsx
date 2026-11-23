"use client"

import { useState } from "react"
import Link from "next/link"

export default function Cta() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setStatus("loading")
    setMessage("")

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "homepage-cta", honeypot: "" }),
      })
      const data = await res.json()
      if (!res.ok) {
        setStatus("error")
        setMessage(data.error ?? "Failed to subscribe. Please try again.")
        return
      }
      setStatus("success")
      setMessage("Thank you! You're now subscribed to CLASPO updates.")
      setEmail("")
    } catch {
      setStatus("error")
      setMessage("Network error. Please try again later.")
    }
  }

  return (
    <section id="cta" className="sec" style={{ background: "#F5F5F5", padding: "80px 0", borderBottom: "1px solid #DADADA" }}>
      <div className="W">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 32,
          }}
        >
          {/* Left: Customer Care & Direct Contact */}
          <div
            style={{
              background: "#303638",
              borderRadius: 14,
              padding: "44px 36px",
              color: "#FFFFFF",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "0 4px 18px rgba(0, 0, 0, 0.12)",
              border: "1px solid #454C4F",
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  color: "#FFFFFF",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  padding: "6px 14px",
                  borderRadius: "4px",
                  marginBottom: 20,
                }}
              >
                Customer Support
              </div>

              <h2
                style={{
                  fontSize: "clamp(26px, 3.2vw, 36px)",
                  fontWeight: 800,
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                  marginBottom: 16,
                  color: "#FFFFFF",
                }}
              >
                Need Assistance or Product Advice?
              </h2>

              <p
                style={{
                  fontSize: 15,
                  color: "rgba(255, 255, 255, 0.8)",
                  lineHeight: 1.65,
                  marginBottom: 28,
                }}
              >
                Whether you have questions about our kitchen gadgets, space-saving storage systems, or an ongoing order, our customer support team is always ready to assist you.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28, fontSize: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#FFFFFF" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-10 6L2 7" />
                  </svg>
                  <span>Official Email: <strong>info@claspo.store</strong></span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#FFFFFF" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>Address: <strong>306, Radhe Kishan Arista, Maninagar, Ahmedabad</strong></span>
                </div>
              </div>
            </div>

            <div>
              <Link
                href="/contact"
                style={{
                  background: "#FFFFFF",
                  color: "#111111",
                  fontSize: 14,
                  fontWeight: 700,
                  padding: "13px 28px",
                  borderRadius: "6px",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  transition: "background 0.2s ease, transform 0.15s ease",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "#F5F5F5"
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "#FFFFFF"
                }}
              >
                Contact Us
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12,5 19,12 12,19" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Right: Stay Connected with CLASPO */}
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 14,
              padding: "44px 36px",
              border: "1px solid #DADADA",
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#F5F5F5",
                  color: "#111111",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  padding: "6px 14px",
                  borderRadius: "4px",
                  border: "1px solid #DADADA",
                  marginBottom: 20,
                }}
              >
                Newsletter &amp; Updates
              </div>

              <h2
                style={{
                  fontSize: "clamp(24px, 3vw, 32px)",
                  fontWeight: 800,
                  color: "#111111",
                  lineHeight: 1.25,
                  letterSpacing: "-0.02em",
                  marginBottom: 14,
                }}
              >
                Stay Connected with CLASPO
              </h2>

              <p
                style={{
                  fontSize: 15,
                  color: "#777777",
                  lineHeight: 1.6,
                  marginBottom: 26,
                }}
              >
                Be the first to discover new arrivals, useful home solutions, product updates, and special offers.
              </p>

              {/* Newsletter Form */}
              <form onSubmit={handleSubscribe} style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={status === "loading" || status === "success"}
                    style={{
                      width: "100%",
                      padding: "13px 16px",
                      borderRadius: 6,
                      border: "1px solid #DADADA",
                      fontSize: 14,
                      outline: "none",
                      color: "#111111",
                      background: "#FFFFFF",
                      transition: "border-color 0.2s ease",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#111111")}
                    onBlur={(e) => (e.target.style.borderColor = "#DADADA")}
                  />
                  <button
                    type="submit"
                    disabled={status === "loading" || status === "success"}
                    style={{
                      background: "#111111",
                      color: "#FFFFFF",
                      fontWeight: 700,
                      fontSize: 14,
                      padding: "13px 28px",
                      borderRadius: 6,
                      border: "none",
                      cursor: status === "loading" || status === "success" ? "default" : "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
                      opacity: status === "loading" ? 0.7 : 1,
                      transition: "background 0.2s ease",
                      marginTop: 4,
                    }}
                    onMouseEnter={e => {
                      if (status !== "loading" && status !== "success") {
                        e.currentTarget.style.background = "#303638"
                      }
                    }}
                    onMouseLeave={e => {
                      if (status !== "loading" && status !== "success") {
                        e.currentTarget.style.background = "#111111"
                      }
                    }}
                  >
                    {status === "loading" ? "Subscribing..." : status === "success" ? "Subscribed ✓" : "Subscribe Now"}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12,5 19,12 12,19" />
                    </svg>
                  </button>
                </div>
                {message && (
                  <div
                    style={{
                      marginTop: 10,
                      fontSize: 13,
                      color: status === "error" ? "#EF4444" : "#111111",
                      fontWeight: 600,
                    }}
                  >
                    {message}
                  </div>
                )}
              </form>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 12.5, color: "#777777" }}>
              <span>✓ No spam guarantee</span>
              <span>✓ Instant unsubscribe</span>
              <span>✓ Exclusive savings</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
