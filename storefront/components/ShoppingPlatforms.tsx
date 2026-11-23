"use client"

import Link from "next/link"

function FlipkartLogo() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="#2874F0">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.666 16.483l-1.848.402-.857-3.935-1.99 4.195-2.078.452.887-4.072-1.97 4.152-2.158.469 2.23-10.23 2.115-.46-.867 3.978 1.98-4.172 2.077-.452-.887 4.072 1.97-4.152 2.167-.472-2.23 10.23z" />
    </svg>
  )
}

function AmazonLogo() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="#FF9900">
      <path d="M13.958 10.09c0 1.272.062 2.33-.538 3.48-.445.852-1.173 1.39-2.052 1.39-1.192 0-1.745-.916-1.745-2.261 0-2.656 2.064-3.13 4.335-3.13v.521zm3.176 7.02c-.228.183-.56.196-.807.054-1.12-.977-1.32-1.442-1.927-2.32-.93 1.383-2.215 2.015-3.834 2.015-2.28 0-4.053-1.428-4.053-4.192 0-2.163 1.186-3.67 2.825-4.453 1.427-.68 3.435-.807 4.962-.988v-.38c0-.7-.06-1.54-.504-2.109-.397-.506-1.11-.74-1.84-.74-1.258 0-2.392.61-2.678 1.9-.057.272-.257.538-.538.549l-2.457-.265c-.26-.057-.49-.283-.418-.62.62-2.827 3.123-3.9 5.867-3.9 1.488 0 3.437.387 4.606 1.554 1.486 1.464 1.34 3.42 1.34 5.398v4.887c0 1.46.608 2.096 1.183 2.88.204.28.167.587-.076.78l-1.85 1.583z" />
      <path d="M21.65 19.98c-3.774 2.778-9.255 4.02-14.475 2.502-3.48-.997-6.248-2.91-7.175-4.43-.16-.27-.037-.585.253-.465 5.093 2.11 11.233 2.56 16.53.22.428-.19.863.266.867.173z" />
    </svg>
  )
}

function InstagramLogo() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="#E1306C">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm3.98-10.169a1.44 1.44 0 1 1 0 2.881 1.44 1.44 0 0 1 0-2.881z"/>
    </svg>
  )
}

function WhatsAppLogo() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="#25D366">
      <path d="M12.031 0C5.39 0 .004 5.385.004 12.023c0 2.12.553 4.184 1.602 6.007L0 24l6.155-1.614a12.008 12.008 0 0 0 5.876 1.527h.005c6.64 0 12.026-5.386 12.026-12.025C24.062 5.385 18.672 0 12.031 0zm0 21.993h-.004a9.98 9.98 0 0 1-5.097-1.393l-.365-.217-3.784.992 1.01-3.687-.238-.378a9.97 9.97 0 0 1-1.536-5.287c0-5.525 4.498-10.021 10.029-10.021 2.678 0 5.195 1.043 7.086 2.936a9.96 9.96 0 0 1 2.932 7.087c0 5.525-4.498 10.02-10.033 10.02z" />
    </svg>
  )
}

const PLATFORMS = [
  {
    name: "Flipkart",
    badge: "Official Store",
    desc: "Browse our curated home solutions and kitchen accessories on Flipkart with fast delivery.",
    href: "https://flipkart.com",
    logo: <FlipkartLogo />,
    accent: "#2874F0",
  },
  {
    name: "Amazon",
    badge: "Prime Storefront",
    desc: "Order smart home essentials and storage organizers with seamless delivery.",
    href: "https://amazon.com",
    logo: <AmazonLogo />,
    accent: "#FF9900",
  },
  {
    name: "Instagram",
    badge: "@claspo.store",
    desc: "Discover creative home organization tips, new arrivals, and place direct orders via DM.",
    href: "https://www.instagram.com/claspo.store/",
    logo: <InstagramLogo />,
    accent: "#E1306C",
  },
  {
    name: "WhatsApp",
    badge: "Instant Support",
    desc: "Chat directly with our customer team for quick product inquiries and assistance.",
    href: "https://wa.me/17348910248?text=Hello%20CLASPO,%20I%20would%20like%20to%20inquire%20about%20a%20product",
    logo: <WhatsAppLogo />,
    accent: "#25D366",
  },
]

export default function ShoppingPlatforms() {
  return (
    <section style={{ background: "#FFFFFF", padding: "64px 0 72px", borderBottom: "1px solid #DADADA" }}>
      <div style={{ maxWidth: 1360, margin: "0 auto", padding: "0 24px" }}>
        {/* Section Header */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
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
            Omnichannel Shopping
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
            Shop Your Way
          </h2>
          <p style={{ fontSize: "16px", color: "#777777", maxWidth: "540px", margin: "0 auto" }}>
            Find CLASPO products on your favourite shopping platforms.
          </p>
        </div>

        {/* Platform Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "24px",
          }}
        >
          {PLATFORMS.map(platform => (
            <a
              key={platform.name}
              href={platform.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: "#FFFFFF",
                borderRadius: "12px",
                border: "1px solid #DADADA",
                padding: "28px 24px",
                textDecoration: "none",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                transition: "all 0.2s ease",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.03)",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "#111111"
                e.currentTarget.style.transform = "translateY(-3px)"
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.08)"
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "#DADADA"
                e.currentTarget.style.transform = "translateY(0)"
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.03)"
              }}
            >
              {/* Header with Icon and Badge */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "8px",
                    background: "#F5F5F5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid #DADADA",
                  }}
                >
                  {platform.logo}
                </div>

                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#111111",
                    background: "#F5F5F5",
                    border: "1px solid #DADADA",
                    padding: "4px 10px",
                    borderRadius: "4px",
                  }}
                >
                  {platform.badge}
                </span>
              </div>

              {/* Name & Description */}
              <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#111111", margin: "0 0 8px" }}>
                {platform.name}
              </h3>

              <p style={{ fontSize: "13.5px", color: "#777777", lineHeight: 1.55, margin: "0 0 20px", flex: 1 }}>
                {platform.desc}
              </p>

              {/* Action Link */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#111111",
                }}
              >
                <span>Connect via {platform.name}</span>
                <span>&rarr;</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
