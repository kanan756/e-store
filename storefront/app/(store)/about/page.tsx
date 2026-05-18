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
    img: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?q=80&w=800",
  },
  {
    n: "02",
    t: "Cable Assembly",
    d: "Full cable assembly services for OEMs across various industries — from single-cable builds to complex multi-branch assemblies. We support a wide range of connector types and termination methods.",
    img: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=800",
  },
  {
    n: "03",
    t: "PCB Assembly",
    d: "Through-hole and surface-mount PCB assembly with rigorous quality checks. From prototypes to production runs, we deliver reliable boards on time.",
    img: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800",
  },
]

const INDUSTRIES = [
  {
    name: "OEMs", desc: "Original Equipment Manufacturers across multiple verticals.",
    img: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=800",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="32" height="32">
        <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/>
      </svg>
    ),
  },
  {
    name: "Small Manufacturers", desc: "Flexible volumes for growing businesses.",
    img: "https://images.unsplash.com/photo-1581092335397-9583eb92d232?q=80&w=800",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="32" height="32">
        <path d="M2 20h20M4 20V10l4-4 4 4V6l4-4 4 4v14"/><rect x="9" y="14" width="6" height="6"/>
      </svg>
    ),
  },
  {
    name: "White Goods", desc: "Appliance OEMs requiring durable, code-compliant harnesses.",
    img: "https://images.unsplash.com/photo-1584432810601-6c7f27d2362b?q=80&w=800",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="32" height="32">
        <rect x="2" y="3" width="20" height="18" rx="2"/><path d="M7 8h.01M12 8h.01M7 12h10"/><circle cx="12" cy="17" r="2"/>
      </svg>
    ),
  },
  {
    name: "Robotics", desc: "High-flex, abrasion-resistant assemblies for robotic systems.",
    img: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=800",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="32" height="32">
        <rect x="3" y="8" width="18" height="12" rx="2"/><path d="M12 8V4M9 4h6M6 12h.01M10 12h.01M14 12h.01M18 12h.01M6 16h12"/><circle cx="9" cy="5" r="1"/><circle cx="15" cy="5" r="1"/>
      </svg>
    ),
  },
  {
    name: "Medical Devices", desc: "Clean-room compatible assemblies meeting medical standards.",
    img: "https://images.unsplash.com/photo-1583324113626-70df0f4deaab?q=80&w=800",
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
        backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.85)), url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: "100px 0",
        overflow: "hidden",
        borderBottom: "1px solid var(--bd)"
      }}>
        <div className="W about-hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
          <div>
            <div className="lbl" style={{ color: "rgba(0,0,0,0.6)", marginBottom: 24 }}>
              ABOUT SUPERIOR HARNESSING
            </div>
            <h1 className="D2" style={{ color: "#000", marginBottom: 24 }}>
              BUILT FOR<br />PRECISION.<br />TRUSTED BY<br />INDUSTRY.
            </h1>
            <p style={{ fontSize: 17, lineHeight: 1.78, color: "rgba(0,0,0,0.7)", marginBottom: 40, maxWidth: 440 }}>
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
            overflow: "hidden",
            boxShadow: "0 24px 60px rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
          }}>
            <img 
              src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=2070" 
              alt="Factory Setup" 
              style={{ width: "100%", height: "100%", objectFit: "cover" }} 
            />
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
                overflow: "hidden",
                transitionDelay: `${parseInt(s.n) * 0.08}s`,
                display: "flex",
                flexDirection: "column"
              }}>
                <div style={{ height: 200, width: "100%", background: "#f0f0f0" }}>
                  <img src={s.img} alt={s.t} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ padding: 32 }}>
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
                overflow: "hidden",
                textAlign: "center",
                transitionDelay: `${i * 0.07}s`,
              }}>
                <div style={{ height: 120, width: "100%", background: "#f0f0f0", marginBottom: 16 }}>
                  <img src={ind.img} alt={ind.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ padding: "0 20px 28px 20px" }}>
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
