import Image from "next/image"

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

const FEATS = [
  {
    t: "In-House Engineering Support",
    d: "Our design-assist engineers optimize wire gauges, shielding, and connector pinouts for manufacturability, cost efficiency, and long-term field reliability.",
  },
  {
    t: "IPC/WHMA-A-620 Class 3 Standards",
    d: "Every single harness undergoes calibrated pull-force verification, crimp cross-section analysis, and 100% electrical continuity testing.",
  },
  {
    t: "Flexible MOQs & Rapid Prototyping",
    d: "Whether you need a 5-piece pilot run or 50,000 production assemblies, we provide scalable manufacturing with some of the fastest turnaround times in North America.",
  },
  {
    t: "Secure Shopping & Fast Payments",
    d: "Full Stripe integration with 256-bit SSL encryption, automated order tracking, and transparent purchase receipts for seamless corporate buying.",
  },
  {
    t: "Dedicated Customer Support",
    d: "Direct access to our engineering and support specialists at info@claspo.store. Fast quote turnarounds within 24 to 48 business hours.",
  },
]

export default function WhyUs() {
  return (
    <section className="sec" style={{ background: "#F7F7F9", padding: "84px 0" }}>
      <div className="W">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 48,
            alignItems: "center",
          }}
        >
          {/* Left Media with floating badges */}
          <div style={{ position: "relative" }}>
            <div
              style={{
                position: "relative",
                width: "100%",
                aspectRatio: "4/3",
                borderRadius: 24,
                overflow: "hidden",
                boxShadow: "0 12px 36px rgba(0,0,0,0.08)",
                border: "1px solid #EBE9F2",
              }}
            >
              <Image
                src="https://images.unsplash.com/photo-1581092335397-9583eb92d232?q=80&w=1200"
                alt="CLASPO Engineering & Manufacturing"
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            {/* Floating Trust Card 1 */}
            <div
              style={{
                position: "absolute",
                top: -20,
                right: -10,
                background: "#FFFFFF",
                borderRadius: 14,
                padding: "14px 20px",
                boxShadow: "0 8px 24px rgba(84, 32, 200, 0.12)",
                border: "1px solid var(--claspo-lavender)",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: "var(--claspo-lavender)",
                  color: "var(--claspo-purple)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 16,
                }}
              >
                ✓
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "var(--claspo-text)" }}>100% Tested</div>
                <div style={{ fontSize: 11, color: "var(--claspo-muted)" }}>IPC/WHMA-A-620 Certified</div>
              </div>
            </div>

            {/* Floating Trust Card 2 */}
            <div
              style={{
                position: "absolute",
                bottom: -20,
                left: -10,
                background: "#FFFFFF",
                borderRadius: 14,
                padding: "14px 20px",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
                border: "1px solid #EBE9F2",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: "var(--claspo-purple)",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 14,
                }}
              >
                30+
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "var(--claspo-text)" }}>30+ Years Combined</div>
                <div style={{ fontSize: 11, color: "var(--claspo-muted)" }}>Wire Harness Experience</div>
              </div>
            </div>
          </div>

          {/* Right Text & Feature Items */}
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
                marginBottom: 16,
              }}
            >
              Why Choose CLASPO
            </div>

            <h2
              style={{
                fontSize: "clamp(28px, 3.8vw, 40px)",
                fontWeight: 800,
                color: "var(--claspo-text)",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
                marginBottom: 16,
              }}
            >
              Engineered Quality.<br />Guaranteed Reliability.
            </h2>

            <p style={{ fontSize: 16, color: "var(--claspo-muted)", lineHeight: 1.6, marginBottom: 32 }}>
              We simplify sourcing for engineering teams and procurement managers — giving you high-performance interconnects, transparent pricing, and dependable delivery schedules.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {FEATS.map(({ t, d }) => (
                <div
                  key={t}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 14,
                    background: "#FFFFFF",
                    padding: "16px 20px",
                    borderRadius: 14,
                    border: "1px solid #EBE9F2",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: "var(--claspo-lavender)",
                      color: "var(--claspo-purple)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    <CheckIcon />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--claspo-text)", marginBottom: 3 }}>
                      {t}
                    </div>
                    <div style={{ fontSize: 13.5, color: "var(--claspo-muted)", lineHeight: 1.5 }}>
                      {d}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
