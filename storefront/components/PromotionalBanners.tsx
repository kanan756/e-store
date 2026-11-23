"use client"

import Link from "next/link"
import Image from "next/image"

const PROMOTIONS = [
  {
    id: "promo-1",
    tag: "FEATURED DEAL",
    badge: "SAVE 20%",
    title: "Smart Kitchen & Food Prep Innovations",
    description: "Multi-functional vegetable cutters, 360° rotating spice turntables, and ergonomic kitchen tools designed to make prep effortless.",
    cta: "Shop Kitchen Essentials",
    href: "/shop?category=Kitchen+Essentials",
    img: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800",
    bgColor: "#FAFAFA",
    borderColor: "#DADADA",
  },
  {
    id: "promo-2",
    tag: "SPECIAL OFFER",
    badge: "UP TO 15% OFF",
    title: "Space-Saving Home Storage Organizers",
    description: "Expandable under-sink sliding racks, modular drawer divider sets, and damage-free adhesive organizers that reclaim unused space.",
    cta: "Explore Storage",
    href: "/shop?category=Storage+Solutions",
    img: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800",
    bgColor: "#F5F5F5",
    borderColor: "#DADADA",
  },
]

export default function PromotionalBanners() {
  return (
    <section className="sec" style={{ background: "#FFFFFF", padding: "72px 0", borderBottom: "1px solid #DADADA" }}>
      <div className="W">
        {/* Section Header */}
        <div style={{ textAlign: "center", maxWidth: 660, margin: "0 auto 48px auto" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "#F5F5F5",
              color: "#111111",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "6px 14px",
              borderRadius: "4px",
              border: "1px solid #DADADA",
              marginBottom: 14,
            }}
          >
            Special Offers &amp; Promotions
          </div>
          <h2
            style={{
              fontSize: "clamp(26px, 3.5vw, 36px)",
              fontWeight: 800,
              color: "#111111",
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              marginBottom: 12,
            }}
          >
            Smarter Living Deals for Every Room
          </h2>
          <p style={{ fontSize: 16, color: "#777777", lineHeight: 1.6, margin: 0 }}>
            Discover seasonal savings on practical household essentials, storage solutions, and innovative kitchen helpers.
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
                border: `1px solid ${promo.borderColor}`,
                borderRadius: 14,
                padding: "36px 32px",
                position: "relative",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.03)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
              className="claspo-promo-card"
            >
              <div style={{ position: "relative", zIndex: 2 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <span
                    style={{
                      background: "#111111",
                      color: "#FFFFFF",
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      padding: "4px 10px",
                      borderRadius: 4,
                    }}
                  >
                    {promo.tag}
                  </span>
                  <span
                    style={{
                      background: "#FFFFFF",
                      color: "#111111",
                      border: "1px solid #DADADA",
                      fontSize: 12,
                      fontWeight: 700,
                      padding: "4px 10px",
                      borderRadius: 4,
                    }}
                  >
                    {promo.badge}
                  </span>
                </div>

                <h3
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: "#111111",
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
                    color: "#777777",
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
                      background: "#111111",
                      color: "#FFFFFF",
                      fontSize: 14,
                      fontWeight: 700,
                      padding: "12px 24px",
                      borderRadius: "6px",
                      textDecoration: "none",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
                      transition: "background 0.2s, transform 0.15s",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = "#303638"
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = "#111111"
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
                  borderRadius: 10,
                  overflow: "hidden",
                  border: "1px solid #DADADA",
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

        {/* Free Shipping Strip */}
        <div
          style={{
            marginTop: 32,
            background: "#303638",
            borderRadius: 14,
            padding: "26px 36px",
            color: "#FFFFFF",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20,
            boxShadow: "0 4px 18px rgba(0, 0, 0, 0.12)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 8,
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", opacity: 0.85 }}>
                Free Shipping Available
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>
                Enjoy Free Standard Delivery on all orders over $100
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link
              href="/shop"
              style={{
                background: "#FFFFFF",
                color: "#111111",
                fontWeight: 700,
                fontSize: 14,
                padding: "12px 26px",
                borderRadius: "6px",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                transition: "background 0.2s, transform 0.15s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "#F5F5F5"
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "#FFFFFF"
              }}
            >
              Shop All Offers
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
