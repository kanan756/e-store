/**
 * @file components/Header.tsx
 * @description Global site header / navigation bar — Client Component.
 *   Features:
 *     - Transparent-to-solid transition on scroll (adds `.on` class after 60px)
 *     - Active solid state on all non-homepage routes
 *     - Navigation links: Home, About, Shop, Blog, Track Order, Contact
 *     - Cart icon with unread-items dot badge (via CartContext)
 *     - Track Order icon shortcut (pin/location SVG)
 *     - Light / Dark mode toggle (persists to localStorage as `cs-theme`)
 *     - Mobile: animated hamburger (☰ / ✕) that opens a full-height slide-down
 *       drawer with all nav links, cart count, and theme toggle.
 *       Body scroll is locked while drawer is open.
 *       Drawer auto-closes on route change.
 *
 *   Theme is applied via `data-theme` attribute on `<html>` element.
 *   Reading localStorage happens post-mount only (client-side safe).
 *
 * @owner Heet-P
 * @lastModified May 16, 2026
 */

"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { useCart } from "@/context/cart-context"

// ── Icons ─────────────────────────────────────────────────────────────────────
function IcoSearch() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" /><line x1="16.5" y1="16.5" x2="22" y2="22" />
    </svg>
  )
}

function IcoCart() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  )
}

function IcoSun() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  )
}

function IcoMoon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

// Animated hamburger / close button icon
function IcoBurger({ open }: { open: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      {open ? (
        // ✕ close icon
        <>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </>
      ) : (
        // ☰ hamburger lines
        <>
          <line x1="3" y1="7" x2="21" y2="7" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="17" x2="21" y2="17" />
        </>
      )}
    </svg>
  )
}

// ── Nav link definitions ───────────────────────────────────────────────────────
const NAV = [
  { href: "/", label: "Home" },
  { href: "/#about", label: "About" },
  { href: "/products", label: "Shop" },
  { href: "/blog", label: "Blog" },
  { href: "/track-order", label: "Track Order" },
  { href: "/contact", label: "Contact" },
]

// ── Main component ─────────────────────────────────────────────────────────────
export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [menuOpen, setMenuOpen] = useState(false) // mobile drawer state
  const { totalItems } = useCart()
  const pathname = usePathname()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  // Read saved theme on mount (localStorage is client-only)
  useEffect(() => {
    const saved = localStorage.getItem("cs-theme") as "light" | "dark" | null
    if (saved) setTheme(saved)
  }, [])

  // Trigger solid header background after scrolling 60px
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60)
    window.addEventListener("scroll", fn, { passive: true })
    return () => window.removeEventListener("scroll", fn)
  }, [])

  // Auto-close mobile drawer when user navigates to a new route
  useEffect(() => { setMenuOpen(false) }, [pathname])

  // Lock body scroll while mobile drawer is open (prevents background scroll)
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [menuOpen])

  const toggleTheme = useCallback(() => {
    setTheme((t) => {
      const next = t === "dark" ? "light" : "dark"
      document.documentElement.setAttribute("data-theme", next)
      localStorage.setItem("cs-theme", next)
      return next
    })
  }, [])

  // Non-homepage routes always show solid header; homepage shows it after scroll
  const isHome = pathname === "/"
  const solid = scrolled || !isHome

  return (
    <>
      {/* ── Desktop / Mobile Header bar ────────────────────────────────────── */}
      <header className={`hdr${solid ? " on" : ""}`}>
        <Link href="/" className="hdr__logo">SUPERIOR HARNESSING &amp; ASSEMBLY</Link>

        {/* Desktop navigation — hidden on mobile via CSS */}
        <nav className="hdr__nav">
          {NAV.map(({ href, label }) => (
            <Link key={href} href={href}>{label}</Link>
          ))}
        </nav>

        {/* Right icon cluster */}
        <div className="hdr__icons">
          {/* Search (desktop) — only visible on products page */}
          {pathname === "/products" && (
            <form onSubmit={(e) => {
              e.preventDefault()
              if (searchQuery.trim()) {
                router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`)
              } else {
                router.push(`/products`)
              }
            }} style={{ display: "flex", alignItems: "center", background: "rgba(0,0,0,0.05)", borderRadius: 20, padding: "4px 12px", marginRight: 16 }}>
              <IcoSearch />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  if (e.target.value === "") router.push("/products")
                }}
                style={{ background: "transparent", border: "none", outline: "none", fontSize: 13, marginLeft: 8, width: 120, color: "var(--text)" }}
              />
              {searchQuery && (
                <button type="button" onClick={() => { setSearchQuery(""); router.push("/products"); }} style={{ display: "flex", color: "var(--textM)", marginLeft: 4, padding: 2 }}>✕</button>
              )}
            </form>
          )}

          {/* Cart icon with dot badge */}
          <Link href="/cart" className="hic" aria-label="Shopping cart" style={{ position: "relative" }}>
            <IcoCart />
            {totalItems > 0 && <span className="cdot" />}
          </Link>

          {/* Track order pin icon (desktop only) */}
          <Link href="/track-order" className="hic hdr--desk" aria-label="Track your order" title="Track Order">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </Link>



          {/* Hamburger — visible on mobile only */}
          <button
            className="hic hdr__burger"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <IcoBurger open={menuOpen} />
          </button>
        </div>
      </header>

      {/* ── Mobile full-screen drawer ───────────────────────────────────────── */}
      <div className={`mob-nav${menuOpen ? " mob-nav--open" : ""}`} aria-hidden={!menuOpen}>

        {/* Nav links — stagger-animated in */}
        <nav className="mob-nav__links">
          {NAV.map(({ href, label }, i) => (
            <Link
              key={href}
              href={href}
              className="mob-nav__link"
              style={{ transitionDelay: menuOpen ? `${i * 55}ms` : "0ms" }}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Quick-action row at the bottom of drawer */}
        <div className="mob-nav__bar">
          <Link href="/cart" className="mob-nav__act" onClick={() => setMenuOpen(false)}>
            <IcoCart />
            Cart
            {totalItems > 0 && <span className="mob-cart-dot">{totalItems}</span>}
          </Link>
          <Link href="/track-order" className="mob-nav__act" onClick={() => setMenuOpen(false)}>
            📦 Track Order
          </Link>

        </div>
      </div>
    </>
  )
}
