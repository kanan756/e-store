"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { useSession, signOut } from "next-auth/react"
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
  { label: "Kitchen Essentials", href: "/shop?category=Kitchen+Essentials", tag: "Hot" },
  { label: "Home Organization", href: "/shop?category=Home+Organization", tag: "Popular" },
  { label: "Storage Solutions", href: "/shop?category=Storage+Solutions", tag: "New" },
  { label: "Cleaning Essentials", href: "/shop?category=Cleaning+Essentials", tag: "" },
  { label: "Adhesive Solutions", href: "/shop?category=Adhesive+Solutions", tag: "No-Drill" },
  { label: "Bathroom Accessories", href: "/shop?category=Bathroom+Accessories", tag: "" },
  { label: "Browse All Products", href: "/shop", tag: "View All →" },
]

const PRODUCTS_POPULAR = [
  { label: "Kitchen Tools & Gadgets", href: "/shop?category=Kitchen+Essentials" },
  { label: "Home Organization & Storage", href: "/shop?category=Home+Organization" },
  { label: "Cleaning Essentials", href: "/shop?category=Cleaning+Essentials" },
  { label: "Adhesive & No-Drill Solutions", href: "/shop?category=Adhesive+Solutions" },
  { label: "Space-Saving Products", href: "/shop?category=Storage+Solutions" },
  { label: "Bathroom Accessories", href: "/shop?category=Bathroom+Accessories" },
]

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { totalItems } = useCart()
  const { wishlistCount } = useWishlist()

  const [scrolled, setScrolled] = useState(false)
  const { data: session, status } = useSession()
  const [shopOpen, setShopOpen] = useState(false)
  const [productsOpen, setProductsOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchFocused, setSearchFocused] = useState(false)

  const shopDDRef = useRef<HTMLDivElement>(null)
  const productsDDRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (shopDDRef.current && !shopDDRef.current.contains(e.target as Node)) {
        setShopOpen(false)
      }
      if (productsDDRef.current && !productsDDRef.current.contains(e.target as Node)) {
        setProductsOpen(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Close menus on path change
  useEffect(() => {
    setShopOpen(false)
    setProductsOpen(false)
    setMenuOpen(false)
    setUserMenuOpen(false)
  }, [pathname])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const isHome = pathname === "/"
  const isShop = pathname.startsWith("/shop")
  const isProducts = pathname.startsWith("/products")
  const isAbout = pathname === "/about"
  const isContact = pathname === "/contact"
  const isBlog = pathname.startsWith("/blog")

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: "#FFFFFF",
          boxShadow: scrolled ? "0 4px 20px rgba(0, 0, 0, 0.06)" : "none",
          borderBottom: "1px solid #E5E5E5",
          transition: "box-shadow 0.25s ease, background 0.25s ease",
        }}
      >
        {/* ── Top Announcement Bar (Charcoal with Orange accent) ── */}
        <div
          style={{
            background: "#303638",
            color: "#FFFFFF",
            fontSize: "12px",
            lineHeight: 1.4,
            padding: "8px 24px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <div
            style={{
              maxWidth: 1360,
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
            }}
          >
            {/* Free shipping & tagline */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 500 }}>
              <span style={{ color: "#F36B12", fontSize: "14px" }}>⚡</span>
              <span>Free Shipping on Orders $100+ &middot; Smart Solutions for Everyday Living</span>
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
                  opacity: 0.9,
                  transition: "opacity 0.2s, color 0.2s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = "#F36B12"
                  e.currentTarget.style.opacity = "1"
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = "#FFFFFF"
                  e.currentTarget.style.opacity = "0.9"
                }}
              >
                <IcoMail />
                <span>info@claspo.store</span>
              </a>

              <span style={{ opacity: 0.3 }}>|</span>

              <Link
                href="/track-order"
                style={{
                  color: "#FFFFFF",
                  textDecoration: "none",
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                  opacity: 0.9,
                  transition: "opacity 0.2s, color 0.2s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = "#F36B12"
                  e.currentTarget.style.opacity = "1"
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = "#FFFFFF"
                  e.currentTarget.style.opacity = "0.9"
                }}
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
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            <div style={{ position: "relative", width: 154, height: 46 }}>
              <Image
                src="/images/claspo-latest-logo.png"
                alt="CLASPO™ - SMART HOME SOLUTIONS"
                fill
                style={{ objectFit: "contain" }}
                priority
                unoptimized
              />
            </div>
          </Link>

          {/* Center Navigation Links (Desktop) */}
          <nav
            className="claspo-nav-links"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "28px",
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: "14.5px",
              fontWeight: 600,
              color: "#17191C",
            }}
          >
            <Link
              href="/"
              style={{
                textDecoration: "none",
                color: isHome ? "#F36B12" : "#17191C",
                padding: "8px 0",
                position: "relative",
                borderBottom: isHome ? "2px solid #F36B12" : "2px solid transparent",
                transition: "border-color 0.2s, color 0.2s",
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
                  color: isShop ? "#F36B12" : "#17191C",
                  padding: "8px 0",
                  borderBottom: isShop ? "2px solid #F36B12" : "2px solid transparent",
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
                    borderRadius: "8px",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
                    border: "1px solid #E5E5E5",
                    padding: "10px",
                    zIndex: 150,
                  }}
                >
                  <div style={{ padding: "6px 12px 10px", borderBottom: "1px solid #E5E5E5" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#17191C", textTransform: "uppercase", letterSpacing: "0.06em" }}>
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
                          borderRadius: "6px",
                          textDecoration: "none",
                          fontSize: "13.5px",
                          color: "#17191C",
                          fontWeight: 500,
                          transition: "background 0.15s, color 0.15s",
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = "#FFF0E5"
                          e.currentTarget.style.color = "#F36B12"
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = "transparent"
                          e.currentTarget.style.color = "#17191C"
                        }}
                      >
                        <span>{cat.label}</span>
                        {cat.tag && (
                          <span
                            style={{
                              fontSize: "10px",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              background: cat.tag.includes("→") ? "transparent" : "#FFF0E5",
                              color: "#F36B12",
                              fontWeight: 700,
                              border: cat.tag.includes("→") ? "none" : "1px solid #F36B12",
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
                  color: isProducts ? "#F36B12" : "#17191C",
                  padding: "8px 0",
                  borderBottom: isProducts ? "2px solid #F36B12" : "2px solid transparent",
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
                    borderRadius: "8px",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
                    border: "1px solid #E5E5E5",
                    padding: "10px",
                    zIndex: 150,
                  }}
                >
                  <div style={{ padding: "6px 12px 10px", borderBottom: "1px solid #E5E5E5" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#17191C", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      Home Solutions
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
                          borderRadius: "6px",
                          textDecoration: "none",
                          fontSize: "13.5px",
                          color: "#17191C",
                          fontWeight: 500,
                          transition: "background 0.15s, color 0.15s",
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = "#FFF0E5"
                          e.currentTarget.style.color = "#F36B12"
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = "transparent"
                          e.currentTarget.style.color = "#17191C"
                        }}
                      >
                        {prod.label}
                      </Link>
                    ))}
                    <div style={{ marginTop: 6, borderTop: "1px solid #E5E5E5", paddingTop: 6 }}>
                      <Link
                        href="/products"
                        onClick={() => setProductsOpen(false)}
                        style={{
                          display: "block",
                          padding: "8px 12px",
                          fontSize: "12.5px",
                          color: "#F36B12",
                          fontWeight: 700,
                          textDecoration: "none",
                        }}
                      >
                        View All Collections &rarr;
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
                color: isAbout ? "#F36B12" : "#17191C",
                padding: "8px 0",
                borderBottom: isAbout ? "2px solid #F36B12" : "2px solid transparent",
                transition: "border-color 0.2s, color 0.2s",
              }}
            >
              About Us
            </Link>

            <Link
              href="/contact"
              style={{
                textDecoration: "none",
                color: isContact ? "#F36B12" : "#17191C",
                padding: "8px 0",
                borderBottom: isContact ? "2px solid #F36B12" : "2px solid transparent",
                transition: "border-color 0.2s, color 0.2s",
              }}
            >
              Contact
            </Link>

            <Link
              href="/blog"
              style={{
                textDecoration: "none",
                color: isBlog ? "#F36B12" : "#17191C",
                padding: "8px 0",
                borderBottom: isBlog ? "2px solid #F36B12" : "2px solid transparent",
                transition: "border-color 0.2s, color 0.2s",
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
                placeholder="Search products..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                style={{
                  padding: "9px 14px 9px 36px",
                  borderRadius: "6px",
                  border: searchFocused ? "1.5px solid #F36B12" : "1px solid #E5E5E5",
                  background: searchFocused ? "#FFFFFF" : "#F5F5F5",
                  fontSize: "13px",
                  width: searchFocused ? "230px" : "190px",
                  outline: "none",
                  transition: "all 0.2s ease",
                  fontFamily: "inherit",
                  color: "#17191C",
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
                  color: searchFocused ? "#F36B12" : "#747474",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  padding: 0,
                }}
              >
                <IcoSearch />
              </button>
            </form>

            {/* Account Menu */}
            <div ref={userMenuRef} style={{ position: "relative" }}>
              {status === "authenticated" && session?.user ? (
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(o => !o)}
                  aria-label="User Account"
                  title={session.user.name || session.user.email || "Account"}
                  style={{
                    height: 40,
                    padding: "0 12px",
                    borderRadius: 20,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    color: "#17191C",
                    background: userMenuOpen ? "#FFF0E5" : "#F5F5F5",
                    border: userMenuOpen ? "1px solid #F36B12" : "1px solid #E5E5E5",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  <span
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      background: "#F36B12",
                      color: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    {(session.user.name || session.user.email || "U").charAt(0).toUpperCase()}
                  </span>
                  <span style={{ maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {(session.user as any).username || session.user.name?.split(" ")[0] || "Account"}
                  </span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: userMenuOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              ) : (
                <Link
                  href="/login"
                  aria-label="Sign In / Register"
                  title="Sign In / Register"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#17191C",
                    background: "#F5F5F5",
                    border: "1px solid #E5E5E5",
                    textDecoration: "none",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "#FFF0E5"
                    e.currentTarget.style.color = "#F36B12"
                    e.currentTarget.style.borderColor = "#F36B12"
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "#F5F5F5"
                    e.currentTarget.style.color = "#17191C"
                    e.currentTarget.style.borderColor = "#E5E5E5"
                  }}
                >
                  <IcoUser />
                </Link>
              )}

              {/* User Dropdown */}
              {userMenuOpen && status === "authenticated" && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    right: 0,
                    width: 220,
                    background: "#FFFFFF",
                    borderRadius: 10,
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.12)",
                    border: "1px solid #E5E5E5",
                    padding: "8px 0",
                    zIndex: 200,
                  }}
                >
                  <div style={{ padding: "10px 16px", borderBottom: "1px solid #F0F0F0" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#17191C" }}>
                      {session?.user?.name || "Customer"}
                    </div>
                    <div style={{ fontSize: 11.5, color: "#747474", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {session?.user?.email}
                    </div>
                  </div>

                  <Link
                    href="/account"
                    onClick={() => setUserMenuOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 16px",
                      fontSize: 13.5,
                      color: "#17191C",
                      textDecoration: "none",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#FFF0E5")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    My Account
                  </Link>

                  <Link
                    href="/track-order"
                    onClick={() => setUserMenuOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 16px",
                      fontSize: 13.5,
                      color: "#17191C",
                      textDecoration: "none",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#FFF0E5")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                    Track Order
                  </Link>

                  {(session?.user as any)?.role === "admin" && (
                    <Link
                      href="/admin/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 16px",
                        fontSize: 13.5,
                        color: "#F36B12",
                        fontWeight: 700,
                        textDecoration: "none",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#FFF0E5")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                      Admin Dashboard
                    </Link>
                  )}

                  <div style={{ height: 1, background: "#F0F0F0", margin: "6px 0" }} />

                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false)
                      signOut({ callbackUrl: "/login" })
                    }}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 16px",
                      fontSize: 13.5,
                      color: "#ef4444",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>

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
                color: "#17191C",
                background: "#F5F5F5",
                border: "1px solid #E5E5E5",
                textDecoration: "none",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "#FFF0E5"
                e.currentTarget.style.color = "#F36B12"
                e.currentTarget.style.borderColor = "#F36B12"
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "#F5F5F5"
                e.currentTarget.style.color = "#17191C"
                e.currentTarget.style.borderColor = "#E5E5E5"
              }}
            >
              <IcoHeart />
              {wishlistCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -4,
                    background: "#F36B12",
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
                    boxShadow: "0 2px 6px rgba(243, 107, 18, 0.4)",
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
                color: totalItems > 0 ? "#FFFFFF" : "#17191C",
                background: totalItems > 0 ? "#F36B12" : "#F5F5F5",
                border: totalItems > 0 ? "1px solid #F36B12" : "1px solid #E5E5E5",
                textDecoration: "none",
                transition: "all 0.2s",
                boxShadow: totalItems > 0 ? "0 4px 12px rgba(243, 107, 18, 0.3)" : "none",
              }}
              onMouseEnter={e => {
                if (totalItems === 0) {
                  e.currentTarget.style.background = "#FFF0E5"
                  e.currentTarget.style.color = "#F36B12"
                  e.currentTarget.style.borderColor = "#F36B12"
                } else {
                  e.currentTarget.style.background = "#D9570A"
                }
              }}
              onMouseLeave={e => {
                if (totalItems === 0) {
                  e.currentTarget.style.background = "#F5F5F5"
                  e.currentTarget.style.color = "#17191C"
                  e.currentTarget.style.borderColor = "#E5E5E5"
                } else {
                  e.currentTarget.style.background = "#F36B12"
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
                    background: "#303638",
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
                background: "#F5F5F5",
                border: "1px solid #E5E5E5",
                width: 40,
                height: 40,
                borderRadius: "6px",
                cursor: "pointer",
                display: "none",
                alignItems: "center",
                justifyContent: "center",
                color: "#17191C",
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
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid #E5E5E5" }}>
                <div style={{ position: "relative", width: 140, height: 42 }}>
                  <Image
                    src="/images/claspo-latest-logo.png"
                    alt="CLASPO™ - SMART HOME SOLUTIONS"
                    fill
                    style={{ objectFit: "contain" }}
                    unoptimized
                  />
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  style={{ background: "#F5F5F5", border: "1px solid #E5E5E5", width: 32, height: 32, borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
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
                      borderRadius: "6px",
                      border: "1px solid #E5E5E5",
                      background: "#F5F5F5",
                      fontSize: "13.5px",
                      color: "#17191C",
                      outline: "none",
                    }}
                  />
                  <span style={{ position: "absolute", left: 12, top: 11, color: "#747474" }}>
                    <IcoSearch />
                  </span>
                </div>
              </form>

              {/* Mobile links */}
              <nav style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                <Link href="/" style={{ padding: "10px 12px", borderRadius: 6, textDecoration: "none", color: isHome ? "#F36B12" : "#17191C", background: isHome ? "#FFF0E5" : "transparent", fontWeight: 600, fontSize: "15px" }}>Home</Link>
                <Link href="/shop" style={{ padding: "10px 12px", borderRadius: 6, textDecoration: "none", color: isShop ? "#F36B12" : "#17191C", background: isShop ? "#FFF0E5" : "transparent", fontWeight: 600, fontSize: "15px" }}>Shop Catalog</Link>
                <Link href="/products" style={{ padding: "10px 12px", borderRadius: 6, textDecoration: "none", color: isProducts ? "#F36B12" : "#17191C", background: isProducts ? "#FFF0E5" : "transparent", fontWeight: 600, fontSize: "15px" }}>Products & Categories</Link>
                <Link href="/about" style={{ padding: "10px 12px", borderRadius: 6, textDecoration: "none", color: isAbout ? "#F36B12" : "#17191C", background: isAbout ? "#FFF0E5" : "transparent", fontWeight: 600, fontSize: "15px" }}>About Us</Link>
                <Link href="/contact" style={{ padding: "10px 12px", borderRadius: 6, textDecoration: "none", color: isContact ? "#F36B12" : "#17191C", background: isContact ? "#FFF0E5" : "transparent", fontWeight: 600, fontSize: "15px" }}>Contact</Link>
                <Link href="/blog" style={{ padding: "10px 12px", borderRadius: 6, textDecoration: "none", color: isBlog ? "#F36B12" : "#17191C", background: isBlog ? "#FFF0E5" : "transparent", fontWeight: 600, fontSize: "15px" }}>Blogs</Link>
                <Link href="/track-order" style={{ padding: "10px 12px", borderRadius: 6, textDecoration: "none", color: "#17191C", fontWeight: 600, fontSize: "15px" }}>Track Your Order</Link>

                <div style={{ height: 1, background: "#E5E5E5", margin: "8px 0" }} />

                {status === "authenticated" && session?.user ? (
                  <>
                    <div style={{ padding: "6px 12px", fontSize: "12px", color: "#747474" }}>
                      Signed in as <strong style={{ color: "#17191C" }}>{session.user.name || session.user.email}</strong>
                    </div>
                    <Link href="/account" onClick={() => setMenuOpen(false)} style={{ padding: "10px 12px", borderRadius: 6, textDecoration: "none", color: "#F36B12", fontWeight: 700, fontSize: "15px", background: "#FFF0E5" }}>My Account</Link>
                    {(session.user as any)?.role === "admin" && (
                      <Link href="/admin/dashboard" onClick={() => setMenuOpen(false)} style={{ padding: "10px 12px", borderRadius: 6, textDecoration: "none", color: "#17191C", fontWeight: 700, fontSize: "15px" }}>Admin Dashboard</Link>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false)
                        signOut({ callbackUrl: "/login" })
                      }}
                      style={{ padding: "10px 12px", borderRadius: 6, textDecoration: "none", color: "#ef4444", fontWeight: 600, fontSize: "15px", background: "transparent", border: "none", textAlign: "left", cursor: "pointer" }}
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setMenuOpen(false)} style={{ padding: "10px 12px", borderRadius: 6, textDecoration: "none", color: "#FFFFFF", background: "#F36B12", fontWeight: 700, fontSize: "15px", textAlign: "center" }}>Sign In</Link>
                    <Link href="/signup" onClick={() => setMenuOpen(false)} style={{ padding: "10px 12px", borderRadius: 6, textDecoration: "none", color: "#17191C", background: "#F5F5F5", border: "1px solid #E5E5E5", fontWeight: 600, fontSize: "15px", textAlign: "center" }}>Create Account</Link>
                  </>
                )}
              </nav>

              {/* Mobile Footer in drawer */}
              <div style={{ paddingTop: 20, borderTop: "1px solid #E5E5E5", fontSize: "12px", color: "#747474" }}>
                <div>Email: <a href="mailto:info@claspo.store" style={{ color: "#F36B12", fontWeight: 600 }}>info@claspo.store</a></div>
                <div style={{ marginTop: 6 }}>Address: 306, Radhe Kishan Arista, Maninagar, Ahmedabad</div>
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
