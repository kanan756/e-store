/**
 * @file app/(store)/contact/page.tsx
 * @description Customer-facing contact form page — Client Component.
 *   Two-column layout: left side shows company contact info cards,
 *   right side has the inquiry form with subject dropdown.
 *
 *   Form features:
 *     - Subject categories: Product Inquiry, Order Support, Partnership, etc.
 *     - Honeypot anti-spam: hidden `honeypot` field (max length 0 server-side)
 *     - reCAPTCHA v3 (invisible, score-based): token sent with every submission
 *     - Success state: shows confirmation message after submission
 *     - On submit: POSTs to /api/contact which saves to Sheet + sends emails
 *
 * @owner Heet-P
 * @lastModified May 16, 2026
 */

"use client"

import { useState, useEffect, useCallback } from "react"

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

// reCAPTCHA v3 site key — optional (graceful fallback if not configured)
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? ""

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "", honeypot: "" })
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const [recaptchaReady, setRecaptchaReady] = useState(false)

  // Dynamically load the reCAPTCHA v3 script on mount
  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY) return // skip if key not configured
    if (document.getElementById("recaptcha-script")) { setRecaptchaReady(true); return }
    const script = document.createElement("script")
    script.id = "recaptcha-script"
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`
    script.async = true
    script.onload = () => setRecaptchaReady(true)
    document.head.appendChild(script)
    return () => { /* keep script for page lifetime */ }
  }, [])

  // Execute reCAPTCHA v3 challenge and get a token
  const getRecaptchaToken = useCallback((): Promise<string> => {
    if (!RECAPTCHA_SITE_KEY || !recaptchaReady) return Promise.resolve("")
    return new Promise((resolve) => {
      // @ts-expect-error — grecaptcha loaded by external script
      window.grecaptcha.ready(() => {
        // @ts-expect-error
        window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: "contact" }).then(resolve)
      })
    })
  }, [recaptchaReady])

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("sending")
    setErrorMsg("")
    try {
      // Get reCAPTCHA token (empty string if not configured — API handles gracefully)
      const recaptchaToken = await getRecaptchaToken()
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, recaptchaToken }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setStatus("success")
      setForm({ name: "", email: "", subject: "", message: "", honeypot: "" })
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong")
      setStatus("error")
    }
  }

  return (
    <div id="contact" style={{ minHeight: "100vh", paddingTop: 120, paddingBottom: 80 }}>
      <div className="W" style={{ maxWidth: 900 }}>
        <div className="contact-layout" style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 64, alignItems: "start" }}>

          {/* Left — Info */}
          <div>
            <div className="lbl" style={{ marginBottom: 16 }}>GET IN TOUCH</div>
            <h1 className="D2" style={{ marginBottom: 20 }}>Let&apos;s talk about your project</h1>
            <p className="Bd" style={{ marginBottom: 40 }}>
              Have a question, product inquiry, or partnership request? Fill in the form and we&apos;ll respond within 1–2 business days.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {[
                {
                  label: "Email", value: "hello@clientstore.com",
                  icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>),
                },
                {
                  label: "Phone", value: "+1 (800) 555-0190",
                  icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.35 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6.07 6.07l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>),
                },
                {
                  label: "Address", value: "Industrial Park, New York, NY 10001",
                  icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>),
                },
                {
                  label: "Hours", value: "Mon – Fri, 9 AM – 6 PM EST",
                  icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>),
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
                <h2 style={{ fontFamily: "var(--font-sora)", fontWeight: 800, marginBottom: 12 }}>Message Sent!</h2>
                <p style={{ color: "var(--text2)", marginBottom: 24 }}>
                  Thanks for reaching out. We&apos;ve sent you a confirmation email and will reply within 1–2 business days.
                </p>
                <button
                  onClick={() => setStatus("idle")}
                  style={{
                    padding: "10px 24px", background: "#2563eb", color: "#fff",
                    border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer",
                  }}
                >Send Another Message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "grid", gap: 20 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={s.label}>Your Name *</label>
                    <input style={s.input} value={form.name} onChange={set("name")} required placeholder="John Doe" />
                  </div>
                  <div>
                    <label style={s.label}>Email Address *</label>
                    <input style={s.input} type="email" value={form.email} onChange={set("email")} required placeholder="john@company.com" />
                  </div>
                </div>

                <div>
                  <label style={s.label}>Subject *</label>
                  <select style={s.input} value={form.subject} onChange={set("subject")} required>
                    <option value="">Select a topic…</option>
                    <option>Product Inquiry</option>
                    <option>Order Support</option>
                    <option>Partnership / B2B</option>
                    <option>General Question</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label style={s.label}>Message *</label>
                  <textarea
                    style={{ ...s.input, minHeight: 140, resize: "vertical" }}
                    value={form.message}
                    onChange={set("message")}
                    required
                    minLength={10}
                    placeholder="Tell us what you need…"
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
                  {status === "sending" ? "Sending…" : "Send Message →"}
                </button>

                <p style={{ fontSize: 12, color: "var(--textM)", textAlign: "center", margin: 0 }}>
                  Your message is saved securely. We respond within 1–2 business days.
                  {RECAPTCHA_SITE_KEY && (
                    <> This form is protected by reCAPTCHA.
                      {" "}<a href="https://policies.google.com/privacy" target="_blank" rel="noopener" style={{ color: "var(--acc)" }}>Privacy</a>
                      {" & "}<a href="https://policies.google.com/terms" target="_blank" rel="noopener" style={{ color: "var(--acc)" }}>Terms</a> apply.
                    </>
                  )}
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
