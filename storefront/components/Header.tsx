"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { useCart } from "@/context/cart-context"

// ── Icons ─────────────────────────────────────────────────────────────────────

function IcoCart() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
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

function IcoPhone() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.17 12a19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 3.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  )
}

function IcoMail() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>
    </svg>
  )
}

function IcoFB() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z"/>
    </svg>
  )
}

function IcoX() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  )
}

function IcoIn() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/>
    </svg>
  )
}

function IcoClose() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function IcoChevron() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  )
}

// ── Nav data ───────────────────────────────────────────────────────────────────

const PRODUCTS_WIRE = [
  { label: "Custom Wire Harness", href: "/products/custom-wire-harness" },
  { label: "Waterproof Harness", href: "/products/waterproof-harness" },
  { label: "High Voltage Harness", href: "/products/high-voltage-harness" },
  { label: "Overmolded Harness", href: "/products/overmolded-harness" },
  { label: "Prototype / NPI", href: "/products/prototype-npi" },
]

const PRODUCTS_CABLE = [
  { label: "Cable Assembly Overview", href: "/products/cable-assembly" },
  { label: "Medical Cable Assemblies", href: "/products/medical-cable-assemblies" },
  { label: "Coaxial / RF / Microwave", href: "/products/coaxial-rf-microwave" },
  { label: "Power & Battery", href: "/products/power-battery" },
  { label: "Ethernet & USB", href: "/products/ethernet-usb" },
  { label: "Fiber Optic & Twinax", href: "/products/fiber-optic-twinax" },
  { label: "Shielded / Hermetic", href: "/products/shielded-hermetic" },
]

const INDUSTRIES_DD = [
  { label: "Automotive & EV", href: "/industries/automotive-ev" },
  { label: "Medical Devices", href: "/industries/medical-devices" },
  { label: "Robotics & Automation", href: "/industries/robotics-automation" },
  { label: "Industrial / Factory", href: "/industries/industrial-factory" },
  { label: "Aerospace & Defense", href: "/industries/aerospace-defense" },
  { label: "Solar & Energy", href: "/industries/solar-energy" },
]

const RESOURCES_DD = [
  { label: "Blog", href: "/blog" },
  { label: "Certifications", href: "/capabilities#certifications" },
  { label: "Capabilities", href: "/capabilities" },
]

