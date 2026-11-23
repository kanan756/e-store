"use client"

import { useState } from "react"
import Link from "next/link"
import ProductCard from "@/components/ProductCard"
import type { Product } from "@/lib/sheets"

// Fallback products if Google Sheets is not yet populated
const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Custom Multi-Branch Wire Harness Assembly",
    category: "Wire Harness",
    description: "Industrial grade multi-branch wire harness designed for heavy equipment, automation and automotive.",
    imageUrl: "/images/custom-wire-harness.webp",
    price: 185,
    handle: "custom-wire-harness",
    inStock: true,
    partNumber: "CP-WH-092",
  },
  {
    id: "2",
    name: "High-Flex M12 Coiled Spiral Cable (3m Extended)",
    category: "Coil Cable",
    description: "Tough PUR jacketed coiled spiral cable with M12 molded connector for industrial sensors and robotics.",
    imageUrl: "/images/coil-cable-m12-connector.webp",
    price: 125,
    handle: "coil-spiral-cable",
    inStock: true,
    partNumber: "CP-CL-441",
  },
  {
    id: "3",
    name: "High-Voltage Shielded Orange EV Cable Assembly",
    category: "High Voltage",
    description: "Multi-shielded high-voltage cable assembly for battery packs, power inverters, and EV applications.",
    imageUrl: "/images/hv-orange-harness.webp",
    price: 340,
    handle: "high-voltage-harness",
    inStock: true,
    partNumber: "CP-EV-710",
  },
  {
    id: "4",
    name: "Overmolded Heavy-Duty Industrial Cable Assembly",
    category: "Cable Assembly",
    description: "IP68 waterproof overmolded cable assembly with strain relief and ruggedized connector housing.",
    imageUrl: "/images/over-molding.webp",
    price: 95,
    handle: "overmolded-harness",
    inStock: true,
    partNumber: "CP-CA-108",
  },
  {
    id: "5",
    name: "Automotive CAN-Bus Twisted Pair Harness",
    category: "Wire Harness",
    description: "Controlled impedance shielded twisted pair cable for CAN-Bus, LIN, and FlexRay in-vehicle networks.",
    imageUrl: "/images/automotive.webp",
    price: 110,
    handle: "can-bus-harness",
    inStock: true,
    partNumber: "CP-AT-215",
  },
  {
    id: "6",
    name: "Medical Device Ultrasonic Welded Sub-Assembly",
    category: "Cable Assembly",
    description: "Low-noise sensor wiring with gold-plated pins and ultrasonic solid-state splices for diagnostic equipment.",
    imageUrl: "/images/ultrasonic-splicing.webp",
    price: 215,
    handle: "medical-ultrasonic-assembly",
    inStock: true,
    partNumber: "CP-MD-530",
  },
]

interface FeaturedProductsProps {
  products?: Product[]
}

const TABS = ["All", "Wire Harness", "Cable Assembly", "Coil Cable", "High Voltage"]

export default function FeaturedProducts({ products = [] }: FeaturedProductsProps) {
  const [activeTab, setActiveTab] = useState("All")
  const sourceProducts = products && products.length > 0 ? products : FALLBACK_PRODUCTS

  const filteredProducts = activeTab === "All"
    ? sourceProducts.slice(0, 8)
    : sourceProducts.filter((p) => p.category?.toLowerCase().includes(activeTab.toLowerCase())).slice(0, 8)

  const displayList = filteredProducts.length > 0 ? filteredProducts : sourceProducts.slice(0, 8)

  return (
    <section style={{ background: "#FFFFFF", padding: "80px 0", borderBottom: "1px solid #E5E5EB" }}>
      <div style={{ maxWidth: 1360, margin: "0 auto", padding: "0 24px" }}>
        {/* Section Header */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
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
            Best Sellers &amp; Trending
          </div>
          <h2
            style={{
              fontSize: "clamp(26px, 3.5vw, 36px)",
              fontWeight: 900,
              letterSpacing: "-0.02em",
              color: "#111111",
              fontFamily: "var(--font-sora), sans-serif",
              marginBottom: "10px",
            }}
          >
            Featured Interconnect Solutions
          </h2>
          <p style={{ fontSize: "16px", color: "#707070", maxWidth: "560px", margin: "0 auto" }}>
            Precision-manufactured wiring harnesses and cable assemblies built for high durability, zero defects, and immediate ordering.
          </p>
        </div>

        {/* Filter Tabs */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: 10,
            marginBottom: 44,
          }}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "8px 20px",
                  borderRadius: 9999,
                  fontSize: 13.5,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  border: isActive ? "1.5px solid #5420C8" : "1.5px solid #E5E5EB",
                  background: isActive ? "#5420C8" : "#FFFFFF",
                  color: isActive ? "#FFFFFF" : "#555555",
                  boxShadow: isActive ? "0 4px 12px rgba(84, 32, 200, 0.2)" : "none",
                }}
              >
                {tab === "All" ? "All Products" : tab}
              </button>
            )
          })}
        </div>

        {/* Product Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "24px",
            marginBottom: "48px",
          }}
        >
          {displayList.map((p, idx) => (
            <ProductCard key={p.handle || p.id} product={p} index={idx} />
          ))}
        </div>

        {/* View All Button */}
        <div style={{ textAlign: "center" }}>
          <Link
            href="/shop"
            style={{
              background: "#5420C8",
              color: "#FFFFFF",
              padding: "15px 36px",
              borderRadius: "9999px",
              fontSize: "14px",
              fontWeight: 700,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 4px 18px rgba(84, 32, 200, 0.25)",
              transition: "all 0.2s",
            }}
          >
            <span>Browse Full Catalog</span>
            <span>&rarr;</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
