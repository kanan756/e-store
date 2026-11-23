import Link from "next/link"
import Image from "next/image"

function IcoPin() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  )
}
function IcoPhone() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.17 12a19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 3.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}
function IcoMail() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" />
    </svg>
  )
}
function IcoFB() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z" />
    </svg>
  )
}
function IcoX() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}
function IcoIn() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  )
}
function IcoInsta() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm3.98-10.169a1.44 1.44 0 1 1 0 2.881 1.44 1.44 0 0 1 0-2.881z" />
    </svg>
  )
}

const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Products", href: "/products" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Blogs", href: "/blog" },
]

const CUSTOMER_SUPPORT = [
  { label: "Contact Us", href: "/contact" },
  { label: "Track Order", href: "/track-order" },
  { label: "Shipping Information", href: "/terms#shipping" },
  { label: "Return & Refund Policy", href: "/terms#returns" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
]

export default function Footer() {
  return (
    <footer style={{ background: "#303638", color: "#FFFFFF", paddingTop: 72, paddingBottom: 36, borderTop: "1px solid #454C4F" }}>
      <div className="W">
        {/* Main Footer Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 40,
            marginBottom: 60,
          }}
        >
          {/* Col 1: Brand & Description */}
          <div style={{ maxWidth: 320 }}>
            <Link href="/" style={{ display: "inline-block", position: "relative", width: 146, height: 50, marginBottom: 14 }}>
              <Image
                src="/images/claspo-logo-tight.png"
                alt="CLASPO™ CLICK. PICK. DONE."
                fill
                style={{ objectFit: "contain", filter: "brightness(0) invert(1)" }}
              />
            </Link>

            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#DADADA",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                marginBottom: 12,
              }}
            >
              CLASPO &ndash; CLICK. PICK. DONE.
            </div>

            <p style={{ fontSize: 13.5, color: "#DADADA", lineHeight: 1.65, marginBottom: 20 }}>
              Smart solutions for everyday living. Discover practical, functional, and thoughtfully selected products that make your home and daily routines better.
            </p>

            {/* Social Links — PRESERVED EXACTLY */}
            <div style={{ display: "flex", gap: 10 }}>
              <a
                href="https://www.facebook.com/profile.php?id=61586667457643#"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 6,
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#DADADA",
                  transition: "background 0.2s ease, color 0.2s ease",
                }}
              >
                <IcoFB />
              </a>
              <a
                href="https://x.com/claspostore"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 6,
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#DADADA",
                  transition: "background 0.2s ease, color 0.2s ease",
                }}
              >
                <IcoX />
              </a>
              <a
                href="https://www.linkedin.com/company/claspostore/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 6,
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#DADADA",
                  transition: "background 0.2s ease, color 0.2s ease",
                }}
              >
                <IcoIn />
              </a>
              <a
                href="https://www.instagram.com/claspo.store/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 6,
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#DADADA",
                  transition: "background 0.2s ease, color 0.2s ease",
                }}
              >
                <IcoInsta />
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#FFFFFF", marginBottom: 18 }}>
              Quick Links
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {QUICK_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  style={{
                    fontSize: 13.5,
                    color: "#DADADA",
                    textDecoration: "none",
                    transition: "color 0.15s ease",
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Col 3: Customer Support */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#FFFFFF", marginBottom: 18 }}>
              Customer Support
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {CUSTOMER_SUPPORT.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  style={{
                    fontSize: 13.5,
                    color: "#DADADA",
                    textDecoration: "none",
                    transition: "color 0.15s ease",
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Col 4: Contact & Office — PRESERVED EXACTLY */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#FFFFFF", marginBottom: 18 }}>
              Contact Information
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, fontSize: 13.5, color: "#DADADA" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div style={{ marginTop: 2, color: "#DADADA" }}><IcoPin /></div>
                <span>306, Radhe Kishan Arista, oppo. Hirabhai Tower, Maninagar, Ahmedabad, Gujarat - 380008</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ color: "#DADADA" }}><IcoPhone /></div>
                <span>+1 734 891 0248</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ color: "#DADADA" }}><IcoMail /></div>
                <a href="mailto:info@claspo.store" style={{ color: "#FFFFFF", textDecoration: "none", fontWeight: 600 }}>
                  info@claspo.store
                </a>
              </div>
            </div>

            <div style={{ marginTop: 24, paddingTop: 18, borderTop: "1px solid rgba(255, 255, 255, 0.12)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#DADADA", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                Secure Payment Partners
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, fontSize: 11, color: "#FFFFFF" }}>
                <span style={{ background: "rgba(255,255,255,0.08)", padding: "4px 8px", borderRadius: 4, border: "1px solid rgba(255,255,255,0.1)" }}>Stripe</span>
                <span style={{ background: "rgba(255,255,255,0.08)", padding: "4px 8px", borderRadius: 4, border: "1px solid rgba(255,255,255,0.1)" }}>Visa</span>
                <span style={{ background: "rgba(255,255,255,0.08)", padding: "4px 8px", borderRadius: 4, border: "1px solid rgba(255,255,255,0.1)" }}>Mastercard</span>
                <span style={{ background: "rgba(255,255,255,0.08)", padding: "4px 8px", borderRadius: 4, border: "1px solid rgba(255,255,255,0.1)" }}>Amex</span>
                <span style={{ background: "rgba(255,255,255,0.08)", padding: "4px 8px", borderRadius: 4, border: "1px solid rgba(255,255,255,0.1)" }}>Apple Pay</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            paddingTop: 24,
            borderTop: "1px solid rgba(255, 255, 255, 0.12)",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            fontSize: 13,
            color: "#DADADA",
          }}
        >
          <div>
            &copy; {new Date().getFullYear()} CLASPO. All rights reserved. &middot; <span style={{ color: "#FFFFFF", fontWeight: 700 }}>CLICK. PICK. DONE.</span>
          </div>

          <div style={{ display: "flex", gap: 20 }}>
            <Link href="/privacy" style={{ color: "#DADADA", textDecoration: "none" }}>Privacy Policy</Link>
            <Link href="/terms" style={{ color: "#DADADA", textDecoration: "none" }}>Terms of Service</Link>
            <Link href="/cookies" style={{ color: "#DADADA", textDecoration: "none" }}>Cookie Preferences</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