// ── Quote Modal ───────────────────────────────────────────────────────────────
function QuoteModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  useEffect(() => {
    if (!open) return
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", fn)
    return () => window.removeEventListener("keydown", fn)
  }, [open, onClose])

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSending(true)
    const fd = new FormData(e.currentTarget)
    const data = Object.fromEntries(fd.entries())

    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        setSubmitted(true)
      } else {
        const err = await res.json()
        alert(err.error || "Failed to submit quote")
      }
    } catch (err) {
      alert("Failed to submit quote request. Please try again.")
    } finally {
      setSending(false)
    }
  }

  return (
    <div
      ref={overlayRef}
      className="quote-overlay"
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
      aria-modal="true"
      role="dialog"
      aria-label="Request a Quote"
    >
      <div className="quote-modal">
        <div className="quote-modal__hdr">
          <div>
            <div className="quote-modal__title">REQUEST A QUOTE</div>
            <div className="quote-modal__subtitle">We respond within two business days.</div>
          </div>
          <button className="quote-modal__close" onClick={onClose} aria-label="Close">
            <IcoClose />
          </button>
        </div>

        {submitted ? (
          <div className="quote-modal__success">
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/>
            </svg>
            <h3>Request Received</h3>
            <p>We&apos;ll get back to you within two business days.</p>
            <button className="quote-modal__submit" style={{ marginTop: 24, width: "auto", padding: "14px 40px" }} onClick={() => { setSubmitted(false); onClose() }}>
              Close
            </button>
          </div>
        ) : (
          <form className="quote-modal__form" onSubmit={handleSubmit}>
            <div className="quote-modal__grid">
              <div className="quote-modal__field">
                <label className="quote-modal__label">Name <span className="quote-modal__req">*</span></label>
                <input type="text" name="name" placeholder="Jane Doe" required autoComplete="name" />
              </div>
              <div className="quote-modal__field">
                <label className="quote-modal__label">Phone</label>
                <input type="tel" name="phone" placeholder="(586) 555-0100" autoComplete="tel" />
              </div>
            </div>
            <div className="quote-modal__grid">
              <div className="quote-modal__field">
                <label className="quote-modal__label">Email <span className="quote-modal__req">*</span></label>
                <input type="email" name="email" placeholder="jane@acme.com" required autoComplete="email" />
              </div>
              <div className="quote-modal__field">
                <label className="quote-modal__label">Company</label>
                <input type="text" name="company" placeholder="Acme Mfg." autoComplete="organization" />
              </div>
            </div>
            <div className="quote-modal__grid">
              <div className="quote-modal__field">
                <label className="quote-modal__label">Application</label>
                <input type="text" name="application" placeholder="e.g. Medical Device, Automotive" />
              </div>
              <div className="quote-modal__field">
                <label className="quote-modal__label">Quantity</label>
                <input type="text" name="quantity" placeholder="e.g. 500 units" />
              </div>
            </div>
            <div className="quote-modal__field">
              <label className="quote-modal__label">Project details <span className="quote-modal__req">*</span></label>
              <textarea name="description" placeholder="Describe your assembly, quantities, target lead time..." rows={4} required />
            </div>
            <input type="text" name="honeypot" style={{ display: "none" }} tabIndex={-1} autoComplete="off" />
            <button type="submit" className="quote-modal__submit" disabled={sending}>
              {sending ? "Sending..." : "Submit Request"}
              {!sending && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [quoteOpen, setQuoteOpen] = useState(false)
  const [productsOpen, setProductsOpen] = useState(false)
  const productsDDRef = useRef<HTMLDivElement>(null)
  const { totalItems } = useCart()
  const pathname = usePathname()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60)
    window.addEventListener("scroll", fn, { passive: true })
    return () => window.removeEventListener("scroll", fn)
  }, [])

  useEffect(() => { setMenuOpen(false); setProductsOpen(false) }, [pathname])

  // Click-outside closes the sticky products dropdown
  useEffect(() => {
    if (!productsOpen) return
    const fn = (e: MouseEvent) => {
      if (productsDDRef.current && !productsDDRef.current.contains(e.target as Node)) {
        setProductsOpen(false)
      }
    }
    document.addEventListener("mousedown", fn)
    return () => document.removeEventListener("mousedown", fn)
  }, [productsOpen])

  // Close products dropdown on Escape
  useEffect(() => {
    if (!productsOpen) return
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") setProductsOpen(false) }
    window.addEventListener("keydown", fn)
    return () => window.removeEventListener("keydown", fn)
  }, [productsOpen])

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest("a")
      const href = link?.getAttribute("href") || link?.href
      if (href && href.endsWith("#quote")) {
        e.preventDefault()
        setQuoteOpen(true)
      }
    }
    document.addEventListener("click", handleGlobalClick)

    if (typeof window !== "undefined" && window.location.hash === "#quote") {
      setQuoteOpen(true)
      window.history.replaceState(null, "", window.location.pathname + window.location.search)
    }

    return () => document.removeEventListener("click", handleGlobalClick)
  }, [])

  useEffect(() => {
    if (!quoteOpen) {
      document.body.style.overflow = menuOpen ? "hidden" : ""
    }
    return () => { if (!quoteOpen) document.body.style.overflow = "" }
  }, [menuOpen, quoteOpen])

  return (
    <>
      <header className={`hdr${scrolled ? " on" : ""}`}>
        {/* ── Top Contact Bar ── */}
        <div className="hdr__topbar">
          <div className="hdr__topbar-in">
            <div className="hdr__topbar-soc">
              <a href="https://facebook.com" aria-label="Facebook" target="_blank" rel="noopener noreferrer"><IcoFB /></a>
              <a href="https://x.com" aria-label="X" target="_blank" rel="noopener noreferrer"><IcoX /></a>
              <a href="https://linkedin.com" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer"><IcoIn /></a>
            </div>
            <div className="hdr__topbar-contacts">
              <a className="hdr__topbar-item" href="tel:+917348910249"><IcoPhone /> +91 7348910249</a>
              <a className="hdr__topbar-item" href="mailto:sales@superiorharness.com"><IcoMail /> <span>sales@superiorharness.com</span></a>
            </div>
          </div>
        </div>

        {/* ── Nav Bar ── */}
        <div className="hdr__bar">
          {/* Logo */}
          <Link href="/" className="hdr__logo">
            <Image
              src="/images/dark-logo.webp"
              alt="Superior Harness & Assembly"
              height={50}
              width={300}
              style={{ objectFit: "contain", objectPosition: "left center" }}
              priority
            />
          </Link>

          {/* Desktop navigation */}
          <nav className="hdr__nav">
            {/* Products — mega dropdown */}
            <div className="hdr__mega-wrap" ref={productsDDRef} data-open={productsOpen ? "true" : undefined}>
              <button
                onClick={() => setProductsOpen(o => !o)}
                style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", padding: 0 }}
                aria-expanded={productsOpen}
                aria-haspopup="true"
              >
                Products <IcoChevron />
              </button>
              <div className="hdr__mega">
                <div className="hdr__mega-col">
                  <div className="hdr__mega-section-title">
                    <span style={{ width: 18, height: 2, background: "#000000", display: "inline-block", borderRadius: 2 }} />
                    Wire Harness
                  </div>
                  {PRODUCTS_WIRE.map(item => (
                    <Link key={item.href} href={item.href}>{item.label}</Link>
                  ))}
                </div>
                <div className="hdr__mega-col">
                  <div className="hdr__mega-section-title">
                    <span style={{ width: 18, height: 2, background: "#000000", display: "inline-block", borderRadius: 2 }} />
                    Cable Assembly
                  </div>
                  {PRODUCTS_CABLE.map(item => (
                    <Link key={item.href} href={item.href}>{item.label}</Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Industries — simple dropdown */}
            <div className="hdr__dd-wrap">
              <Link href="/industries" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                Industries <IcoChevron />
              </Link>
              <div className="hdr__dd">
                {INDUSTRIES_DD.map(d => <Link key={d.href} href={d.href}>{d.label}</Link>)}
                <Link href="/industries" style={{ fontWeight: 700, color: "var(--ink, #111)", marginTop: 4, display: "block", padding: "10px 14px" }}>View all industries →</Link>
              </div>
            </div>

            {/* Resources — simple dropdown */}
            <div className="hdr__dd-wrap">
              <Link href="/capabilities" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                Resources <IcoChevron />
              </Link>
              <div className="hdr__dd">
                {RESOURCES_DD.map(d => <Link key={d.href} href={d.href}>{d.label}</Link>)}
              </div>
            </div>

            <Link href="/about" data-active={pathname === "/about" ? "true" : undefined}>About</Link>
            <Link href="/contact" data-active={pathname === "/contact" ? "true" : undefined}>Contact</Link>
          </nav>

          {/* Right icons */}
          <div className="hdr__icons" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            {/* Track Order */}
            <Link href="/track-order" className="hdr--desk" style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "11px", fontWeight: 600, letterSpacing: "0.09em", color: "rgba(255,255,255,0.7)", textTransform: "uppercase" }}>
              Track Order
            </Link>

            {/* Shop */}
            <Link href="/shop" className="hdr--desk hdr-shop-btn">
              Shop
            </Link>

            {/* Cart */}
            <Link href="/cart" className="hic" aria-label="Shopping cart" style={{ position: "relative" }}>
              <IcoCart />
              {totalItems > 0 && <span className="cdot" />}
            </Link>

            {/* Request Quote */}
            <button
              className="hdr-quote-btn hdr--desk"
              style={{ marginLeft: 12 }}
              onClick={() => setQuoteOpen(true)}
              aria-label="Request a Quote"
            >
              Request Quote
            </button>

            {/* Hamburger */}
            <button
              className="hic hdr__burger"
              onClick={() => setMenuOpen(o => !o)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              <IcoBurger open={menuOpen} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile drawer ── */}
      <div className={`mob-nav${menuOpen ? " mob-nav--open" : ""}`} aria-hidden={!menuOpen}>
        <nav className="mob-nav__links">
          {[
            { href: "/products", label: "Products" },
            { href: "/industries", label: "Industries" },
            { href: "/capabilities", label: "Capabilities" },
            { href: "/about", label: "About" },
            { href: "/contact", label: "Contact" },
            { href: "/shop", label: "Shop" },
            { href: "/blog", label: "Blog" },
          ].map(({ href, label }, i) => (
            <Link
              key={href}
              href={href}
              className="mob-nav__link"
              style={{ transitionDelay: menuOpen ? `${i * 50}ms` : "0ms" }}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div style={{ padding: "0 24px 24px" }}>
          <button
            className="btn bp"
            style={{ width: "100%", justifyContent: "center", display: "flex" }}
            onClick={() => { setMenuOpen(false); setQuoteOpen(true) }}
          >
            Request Quote
          </button>
        </div>

        <div className="mob-nav__bar">
          <Link href="/cart" className="mob-nav__act" onClick={() => setMenuOpen(false)}>
            <IcoCart />
            Cart
            {totalItems > 0 && <span className="mob-cart-dot">{totalItems}</span>}
          </Link>
        </div>
      </div>

      {/* ── Quote Popup Modal ── */}
      <QuoteModal open={quoteOpen} onClose={() => setQuoteOpen(false)} />
    </>
  )
}
