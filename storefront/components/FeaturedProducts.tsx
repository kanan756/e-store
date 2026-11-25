"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import ProductCard from "@/components/ProductCard"
import type { Product } from "@/lib/sheets"

interface FeaturedProductsProps {
  products?: Product[]
}

export default function FeaturedProducts({ products = [] }: FeaturedProductsProps) {
  const [activeTab, setActiveTab] = useState("All")

  const tabs = useMemo(() => {
    const cats = Array.from(
      new Set(products.map((p) => p.category?.trim()).filter((c): c is string => Boolean(c)))
    )
    return ["All", ...cats.slice(0, 6)]
  }, [products])

  const displayList = useMemo(() => {
    if (activeTab === "All") return products.slice(0, 8)
    return products
      .filter((p) => p.category?.trim().toLowerCase() === activeTab.toLowerCase())
      .slice(0, 8)
  }, [products, activeTab])

  return (
    <section style={{ background: "#FFFFFF", padding: "80px 0", borderBottom: "1px solid #E5E5E5" }}>
      <div style={{ maxWidth: 1360, margin: "0 auto", padding: "0 24px" }}>
        {/* Section Header */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
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
            Featured Selections
          </div>
          <h2
            style={{
              fontSize: "clamp(26px, 3.5vw, 36px)",
              fontWeight: 900,
              letterSpacing: "-0.02em",
              color: "#17191C",
              fontFamily: "var(--font-sora), sans-serif",
              marginBottom: "10px",
            }}
          >
            Discover Our Popular Picks
          </h2>
          <p style={{ fontSize: "16px", color: "#747474", maxWidth: "560px", margin: "0 auto" }}>
            Explore practical everyday essentials selected to make life easier.
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
          {tabs.map((tab) => {
            const isActive = activeTab === tab
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "8px 18px",
                  borderRadius: "6px",
                  fontSize: 13.5,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  border: isActive ? "1.5px solid #F36B12" : "1px solid #E5E5E5",
                  background: isActive ? "#F36B12" : "#FFFFFF",
                  color: isActive ? "#FFFFFF" : "#747474",
                  boxShadow: isActive ? "0 2px 8px rgba(243, 107, 18, 0.3)" : "none",
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = "#F36B12"
                    e.currentTarget.style.color = "#F36B12"
                    e.currentTarget.style.background = "#FFF0E5"
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = "#E5E5E5"
                    e.currentTarget.style.color = "#747474"
                    e.currentTarget.style.background = "#FFFFFF"
                  }
                }}
              >
                {tab === "All" ? "All Products" : tab}
              </button>
            )
          })}
        </div>

        {/* Product Grid */}
        {displayList.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 20px", color: "#747474", fontSize: 15 }}>
            No products available right now. Check back soon!
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(min(260px, 100%), 1fr))",
              gap: "24px",
              marginBottom: "48px",
            }}
          >
            {displayList.map((p, idx) => (
              <ProductCard key={p.handle || p.id} product={p} index={idx} />
            ))}
          </div>
        )}

        {/* View All Button */}
        <div style={{ textAlign: "center" }}>
          <Link
            href="/shop"
            style={{
              background: "#F36B12",
              color: "#FFFFFF",
              padding: "14px 34px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 700,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 4px 14px rgba(243, 107, 18, 0.3)",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "#D9570A"
              e.currentTarget.style.transform = "translateY(-1px)"
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "#F36B12"
              e.currentTarget.style.transform = "translateY(0)"
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
