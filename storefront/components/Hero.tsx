"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"

const HERO_SLIDES = [
  {
    title: "Smart Kitchen & Prep Tools",
    category: "Kitchen Essentials",
    img: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1200",
    tag: "Popular Pick",
  },
  {
    title: "Space-Saving Organization & Storage",
    category: "Home Organization",
    img: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1200",
    tag: "Smart Living",
  },
  {
    title: "Adhesive Mounts & Household Utilities",
    category: "Adhesive Solutions",
    img: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1200",
    tag: "Damage-Free",
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
        background: "linear-gradient(180deg, #FFFFFF 0%, #FFF8F3 100%)",
        position: "relative",
        overflow: "hidden",
        padding: "clamp(108px, 10vw, 128px) 0 84px",
        borderBottom: "1px solid #E5E5E5",
      }}
    >
      {/* Decorative subtle ambient lights */}
      <div
        style={{
          position: "absolute",
          top: "-80px",
          right: "-80px",
          width: "550px",
          height: "550px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(243, 107, 18, 0.08) 0%, rgba(255, 255, 255, 0) 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-60px",
          left: "-60px",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(243, 107, 18, 0.04) 0%, rgba(255, 255, 255, 0) 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: 1360, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 2 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            alignItems: "center",
            gap: "56px",
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
                padding: "8px 16px",
                borderRadius: "6px",
                background: "#FFF0E5",
                border: "1px solid rgba(243, 107, 18, 0.25)",
                color: "#D9570A",
                fontSize: "12px",
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "24px",
              }}
            >
              <span>✨</span>
              <span>WELCOME TO CLASPO</span>
            </div>

            {/* Main Heading */}
            <h1
              style={{
                fontSize: "clamp(34px, 5vw, 54px)",
                fontWeight: 900,
                letterSpacing: "-0.035em",
                lineHeight: 1.12,
                color: "#17191C",
                fontFamily: "var(--font-sora), sans-serif",
                marginBottom: "20px",
              }}
            >
              Smart Solutions for a<br />
              <span style={{ color: "#F36B12" }}>Better Everyday.</span>
            </h1>

            {/* Supporting Description */}
            <p
              style={{
                fontSize: "17px",
                lineHeight: 1.65,
                color: "#747474",
                maxWidth: "520px",
                marginBottom: "36px",
                fontFamily: "var(--font-dm-sans), sans-serif",
              }}
            >
              Discover practical home essentials, smart storage solutions, and everyday products designed to make your life simpler, smarter, and more convenient.
            </p>

            {/* CTAs */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", marginBottom: "36px" }}>
              <Link
                href="/products"
                style={{
                  background: "#F36B12",
                  color: "#FFFFFF",
                  padding: "15px 34px",
                  borderRadius: "8px",
                  fontWeight: 700,
                  fontSize: "14.5px",
                  letterSpacing: "0.02em",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  boxShadow: "0 4px 16px rgba(243, 107, 18, 0.3)",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "#D9570A"
                  e.currentTarget.style.transform = "translateY(-1px)"
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "#F36B12"
                  e.currentTarget.style.transform = "translateY(0)"
                }}
              >
                <span>Explore Products</span>
                <span style={{ fontSize: "16px" }}>&rarr;</span>
              </Link>

              <Link
                href="/shop"
                style={{
                  background: "#FFFFFF",
                  color: "#17191C",
                  border: "1.5px solid #E5E5E5",
                  padding: "14px 30px",
                  borderRadius: "8px",
                  fontWeight: 700,
                  fontSize: "14.5px",
                  letterSpacing: "0.02em",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "#F36B12"
                  e.currentTarget.style.color = "#F36B12"
                  e.currentTarget.style.background = "#FFF0E5"
                  e.currentTarget.style.transform = "translateY(-1px)"
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "#E5E5E5"
                  e.currentTarget.style.color = "#17191C"
                  e.currentTarget.style.background = "#FFFFFF"
                  e.currentTarget.style.transform = "translateY(0)"
                }}
              >
                <span>Shop Now</span>
              </Link>
            </div>

            {/* Feature Pills */}
            <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap", paddingTop: "16px", borderTop: "1px solid #E5E5E5" }}>
              {[
                { icon: "🏠", text: "Smart Home Solutions" },
                { icon: "✨", text: "Practical Innovation" },
                { icon: "📦", text: "Quality Guaranteed" },
              ].map(item => (
                <div key={item.text} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: 600, color: "#17191C" }}>
                  <span>{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right Showcase ── */}
          <div style={{ position: "relative" }}>
            {/* Card Frame */}
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: "16px",
                border: "1px solid #E5E5E5",
                boxShadow: "0 12px 36px rgba(0, 0, 0, 0.06)",
                padding: "24px",
                position: "relative",
              }}
            >
              {/* Product Category Tag */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#747474", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {current.category}
                </span>
                <span
                  style={{
                    background: "#F36B12",
                    color: "#FFFFFF",
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: "4px",
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
                  borderRadius: "12px",
                  background: "radial-gradient(circle at center, #FFF5ED 0%, #F5F5F5 100%)",
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
                  <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#17191C", margin: 0 }}>
                    {current.title}
                  </h3>
                  <div style={{ fontSize: "12px", color: "#747474", marginTop: "4px" }}>
                    Engineered for high reliability & effortless living
                  </div>
                </div>

                <Link
                  href="/shop"
                  style={{
                    background: "#FFF0E5",
                    color: "#F36B12",
                    border: "1px solid rgba(243, 107, 18, 0.3)",
                    padding: "9px 16px",
                    borderRadius: "6px",
                    fontSize: "12.5px",
                    fontWeight: 700,
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "#F36B12"
                    e.currentTarget.style.color = "#FFFFFF"
                    e.currentTarget.style.borderColor = "#F36B12"
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "#FFF0E5"
                    e.currentTarget.style.color = "#F36B12"
                    e.currentTarget.style.borderColor = "rgba(243, 107, 18, 0.3)"
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
                      width: activeSlide === idx ? "26px" : "8px",
                      height: "8px",
                      borderRadius: "4px",
                      background: activeSlide === idx ? "#F36B12" : "#E5E5E5",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      transition: "all 0.3s ease",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
