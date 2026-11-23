"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"

const HERO_SLIDES = [
  {
    title: "High-Voltage EV & Battery Harnesses",
    category: "Automotive & Clean Energy",
    img: "/images/high-voltage-wiring-harness.webp",
    tag: "Best Seller",
  },
  {
    title: "Precision Custom Wire Harnessing",
    category: "Aerospace & Industrial",
    img: "/images/custom-wire-harness.webp",
    tag: "ISO Certified",
  },
  {
    title: "High-Flex Robotic & Coil Solutions",
    category: "Robotics & Automation",
    img: "/images/cobot-coil-cable-ur5.webp",
    tag: "10M+ Cycles",
  },
  {
    title: "Medical Device Cable Assemblies",
    category: "Life Sciences & Diagnostics",
    img: "/images/cleanroom-cable-assembly.webp",
    tag: "Class III Standard",
  },
]

export default function Hero() {
  const [activeSlide, setActiveSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % HERO_SLIDES.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [])

  const current = HERO_SLIDES[activeSlide]

  return (
    <section
      style={{
        background: "linear-gradient(135deg, #FFFFFF 0%, #FAF8FF 50%, #F1EBFF 100%)",
        position: "relative",
        overflow: "hidden",
        padding: "60px 0 80px",
        borderBottom: "1px solid #EDE9F6",
      }}
    >
      {/* Decorative background blurs */}
      <div
        style={{
          position: "absolute",
          top: "-100px",
          right: "-100px",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(84,32,200,0.08) 0%, rgba(241,235,255,0) 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-50px",
          left: "10%",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(84,32,200,0.05) 0%, rgba(241,235,255,0) 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: 1360, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 2 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            alignItems: "center",
            gap: "48px",
          }}
        >
          {/* ── Left Content ── */}
          <div>
            {/* Welcome Badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 18px",
                borderRadius: "9999px",
                background: "#F1EBFF",
                border: "1px solid rgba(84, 32, 200, 0.18)",
                color: "#5420C8",
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: "0.02em",
                marginBottom: "24px",
                boxShadow: "0 2px 10px rgba(84, 32, 200, 0.08)",
              }}
            >
              <span style={{ fontSize: "14px" }}>✨</span>
              <span>Welcome to CLASPO &middot; CLICK. PICK. DONE.</span>
            </div>

            {/* Main Heading */}
            <h1
              style={{
                fontSize: "clamp(34px, 5vw, 54px)",
                fontWeight: 900,
                letterSpacing: "-0.035em",
                lineHeight: 1.12,
                color: "#111111",
                fontFamily: "var(--font-sora), sans-serif",
                marginBottom: "20px",
              }}
            >
              Shop Your Way –<br />
              <span style={{ color: "#5420C8" }}>Smart. Simple. Better.</span>
            </h1>

            {/* Supporting Description */}
            <p
              style={{
                fontSize: "17px",
                lineHeight: 1.65,
                color: "#707070",
                maxWidth: "520px",
                marginBottom: "36px",
                fontFamily: "var(--font-dm-sans), sans-serif",
              }}
            >
              Discover premium products, amazing deals and a seamless shopping experience. Custom wire harnesses, cable assemblies, and precision OEM interconnects built to your exact specifications.
            </p>

            {/* CTAs */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", marginBottom: "36px" }}>
              <Link
                href="/shop"
                style={{
                  background: "#5420C8",
                  color: "#FFFFFF",
                  padding: "16px 36px",
                  borderRadius: "9999px",
                  fontWeight: 700,
                  fontSize: "14.5px",
                  letterSpacing: "0.03em",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  boxShadow: "0 6px 22px rgba(84, 32, 200, 0.32)",
                  transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "#4317A8"
                  e.currentTarget.style.transform = "translateY(-2px)"
                  e.currentTarget.style.boxShadow = "0 10px 28px rgba(84, 32, 200, 0.42)"
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "#5420C8"
                  e.currentTarget.style.transform = "translateY(0)"
                  e.currentTarget.style.boxShadow = "0 6px 22px rgba(84, 32, 200, 0.32)"
                }}
              >
                <span>Shop Now</span>
                <span style={{ fontSize: "16px" }}>&rarr;</span>
              </Link>

              <Link
                href="/products"
                style={{
                  background: "#FFFFFF",
                  color: "#111111",
                  border: "1.5px solid #E5E5EB",
                  padding: "15px 32px",
                  borderRadius: "9999px",
                  fontWeight: 700,
                  fontSize: "14.5px",
                  letterSpacing: "0.02em",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "#5420C8"
                  e.currentTarget.style.color = "#5420C8"
                  e.currentTarget.style.background = "#F1EBFF"
                  e.currentTarget.style.transform = "translateY(-2px)"
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "#E5E5EB"
                  e.currentTarget.style.color = "#111111"
                  e.currentTarget.style.background = "#FFFFFF"
                  e.currentTarget.style.transform = "translateY(0)"
                }}
              >
                <span>Explore Products</span>
              </Link>
            </div>

            {/* Feature Pills */}
            <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap", paddingTop: "12px", borderTop: "1px solid rgba(84,32,200,0.12)" }}>
              {[
                { icon: "🛡️", text: "IPC/WHMA-A-620 Standards" },
                { icon: "⚡", text: "Fast 24-48h Quote Turnaround" },
                { icon: "📦", text: "Low Flexible MOQs" },
              ].map(item => (
                <div key={item.text} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: 600, color: "#111111" }}>
                  <span>{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right Showcase Showcase ── */}
          <div style={{ position: "relative" }}>
            {/* Card Frame */}
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: "24px",
                border: "1px solid #E5E5EB",
                boxShadow: "0 20px 50px rgba(84, 32, 200, 0.12)",
                padding: "24px",
                position: "relative",
              }}
            >
              {/* Product Category Tag */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#5420C8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {current.category}
                </span>
                <span
                  style={{
                    background: "#5420C8",
                    color: "#FFFFFF",
                    fontSize: "11px",
                    fontWeight: 800,
                    padding: "4px 10px",
                    borderRadius: "9999px",
                  }}
                >
                  {current.tag}
                </span>
              </div>

              {/* Main Image Showcase */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "340px",
                  borderRadius: "16px",
                  background: "#F7F7F9",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image
                  key={current.img}
                  src={current.img}
                  alt={current.title}
                  fill
                  unoptimized={true}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{
                    objectFit: "contain",
                    padding: "20px",
                    transition: "transform 0.4s ease",
                  }}
                  priority
                />
              </div>

              {/* Title & Shop Button */}
              <div style={{ marginTop: "18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
                <div>
                  <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#111111", margin: 0 }}>
                    {current.title}
                  </h3>
                  <div style={{ fontSize: "12px", color: "#707070", marginTop: "4px" }}>
                    Engineered for high reliability & zero-defect performance
                  </div>
                </div>

                <Link
                  href="/shop"
                  style={{
                    background: "#F1EBFF",
                    color: "#5420C8",
                    padding: "10px 18px",
                    borderRadius: "9999px",
                    fontSize: "12.5px",
                    fontWeight: 800,
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "#5420C8"
                    e.currentTarget.style.color = "#FFFFFF"
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "#F1EBFF"
                    e.currentTarget.style.color = "#5420C8"
                  }}
                >
                  View Details &rarr;
                </Link>
              </div>

              {/* Slider Pagination Dots */}
              <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "20px" }}>
                {HERO_SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSlide(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    style={{
                      width: activeSlide === idx ? "28px" : "8px",
                      height: "8px",
                      borderRadius: "9999px",
                      background: activeSlide === idx ? "#5420C8" : "#E5E5EB",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      transition: "all 0.3s ease",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Floating Badge 1: Free Shipping */}
            <div
              style={{
                position: "absolute",
                top: "-20px",
                left: "-20px",
                background: "#FFFFFF",
                borderRadius: "14px",
                padding: "10px 16px",
                border: "1px solid #E5E5EB",
                boxShadow: "0 10px 25px rgba(84, 32, 200, 0.12)",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                zIndex: 3,
              }}
            >
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "10px",
                  background: "#F1EBFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                }}
              >
                🚚
              </div>
              <div>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "#111111" }}>Free Shipping</div>
                <div style={{ fontSize: "10px", color: "#707070" }}>On orders over $100</div>
              </div>
            </div>

            {/* Floating Badge 2: Secure Payments */}
            <div
              style={{
                position: "absolute",
                bottom: "-15px",
                right: "-15px",
                background: "#FFFFFF",
                borderRadius: "14px",
                padding: "10px 16px",
                border: "1px solid #E5E5EB",
                boxShadow: "0 10px 25px rgba(84, 32, 200, 0.12)",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                zIndex: 3,
              }}
            >
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "10px",
                  background: "#F1EBFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                }}
              >
                🔒
              </div>
              <div>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "#111111" }}>Secure Payments</div>
                <div style={{ fontSize: "10px", color: "#707070" }}>256-Bit SSL Encrypted</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
