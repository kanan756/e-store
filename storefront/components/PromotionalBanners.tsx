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
    bgColor: "#FFFFFF",
    borderColor: "#E5E5E5",
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
    bgColor: "#FFF8F3",
    borderColor: "#E5E5E5",
  },
]

export default function PromotionalBanners() {
  return (
    <section className="sec" style={{ background: "#FFFFFF", padding: "72px 0", borderBottom: "1px solid #E5E5E5" }}>
      <div className="W">
        {/* ── Main Orange Feature Promotional Banner ── */}
        <div
          style={{
            background: "linear-gradient(135deg, #F36B12 0%, #D9570A 100%)",
            borderRadius: 16,
            padding: "54px 48px",
            color: "#FFFFFF",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 40,
            alignItems: "center",
            boxShadow: "0 10px 30px rgba(243, 107, 18, 0.25)",
            marginBottom: 40,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Subtle Ambient Decorative Circles */}
          <div
            style={{
              position: "absolute",
              top: "-50px",
              right: "-50px",
              width: "300px",
              height: "300px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.08)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-40px",
              left: "20%",
              width: "200px",
              height: "200px",
              borderRadius: "50%",
              background: "rgba(0, 0, 0, 0.06)",
              pointerEvents: "none",
            }}
          />

          {/* Left Text */}
          <div style={{ position: "relative", zIndex: 2 }}>
            <div
              style={{
                display: "inline-block",
                background: "rgba(255, 255, 255, 0.2)",
                color: "#FFFFFF",
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: "6px 14px",
                borderRadius: 9999,
                marginBottom: 16,
                backdropFilter: "blur(4px)",
              }}
            >
              CLASPO Signature Collection
            </div>
            <h2
              style={{
                fontSize: "clamp(30px, 4vw, 44px)",
                fontWeight: 900,
                letterSpacing: "-0.025em",
                lineHeight: 1.15,
                color: "#FFFFFF",
                marginBottom: 16,
                fontFamily: "var(--font-sora), sans-serif",
              }}
            >
              Upgrade Your Home, Upgrade Your Life.
            </h2>
            <p
              style={{
                fontSize: 16.5,
                color: "rgba(255, 255, 255, 0.92)",
                lineHeight: 1.65,
                maxWidth: 500,
                marginBottom: 28,
              }}
            >
              Discover smart everyday essentials that make your home more organized, efficient, and convenient &mdash; engineered for modern living.
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <Link
                href="/shop"
                style={{
                  background: "#FFFFFF",
                  color: "#D9570A",
                  fontWeight: 800,
                  fontSize: 14.5,
                  padding: "14px 32px",
                  borderRadius: 8,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 4px 14px rgba(0, 0, 0, 0.15)",
                  transition: "transform 0.15s ease, background 0.15s ease",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-1px)"
                  e.currentTarget.style.background = "#FFF0E5"
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0)"
                  e.currentTarget.style.background = "#FFFFFF"
                }}
              >
                <span>Shop Featured Deals</span>
                <span>&rarr;</span>
              </Link>
              <Link
                href="/products"
                style={{
                  background: "rgba(255, 255, 255, 0.15)",
                  color: "#FFFFFF",
                  border: "1.5px solid rgba(255, 255, 255, 0.4)",
                  fontWeight: 700,
                  fontSize: 14.5,
                  padding: "14px 28px",
                  borderRadius: 8,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.25)"
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)"
                }}
              >
                <span>Explore Catalog</span>
              </Link>
            </div>
          </div>

          {/* Right Product Image Showcase */}
          <div style={{ position: "relative", zIndex: 2 }}>
            <div
              style={{
                position: "relative",
                width: "100%",
                height: 300,
                borderRadius: 14,
                overflow: "hidden",
                background: "rgba(255, 255, 255, 0.1)",
                border: "1.5px solid rgba(255, 255, 255, 0.25)",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
              }}
            >
              <Image
                src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800"
                alt="Upgrade Your Home with CLASPO"
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>

        {/* 2-Column Secondary Promo Cards */}
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
                transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "#F36B12"
                e.currentTarget.style.transform = "translateY(-3px)"
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(243, 107, 18, 0.1)"
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = promo.borderColor
                e.currentTarget.style.transform = "translateY(0)"
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.03)"
              }}
            >
              <div style={{ position: "relative", zIndex: 2 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <span
                    style={{
                      background: "#F36B12",
                      color: "#FFFFFF",
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      padding: "4px 10px",
                      borderRadius: 4,
                      boxShadow: "0 2px 6px rgba(243, 107, 18, 0.3)",
                    }}
                  >
                    {promo.tag}
                  </span>
                  <span
                    style={{
                      background: "#FFF0E5",
                      color: "#D9570A",
                      border: "1px solid rgba(243, 107, 18, 0.25)",
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
                    fontSize: 22,
                    fontWeight: 800,
                    color: "#17191C",
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
                    color: "#747474",
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
                      background: "#17191C",
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
                      e.currentTarget.style.background = "#F36B12"
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = "#17191C"
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
                  border: "1px solid #E5E5E5",
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
                background: "rgba(243, 107, 18, 0.15)",
                border: "1px solid rgba(243, 107, 18, 0.3)",
                color: "#F36B12",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#F36B12" }}>
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
                background: "#F36B12",
                color: "#FFFFFF",
                fontWeight: 700,
                fontSize: 14,
                padding: "12px 26px",
                borderRadius: "6px",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 2px 10px rgba(243, 107, 18, 0.35)",
                transition: "background 0.2s, transform 0.15s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "#D9570A"
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "#F36B12"
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
