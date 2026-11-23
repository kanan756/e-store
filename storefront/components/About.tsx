import Link from "next/link"

export default function About() {
  return (
    <section id="about" className="sec" style={{ background: "#FFFFFF", padding: "80px 0" }}>
      <div className="W">
        <div style={{ maxWidth: 880, margin: "0 auto", textAlign: "center" }}>
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
              marginBottom: 16,
            }}
          >
            About CLASPO
          </div>

          <h2
            style={{
              fontSize: "clamp(28px, 3.8vw, 42px)",
              fontWeight: 800,
              color: "var(--claspo-text)",
              letterSpacing: "-0.02em",
              lineHeight: 1.25,
              marginBottom: 24,
            }}
          >
            Your Trusted Partner in Custom Wire Harnesses &amp; Interconnect Solutions
          </h2>

          <p style={{ fontSize: 16, color: "var(--claspo-muted)", lineHeight: 1.7, marginBottom: 20 }}>
            CLASPO is a specialized wire harness and cable assembly manufacturer committed to delivering high-quality, reliable, and fully customized wiring solutions. Backed by a team with over 30 years of combined industry experience, we understand the critical balance between mechanical durability, electrical precision, and on-time delivery.
          </p>

          <p style={{ fontSize: 16, color: "var(--claspo-muted)", lineHeight: 1.7, marginBottom: 36 }}>
            We specialize in low to high volume manufacturing with flexible minimum order quantities. From early-stage engineering prototypes to full-rate production runs, we work directly alongside startups, OEMs, and Tier-1 suppliers across automotive, medical, robotics, and industrial automation sectors.
          </p>

          {/* 3 Metric Badges */}
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
                background: "#F7F7F9",
                borderRadius: 16,
                padding: "24px 20px",
                border: "1px solid #EBE9F2",
              }}
            >
              <div style={{ fontSize: 32, fontWeight: 800, color: "var(--claspo-purple)", marginBottom: 4 }}>
                30+ Years
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--claspo-text)" }}>
                Combined Experience
              </div>
              <div style={{ fontSize: 12.5, color: "var(--claspo-muted)", marginTop: 4 }}>
                Wire harness &amp; cable assembly mastery
              </div>
            </div>

            <div
              style={{
                background: "#F7F7F9",
                borderRadius: 16,
                padding: "24px 20px",
                border: "1px solid #EBE9F2",
              }}
            >
              <div style={{ fontSize: 32, fontWeight: 800, color: "var(--claspo-purple)", marginBottom: 4 }}>
                100% Tested
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--claspo-text)" }}>
                IPC/WHMA-A-620
              </div>
              <div style={{ fontSize: 12.5, color: "var(--claspo-muted)", marginTop: 4 }}>
                Electrical continuity &amp; pull-force verified
              </div>
            </div>

            <div
              style={{
                background: "#F7F7F9",
                borderRadius: 16,
                padding: "24px 20px",
                border: "1px solid #EBE9F2",
              }}
            >
              <div style={{ fontSize: 32, fontWeight: 800, color: "var(--claspo-purple)", marginBottom: 4 }}>
                Flexible MOQs
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--claspo-text)" }}>
                From 1 to 50k+ Units
              </div>
              <div style={{ fontSize: 12.5, color: "var(--claspo-muted)", marginTop: 4 }}>
                Prototypes through mass production
              </div>
            </div>
          </div>

          <Link
            href="/about"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "var(--claspo-purple)",
              color: "#FFFFFF",
              fontSize: 14,
              fontWeight: 700,
              padding: "14px 32px",
              borderRadius: 9999,
              textDecoration: "none",
              boxShadow: "0 4px 16px rgba(84, 32, 200, 0.25)",
              transition: "transform 0.15s ease",
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
