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
    <section id="cta" className="sec" style={{ background: "#F7F7F9", padding: "80px 0" }}>
      <div className="W">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 32,
          }}
        >
          {/* Left: Project Quote / Direct Contact */}
          <div
            style={{
              background: "linear-gradient(135deg, #5420C8 0%, #3B1299 100%)",
              borderRadius: 24,
              padding: "44px 36px",
              color: "#FFFFFF",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "0 10px 32px rgba(84, 32, 200, 0.22)",
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "rgba(255, 255, 255, 0.16)",
                  color: "#FFFFFF",
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  padding: "6px 14px",
                  borderRadius: 9999,
                  marginBottom: 20,
                }}
              >
                Fast 24-48h Quote Turnaround
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
                Ready to Put Your Next Program in Reliable Hands?
              </h2>

              <p
                style={{
                  fontSize: 15,
                  color: "rgba(255, 255, 255, 0.85)",
                  lineHeight: 1.65,
                  marginBottom: 28,
                }}
              >
                Send us your wire list, CAD prints, or BOM specifications. Our engineering team reviews your design for manufacturability (DFM) and delivers an itemized quote within two business days.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28, fontSize: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, color: "rgba(255, 255, 255, 0.9)" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-10 6L2 7" />
                  </svg>
                  <span>Official Inquiry: <strong>info@claspo.store</strong></span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, color: "rgba(255, 255, 255, 0.9)" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.17 12a19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 3.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span>Direct Line: <strong>+1 734 891 0248</strong></span>
                </div>
              </div>
            </div>

            <div>
              <Link
                href="/contact"
                style={{
                  background: "#FFFFFF",
                  color: "var(--claspo-purple)",
                  fontSize: 14,
                  fontWeight: 800,
                  padding: "14px 28px",
                  borderRadius: 9999,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                  transition: "transform 0.15s ease",
                }}
              >
                Request a Custom Quote
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12,5 19,12 12,19" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Right: Newsletter & Special Updates */}
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 24,
              padding: "44px 36px",
              border: "1px solid #EBE9F2",
              boxShadow: "0 8px 30px rgba(0,0,0,0.04)",
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
                  background: "var(--claspo-lavender)",
                  color: "var(--claspo-purple)",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  padding: "6px 14px",
                  borderRadius: 9999,
                  marginBottom: 20,
                }}
              >
                Newsletter &amp; Updates
              </div>

              <h2
                style={{
                  fontSize: "clamp(24px, 3vw, 32px)",
                  fontWeight: 800,
                  color: "var(--claspo-text)",
                  lineHeight: 1.25,
                  letterSpacing: "-0.02em",
                  marginBottom: 14,
                }}
              >
                Stay Updated with CLASPO
              </h2>

              <p
                style={{
                  fontSize: 15,
                  color: "var(--claspo-muted)",
                  lineHeight: 1.6,
                  marginBottom: 26,
                }}
              >
                Subscribe for exclusive discounts, new product releases, technical manufacturing guides, and special promotional announcements.
              </p>

              {/* Newsletter Form */}
              <form onSubmit={handleSubscribe} style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <input
                    type="email"
                    required
                    placeholder="Enter your corporate email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={status === "loading" || status === "success"}
                    style={{
                      width: "100%",
                      padding: "14px 18px",
                      borderRadius: 12,
                      border: "1.5px solid #E5E5EB",
                      fontSize: 14,
                      outline: "none",
                      color: "var(--claspo-text)",
                      background: "#FFFFFF",
                      transition: "border-color 0.2s ease",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--claspo-purple)")}
                    onBlur={(e) => (e.target.style.borderColor = "#E5E5EB")}
                  />
                  <button
                    type="submit"
                    disabled={status === "loading" || status === "success"}
                    style={{
                      background: "var(--claspo-purple)",
                      color: "#FFFFFF",
                      fontWeight: 800,
                      fontSize: 14,
                      padding: "14px 28px",
                      borderRadius: 9999,
                      border: "none",
                      cursor: status === "loading" || status === "success" ? "default" : "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      boxShadow: "0 4px 14px rgba(84, 32, 200, 0.25)",
                      opacity: status === "loading" ? 0.7 : 1,
                      transition: "transform 0.15s ease",
                      marginTop: 4,
                    }}
                  >
                    {status === "loading" ? "Subscribing..." : status === "success" ? "Subscribed ✓" : "Subscribe"}
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
                      color: status === "error" ? "#EF4444" : "#10B981",
                      fontWeight: 600,
                    }}
                  >
                    {message}
                  </div>
                )}
              </form>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 12.5, color: "var(--claspo-muted)" }}>
              <span>✓ No spam guarantee</span>
              <span>✓ Instant unsubscribe</span>
              <span>✓ GDPR compliant</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
