import Link from "next/link"
import Image from "next/image"

const INDUSTRIES = [
  { name: "Automotive",        img: "/images/automotive.webp",        eyebrow: "OEM & Tier-1 Supplier",        slug: "automotive-ev" },
  { name: "Broadcast",         img: "/images/broadcast.webp",         eyebrow: "Signal Integrity Focus",       slug: "broadcast" },
  { name: "Computer Wiring",   img: "/images/computer_wiring.webp",   eyebrow: "Data & Connectivity",          slug: "computer-wiring" },
  { name: "Electronics",       img: "/images/electronics.webp",       eyebrow: "Consumer & Industrial",        slug: "electronics" },
  { name: "OEM Appliances",    img: "/images/oem.webp",               eyebrow: "OEM Manufacturing",            slug: "oem-appliances" },
  { name: "Robotics",          img: "/images/robotics.webp",          eyebrow: "Automation & Motion",          slug: "robotics-automation" },
  { name: "Environmental",     img: "/images/environmental.webp",     eyebrow: "Harsh Conditions",             slug: "environmental" },
  { name: "Solar",             img: "/images/solar.webp",             eyebrow: "Renewable Energy",             slug: "solar-energy" },
  { name: "Electric Vehicles", img: "/images/ev.webp",                eyebrow: "High-Voltage Specialists",     slug: "automotive-ev" },
  { name: "Telecommunication", img: "/images/telecom.webp",           eyebrow: "Network & Infrastructure",     slug: "telecom" },
  { name: "Medical",           img: "/images/medical.webp",           eyebrow: "Life-Critical Applications",   slug: "medical-devices" },
  { name: "Aerospace",         img: "/images/Aerospsace.webp",        eyebrow: "Aviation & Defense",           slug: "aerospace-defense" },
  { name: "Construction",      img: "/images/construction.webp",      eyebrow: "Heavy Equipment",              slug: "construction" },
  { name: "Agricultural",      img: "/images/agricultural.webp",      eyebrow: "Farm & Field Equipment",       slug: "agricultural" },
  { name: "Lighting",          img: "/images/lighting-cables.webp",   eyebrow: "Commercial & Industrial",      slug: "lighting" },
]

// Duplicate for seamless loop — animation translates by exactly -50%
const DOUBLED = [...INDUSTRIES, ...INDUSTRIES]

export default function IndustriesStrip() {
  return (
    <section className="sec" style={{ background: "#FFFFFF", padding: "80px 0 60px 0", overflow: "hidden" }}>
      {/* Section header */}
      <div className="W" style={{ marginBottom: 44, textAlign: "center" }}>
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
          Industries We Serve
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
          Precision Interconnects Across Every Sector
        </h2>
        <p style={{ fontSize: 16, color: "var(--claspo-muted)", maxWidth: 640, margin: "0 auto", lineHeight: 1.6 }}>
          Supplying robust, certified cable assemblies and wiring looms to leading enterprises worldwide.
        </p>
      </div>

      {/* Scrolling strip with fade-out edges */}
      <div className="istrip-outer">
        <div className="istrip-track">
          {DOUBLED.map((ind, i) => (
            <Link
              key={i}
              href="/industries"
              className="istrip-card"
              aria-label={ind.name}
              tabIndex={i >= INDUSTRIES.length ? -1 : undefined}
              style={{
                background: "#FFFFFF",
                border: "1px solid #EBE9F2",
                borderRadius: 16,
                boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
                transition: "all 0.25s ease",
              }}
            >
              <div className="istrip-img" style={{ position: "relative", width: "100%", height: 140, background: "#F7F7F9" }}>
                <Image
                  src={ind.img}
                  alt={ind.name}
                  fill
                  sizes="300px"
                  style={{ objectFit: "contain", padding: 12 }}
                  loading="lazy"
                />
              </div>
              <div className="istrip-body" style={{ padding: "16px 20px" }}>
                <div className="istrip-eyebrow" style={{ color: "var(--claspo-purple)", fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {ind.eyebrow}
                </div>
                <div className="istrip-name" style={{ color: "var(--claspo-text)", fontWeight: 800, fontSize: 16, marginTop: 4 }}>
                  {ind.name}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="W" style={{ marginTop: 44, textAlign: "center" }}>
        <Link
          href="/industries"
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
          View All Industries
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12,5 19,12 12,19" />
          </svg>
        </Link>
      </div>
    </section>
  )
}
