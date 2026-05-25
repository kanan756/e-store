"use client"

import { useState, useMemo, useEffect } from "react"
import type { Product } from "@/lib/sheets"
import ProductCard from "./ProductCard"

interface ShopFiltersProps {
  initialProducts: Product[]
  initialQuery?: string
}

export default function ShopFilters({ initialProducts, initialQuery = "" }: ShopFiltersProps) {
  const [search, setSearch] = useState(initialQuery)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [minPrice, setMinPrice] = useState<string>("")
  const [maxPrice, setMaxPrice] = useState<string>("")
  const [inStockOnly, setInStockOnly] = useState(false)
  const [sortOrder, setSortOrder] = useState<"" | "low-high" | "high-low">("")
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // Disable body scroll when mobile filter is open
  useEffect(() => {
    if (mobileFiltersOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [mobileFiltersOpen])

  const maxPossiblePrice = useMemo(() => {
    if (!initialProducts.length) return 10000;
    return Math.max(...initialProducts.map(p => p.price));
  }, [initialProducts])

  const categories = useMemo(() => {
    const cats = new Set<string>()
    initialProducts.forEach(p => {
      if (p.category) cats.add(p.category)
    })
    return Array.from(cats).sort()
  }, [initialProducts])

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  const filteredProducts = useMemo(() => {
    return initialProducts.filter(p => {
      // Search text
      if (search) {
        const q = search.toLowerCase()
        if (!p.name.toLowerCase().includes(q) && !p.category.toLowerCase().includes(q)) {
          return false
        }
      }
      
      // Category
      if (selectedCategories.length > 0) {
        if (!selectedCategories.includes(p.category)) {
          return false
        }
      }

      // Price
      if (minPrice && p.price < Number(minPrice)) return false
      if (maxPrice && p.price > Number(maxPrice)) return false

      // Availability
      if (inStockOnly && !p.inStock) return false

      return true
    }).sort((a, b) => {
      if (sortOrder === "low-high") return a.price - b.price
      if (sortOrder === "high-low") return b.price - a.price
      return 0
    })
  }, [initialProducts, search, selectedCategories, minPrice, maxPrice, inStockOnly, sortOrder])

  // Re-trigger reveal animation when filtered products change.
  // io is declared outside the timeout so cleanup can disconnect it whether
  // or not the 50ms timer has fired — prevents orphaned observer accumulation.
  useEffect(() => {
    let io: IntersectionObserver | null = null

    const timeoutId = setTimeout(() => {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) e.target.classList.add("in")
          })
        },
        { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
      )
      document.querySelectorAll(".shop-container .rv").forEach((el) => io!.observe(el))
    }, 50)

    return () => {
      clearTimeout(timeoutId)
      io?.disconnect()
    }
  }, [filteredProducts])

  return (
    <div className="shop-layout" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 32 }}>
      
      {/* Mobile/Desktop responsive layout: we'll use CSS grid. 
          On desktop: 280px 1fr
          On mobile: 1fr */}
      <style dangerouslySetInnerHTML={{__html: `
        .shop-container {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
          align-items: start;
        }
        
        .mobile-filter-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 14px;
          background: var(--bg2);
          border: 1px solid var(--bd);
          border-radius: 8px;
          font-family: var(--font-sora);
          font-weight: 700;
          cursor: pointer;
          margin-bottom: 24px;
          color: var(--text);
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        /* Mobile Drawer Defaults */
        .shop-sidebar {
          position: fixed;
          top: 0;
          left: -100%;
          width: 320px;
          max-width: 85vw;
          height: 100vh;
          background: var(--bg);
          z-index: 9999;
          padding: 24px;
          overflow-y: auto;
          transition: left 0.3s ease;
          box-shadow: 4px 0 24px rgba(0,0,0,0.5);
          border-right: 1px solid var(--bd);
        }
        .shop-sidebar.open {
          left: 0;
        }
        .sidebar-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 9998;
          backdrop-filter: blur(4px);
        }
        .sidebar-overlay.open {
          display: block;
        }
        .sidebar-close-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--bd);
          font-family: var(--font-sora);
          font-weight: 800;
          font-size: 18px;
        }

        @media (min-width: 900px) {
          .shop-container {
            grid-template-columns: 280px 1fr;
            gap: 64px;
          }
          .mobile-filter-btn {
            display: none;
          }
          .shop-sidebar {
            position: static;
            width: auto;
            max-width: none;
            height: auto;
            padding: 0;
            overflow-y: visible;
            box-shadow: none;
            border-right: none;
            transition: none;
          }
          .sidebar-overlay {
            display: none !important;
          }
          .sidebar-close-btn {
            display: none;
          }
        }
        .filter-section {
          margin-bottom: 32px;
          padding-bottom: 32px;
          border-bottom: 1px solid var(--bd);
        }
        .filter-title {
          font-family: var(--font-sora);
          font-weight: 700;
          font-size: 16px;
          margin-bottom: 16px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .filter-label {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
          cursor: pointer;
          color: var(--text2);
          font-size: 15px;
        }
        .filter-label:hover {
          color: var(--text);
        }
        .price-input {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid var(--bd);
          border-radius: 8px;
          background: transparent;
          color: var(--text);
          font-family: var(--font-inter);
        }
        .price-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          align-items: center;
        }
      `}} />

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div className="lbl" style={{ marginBottom: 16 }}>ALL PRODUCTS</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <h1 className="D2">{search ? `Search: "${search}"` : "Shop Everything"}</h1>
          <div style={{ color: "var(--text2)", fontSize: 15 }}>
            Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Mobile Toggle Button */}
      <button className="mobile-filter-btn" onClick={() => setMobileFiltersOpen(true)}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/></svg>
        Filter Products
      </button>

      {/* Overlay for Mobile */}
      <div 
        className={`sidebar-overlay ${mobileFiltersOpen ? 'open' : ''}`} 
        onClick={() => setMobileFiltersOpen(false)}
      />

      <div className="shop-container">
        
        {/* Sidebar */}
        <aside className={`shop-sidebar ${mobileFiltersOpen ? 'open' : ''}`}>
          
          <div className="sidebar-close-btn">
            Filters
            <button onClick={() => setMobileFiltersOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text)", fontSize: 24, cursor: "pointer" }}>&times;</button>
          </div>

          <div className="filter-section">
            <input 
              type="text" 
              placeholder="Search products..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="price-input"
              style={{ marginBottom: 8 }}
            />
          </div>

          {categories.length > 0 && (
            <div className="filter-section">
              <div className="filter-title">Categories</div>
              {categories.map(cat => (
                <label key={cat} className="filter-label">
                  <input 
                    type="checkbox" 
                    checked={selectedCategories.includes(cat)}
                    onChange={() => toggleCategory(cat)}
                    style={{ accentColor: "var(--acc)", width: 16, height: 16 }}
                  />
                  {cat}
                </label>
              ))}
            </div>
          )}

          <div className="filter-section">
            <div className="filter-title">Price Range</div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--text2)", marginBottom: 8 }}>
                <span>Min: ${minPrice || "0"}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max={maxPossiblePrice} 
                step="100"
                value={minPrice || "0"}
                onChange={e => setMinPrice(e.target.value)}
                style={{ width: "100%", accentColor: "var(--acc)", cursor: "pointer" }}
              />
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--text2)", marginBottom: 8 }}>
                <span>Max: ${maxPrice || maxPossiblePrice}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max={maxPossiblePrice} 
                step="100"
                value={maxPrice || maxPossiblePrice}
                onChange={e => setMaxPrice(e.target.value)}
                style={{ width: "100%", accentColor: "var(--acc)", cursor: "pointer" }}
              />
            </div>
          </div>

          <div className="filter-section">
            <div className="filter-title">Sort By</div>
            {(["", "low-high", "high-low"] as const).map((val) => {
              const label = val === "" ? "Default" : val === "low-high" ? "Price: Low to High" : "Price: High to Low"
              return (
                <label key={val} className="filter-label">
                  <input
                    type="radio"
                    name="sortOrder"
                    checked={sortOrder === val}
                    onChange={() => setSortOrder(val)}
                    style={{ accentColor: "var(--acc)", width: 16, height: 16 }}
                  />
                  {label}
                </label>
              )
            })}
          </div>

          <div className="filter-section" style={{ borderBottom: "none" }}>
            <div className="filter-title">Availability</div>
            <label className="filter-label">
              <input 
                type="checkbox" 
                checked={inStockOnly}
                onChange={e => setInStockOnly(e.target.checked)}
                style={{ accentColor: "var(--acc)", width: 16, height: 16 }}
              />
              In Stock Only
            </label>
          </div>

          {(selectedCategories.length > 0 || minPrice || maxPrice || inStockOnly || search || sortOrder) && (
            <button
              onClick={() => {
                setSearch("")
                setSelectedCategories([])
                setMinPrice("")
                setMaxPrice("")
                setInStockOnly(false)
                setSortOrder("")
              }}
              className="btn bod" 
              style={{ width: "100%", justifyContent: "center" }}
            >
              Clear All Filters
            </button>
          )}

        </aside>

        {/* Grid */}
        <div>
          {filteredProducts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text2)", background: "rgba(0,109,55,0.02)", borderRadius: "var(--rL)", border: "1px dashed var(--bd)" }}>
              <p>No products match your filters.</p>
              <button
                onClick={() => {
                  setSearch("")
                  setSelectedCategories([])
                  setMinPrice("")
                  setMaxPrice("")
                  setInStockOnly(false)
                  setSortOrder("")
                }}
                className="btn bod"
                style={{ marginTop: 16 }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="prodG">
              {filteredProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
