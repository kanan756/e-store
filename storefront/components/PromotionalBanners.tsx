import Link from "next/link"
import Image from "next/image"

const PROMOTIONS = [
  {
    id: "promo-1",
    tag: "FEATURED DEAL",
    badge: "SAVE 20%",
    title: "Rapid Prototype Wire Harnesses",
    description: "Built to IPC/WHMA-A-620 Class 3 standards with fast 48-hour turnarounds. Perfect for automotive, robotics, and medical trial runs.",
    cta: "Shop Wire Harnesses",
    href: "/shop?cat=Wire+Harness",
    img: "/images/custom-wire-harness.webp",
    bgColor: "linear-gradient(135deg, #F8F5FF 0%, #FFFFFF 100%)",
    borderColor: "#E5DAFF",
  },
  {
    id: "promo-2",
    tag: "SPECIAL OFFER",
    badge: "UP TO 15% OFF",
    title: "Heavy-Duty Overmolded Cable Assemblies",
    description: "Harsh-environment strain relief, IP67 waterproof protection, and high-flex cyclic endurance for industrial machinery and EV powertrains.",
    cta: "Explore Overmolding",
    href: "/shop?cat=Overmolded+Cables",
    img: "/images/over-molding.webp",
    bgColor: "linear-gradient(135deg, #FDF9FF 0%, #F5F1FD 100%)",
    borderColor: "#E0D5FA",
  },
]

export default function PromotionalBanners() {
  return (
    <section className="sec" style={{ background: "#FFFFFF", padding: "72px 0" }}>
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
            Special Offers &amp; Promotions
          </div>
          <h2
            style={{
              fontSize: "clamp(26px, 3.5vw, 36px)",
              fontWeight: 800,
              color: "var(--claspo-text)",
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              marginBottom: 12,
            }}
          >
            Engineered Deals for Every Program
          </h2>
          <p style={{ fontSize: 16, color: "var(--claspo-muted)", lineHeight: 1.6, margin: 0 }}>
            Take advantage of exclusive manufacturer pricing, volume discounts, and guaranteed production timelines for your next build.
          </p>
        </div>

        {/* 2-Column Promo Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 28,
          }}
        >
          {PROMOTIONS.map((promo) => (
            <div
              key={promo.id}
              style={{
                background: promo.bgColor,
                border: `1.5px solid ${promo.borderColor}`,
                borderRadius: 20,
                padding: "36px 32px",
                position: "relative",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: "0 6px 24px rgba(84, 32, 200, 0.05)",
                transition: "transform 0.25s ease, box-shadow 0.25s ease",
              }}
              className="claspo-promo-card"
            >
              <div style={{ position: "relative", zIndex: 2 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <span
                    style={{
                      background: "var(--claspo-purple)",
                      color: "#FFFFFF",
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      padding: "4px 10px",
                      borderRadius: 6,
                    }}
                  >
                    {promo.tag}
                  </span>
                  <span
                    style={{
                      background: "rgba(84, 32, 200, 0.1)",
                      color: "var(--claspo-purple)",
                      fontSize: 12,
                      fontWeight: 700,
                      padding: "4px 10px",
                      borderRadius: 6,
                    }}
                  >
                    {promo.badge}
                  </span>
                </div>

                <h3
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: "var(--claspo-text)",
                    lineHeight: 1.25,
                    marginBottom: 12,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {promo.title}
                </h3>

                <p
                  style={{
                    fontSize: 14.5,
                    color: "var(--claspo-muted)",
                    lineHeight: 1.6,
                    marginBottom: 24,
                    maxWidth: "90%",
                  }}
                >
                  {promo.description}
                </p>

                <div>
                  <Link
                    href={promo.href}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      background: "var(--claspo-purple)",
                      color: "#FFFFFF",
                      fontSize: 14,
                      fontWeight: 700,
                      padding: "12px 24px",
                      borderRadius: 9999,
                      textDecoration: "none",
                      boxShadow: "0 4px 14px rgba(84, 32, 200, 0.25)",
                      transition: "background 0.2s, transform 0.15s",
                    }}
                  >
                    {promo.cta}
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12,5 19,12 12,19" />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Bottom decorative image representation */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: 180,
                  marginTop: 28,
                  borderRadius: 14,
                  overflow: "hidden",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                }}
              >
                <Image
                  src={promo.img}
                  alt={promo.title}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Wholesale OEM Banner Strip */}
        <div
          style={{
            marginTop: 32,
            background: "linear-gradient(90deg, #5420C8 0%, #6E38DF 100%)",
            borderRadius: 18,
            padding: "26px 36px",
            color: "#FFFFFF",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20,
            boxShadow: "0 8px 30px rgba(84, 32, 200, 0.18)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: "rgba(255, 255, 255, 0.16)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" />
                <line x1="23" y1="11" x2="17" y2="11" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", opacity: 0.85 }}>
                Volume OEM &amp; Tier-1 Procurement
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>
                Flexible MOQs from 1 prototype to 100,000+ production units
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link
              href="#quote"
              style={{
                background: "#FFFFFF",
                color: "var(--claspo-purple)",
                fontWeight: 700,
                fontSize: 14,
                padding: "12px 26px",
                borderRadius: 9999,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                transition: "transform 0.15s ease",
              }}
            >
              Request Volume Quote
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12,5 19,12 12,19" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
