import type { Metadata } from "next"
import Link from "next/link"
import { getSettings } from "@/lib/settings"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Capabilities | Custom Wire Harness Manufacturing",
  description:
    "Explore Superior Harness & Assembly's full manufacturing capabilities: cut & strip, crimping, ultrasonic splicing, overmolding, connector loading, and JIT delivery.",
}

const CAPS = [
  {
    n: "01",
    title: "Automatic Cut & Strip",
    desc: "Computerized wire cutting and stripping machines deliver precise lengths and clean insulation removal for repeatable, high-quality terminations at production volume. Our equipment handles wire gauges from 28 AWG through 2/0 AWG.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
        <line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/>
        <line x1="8.12" y1="8.12" x2="12" y2="12"/>
      </svg>
    ),
  },
  {
    n: "02",
    title: "Terminal Application & Crimping",
    desc: "High-precision presses and applicators ensure strong, reliable electrical connections. Every crimp profile is validated with pull testing to IPC/WHMA-A-620 acceptance criteria. We run over 400 terminal configurations in-house.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
  {
    n: "03",
    title: "Ultrasonic Splicing",
    desc: "Ultrasonic welding creates strong, reliable wire splices without soldering — delivering excellent conductivity, reduced resistance, and long-lasting performance. Ideal for high-current and high-vibration applications.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
    ),
  },
  {
    n: "04",
    title: "Overmolding & Potting",
    desc: "Custom mold design for your connector geometry adds protection against harsh environments, providing strain relief and enhanced durability for finished assemblies. IP67/IP68-rated configurations available.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
  },
  {
    n: "05",
    title: "Connector Loading & Verification",
    desc: "Strict verification processes with EOL continuity testing and integrated vision systems ensure every wire is properly inserted, locked, and verified. Our automated test stations catch defects before parts leave the floor.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
  },
  {
    n: "06",
    title: "Kitting & JIT Delivery",
    desc: "Managed inventory, component kitting, kanban programs, and just-in-time delivery keep your production line running without interruption. We maintain safety stock for high-runners and can ship same-day on emergency orders.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
        <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
  },
]

const PROCESS = [
  { step: "1", title: "TOOLING DESIGN", desc: "Custom mold design for your connector and cable geometry." },
  { step: "2", title: "MOLD FABRICATION", desc: "Partnered with local mold manufacturers for precision tooling." },
  { step: "3", title: "OVERMOLDING", desc: "Precision overmolding with chosen material." },
  { step: "4", title: "TESTING", desc: "Pull testing, IP rating validation, visual inspection." },
  { step: "5", title: "PRODUCTION", desc: "Scale to full production volume." },
]

const CERTS = ["IPC/WHMA-A-620", "ISO 9001:2015", "RoHS Compliant", "ITAR Registered", "UL Listed"]

export default async function CapabilitiesPage() {
  const settings = await getSettings()
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      {/* Inner Banner */}
      <div style={{ paddingTop: 120 }}>
        <section className="inner-banner">
          <div className="W">
            <div className="inner-banner__crumb">
              <Link href="/">Home</Link> <span>/</span> Capabilities
            </div>
            <div className="inner-banner__eyebrow">Manufacturing Capabilities</div>
            <h1 className="D2 inner-banner__h">Everything Under One Roof</h1>
            <p className="inner-banner__p">
              From design-assist engineering through final functional test, we control the full process in-house — so quality, lead time, and accountability never get handed off.
            </p>
          </div>
        </section>
      </div>

      {/* Capabilities Grid */}
      <section className="sec">
        <div className="W">
          <div className="sHdr sHdr--c" style={{ marginBottom: 56 }}>
            <div className="lbl lbl-c" style={{ marginBottom: 14 }}>Core Processes</div>
            <h2 className="D3">Precision At Every Stage</h2>
          </div>
          <div className="caps-row">
            {CAPS.map(({ n, title, desc, icon }) => (
              <div className="caps-cell" key={n}>
                <div style={{ color: "var(--text2)", marginBottom: 18, opacity: 0.7 }}>{icon}</div>
                <div className="caps-cell__n">{n}</div>
                <div className="caps-cell__t">{title}</div>
                <div className="caps-cell__d">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="sec sec-bg2">
        <div className="W">
          <div className="sHdr sHdr--c" style={{ marginBottom: 64 }}>
            <h2 className="D3" style={{ fontSize: 24, textTransform: "uppercase", letterSpacing: "0.05em" }}>Our Process</h2>
          </div>

          <div style={{ position: "relative" }}>
            <div className="process-line-wrap">
              <div className="process-particle"></div>
            </div>
            <div className="process-flow">
              {PROCESS.map(({ step, title, desc }) => (
              <div key={step} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: "#5b1919",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 16,
                  marginBottom: 16
                }}>
                  {step}
                </div>
                <div style={{
                  fontFamily: "var(--font-sora), sans-serif",
                  fontSize: 13,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  marginBottom: 12,
                  letterSpacing: "0.02em"
                }}>
                  {title}
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.6, color: "var(--text2)" }}>
                  {desc}
                </div>
              </div>
            ))}
            </div>
          </div>
        </div>
      </section>
      {/* Certs Banner */}
      {settings.showCertifications && (
        <section className="certs-banner">
          <div className="W">
            <div className="certs-banner__eyebrow">Certifications &amp; Standards</div>
            <h2 className="certs-banner__h">Built to the Highest Standards</h2>
            <div className="certs-banner__badges">
              {CERTS.map(c => (
                <span key={c} className="certs-banner__badge">{c}</span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="cta">
        <div className="W">
          <h2 className="D3 cta__h">Ready to Start Your Project?</h2>
          <p className="cta__s">Share your specs and we&apos;ll respond with a detailed quote within one business day.</p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/contact" className="btn bp">Contact Us</Link>
            <Link href="/products" className="btn" style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.22)" }}>Browse Products</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
