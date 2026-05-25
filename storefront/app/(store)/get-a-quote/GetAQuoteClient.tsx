"use client"

import { useState, useRef } from "react"

const s = {
  input: {
    width: "100%", boxSizing: "border-box" as const,
    padding: "14px 18px", background: "var(--cBg)",
    border: "1px solid var(--bd)", borderRadius: 10,
    color: "var(--text)", fontSize: 15, outline: "none",
    fontFamily: "inherit",
    transition: "border-color 0.2s",
  },
  label: {
    display: "block" as const, fontSize: 13, fontWeight: 600 as const,
    color: "var(--text2)", marginBottom: 8,
    textTransform: "uppercase" as const, letterSpacing: "0.05em",
  },
}

const APPLICATIONS = [
  "Automotive",
  "Broadcast",
  "Computer Wiring",
  "Electronics",
  "OEM Appliances",
  "Robotics",
  "Environmental",
  "Solar",
  "Electric Vehicles (EV)",
  "Telecommunication",
  "Medical",
  "Aerospace",
  "Construction",
  "Agricultural",
  "Lighting Cables",
  "Other",
]

export default function GetAQuoteClient() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", company: "",
    application: "", quantity: "", description: "", honeypot: "",
  })
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const isSubmitting = useRef(false)

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting.current) return
    isSubmitting.current = true
    setStatus("sending")
    setErrorMsg("")
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setStatus("success")
      setForm({ name: "", email: "", phone: "", company: "", application: "", quantity: "", description: "", honeypot: "" })
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong")
      setStatus("error")
    } finally {
      isSubmitting.current = false
    }
  }

  return (
    <div style={{ minHeight: "100vh", paddingTop: 120, paddingBottom: 80 }}>
      <div className="W" style={{ maxWidth: 960 }}>

        <style dangerouslySetInnerHTML={{ __html: `
          .quote-layout { grid-template-columns: 1fr !important; }
          @media (min-width: 768px) {
            .quote-layout { grid-template-columns: 1fr 1.5fr !important; }
          }
          .quote-two-col { grid-template-columns: 1fr !important; }
          @media (min-width: 560px) {
            .quote-two-col { grid-template-columns: 1fr 1fr !important; }
          }
        `}} />

        <div className="quote-layout" style={{ display: "grid", gap: 64, alignItems: "start" }}>

          {/* Left — Info */}
          <div>
            <div className="lbl" style={{ marginBottom: 16 }}>GET A QUOTE</div>
            <h1 className="D2" style={{ marginBottom: 20 }}>
              Looking for a custom wire harness solution?
            </h1>
            <p className="Bd" style={{ marginBottom: 20 }}>
              Send us your drawings, specifications, or project details, and our team will provide a fast and competitive quote. We specialize in custom manufacturing and are equipped to handle projects of all sizes.
            </p>
            <p className="Bd" style={{ marginBottom: 40 }}>
              We are committed to delivering high-quality products with quick turnaround times to help you meet your deadlines.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {[
                {
                  label: "Email Us",
                  value: "pateltushar1987@gmail.com",
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  ),
                },
                {
                  label: "Call Us",
                  value: "734 891 0248",
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.35 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6.07 6.07l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  ),
                },
                {
                  label: "Response Time",
                  value: "1–2 business days",
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                  ),
                },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: "rgba(0,109,55,0.08)", border: "1px solid rgba(0,109,55,0.15)",
                    color: "var(--acc)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>{item.icon}</div>
                  <div>
                    <div style={{ fontSize: 12, color: "var(--text2)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontSize: 15, color: "var(--text)" }}>{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Form */}
          <div style={{ background: "var(--cBg)", border: "1px solid var(--bd)", borderRadius: "var(--rL)", padding: 36 }}>
            {status === "success" ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="var(--acc)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="56" height="56">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                </div>
                <h2 style={{ fontFamily: "var(--font-sora)", fontWeight: 800, marginBottom: 12 }}>Quote Request Sent!</h2>
                <p style={{ color: "var(--text2)", marginBottom: 24 }}>
                  Thanks for reaching out. We&apos;ve sent you a confirmation email and will reply with a quote within 1–2 business days.
                </p>
                <button
                  onClick={() => setStatus("idle")}
                  className="btn bp"
                  style={{ margin: "0 auto" }}
                >
                  Submit Another Request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "grid", gap: 20 }}>
                <div className="quote-two-col" style={{ display: "grid", gap: 16 }}>
                  <div>
                    <label style={s.label}>Your Name *</label>
                    <input style={s.input} value={form.name} onChange={set("name")} required placeholder="John Doe" />
                  </div>
                  <div>
                    <label style={s.label}>Email Address *</label>
                    <input style={s.input} type="email" value={form.email} onChange={set("email")} required placeholder="john@company.com" />
                  </div>
                </div>

                <div className="quote-two-col" style={{ display: "grid", gap: 16 }}>
                  <div>
                    <label style={s.label}>Phone</label>
                    <input style={s.input} type="tel" value={form.phone} onChange={set("phone")} placeholder="+1 (555) 000-0000" />
                  </div>
                  <div>
                    <label style={s.label}>Company</label>
                    <input style={s.input} value={form.company} onChange={set("company")} placeholder="Your company name" />
                  </div>
                </div>

                <div className="quote-two-col" style={{ display: "grid", gap: 16 }}>
                  <div>
                    <label style={s.label}>Application / Industry</label>
                    <select style={s.input} value={form.application} onChange={set("application")}>
                      <option value="">Select industry…</option>
                      {APPLICATIONS.map(a => <option key={a}>{a}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={s.label}>Estimated Quantity</label>
                    <input style={s.input} value={form.quantity} onChange={set("quantity")} placeholder="e.g. 500 units/month" />
                  </div>
                </div>

                <div>
                  <label style={s.label}>Project Description *</label>
                  <textarea
                    style={{ ...s.input, minHeight: 160, resize: "vertical" }}
                    value={form.description}
                    onChange={set("description")}
                    required
                    minLength={10}
                    placeholder="Describe your project — wire gauge, connector types, length, application environment, any drawings or references…"
                  />
                </div>

                {/* Honeypot — hidden from real users */}
                <input
                  type="text"
                  value={form.honeypot}
                  onChange={set("honeypot")}
                  style={{ display: "none" }}
                  tabIndex={-1}
                  autoComplete="off"
                />

                {status === "error" && (
                  <div style={{
                    padding: "12px 16px", background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8,
                    color: "#ef4444", fontSize: 14,
                  }}>{errorMsg}</div>
                )}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="btn bp"
                  style={{
                    width: "100%", justifyContent: "center",
                    opacity: status === "sending" ? 0.65 : 1,
                    cursor: status === "sending" ? "not-allowed" : "pointer",
                  }}
                >
                  {status === "sending" ? "Sending…" : "Request a Quote →"}
                </button>

                <p style={{ fontSize: 12, color: "var(--textM)", textAlign: "center", margin: 0 }}>
                  Your information is saved securely. We respond within 1–2 business days.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
