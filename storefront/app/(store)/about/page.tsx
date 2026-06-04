/**
 * @file app/(store)/about/page.tsx
 * @description Dedicated About Us page for Superior Harnessing and Assembly.
 *   Covers company overview, why choose us, and certifications.
 *
 * @owner Heet-P
 * @lastModified May 29, 2026
 */

import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import WhyUs from "@/components/WhyUs"
import { getSettings } from "@/lib/settings"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Superior Harnessing and Assembly — custom wire harness manufacturer with 30+ years of combined experience delivering precision wiring solutions for OEMs, robotics, medical, EV, and industrial industries.",
}

function ArrowIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12,5 19,12 12,19" />
    </svg>
  )
}

const CERTS_PLACEHOLDER = [
  { label: "IPC/WHMA-A-620", desc: "Workmanship standard for cable and wire harness assemblies." },
  { label: "ISO 9001:2015", desc: "Quality management system certification." },
  { label: "RoHS Compliant", desc: "Restriction of hazardous substances in manufacturing." },
  { label: "ITAR Registered", desc: "International Traffic in Arms Regulations registration." },
  { label: "UL Listed", desc: "Underwriters Laboratories product safety certification." },
]

export default function AboutPage() {
  const settings = getSettings()

  return (
    <main style={{ paddingTop: 120 }}>

      {/* ── PAGE BANNER ─────────────────────────────────────────────── */}
      <section className="inner-banner">
        <div className="W">
          <div className="inner-banner__eyebrow">About Us</div>
          <h1 className="D2 inner-banner__h">Built for Precision.<br />Trusted by Industry.</h1>
          <p className="inner-banner__p">
            Custom wire harness &amp; cable assembly manufacturer with over 30 years of combined experience — delivering reliable, cost-effective wiring solutions tailored to your exact specifications.
          </p>
        </div>
      </section>

      {/* ── ABOUT INTRO SPLIT ───────────────────────────────────────── */}
      <section className="sec" style={{ background: "var(--bg)" }}>
        <div className="W">
          <div className="about-split">
            <div className="about-split__img rv" style={{ position: "relative" }}>
              <img src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=1400" alt="Factory Setup" style={{ width: "100%", height: "auto", display: "block",  objectFit: "contain" }} />
            </div>
            <div className="rv rv-d1">
              <div className="lbl" style={{ marginBottom: 18 }}>About Superior Harnessing</div>
              <h2 className="D3" style={{ marginBottom: 22, letterSpacing: "-0.02em" }}>Built on Reliability,<br />Engineered for Trust</h2>
              <p style={{ fontSize: 16, lineHeight: 1.78, color: "var(--text2)", marginBottom: 16 }}>
                We are a custom wire harness manufacturer committed to delivering high-quality, reliable, and fully customized wiring solutions. With a team that brings over 30 years of combined experience in the wire harness industry, we understand the importance of precision, durability, and performance in every project we undertake.
              </p>
              <p style={{ fontSize: 16, lineHeight: 1.78, color: "var(--text2)", marginBottom: 16 }}>
                We specialize in low to medium volume production with flexible minimum order quantities, allowing us to support startups, OEMs, and large-scale manufacturers alike — delivering products that meet your technical specifications, timelines, and budget.
              </p>
              <p style={{ fontSize: 16, lineHeight: 1.78, color: "var(--text2)", marginBottom: 32 }}>
                From concept to completion, we work closely with our clients to ensure every wire harness and cable assembly is built to perform in its intended environment.
              </p>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                <Link href="#quote" className="btn bp">
                  Get a Quote <ArrowIcon />
                </Link>
                <Link href="/capabilities" className="btn bod">
                  Our Capabilities <ArrowIcon />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CERTIFICATIONS ──────────────────────────────────────────── */}
      {settings.showCertifications && (
        <section className="S" style={{ background: "var(--bg)" }}>
          <div className="W">
            <div className="sHdr sHdr--c">
              <div className="lbl lbl-c rv" style={{ marginBottom: 16 }}>Quality Assurance</div>
              <h2 className="D3 rv d1" style={{ marginBottom: 16 }}>Certifications</h2>
              <p className="Bd rv d2" style={{ maxWidth: 520, margin: "0 auto 56px" }}>
                Our manufacturing processes meet rigorous industry standards, ensuring every assembly leaves our facility with verified quality and compliance.
              </p>
            </div>

            <div className="rv d3" style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: 16,
            }}>
              {CERTS_PLACEHOLDER.map(({ label, desc }) => (
                <div key={label} style={{
                  background: "var(--cBg)",
                  border: "1px solid var(--bd)",
                  borderRadius: "var(--rL)",
                  padding: "28px 24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: "#0A0A0A",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
                      </svg>
                    </div>
                    <div style={{
                      fontFamily: "var(--font-sora), sans-serif",
                      fontWeight: 700,
                      fontSize: 14,
                      color: "var(--text)",
                      letterSpacing: "-0.01em",
                    }}>
                      {label}
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6, paddingLeft: 46 }}>
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── WHY CHOOSE US ───────────────────────────────────────────── */}
      <WhyUs />

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="cta">
        <div className="W">
          <h2 className="D3 cta__h rv">Partner With Us Today</h2>
          <p className="cta__s rv d1">
            Tell us your requirements — we&apos;ll handle the rest from design to delivery.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/contact" className="rv d2" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "#fff", color: "#0A0A0A", borderRadius: "9999px",
              padding: "14px 32px", fontWeight: 700, fontSize: 13,
              letterSpacing: "0.04em", textTransform: "uppercase",
              fontFamily: "var(--font-sora)",
            }}>
              Contact Us <ArrowIcon />
            </Link>
            <Link href="/industries" className="rv d3" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(255,255,255,0.1)", color: "#fff",
              border: "1.5px solid rgba(255,255,255,0.22)", borderRadius: "9999px",
              padding: "14px 32px", fontWeight: 700, fontSize: 13,
              letterSpacing: "0.04em", textTransform: "uppercase",
              fontFamily: "var(--font-sora)",
            }}>
              Industries We Serve <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>

    </main>
  )
}
