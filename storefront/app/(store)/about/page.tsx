/**
 * @file app/(store)/about/page.tsx
 * @description Dedicated About Us page for Superior Harnessing and Assembly.
 *   Covers company overview, services, USPs, and target industries.
 *
 * @owner Heet-P
 * @lastModified May 18, 2026
 */

import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Superior Harnessing and Assembly — precision wire harnessing, cable assembly, and PCB assembly for OEMs, robotics, medical, and white goods industries.",
}

function ArrowIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12,5 19,12 12,19" />
    </svg>
  )
}

const SERVICES = [
  {
    n: "01",
    t: "Wire Harnessing",
    d: "Custom wire harness manufacturing for small companies and OEMs. We handle low-to-medium volume runs with precision and consistency, ensuring every harness meets your exact specifications.",
  },
  {
    n: "02",
    t: "Cable Assembly",
    d: "Full cable assembly services for OEMs across various industries — from single-cable builds to complex multi-branch assemblies. We support a wide range of connector types and termination methods.",
  },
  {
    n: "03",
    t: "PCB Assembly",
    d: "Through-hole and surface-mount PCB assembly with rigorous quality checks. From prototypes to production runs, we deliver reliable boards on time.",
  },
]

const INDUSTRIES = [
  {
    name: "OEMs", desc: "Original Equipment Manufacturers across multiple verticals.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="32" height="32">
        <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/>
      </svg>
    ),
  },
  {
    name: "Small Manufacturers", desc: "Flexible volumes for growing businesses.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="32" height="32">
        <path d="M2 20h20M4 20V10l4-4 4 4V6l4-4 4 4v14"/><rect x="9" y="14" width="6" height="6"/>
      </svg>
    ),
  },
  {
    name: "White Goods", desc: "Appliance OEMs requiring durable, code-compliant harnesses.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="32" height="32">
        <rect x="2" y="3" width="20" height="18" rx="2"/><path d="M7 8h.01M12 8h.01M7 12h10"/><circle cx="12" cy="17" r="2"/>
      </svg>
    ),
  },
  {
    name: "Robotics", desc: "High-flex, abrasion-resistant assemblies for robotic systems.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="32" height="32">
        <rect x="3" y="8" width="18" height="12" rx="2"/><path d="M12 8V4M9 4h6M6 12h.01M10 12h.01M14 12h.01M18 12h.01M6 16h12"/><circle cx="9" cy="5" r="1"/><circle cx="15" cy="5" r="1"/>
      </svg>
    ),
  },
  {
    name: "Medical Devices", desc: "Clean-room compatible assemblies meeting medical standards.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="32" height="32">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    ),
  },
]

export default function AboutPage() {
  return (
    <main style={{ paddingTop: 80 }}>

      {/* ── HERO SPLIT ─────────────────────────────────────────────── */}
      <section style={{
        background: "#1c1c18",
        padding: "100px 0",
        overflow: "hidden",
      }}>
        <div className="W about-hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
          <div>
            <div className="lbl" style={{ color: "rgba(255,255,255,0.5)", marginBottom: 24 }}>
              ABOUT SUPERIOR HARNESSING
            </div>
            <h1 className="D2" style={{ color: "#fff", marginBottom: 24 }}>
              BUILT FOR<br />PRECISION.<br />TRUSTED BY<br />INDUSTRY.
            </h1>
            <p style={{ fontSize: 17, lineHeight: 1.78, color: "rgba(255,255,255,0.56)", marginBottom: 40, maxWidth: 440 }}>
              Superior Harnessing and Assembly delivers precision wire harnessing,
              cable assembly, and PCB assembly to OEMs and manufacturers worldwide.
              Our commitment to quality and flexibility makes us the partner of choice
              for companies of all sizes.
            </p>
            <Link href="/contact" className="btn bp">
              Get a Quote <ArrowIcon />
            </Link>
          </div>
          {/* Placeholder — replace with final photo/illustration */}
          <div style={{
            height: 420,
            borderRadius: 12,
            border: "1px solid rgba(74, 225, 131, 0.25)",
            boxShadow: "0 0 32px rgba(74, 225, 131, 0.1), inset 0 0 48px rgba(74, 225, 131, 0.04)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
            background: "transparent",
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="rgba(74,225,131,0.45)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" width="48" height="48">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
            </svg>
            <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(74,225,131,0.45)" }}>
              Factory Illustration — Coming Soon
            </span>
          </div>
        </div>
      </section>

      {/* ── SERVICES ─────────────────────────────────────────────────── */}
      <section className="S" style={{ background: "var(--bg)" }}>
        <div className="W">
          <div className="sHdr sHdr--c">
            <div className="lbl lbl-c rv" style={{ marginBottom: 16 }}>WHAT WE DO</div>
            <h2 className="D3 rv d1" style={{ marginBottom: 16 }}>Our Services</h2>
            <p className="Bd rv d2" style={{ maxWidth: 520, margin: "0 auto" }}>
              End-to-end manufacturing services from raw wire to finished assembly, built to your specifications.
            </p>
          </div>

          <div className="about-services-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {SERVICES.map((s) => (
              <div key={s.n} className="rv" style={{
                background: "var(--cBg)",
                border: "1px solid var(--bd)",
                borderRadius: "var(--rL)",
                padding: 32,
                transitionDelay: `${parseInt(s.n) * 0.08}s`,
              }}>
                <div style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: "0.1em",
                  color: "var(--acc)",
                  marginBottom: 16,
                }}>
                  {s.n}
                </div>
                <h3 style={{
                  fontFamily: "var(--font-sora)",
                  fontSize: 20,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  marginBottom: 14,
                  color: "var(--text)",
                }}>
                  {s.t}
                </h3>
                <p style={{ fontSize: 14, lineHeight: 1.72, color: "var(--text2)" }}>
                  {s.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INDUSTRIES ────────────────────────────────────────────────── */}
      <section className="S" style={{ background: "var(--bg2)", borderTop: "1px solid var(--bd)", borderBottom: "1px solid var(--bd)" }}>
        <div className="W">
          <div className="sHdr sHdr--c">
            <div className="lbl lbl-c rv" style={{ marginBottom: 16 }}>WHO WE SERVE</div>
            <h2 className="D3 rv d1" style={{ marginBottom: 16 }}>Industries We Work With</h2>
          </div>
          <div className="about-industries-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 20 }}>
            {INDUSTRIES.map((ind, i) => (
              <div key={ind.name} className="rv" style={{
                background: "var(--cBg)",
                border: "1px solid var(--bd)",
                borderRadius: "var(--rL)",
                padding: "28px 20px",
                textAlign: "center",
                transitionDelay: `${i * 0.07}s`,
              }}>
                <div style={{
                  color: "var(--acc)",
                  marginBottom: 12,
                  display: "flex",
                  justifyContent: "center",
                }}>{ind.icon}</div>
                <div style={{
                  fontFamily: "var(--font-sora)",
                  fontWeight: 700,
                  fontSize: 15,
                  marginBottom: 8,
                  color: "var(--text)",
                }}>
                  {ind.name}
                </div>
                <p style={{ fontSize: 12.5, color: "var(--text2)", lineHeight: 1.6 }}>{ind.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="cta">
        <div className="W">
          <h2 className="D3 cta__h rv">Partner With Us Today</h2>
          <p className="cta__s rv d1">
            Tell us your requirements — we'll handle the rest from design to delivery.
          </p>
          <Link href="/contact" className="btn bp rv d2">
            Contact Us <ArrowIcon />
          </Link>
        </div>
      </section>

    </main>
  )
}
