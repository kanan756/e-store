function StarRating() {
  return (
    <div style={{ display: "flex", gap: 3, color: "#F59E0B" }}>
      {[...Array(5)].map((_, i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  )
}

const REVIEWS = [
  {
    quote: "CLASPO turned around our multi-conductor harness prototypes in 48 hours for our robotic arm trials. Every single termination met IPC-620 Class 3, and their engineering team flagged two pinout optimizations before production.",
    author: "Senior Systems Engineer",
    company: "Robotics & Industrial Automation",
    verified: "Verified Client Partner",
    rating: 5,
  },
  {
    quote: "Finding a manufacturing partner that comfortably supports low-volume custom runs with zero compromise on quality has transformed our development cycle. The overmolded cable assemblies passed all IP67 submersion tests on day one.",
    author: "Hardware Engineering Lead",
    company: "EV & Green Energy Solutions",
    verified: "Verified Client Partner",
    rating: 5,
  },
  {
    quote: "Exceptional responsiveness and transparent pricing. From quick sample builds to scaled production, CLASPO's crimp consistency and ultrasonic splicing give us 100% confidence in our field reliability.",
    author: "Director of Procurement",
    company: "Medical & Diagnostic Equipment",
    verified: "Verified Client Partner",
    rating: 5,
  },
]

export default function Testimonials() {
  return (
    <section className="sec" style={{ background: "#F7F7F9", padding: "80px 0" }}>
      <div className="W">
        {/* Section Header */}
        <div style={{ textAlign: "center", maxWidth: 660, margin: "0 auto 48px auto" }}>
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
              marginBottom: 14,
            }}
          >
            Client Reviews
          </div>
          <h2
            style={{
              fontSize: "clamp(26px, 3.5vw, 38px)",
              fontWeight: 800,
              color: "var(--claspo-text)",
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              marginBottom: 12,
            }}
          >
            Trusted by Engineering Leaders
          </h2>
          <p style={{ fontSize: 16, color: "var(--claspo-muted)", lineHeight: 1.6, margin: 0 }}>
            Hear from hardware developers, system architects, and procurement managers who rely on CLASPO for mission-critical interconnects.
          </p>
        </div>

        {/* 3 Review Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 24,
          }}
        >
          {REVIEWS.map((rev, idx) => (
            <div
              key={idx}
              style={{
                background: "#FFFFFF",
                borderRadius: 18,
                padding: "32px 28px",
                border: "1px solid #EBE9F2",
                boxShadow: "0 4px 18px rgba(0,0,0,0.03)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                  <StarRating />
                  <span
                    style={{
                      background: "rgba(84, 32, 200, 0.08)",
                      color: "var(--claspo-purple)",
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "4px 8px",
                      borderRadius: 6,
                    }}
                  >
                    {rev.verified}
                  </span>
                </div>

                <p
                  style={{
                    fontSize: 14.5,
                    lineHeight: 1.65,
                    color: "var(--claspo-text)",
                    margin: 0,
                    fontStyle: "normal",
                  }}
                >
                  &ldquo;{rev.quote}&rdquo;
                </p>
              </div>

              <div
                style={{
                  marginTop: 24,
                  paddingTop: 18,
                  borderTop: "1px solid #F1F1F5",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 9999,
                    background: "var(--claspo-lavender)",
                    color: "var(--claspo-purple)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: 15,
                  }}
                >
                  {rev.author.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: 14.5, fontWeight: 800, color: "var(--claspo-text)" }}>
                    {rev.author}
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--claspo-muted)", marginTop: 2 }}>
                    {rev.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
