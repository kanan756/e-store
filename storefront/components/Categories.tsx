"use client"

import Link from "next/link"
import Image from "next/image"

const CATEGORIES = [
  {
    name: "Custom Wire Harnesses",
    sub: "Multi-branch, engine, and control panel wiring systems",
    href: "/products/custom-wire-harness",
    img: "/images/custom-wire-harness.webp",
    badge: "Most Popular",
  },
  {
    name: "Overmolded Cable Assemblies",
    sub: "Heavy-duty strain relief & weatherproof IP68 sealing",
    href: "/products/overmolded-harness",
    img: "/images/over-molding.webp",
    badge: "Industrial Grade",
  },
  {
    name: "Coil & Spiral Cables",
    sub: "Retractable cords for robotics, automation & aviation",
    href: "/products/coil-spiral-cable",
    img: "/images/coil-cable-m12-connector.webp",
    badge: "10M+ Cycles",
  },
  {
    name: "High-Voltage & EV Harnesses",
    sub: "Orange shielded cabling for battery packs & clean energy",
    href: "/products/high-voltage-harness",
    img: "/images/hv-orange-harness.webp",
    badge: "EV Rated",
  },
  {
    name: "PCB Assembly & SMT",
    sub: "Surface mount, through-hole & complete box builds",
    href: "/products/pcb-assemblies",
    img: "/images/pcb.webp",
    badge: "IPC Class III",
  },
  {
    name: "Circular & MIL Connectors",
    sub: "MIL-DTL-38999, M12, M8, and rugged Deutsch interconnects",
    href: "/products/circular-connector",
    img: "/images/circular-connector-pin-insert.webp",
    badge: "MIL-Spec",
  },
]

export default function Categories() {
  return (
    <section style={{ background: "#F7F7F9", padding: "80px 0", borderBottom: "1px solid #E5E5EB" }}>
      <div style={{ maxWidth: 1360, margin: "0 auto", padding: "0 24px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "48px", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <div
              style={{
                display: "inline-block",
                background: "#F1EBFF",
                color: "#5420C8",
                fontSize: "12px",
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: "6px 14px",
                borderRadius: "9999px",
                marginBottom: "12px",
              }}
            >
              Catalog Overview
            </div>
            <h2
              style={{
                fontSize: "clamp(26px, 3.5vw, 36px)",
                fontWeight: 900,
                letterSpacing: "-0.02em",
                color: "#111111",
                fontFamily: "var(--font-sora), sans-serif",
                margin: "0 0 8px",
              }}
            >
              Explore Product Categories
            </h2>
            <p style={{ fontSize: "16px", color: "#707070", margin: 0 }}>
              Tailored interconnect solutions manufactured to your exact engineering prints.
            </p>
          </div>

          <Link
            href="/products"
            style={{
              color: "#5420C8",
              fontSize: "14px",
              fontWeight: 800,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "10px 20px",
              borderRadius: "9999px",
              background: "#FFFFFF",
              border: "1px solid #E5E5EB",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "#F1EBFF"
              e.currentTarget.style.borderColor = "#5420C8"
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "#FFFFFF"
              e.currentTarget.style.borderColor = "#E5E5EB"
            }}
          >
            <span>View All Categories</span>
            <span>&rarr;</span>
          </Link>
        </div>

        {/* Categories Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "24px",
          }}
        >
          {CATEGORIES.map(cat => (
            <Link
              key={cat.name}
              href={cat.href}
              style={{
                background: "#FFFFFF",
                borderRadius: "18px",
                border: "1px solid #E5E5EB",
                overflow: "hidden",
                textDecoration: "none",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "#5420C8"
                e.currentTarget.style.transform = "translateY(-4px)"
                e.currentTarget.style.boxShadow = "0 14px 32px rgba(84, 32, 200, 0.12)"
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "#E5E5EB"
                e.currentTarget.style.transform = "translateY(0)"
                e.currentTarget.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.03)"
              }}
            >
              {/* Category Image */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "200px",
                  background: "#F7F7F9",
                  overflow: "hidden",
                }}
              >
                <Image
                  src={cat.img}
                  alt={cat.name}
                  fill
                  unoptimized={true}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  style={{
                    objectFit: "cover",
                    transition: "transform 0.4s ease",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 14,
                    right: 14,
                    background: "rgba(255,255,255,0.95)",
                    backdropFilter: "blur(6px)",
                    color: "#5420C8",
                    fontSize: "11px",
                    fontWeight: 800,
                    padding: "4px 10px",
                    borderRadius: "9999px",
                    border: "1px solid rgba(84,32,200,0.15)",
                  }}
                >
                  {cat.badge}
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: "20px 22px 24px", display: "flex", flexDirection: "column", flex: 1 }}>
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: 800,
                    color: "#111111",
                    margin: "0 0 6px",
                    fontFamily: "var(--font-sora), sans-serif",
                  }}
                >
                  {cat.name}
                </h3>
                <p style={{ fontSize: "14px", color: "#707070", lineHeight: 1.5, margin: "0 0 18px", flex: 1 }}>
                  {cat.sub}
                </p>

                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "13px",
                    fontWeight: 800,
                    color: "#5420C8",
                  }}
                >
                  <span>Explore Series</span>
                  <span>&rarr;</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
