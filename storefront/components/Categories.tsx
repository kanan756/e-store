"use client"

import Link from "next/link"
import Image from "next/image"

const CATEGORIES = [
  {
    name: "Kitchen Essentials",
    sub: "Innovative culinary gadgets, ergonomic tools, and smart food prep solutions",
    href: "/shop?category=Kitchen+Essentials",
    img: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800",
    badge: "Top Seller",
  },
  {
    name: "Home Organization",
    sub: "Declutter living spaces with modular organizers, cable tidies, and neat systems",
    href: "/shop?category=Home+Organization",
    img: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800",
    badge: "Smart Living",
  },
  {
    name: "Storage Solutions",
    sub: "Space-saving collapsible bins, stackable containers, and closet helpers",
    href: "/shop?category=Storage+Solutions",
    img: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=800",
    badge: "Space Saver",
  },
  {
    name: "Cleaning Essentials",
    sub: "Effortless cleaning tools, specialized brushes, and reusable hygiene helpers",
    href: "/shop?category=Cleaning+Essentials",
    img: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=800",
    badge: "Daily Utility",
  },
  {
    name: "Adhesive Solutions",
    sub: "No-drill wall hooks, heavy-duty mounting strips, and damage-free hanging accessories",
    href: "/shop?category=Adhesive+Solutions",
    img: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800",
    badge: "No-Drill",
  },
  {
    name: "Bathroom Accessories",
    sub: "Rust-resistant shower organizers, draining soap trays, and bath storage caddies",
    href: "/shop?category=Bathroom+Accessories",
    img: "https://images.unsplash.com/photo-1584622781564-1d987f7333c1?q=80&w=800",
    badge: "Waterproof",
  },
]

export default function Categories() {
  return (
    <section style={{ background: "#F5F5F5", padding: "80px 0", borderBottom: "1px solid #E5E5E5" }}>
      <div style={{ maxWidth: 1360, margin: "0 auto", padding: "0 24px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "48px", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <div
              style={{
                display: "inline-block",
                background: "#FFF0E5",
                color: "#D9570A",
                fontSize: "12px",
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: "6px 14px",
                borderRadius: "4px",
                border: "1px solid rgba(243, 107, 18, 0.25)",
                marginBottom: "12px",
              }}
            >
              Curated Collections
            </div>
            <h2
              style={{
                fontSize: "clamp(26px, 3.5vw, 36px)",
                fontWeight: 900,
                letterSpacing: "-0.02em",
                color: "#17191C",
                fontFamily: "var(--font-sora), sans-serif",
                margin: "0 0 8px",
              }}
            >
              Discover Smarter Living
            </h2>
            <p style={{ fontSize: "16px", color: "#747474", margin: 0, maxWidth: "600px" }}>
              Explore practical products designed to make every corner of your home more functional.
            </p>
          </div>

          <Link
            href="/shop"
            style={{
              color: "#F36B12",
              fontSize: "14px",
              fontWeight: 700,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              transition: "transform 0.15s ease, color 0.15s ease",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = "#D9570A"
              e.currentTarget.style.transform = "translateX(3px)"
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = "#F36B12"
              e.currentTarget.style.transform = "translateX(0)"
            }}
          >
            <span>View All Categories</span>
            <span style={{ fontSize: "16px" }}>&rarr;</span>
          </Link>
        </div>

        {/* 6-Card Category Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(320px, 100%), 1fr))",
            gap: "24px",
          }}
        >
          {CATEGORIES.map(cat => (
            <Link
              key={cat.name}
              href={cat.href}
              style={{
                background: "#FFFFFF",
                borderRadius: "12px",
                border: "1px solid #E5E5E5",
                overflow: "hidden",
                textDecoration: "none",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "#F36B12"
                e.currentTarget.style.transform = "translateY(-4px)"
                e.currentTarget.style.boxShadow = "0 10px 24px rgba(243, 107, 18, 0.12)"
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "#E5E5E5"
                e.currentTarget.style.transform = "translateY(0)"
                e.currentTarget.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.03)"
              }}
            >
              {/* Image Preview */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "16/10",
                  background: "#FFF0E5",
                  overflow: "hidden",
                }}
              >
                <Image
                  src={cat.img}
                  alt={cat.name}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />

                <div
                  style={{
                    position: "absolute",
                    top: 14,
                    right: 14,
                    background: "#F36B12",
                    color: "#FFFFFF",
                    fontSize: 11,
                    fontWeight: 800,
                    padding: "4px 10px",
                    borderRadius: "4px",
                    letterSpacing: "0.04em",
                    boxShadow: "0 2px 8px rgba(243, 107, 18, 0.35)",
                  }}
                >
                  {cat.badge}
                </div>
              </div>

              {/* Text Body */}
              <div style={{ padding: "24px 22px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                <h3
                  style={{
                    fontSize: 19,
                    fontWeight: 800,
                    color: "#17191C",
                    marginBottom: 8,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {cat.name}
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    color: "#747474",
                    lineHeight: 1.6,
                    margin: "0 0 16px 0",
                    flexGrow: 1,
                  }}
                >
                  {cat.sub}
                </p>

                <div
                  style={{
                    fontSize: 13.5,
                    fontWeight: 700,
                    color: "#F36B12",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span>Explore Collection</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12,5 19,12 12,19" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
