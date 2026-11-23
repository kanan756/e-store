"use client"

import Link from "next/link"

export default function About() {
  return (
    <section id="about" className="sec" style={{ background: "#FFFFFF", padding: "80px 0", borderBottom: "1px solid #E5E5E5" }}>
      <div className="W">
        <div style={{ maxWidth: 880, margin: "0 auto", textAlign: "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "#FFF0E5",
              color: "#D9570A",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "6px 14px",
              borderRadius: "4px",
              border: "1px solid rgba(243, 107, 18, 0.25)",
              marginBottom: 16,
            }}
          >
            About CLASPO
          </div>

          <h2
            style={{
              fontSize: "clamp(28px, 3.8vw, 42px)",
              fontWeight: 800,
              color: "#17191C",
              letterSpacing: "-0.02em",
              lineHeight: 1.25,
              marginBottom: 24,
            }}
          >
            Making Everyday Living Smarter, Simpler, and Better.
          </h2>

          <p style={{ fontSize: 16, color: "#747474", lineHeight: 1.7, marginBottom: 20 }}>
            At <strong>CLASPO</strong>, we believe that everyday life should be easier, more organized, and more convenient. We are a modern home solutions brand dedicated to bringing smart, practical, and stylish products into your everyday routine.
          </p>

          <p style={{ fontSize: 16, color: "#747474", lineHeight: 1.7, marginBottom: 36 }}>
            From innovative kitchen tools and space-saving storage solutions to cleaning essentials, adhesive accessories, and household utilities, we carefully curate products that solve real-life problems. Our philosophy is simple: useful innovation should make everyday tasks effortless.
          </p>

          {/* 3 Metric / Value Badges */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 20,
              marginBottom: 40,
            }}
          >
            <div
              style={{
                background: "#FFF8F3",
                borderRadius: 10,
                padding: "24px 20px",
                border: "1px solid #E5E5E5",
              }}
            >
              <div style={{ fontSize: 24, fontWeight: 900, color: "#F36B12", marginBottom: 4 }}>
                Smart Design
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#17191C" }}>
                Practical Innovation
              </div>
              <div style={{ fontSize: 12.5, color: "#747474", marginTop: 4 }}>
                Tools designed to solve daily household pain points
              </div>
            </div>

            <div
              style={{
                background: "#FFF8F3",
                borderRadius: 10,
                padding: "24px 20px",
                border: "1px solid #E5E5E5",
              }}
            >
              <div style={{ fontSize: 24, fontWeight: 900, color: "#F36B12", marginBottom: 4 }}>
                100% Vetted
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#17191C" }}>
                Quality Selection
              </div>
              <div style={{ fontSize: 12.5, color: "#747474", marginTop: 4 }}>
                Sturdy, safe, and durable materials built to last
              </div>
            </div>

            <div
              style={{
                background: "#FFF8F3",
                borderRadius: 10,
                padding: "24px 20px",
                border: "1px solid #E5E5E5",
              }}
            >
              <div style={{ fontSize: 24, fontWeight: 900, color: "#F36B12", marginBottom: 4 }}>
                Accessible
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#17191C" }}>
                Affordable Value
              </div>
              <div style={{ fontSize: 12.5, color: "#747474", marginTop: 4 }}>
                High-utility products at honest, direct prices
              </div>
            </div>
          </div>

          <Link
            href="/about"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "#F36B12",
              color: "#FFFFFF",
              fontSize: 14,
              fontWeight: 700,
              padding: "13px 30px",
              borderRadius: "6px",
              textDecoration: "none",
              boxShadow: "0 4px 14px rgba(243, 107, 18, 0.3)",
              transition: "background 0.2s, transform 0.15s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "#D9570A"
              e.currentTarget.style.transform = "translateY(-1px)"
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "#F36B12"
              e.currentTarget.style.transform = "translateY(0)"
            }}
          >
            Learn More About CLASPO
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12,5 19,12 12,19" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
