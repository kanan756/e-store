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
    t: "Practical Innovation",
    d: "Thoughtful household tools and smart accessories designed to solve everyday problems and save valuable time.",
  },
  {
    t: "Quality-Focused Selection",
    d: "Carefully vetted materials, sturdy build quality, and non-toxic durability built for reliable daily use.",
  },
  {
    t: "Affordable Convenience",
    d: "Smart living solutions that elevate your home's functionality without expensive custom renovations.",
  },
  {
    t: "Everyday Functionality",
    d: "Intuitive, easy-to-use products with drill-free adhesive mounts and hassle-free setups.",
  },
  {
    t: "Customer-Centric Approach",
    d: "Seamless ordering, prompt customer care at info@claspo.store, and secure multi-platform shopping options.",
  },
  {
    t: "Smarter Living",
    d: "Transforming cluttered drawers, busy kitchens, and compact spaces into organized, peaceful environments.",
  },
]

export default function WhyUs() {
  return (
    <section className="sec" style={{ background: "#F5F5F5", padding: "84px 0", borderBottom: "1px solid #E5E5E5" }}>
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
                borderRadius: 16,
                overflow: "hidden",
                boxShadow: "0 8px 28px rgba(0, 0, 0, 0.06)",
                border: "1px solid #E5E5E5",
              }}
            >
              <Image
                src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1200"
                alt="CLASPO Organized Modern Home"
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            {/* Floating Trust Card 1 */}
            <div
              style={{
                position: "absolute",
                top: -16,
                right: -10,
                background: "#FFFFFF",
                borderRadius: 10,
                padding: "14px 20px",
                boxShadow: "0 6px 20px rgba(0, 0, 0, 0.08)",
                border: "1px solid #E5E5E5",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 8,
                  background: "#FFF0E5",
                  border: "1px solid rgba(243, 107, 18, 0.25)",
                  color: "#F36B12",
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
                <div style={{ fontSize: 13, fontWeight: 800, color: "#17191C" }}>Smart Living</div>
                <div style={{ fontSize: 11, color: "#747474" }}>Designed for Real Homes</div>
              </div>
            </div>

            {/* Floating Trust Card 2 */}
            <div
              style={{
                position: "absolute",
                bottom: -16,
                left: -10,
                background: "#FFFFFF",
                borderRadius: 10,
                padding: "14px 20px",
                boxShadow: "0 6px 20px rgba(0, 0, 0, 0.08)",
                border: "1px solid #E5E5E5",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 8,
                  background: "#F36B12",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 14,
                  boxShadow: "0 2px 8px rgba(243, 107, 18, 0.35)",
                }}
              >
                ★
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#17191C" }}>Top Rated Utility</div>
                <div style={{ fontSize: 11, color: "#747474" }}>Click. Pick. Done.</div>
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
              Why CLASPO
            </div>

            <h2
              style={{
                fontSize: "clamp(28px, 3.8vw, 40px)",
                fontWeight: 800,
                color: "#17191C",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
                marginBottom: 16,
              }}
            >
              Small Solutions.<br />
              <span style={{ color: "#F36B12" }}>Big Difference.</span>
            </h2>

            <p style={{ fontSize: 16, color: "#747474", lineHeight: 1.6, marginBottom: 28 }}>
              From smarter storage to everyday household essentials, discover products that bring convenience, functionality, and simplicity into your daily routine.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
              {FEATS.map(({ t, d }) => (
                <div
                  key={t}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    background: "#FFFFFF",
                    padding: "16px 18px",
                    borderRadius: 10,
                    border: "1px solid #E5E5E5",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
                  }}
                >
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 6,
                      background: "#FFF0E5",
                      border: "1px solid rgba(243, 107, 18, 0.25)",
                      color: "#F36B12",
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
                    <div style={{ fontSize: 14.5, fontWeight: 700, color: "#17191C", marginBottom: 2 }}>
                      {t}
                    </div>
                    <div style={{ fontSize: 13, color: "#747474", lineHeight: 1.5 }}>
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
