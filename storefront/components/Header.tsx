"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { useCart } from "@/context/cart-context"
import { useWishlist } from "@/context/wishlist-context"

// ── Icons ─────────────────────────────────────────────────────────────────────

function IcoSearch() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function IcoUser() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function IcoHeart() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function IcoCart() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  )
}

function IcoBurger({ open }: { open: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      {open ? (
        <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
      ) : (
        <><line x1="3" y1="7" x2="21" y2="7" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="17" x2="21" y2="17" /></>
      )}
    </svg>
  )
}

function IcoMail() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" />
    </svg>
  )
}

function IcoChevron({ style }: { style?: React.CSSProperties } = {}) {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6, ...style }}>
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  )
}

// ── Nav items ─────────────────────────────────────────────────────────────────

const SHOP_CATEGORIES = [
  { label: "Custom Wire Harnesses", href: "/products/custom-wire-harness", tag: "Hot" },
  { label: "Cable Assemblies", href: "/products/cable-assembly", tag: "Popular" },
  { label: "Coil & Spiral Cables", href: "/products/coil-spiral-cable", tag: "New" },
  { label: "Overmolded Harnesses", href: "/products/overmolded-harness", tag: "" },
  { label: "High-Voltage & EV", href: "/products/high-voltage-harness", tag: "EV" },
  { label: "PCB Assemblies", href: "/products/pcb-assemblies", tag: "" },
  { label: "Browse All Shop Items", href: "/shop", tag: "View All →" },
]

