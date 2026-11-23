import Link from "next/link"
import Image from "next/image"

const CAPS = [
  {
    n: "01",
    title: "Automatic Cut & Strip",
    desc: "High-precision automated wire cutting and stripping machinery guaranteeing micron-exact strip lengths, zero conductor strand damage, and repeatable wire preparation for high-density harnesses.",
    img: "/images/automatic-cut-and-strip.webp",
  },
  {
    n: "02",
    title: "Crimp Press & Applicators",
    desc: "Calibrated pneumatic and mechanical crimping presses paired with terminal applicators. Every terminal undergoes pull-force testing and cross-section validation against IPC/WHMA-A-620 Class 3.",
    img: "/images/terminal-application.webp",
  },
  {
    n: "03",
    title: "Ultrasonic Splicing",
    desc: "Advanced ultrasonic wire welding joining stranded copper conductors without flux or solder. Yields zero resistance degradation, superior tensile strength, and exceptional heat tolerance.",
    img: "/images/ultrasonic-splicing.webp",
  },
  {
    n: "04",
    title: "Custom Overmolding",
    desc: "Thermoplastic and polyurethane low-pressure overmolding protecting sensitive PCB junctions and connectors from vibration, thermal cycling, and ingress with IP67/IP68 submersible seals.",
    img: "/images/over-molding.webp",
  },
]

export default function Capabilities() {
  return (
    <section id="capabilities" className="sec" style={{ background: "#F7F7F9", padding: "80px 0" }}>
      <div className="W">
        {/* Header */}
        <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 52px auto" }}>
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
            Capabilities
          </div>
          <h2
            style={{
              fontSize: "clamp(28px, 3.8vw, 40px)",
              fontWeight: 800,
              color: "var(--claspo-text)",
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              marginBottom: 14,
            }}
          >
            Precision Manufacturing Under One Roof
          </h2>
          <p style={{ fontSize: 16, color: "var(--claspo-muted)", lineHeight: 1.6, margin: 0 }}>
            From design-assist engineering through final functional test, we control the entire assembly process in-house — so quality, turnaround time, and accountability never get handed off.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))",
            gap: 24,
          }}
        >
          {CAPS.map(({ n, title, desc, img }) => (
            <div
              key={n}
              style={{
                background: "#FFFFFF",
                borderRadius: 16,
                border: "1px solid #EBE9F2",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 4px 18px rgba(0,0,0,0.03)",
                transition: "transform 0.25s ease, box-shadow 0.25s ease",
              }}
              className="claspo-cap-card"
            >
              {/* Media banner */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "16/10",
                  background: "#EDE9F6",
                  overflow: "hidden",
                }}
              >
                <Image
                  src={img}
                  alt={title}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
                <div
                  style={{
                    position: "absolute",
                    top: 12,
                    left: 12,
                    background: "var(--claspo-purple)",
                    color: "#FFFFFF",
                    fontSize: 12,
                    fontWeight: 800,
                    padding: "4px 10px",
                    borderRadius: 9999,
                    letterSpacing: "0.04em",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  }}
                >
                  {n}
                </div>
              </div>

              {/* Text content */}
              <div style={{ padding: 24, display: "flex", flexDirection: "column", flexGrow: 1 }}>
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "var(--claspo-text)",
                    marginBottom: 10,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {title}
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    color: "var(--claspo-muted)",
                    lineHeight: 1.6,
                    margin: 0,
                    flexGrow: 1,
                  }}
                >
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div style={{ marginTop: 44, textAlign: "center" }}>
          <Link
            href="/capabilities"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "#FFFFFF",
              color: "var(--claspo-purple)",
              border: "1.5px solid var(--claspo-purple)",
              fontSize: 14,
              fontWeight: 700,
              padding: "12px 28px",
              borderRadius: 9999,
              textDecoration: "none",
              transition: "all 0.2s ease",
            }}
          >
            View All Capabilities
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
