"use client"

import { useState } from "react"
import Link from "next/link"
import ProductCard from "@/components/ProductCard"
import type { Product } from "@/lib/sheets"

// Fallback home products if Google Sheets is not yet populated
const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "360° Rotating Kitchen Spice & Condiment Organizer",
    category: "Kitchen Essentials",
    description: "Smooth-glide turntable organizer maximizing cabinet and pantry storage with non-skid surface.",
    imageUrl: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800",
    price: 24,
    handle: "rotating-kitchen-spice-organizer",
    inStock: true,
    partNumber: "CP-KT-101",
  },
  {
    id: "2",
    name: "Damage-Free Heavy Duty Adhesive Wall Hooks (6-Pack)",
    category: "Adhesive Solutions",
    description: "Ultra-strong waterproof adhesive hooks holding up to 15 lbs without drilling or wall marks.",
    imageUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800",
    price: 16,
    handle: "damage-free-adhesive-wall-hooks",
    inStock: true,
    partNumber: "CP-AD-204",
  },
  {
    id: "3",
    name: "Under-Sink Expandable 2-Tier Sliding Storage Rack",
    category: "Storage Solutions",
    description: "Heavy-duty steel sliding drawers designed to bypass sink plumbing pipes and maximize cabinet storage.",
    imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800",
    price: 38,
    handle: "under-sink-expandable-storage-rack",
    inStock: true,
    partNumber: "CP-ST-302",
  },
  {
    id: "4",
    name: "Multi-Surface Flexible Cleaning Brush & Squeegee Set",
    category: "Cleaning Essentials",
    description: "Ergonomic deep-cleaning brush with high-density bristles and silicone wiper for tiles and countertops.",
    imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=800",
    price: 19,
    handle: "multi-surface-cleaning-brush-set",
    inStock: true,
    partNumber: "CP-CL-408",
  },
  {
    id: "5",
    name: "Adjustable Modular Drawer Divider Organizers (4-Pack)",
    category: "Home Organization",
    description: "Spring-loaded expandable bamboo dividers creating custom compartments in clothes, desk, and kitchen drawers.",
    imageUrl: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=800",
    price: 29,
    handle: "adjustable-modular-drawer-dividers",
    inStock: true,
    partNumber: "CP-OR-512",
  },
  {
    id: "6",
    name: "Wall-Mounted Adhesive Bathroom Caddy & Towel Bar",
    category: "Bathroom Accessories",
    description: "Rustproof aluminum shower organizer with rapid drainage slots and razor hanging hooks.",
    imageUrl: "https://images.unsplash.com/photo-1584622781564-1d987f7333c1?q=80&w=800",
    price: 28,
    handle: "adhesive-bathroom-shower-caddy",
    inStock: true,
    partNumber: "CP-BA-605",
  },
]

interface FeaturedProductsProps {
  products?: Product[]
}

const TABS = ["All", "Kitchen Essentials", "Home Organization", "Storage Solutions", "Cleaning Essentials", "Adhesive Solutions"]

export default function FeaturedProducts({ products = [] }: FeaturedProductsProps) {
  const [activeTab, setActiveTab] = useState("All")
  const sourceProducts = products && products.length > 0 ? products : FALLBACK_PRODUCTS

  const filteredProducts = activeTab === "All"
    ? sourceProducts.slice(0, 8)
    : sourceProducts.filter((p) => p.category?.toLowerCase().includes(activeTab.toLowerCase().split(" ")[0])).slice(0, 8)

  const displayList = filteredProducts.length > 0 ? filteredProducts : sourceProducts.slice(0, 8)

  return (
    <section style={{ background: "#FFFFFF", padding: "80px 0", borderBottom: "1px solid #DADADA" }}>
      <div style={{ maxWidth: 1360, margin: "0 auto", padding: "0 24px" }}>
        {/* Section Header */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div
            style={{
              display: "inline-block",
              background: "#F5F5F5",
              color: "#111111",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "6px 14px",
              borderRadius: "4px",
              border: "1px solid #DADADA",
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
              color: "#111111",
              fontFamily: "var(--font-sora), sans-serif",
              marginBottom: "10px",
            }}
          >
            Discover Our Popular Picks
          </h2>
          <p style={{ fontSize: "16px", color: "#777777", maxWidth: "560px", margin: "0 auto" }}>
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
          {TABS.map((tab) => {
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
                  border: isActive ? "1.5px solid #111111" : "1px solid #DADADA",
                  background: isActive ? "#111111" : "#FFFFFF",
                  color: isActive ? "#FFFFFF" : "#777777",
                  boxShadow: isActive ? "0 2px 8px rgba(0, 0, 0, 0.12)" : "none",
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
              background: "#111111",
              color: "#FFFFFF",
              padding: "14px 34px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 700,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 4px 14px rgba(0, 0, 0, 0.12)",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "#303638"
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "#111111"
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