const PRODUCTS_POPULAR = [
  { label: "Automotive & EV Wire Harness", href: "/products/ev-renewable-energy" },
  { label: "Medical Grade Assemblies", href: "/products/medical-cable-assemblies" },
  { label: "Robotic Umbilical & Coil", href: "/products/hi-flex-robotic-coil-cable" },
  { label: "Circular Connector Assemblies", href: "/products/circular-connector" },
  { label: "Waterproof IP68 Solutions", href: "/products/waterproof-harness" },
  { label: "Control Panel & Industrial", href: "/products/control-panel-wiring" },
]

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { totalItems } = useCart()
  const { wishlistCount } = useWishlist()

  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [shopOpen, setShopOpen] = useState(false)
  const [productsOpen, setProductsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchFocused, setSearchFocused] = useState(false)

  const shopDDRef = useRef<HTMLDivElement>(null)
  const productsDDRef = useRef<HTMLDivElement>(null)

  // Scroll handler for subtle elevation
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close menus on page navigation
  useEffect(() => {
    setMenuOpen(false)
    setShopOpen(false)
    setProductsOpen(false)
  }, [pathname])

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (shopDDRef.current && !shopDDRef.current.contains(e.target as Node)) {
        setShopOpen(false)
      }
      if (productsDDRef.current && !productsDDRef.current.contains(e.target as Node)) {
        setProductsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery("")
      setMenuOpen(false)
    }
  }

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "#FFFFFF",
          transition: "box-shadow 0.25s ease, border-color 0.25s ease",
          boxShadow: scrolled ? "0 4px 20px rgba(84, 32, 200, 0.08)" : "none",
          borderBottom: "1px solid #E5E5EB",
          width: "100%",
        }}
      >
        {/* ── Top Announcement Bar ── */}
        <div
          style={{
            background: "#5420C8",
            color: "#FFFFFF",
            fontSize: "12.5px",
            fontWeight: 500,
            padding: "8px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <div
            style={{
              maxWidth: 1360,
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            {/* Announcement banner */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: "14px" }}>⚡</span>
              <span>Free Shipping on Orders $100+ &middot; Quick 24h Turnaround Quotes</span>
            </div>

            {/* Email & Track Order */}
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <a
                href="mailto:info@claspo.store"
                style={{
                  color: "#FFFFFF",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  textDecoration: "none",
                  fontSize: "12px",
                  opacity: 0.95,
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "0.95")}
              >
                <IcoMail />
                <span>info@claspo.store</span>
              </a>

              <span style={{ opacity: 0.4 }}>|</span>

              <Link
                href="/track-order"
                style={{
                  color: "#FFFFFF",
                  textDecoration: "none",
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                  opacity: 0.95,
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "0.95")}
              >
                Track Order
              </Link>
            </div>
          </div>
        </div>

        {/* ── Main Navigation Bar ── */}
        <div
          style={{
            maxWidth: 1360,
            margin: "0 auto",
            padding: "0 24px",
            height: "76px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20,
          }}
        >
          {/* Left: Brand Logo & Tagline */}
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            {/* Icon Mark */}
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "linear-gradient(135deg, #5420C8 0%, #7B47EE 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                fontWeight: 900,
                fontSize: "20px",
                fontFamily: "var(--font-sora), sans-serif",
                boxShadow: "0 4px 12px rgba(84, 32, 200, 0.28)",
              }}
            >
              C
            </div>

            {/* Typography & Tagline */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: "22px",
                  fontWeight: 900,
                  letterSpacing: "-0.03em",
                  color: "#111111",
                  fontFamily: "var(--font-sora), sans-serif",
                  lineHeight: 1,
                }}
              >
                CLASPO
              </span>
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: 800,
                  letterSpacing: "0.18em",
                  color: "#5420C8",
                  fontFamily: "var(--font-mono), monospace",
                  marginTop: "3px",
                  textTransform: "uppercase",
                }}
              >
                CLICK. PICK. DONE.
              </span>
            </div>
          </Link>

          {/* Center Navigation Links (Desktop) */}
          <nav
            className="claspo-nav-links"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "24px",
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: "14.5px",
              fontWeight: 600,
              color: "#111111",
            }}
          >
            <Link
              href="/"
              style={{
                textDecoration: "none",
                color: pathname === "/" ? "#5420C8" : "#111111",
                padding: "8px 0",
                position: "relative",
                transition: "color 0.2s",
              }}
            >
              Home
            </Link>

            {/* Shop with Dropdown */}
            <div ref={shopDDRef} style={{ position: "relative" }}>
              <button
                onClick={() => setShopOpen(o => !o)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: "14.5px",
                  fontWeight: 600,
                  color: pathname.startsWith("/shop") ? "#5420C8" : "#111111",
                  padding: "8px 0",
                  fontFamily: "inherit",
                }}
                aria-expanded={shopOpen}
              >
                Shop <IcoChevron style={{ transform: shopOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
              </button>

              {shopOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 12px)",
                    left: "-20px",
                    width: "280px",
                    background: "#FFFFFF",
                    borderRadius: "12px",
                    boxShadow: "0 14px 40px rgba(84, 32, 200, 0.12)",
                    border: "1px solid #E5E5EB",
                    padding: "10px",
                    zIndex: 150,
                  }}
                >
                  <div style={{ padding: "6px 12px 10px", borderBottom: "1px solid #F1EBFF" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#5420C8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      Featured Categories
                    </div>
                  </div>
                  <div style={{ padding: "6px 0" }}>
                    {SHOP_CATEGORIES.map(cat => (
                      <Link
                        key={cat.label}
                        href={cat.href}
                        onClick={() => setShopOpen(false)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "9px 12px",
                          borderRadius: "8px",
                          textDecoration: "none",
                          fontSize: "13.5px",
                          color: "#111111",
                          fontWeight: 500,
                          transition: "background 0.15s, color 0.15s",
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = "#F1EBFF"
                          e.currentTarget.style.color = "#5420C8"
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = "transparent"
                          e.currentTarget.style.color = "#111111"
                        }}
                      >
                        <span>{cat.label}</span>
                        {cat.tag && (
                          <span
                            style={{
                              fontSize: "10px",
                              padding: "2px 8px",
                              borderRadius: "9999px",
                              background: cat.tag.includes("→") ? "transparent" : "#F1EBFF",
                              color: "#5420C8",
                              fontWeight: 700,
                            }}
                          >
                            {cat.tag}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Products with Dropdown */}
            <div ref={productsDDRef} style={{ position: "relative" }}>
              <button
                onClick={() => setProductsOpen(o => !o)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: "14.5px",
                  fontWeight: 600,
                  color: pathname.startsWith("/products") ? "#5420C8" : "#111111",
                  padding: "8px 0",
                  fontFamily: "inherit",
                }}
                aria-expanded={productsOpen}
              >
                Products <IcoChevron style={{ transform: productsOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
              </button>

              {productsOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 12px)",
                    left: "-40px",
                    width: "300px",
                    background: "#FFFFFF",
                    borderRadius: "12px",
                    boxShadow: "0 14px 40px rgba(84, 32, 200, 0.12)",
                    border: "1px solid #E5E5EB",
                    padding: "10px",
                    zIndex: 150,
                  }}
                >
                  <div style={{ padding: "6px 12px 10px", borderBottom: "1px solid #F1EBFF" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#5420C8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      Engineering Solutions
                    </div>
                  </div>
                  <div style={{ padding: "6px 0" }}>
                    {PRODUCTS_POPULAR.map(prod => (
                      <Link
                        key={prod.label}
                        href={prod.href}
                        onClick={() => setProductsOpen(false)}
                        style={{
                          display: "block",
                          padding: "9px 12px",
                          borderRadius: "8px",
                          textDecoration: "none",
                          fontSize: "13.5px",
                          color: "#111111",
                          fontWeight: 500,
                          transition: "background 0.15s, color 0.15s",
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = "#F1EBFF"
                          e.currentTarget.style.color = "#5420C8"
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = "transparent"
                          e.currentTarget.style.color = "#111111"
                        }}
                      >
                        {prod.label}
                      </Link>
                    ))}
                    <div style={{ marginTop: 6, borderTop: "1px solid #EFEFF4", paddingTop: 6 }}>
                      <Link
                        href="/products"
                        onClick={() => setProductsOpen(false)}
                        style={{
                          display: "block",
                          padding: "8px 12px",
                          fontSize: "12.5px",
                          color: "#5420C8",
                          fontWeight: 700,
                          textDecoration: "none",
                        }}
                      >
                        View All 30+ Product Pages &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/about"
              style={{
                textDecoration: "none",
                color: pathname === "/about" ? "#5420C8" : "#111111",
                padding: "8px 0",
                transition: "color 0.2s",
              }}
            >
              About Us
            </Link>

            <Link
              href="/contact"
              style={{
                textDecoration: "none",
                color: pathname === "/contact" ? "#5420C8" : "#111111",
                padding: "8px 0",
                transition: "color 0.2s",
              }}
            >
              Contact
            </Link>

            <Link
              href="/blog"
              style={{
                textDecoration: "none",
                color: pathname.startsWith("/blog") ? "#5420C8" : "#111111",
                padding: "8px 0",
                transition: "color 0.2s",
              }}
            >
              Blogs
            </Link>
          </nav>

          {/* Right Action Icons & Search */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Search Input (Desktop) */}
            <form
              onSubmit={handleSearchSubmit}
              className="claspo-header-search"
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
              }}
            >
              <input
                type="text"
                placeholder="Search products, parts..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                style={{
                  padding: "9px 14px 9px 36px",
                  borderRadius: "9999px",
                  border: searchFocused ? "1.5px solid #5420C8" : "1px solid #E5E5EB",
                  background: searchFocused ? "#FFFFFF" : "#F7F7F9",
                  fontSize: "13px",
                  width: searchFocused ? "240px" : "190px",
                  outline: "none",
                  transition: "all 0.25s ease",
                  fontFamily: "inherit",
                  color: "#111111",
                }}
              />
              <button
                type="submit"
                aria-label="Search"
                style={{
                  position: "absolute",
                  left: "11px",
                  background: "none",
                  border: "none",
                  color: searchFocused ? "#5420C8" : "#707070",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  padding: 0,
                }}
              >
                <IcoSearch />
              </button>
            </form>

            {/* Account Icon */}
            <Link
              href="/track-order"
              aria-label="User Account"
              title="Track Order / Account"
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#111111",
                background: "#F7F7F9",
                border: "1px solid #E5E5EB",
                textDecoration: "none",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "#F1EBFF"
                e.currentTarget.style.color = "#5420C8"
                e.currentTarget.style.borderColor = "#5420C8"
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "#F7F7F9"
                e.currentTarget.style.color = "#111111"
                e.currentTarget.style.borderColor = "#E5E5EB"
              }}
            >
              <IcoUser />
            </Link>

            {/* Wishlist Icon with Item Count */}
            <Link
              href="/shop"
              aria-label="Wishlist"
              title="Wishlist"
              style={{
                position: "relative",
                width: 40,
                height: 40,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: wishlistCount > 0 ? "#5420C8" : "#111111",
                background: wishlistCount > 0 ? "#F1EBFF" : "#F7F7F9",
                border: wishlistCount > 0 ? "1px solid #5420C8" : "1px solid #E5E5EB",
                textDecoration: "none",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "#F1EBFF"
                e.currentTarget.style.color = "#5420C8"
                e.currentTarget.style.borderColor = "#5420C8"
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = wishlistCount > 0 ? "#F1EBFF" : "#F7F7F9"
                e.currentTarget.style.color = wishlistCount > 0 ? "#5420C8" : "#111111"
                e.currentTarget.style.borderColor = wishlistCount > 0 ? "#5420C8" : "#E5E5EB"
              }}
            >
              <IcoHeart />
              {wishlistCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -4,
                    background: "#5420C8",
                    color: "#FFFFFF",
                    fontSize: "10.5px",
                    fontWeight: 800,
                    minWidth: "18px",
                    height: "18px",
                    borderRadius: "9999px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 4px",
                    boxShadow: "0 2px 6px rgba(84, 32, 200, 0.4)",
                  }}
                >
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Shopping Cart Icon with Item Count */}
            <Link
              href="/cart"
              aria-label="Shopping Cart"
              title="Shopping Cart"
              style={{
                position: "relative",
                width: 40,
                height: 40,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: totalItems > 0 ? "#FFFFFF" : "#111111",
                background: totalItems > 0 ? "#5420C8" : "#F7F7F9",
                border: totalItems > 0 ? "1px solid #5420C8" : "1px solid #E5E5EB",
                textDecoration: "none",
                transition: "all 0.2s",
                boxShadow: totalItems > 0 ? "0 4px 12px rgba(84, 32, 200, 0.3)" : "none",
              }}
              onMouseEnter={e => {
                if (totalItems === 0) {
                  e.currentTarget.style.background = "#F1EBFF"
                  e.currentTarget.style.color = "#5420C8"
                  e.currentTarget.style.borderColor = "#5420C8"
                }
              }}
              onMouseLeave={e => {
                if (totalItems === 0) {
                  e.currentTarget.style.background = "#F7F7F9"
                  e.currentTarget.style.color = "#111111"
                  e.currentTarget.style.borderColor = "#E5E5EB"
                }
              }}
            >
              <IcoCart />
              {totalItems > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -4,
                    background: "#111111",
                    color: "#FFFFFF",
                    fontSize: "10.5px",
                    fontWeight: 800,
                    minWidth: "18px",
                    height: "18px",
                    borderRadius: "9999px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 4px",
                    border: "1.5px solid #FFFFFF",
                  }}
                >
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="claspo-mobile-toggle"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              style={{
                background: "#F7F7F9",
                border: "1px solid #E5E5EB",
                width: 40,
                height: 40,
                borderRadius: "10px",
                cursor: "pointer",
                display: "none",
                alignItems: "center",
                justifyContent: "center",
                color: "#111111",
              }}
            >
              <IcoBurger open={menuOpen} />
            </button>
          </div>
        </div>

        {/* ── Mobile Navigation Drawer ── */}
        {menuOpen && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 200,
              backdropFilter: "blur(4px)",
            }}
            onClick={() => setMenuOpen(false)}
          >
            <div
              style={{
                width: "82%",
                maxWidth: "340px",
                height: "100%",
                background: "#FFFFFF",
                boxShadow: "0 0 30px rgba(0,0,0,0.2)",
                padding: "24px 20px",
                display: "flex",
                flexDirection: "column",
                overflowY: "auto",
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header inside drawer */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid #E5E5EB" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: "#5420C8", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>
                    C
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: "18px", color: "#111" }}>CLASPO</div>
                    <div style={{ fontSize: "9px", color: "#5420C8", fontWeight: 700, letterSpacing: "0.1em" }}>CLICK. PICK. DONE.</div>
                  </div>
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  style={{ background: "#F7F7F9", border: "none", width: 32, height: 32, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  ✕
                </button>
              </div>

              {/* Mobile Search */}
              <form onSubmit={handleSearchSubmit} style={{ marginBottom: 20 }}>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px 10px 36px",
                      borderRadius: "8px",
                      border: "1px solid #E5E5EB",
                      background: "#F7F7F9",
                      fontSize: "13.5px",
                    }}
                  />
                  <span style={{ position: "absolute", left: 12, top: 11, color: "#707070" }}>
                    <IcoSearch />
                  </span>
                </div>
              </form>

              {/* Mobile links */}
              <nav style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                <Link href="/" style={{ padding: "10px 12px", borderRadius: 8, textDecoration: "none", color: "#111", fontWeight: 600, fontSize: "15px" }}>Home</Link>
                <Link href="/shop" style={{ padding: "10px 12px", borderRadius: 8, textDecoration: "none", color: "#111", fontWeight: 600, fontSize: "15px" }}>Shop Catalog</Link>
                <Link href="/products" style={{ padding: "10px 12px", borderRadius: 8, textDecoration: "none", color: "#111", fontWeight: 600, fontSize: "15px" }}>Products & Categories</Link>
                <Link href="/about" style={{ padding: "10px 12px", borderRadius: 8, textDecoration: "none", color: "#111", fontWeight: 600, fontSize: "15px" }}>About Us</Link>
                <Link href="/contact" style={{ padding: "10px 12px", borderRadius: 8, textDecoration: "none", color: "#111", fontWeight: 600, fontSize: "15px" }}>Contact & Quote</Link>
                <Link href="/blog" style={{ padding: "10px 12px", borderRadius: 8, textDecoration: "none", color: "#111", fontWeight: 600, fontSize: "15px" }}>Blogs</Link>
                <Link href="/track-order" style={{ padding: "10px 12px", borderRadius: 8, textDecoration: "none", color: "#5420C8", fontWeight: 700, fontSize: "15px" }}>Track Your Order</Link>
              </nav>

              {/* Mobile Footer in drawer */}
              <div style={{ paddingTop: 20, borderTop: "1px solid #E5E5EB", fontSize: "12px", color: "#707070" }}>
                <div>Email: <a href="mailto:info@claspo.store" style={{ color: "#5420C8", fontWeight: 600 }}>info@claspo.store</a></div>
                <div style={{ marginTop: 6 }}>Phone: +1 734 891 0248</div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Media query helper style for header responsiveness */}
      <style jsx global>{`
        @media (max-width: 900px) {
          .claspo-nav-links,
          .claspo-header-search {
            display: none !important;
          }
          .claspo-mobile-toggle {
            display: flex !important;
          }
        }
      `}</style>
    </>
  )
}
