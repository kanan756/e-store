"use client"

import Link from "next/link"
import { useState } from "react"

function ArrowRight() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

export default function Hero() {
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSending(true)
    const fd = new FormData(e.currentTarget)
    const data = Object.fromEntries(fd.entries())
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (res.ok) setSubmitted(true)
      else alert("Failed to submit — please try again or email us directly.")
    } catch {
      alert("Failed to submit — please try again or email us directly.")
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="hero-v2">
      <div className="hero-v2__inner">
        {/* ── Left: content ── */}
        <div>
          {/* Badge row */}
          <div className="hero-v2__badge-bar">
            <span className="hero-v2__badge">
              <span className="hero-v2__badge-dot" />
              IPC/WHMA-A-620
            </span>
            <span className="hero-v2__badge">UL Listed</span>
            <span className="hero-v2__badge">ISO 9001:2015</span>
            <span className="hero-v2__badge">ITAR Registered</span>
          </div>

          {/* Main headline */}
          <h1 className="hero-v2__h1">
            <span className="hero-v2__h1-primary">Precision</span>
            <span className="hero-v2__h1-muted">Wire Harness &</span>
            <span className="hero-v2__h1-muted">Cable Assembly.</span>
          </h1>

          <p className="hero-v2__desc">
            Precision-driven custom wire harness and cable assembly manufacturer with 30+ years of combined experience.
            From low-volume prototyping to high-volume production — consistent, durable, and built to your exact specifications across a wide range of industries.
          </p>

          {/* Stats */}
          <div className="hero-v2__stats">
            <div className="hero-v2__stat">
              <span className="hero-v2__stat-val">30+</span>
              <span className="hero-v2__stat-lbl">Years Experience</span>
            </div>
            <div className="hero-v2__stat">
              <span className="hero-v2__stat-val">5–15 Days</span>
              <span className="hero-v2__stat-lbl">Lead Time</span>
            </div>
            <div className="hero-v2__stat">
              <span className="hero-v2__stat-val">1 Piece</span>
              <span className="hero-v2__stat-lbl">Min. Order</span>
            </div>
            <div className="hero-v2__stat">
              <span className="hero-v2__stat-val">&lt;24 Hours</span>
              <span className="hero-v2__stat-lbl">Quote Reply</span>
            </div>
          </div>

          {/* CTAs */}
          <div className="hero-v2__ctabar">
            <Link href="/contact" className="hero-v2__cta-primary">
              Contact Us <ArrowRight />
            </Link>
            <Link href="/capabilities" className="hero-v2__cta-secondary">
              See Capabilities
            </Link>
          </div>
        </div>

        {/* ── Right: inline RFQ form ── */}
        <div className="hero-v2__form-card">
          <div className="hero-v2__form-badge">RFQ · 24H Response</div>
          <div className="hero-v2__form-eyebrow">Engineering Desk · IPC Certified</div>
          <div className="hero-v2__form-title">Submit Your Wire Harness RFQ</div>
          <div className="hero-v2__form-sub">
            Drawings, BOM, connector list — anything you have. We respond within 24 hours.
          </div>

          {submitted ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 0", textAlign: "center" }}>
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 16 }}>
                <circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/>
              </svg>
              <p style={{ fontSize: 14, color: "#555", lineHeight: 1.6 }}>
                Request received. We&apos;ll be in touch within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="hero-v2__form-grid">
                <div className="hero-v2__form-field">
                  <label className="hero-v2__form-label">Full Name *</label>
                  <input type="text" name="name" placeholder="Jane Smith" required />
                </div>
                <div className="hero-v2__form-field">
                  <label className="hero-v2__form-label">Company</label>
                  <input type="text" name="company" placeholder="Acme Manufacturing" />
                </div>
              </div>
              <div className="hero-v2__form-grid">
                <div className="hero-v2__form-field">
                  <label className="hero-v2__form-label">Email *</label>
                  <input type="email" name="email" placeholder="you@company.com" required />
                </div>
                <div className="hero-v2__form-field">
                  <label className="hero-v2__form-label">Phone</label>
                  <input type="tel" name="phone" placeholder="+1 555 0123" />
                </div>
              </div>
              <div className="hero-v2__form-grid">
                <div className="hero-v2__form-field">
                  <label className="hero-v2__form-label">Service</label>
                  <select name="application">
                    <option value="">Select service</option>
                    <option>Wire Harness</option>
                    <option>Cable Assembly</option>
                    <option>High Voltage Harness</option>
                    <option>Waterproof / Sealed</option>
                    <option>Overmolded</option>
                    <option>PCB Assembly</option>
                    <option>Prototype / NPI</option>
                  </select>
                </div>
                <div className="hero-v2__form-field">
                  <label className="hero-v2__form-label">Quantity *</label>
                  <input type="text" name="quantity" placeholder="e.g. 500 / month" required />
                </div>
              </div>
              <div className="hero-v2__form-field">
                <label className="hero-v2__form-label">Project Requirements *</label>
                <textarea name="description" rows={3} placeholder="Wire gauge, connector types, standards, target volumes..." required />
              </div>
              <input type="text" name="honeypot" style={{ display: "none" }} tabIndex={-1} autoComplete="off" />
              <button type="submit" className="hero-v2__form-submit" disabled={sending} style={{ minWidth: 160, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                {sending ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                ) : (
                  <>Submit Request <ArrowRight /></>
                )}
              </button>
              <div className="hero-v2__form-footer">Encrypted · NDA-Ready · 24H Response</div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
