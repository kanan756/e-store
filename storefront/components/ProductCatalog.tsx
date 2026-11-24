"use client"

import { useState, useMemo, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import type { Product } from "@/lib/sheets"
import ProductCard from "./ProductCard"

interface ProductCatalogProps {
  initialProducts: Product[]
  initialCategory?: string
  initialQuery?: string
}

const DEFAULT_CATEGORIES = [
  "Kitchen Tools",
  "Home Organization",
  "Cleaning Essentials",
  "Adhesive Solutions",
  "Space Saving",
  "Bathroom Accessories",
  "Smart Home",
]

export default function ProductCatalog({
  initialProducts,
  initialCategory = "all",
  initialQuery = "",
}: ProductCatalogProps) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const urlCategory = searchParams.get("category") || initialCategory || "all"
  const urlQuery = searchParams.get("q") || initialQuery || ""

  const [selectedCategory, setSelectedCategory] = useState<string>(urlCategory)
  const [searchQuery, setSearchQuery] = useState<string>(urlQuery)
  const [sortBy, setSortBy] = useState<string>("default")

  // Sync state if URL changes
  useEffect(() => {
    if (searchParams.get("category")) {
      setSelectedCategory(searchParams.get("category")!)
    }
    if (searchParams.get("q") !== null) {
      setSearchQuery(searchParams.get("q") || "")
    }
  }, [searchParams])

  // Extract all categories dynamically from active products and merge with standard categories
  const categoriesList = useMemo(() => {
    const dynamicCats = new Set<string>()
    initialProducts.forEach((p) => {
      if (p.category && p.category.trim()) {
        dynamicCats.add(p.category.trim())
      }
    })

    // Include default categories if no dynamic ones yet, or add any known categories that have products
    const combined = new Set<string>(["All Products"])
    dynamicCats.forEach((c) => combined.add(c))

    // If active product set doesn't have categories yet, present default catalog categories
    if (dynamicCats.size === 0) {
      DEFAULT_CATEGORIES.forEach((c) => combined.add(c))
    }

    return Array.from(combined)
  }, [initialProducts])

  // Count items per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { "All Products": initialProducts.length }
    initialProducts.forEach((p) => {
      const cat = p.category ? p.category.trim() : "General"
      counts[cat] = (counts[cat] || 0) + 1
    })
    return counts
  }, [initialProducts])

  // Filter & sort products
  const filteredProducts = useMemo(() => {
    return initialProducts
      .filter((p) => {
        // Category filter
        if (selectedCategory && selectedCategory.toLowerCase() !== "all" && selectedCategory !== "All Products") {
          const pCat = (p.category || "").trim().toLowerCase()
          const selCat = selectedCategory.trim().toLowerCase()
          if (pCat !== selCat) {
            return false
          }
        }

        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim()
          const nameMatch = p.name ? p.name.toLowerCase().includes(q) : false
          const catMatch = p.category ? p.category.toLowerCase().includes(q) : false
          const descMatch = p.description ? p.description.toLowerCase().includes(q) : false
          const shortDescMatch = p.shortDescription ? p.shortDescription.toLowerCase().includes(q) : false
          const skuMatch = p.sku ? p.sku.toLowerCase().includes(q) : false

          if (!nameMatch && !catMatch && !descMatch && !shortDescMatch && !skuMatch) {
            return false
          }
        }

        return true
      })
      .sort((a, b) => {
        const priceA = a.discountPrice ? Number(a.discountPrice) : Number(a.price) || 0
        const priceB = b.discountPrice ? Number(b.discountPrice) : Number(b.price) || 0

        if (sortBy === "price-low") return priceA - priceB
        if (sortBy === "price-high") return priceB - priceA
        if (sortBy === "name-asc") return (a.name || "").localeCompare(b.name || "")
        if (sortBy === "name-desc") return (b.name || "").localeCompare(a.name || "")
        return 0
      })
  }, [initialProducts, selectedCategory, searchQuery, sortBy])

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category)
    const params = new URLSearchParams(window.location.search)
    if (category === "All Products" || category === "all") {
      params.delete("category")
    } else {
      params.set("category", category)
    }
    const newQs = params.toString()
    router.replace(`/products${newQs ? `?${newQs}` : ""}`, { scroll: false })
  }

  const handleResetFilters = () => {
    setSelectedCategory("All Products")
    setSearchQuery("")
    setSortBy("default")
    router.replace("/products", { scroll: false })
  }

  return (
    <div style={{ width: "100%", maxWidth: 1360, margin: "0 auto", padding: "0 20px" }}>
      {/* ── Category Tabs Bar ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          overflowX: "auto",
          paddingBottom: 16,
          marginBottom: 32,
          scrollbarWidth: "thin",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {categoriesList.map((cat) => {
          const isActive =
            (selectedCategory === "all" || selectedCategory === "All Products")
              ? cat === "All Products"
              : selectedCategory.toLowerCase() === cat.toLowerCase()
          const count = categoryCounts[cat] ?? 0

          return (
            <button
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              type="button"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 20px",
                borderRadius: 9999,
                fontSize: 14,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? "#FFFFFF" : "#4B5563",
                background: isActive ? "#F36B12" : "#FFFFFF",
                border: isActive ? "1px solid #F36B12" : "1px solid #E5E7EB",
                boxShadow: isActive
                  ? "0 4px 12px rgba(243, 107, 18, 0.28)"
                  : "0 1px 3px rgba(0, 0, 0, 0.05)",
                whiteSpace: "nowrap",
                cursor: "pointer",
                transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = "#F36B12"
                  e.currentTarget.style.color = "#F36B12"
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = "#E5E7EB"
                  e.currentTarget.style.color = "#4B5563"
                }
              }}
            >
              <span>{cat}</span>
              {count > 0 && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "2px 7px",
                    borderRadius: 9999,
                    background: isActive ? "rgba(255, 255, 255, 0.25)" : "#F3F4F6",
                    color: isActive ? "#FFFFFF" : "#6B7280",
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Search & Filter Controls ── */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 32,
          padding: "16px 20px",
          background: "#FFFFFF",
          borderRadius: 12,
          border: "1px solid #E5E7EB",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
        }}
      >
        {/* Search input */}
        <div style={{ position: "relative", flex: "1 1 280px", maxWidth: 420 }}>
          <input
            type="text"
            placeholder="Search by product name, SKU, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px 10px 38px",
              borderRadius: 8,
              border: "1px solid #E5E7EB",
              background: "#F9FAFB",
              fontSize: 14,
              color: "#17191C",
              outline: "none",
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#F36B12"
              e.target.style.boxShadow = "0 0 0 3px rgba(243, 107, 18, 0.12)"
              e.target.style.background = "#FFFFFF"
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#E5E7EB"
              e.target.style.boxShadow = "none"
              e.target.style.background = "#F9FAFB"
            }}
          />
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9CA3AF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ position: "absolute", left: 13, top: 13, pointerEvents: "none" }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              type="button"
              style={{
                position: "absolute",
                right: 12,
                top: 10,
                background: "transparent",
                border: "none",
                color: "#9CA3AF",
                cursor: "pointer",
                fontSize: 16,
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Results summary & Sort dropdown */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13.5, color: "#6B7280", fontWeight: 500 }}>
            Showing <strong style={{ color: "#17191C" }}>{filteredProducts.length}</strong> {filteredProducts.length === 1 ? "product" : "products"}
          </span>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label htmlFor="sort-select" style={{ fontSize: 13.5, color: "#4B5563", fontWeight: 600 }}>
              Sort:
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #E5E7EB",
                background: "#FFFFFF",
                fontSize: 13.5,
                color: "#17191C",
                fontWeight: 500,
                cursor: "pointer",
                outline: "none",
              }}
            >
              <option value="default">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Products Grid ── */}
      {filteredProducts.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 28,
            marginBottom: 60,
          }}
        >
          {filteredProducts.map((product, idx) => (
            <ProductCard key={product.id || product.handle || idx} product={product} index={idx} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 16,
            border: "1px solid #E5E7EB",
            padding: "64px 24px",
            textAlign: "center",
            maxWidth: 600,
            margin: "0 auto 60px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "#FFF4ED",
              color: "#F36B12",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>

          <h3 style={{ fontSize: 20, fontWeight: 800, color: "#17191C", marginBottom: 8 }}>
            {initialProducts.length === 0
              ? "New Products Arriving Soon"
              : "No Products Found"}
          </h3>

          <p style={{ fontSize: 14.5, color: "#6B7280", lineHeight: 1.6, marginBottom: 24 }}>
            {initialProducts.length === 0
              ? "Our product catalog is currently being updated through the Product Management Portal. New smart home arrivals will appear automatically here once uploaded."
              : `We couldn't find any products matching your current filters ${searchQuery ? `for "${searchQuery}"` : ""}. Try resetting your search or choosing another category.`}
          </p>

          <button
            onClick={handleResetFilters}
            type="button"
            style={{
              background: "#F36B12",
              color: "#FFFFFF",
              border: "none",
              padding: "12px 28px",
              borderRadius: 9999,
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(243, 107, 18, 0.3)",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#D9570A")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#F36B12")}
          >
            View All Products
          </button>
        </div>
      )}
    </div>
  )
}
