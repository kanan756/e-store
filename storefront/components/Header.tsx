"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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

// ── Nav links ─────────────────────────────────────────────────────────────────
const NAV = [
  { href: "/", label: "Home" },
  { href: "/#about", label: "About" },
  { href: "/products", label: "Shop" },
  { href: "/#categories", label: "Categories" },
  { href: "/#contact", label: "Contact" },
]

// ── Component ─────────────────────────────────────────────────────────────────
export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const { totalItems } = useCart()
  const pathname = usePathname()

  // Read initial theme (after mount — localStorage is client-only)
  useEffect(() => {
    const saved = localStorage.getItem("cs-theme") as "light" | "dark" | null
    if (saved) setTheme(saved)
  }, [])

  // Track scroll
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60)
    window.addEventListener("scroll", fn, { passive: true })
    return () => window.removeEventListener("scroll", fn)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme((t) => {
      const next = t === "dark" ? "light" : "dark"
      document.documentElement.setAttribute("data-theme", next)
      localStorage.setItem("cs-theme", next)
      return next
    })
  }, [])

  // On non-homepage, always show the solid background
  const isHome = pathname === "/"
  const solid = scrolled || !isHome

  return (
    <header className={`hdr${solid ? " on" : ""}`}>
      <Link href="/" className="hdr__logo">CLIENT STORE</Link>

      <nav className="hdr__nav">
        {NAV.map(({ href, label }) => (
          <Link key={href} href={href}>{label}</Link>
        ))}
      </nav>

      <div className="hdr__icons">
        <Link href="/products" className="hic" aria-label="Search products">
          <IcoSearch />
        </Link>

        <Link href="/cart" className="hic" aria-label="Shopping cart" style={{ position: "relative" }}>
          <IcoCart />
          {totalItems > 0 && <span className="cdot" />}
        </Link>

        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <IcoSun /> : <IcoMoon />}
        </button>
      </div>
    </header>
  )
}
