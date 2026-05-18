/**
 * @file components/Hero.tsx
 * @description Hero section with 40/60 split layout.
 *   Left 40%: headline, USP labels, and CTA buttons.
 *   Right 60%: industry illustration — hero.webp (light) / hero-dark.png (dark).
 *
 * @owner Heet-P
 * @lastModified May 18, 2026
 */

"use client"

import Link from "next/link"
import { useState, useEffect } from "react"

function ArrowIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12,5 19,12 12,19" />
    </svg>
  )
}


/** Watches data-theme on <html> and returns true when dark mode is active. */
function useIsDark() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const html = document.documentElement
    setDark(html.getAttribute("data-theme") === "dark")

    const observer = new MutationObserver(() => {
      setDark(html.getAttribute("data-theme") === "dark")
    })
    observer.observe(html, { attributes: true, attributeFilter: ["data-theme"] })
    return () => observer.disconnect()
  }, [])

  return dark
}

export default function Hero() {
  const isDark = useIsDark()

  return (
    <section id="home" className="hero" style={{
      backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.7)), url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070')",
      backgroundSize: "cover",
      backgroundPosition: "center"
    }}>
      <div className="W hero__split">

        {/* ── LEFT 40% — Text ────────────────────────────────── */}
        <div className="hero__c">
          <div className="lbl hero__lbl hu1">
            Superior Harnessing &amp; Assembly
          </div>

          <h1 className="D1 hero__h hu2">
            PRECISION<br />WIRING &amp;<br />ASSEMBLY
          </h1>

          <p className="hero__sub hu3">
            Trusted wire harnessing, cable assembly, and PCB assembly
            solutions for OEMs, robotics, medical, and white goods industries. 
          </p>


          <div className="hero__btns hu4">
            <Link href="/products" className="btn bp">
              Shop Now <ArrowIcon />
            </Link>
            <Link href="/about" className="btn bod">
              About Us
            </Link>
          </div>
        </div>

        {/* ── RIGHT 60% — Demo Image ── */}
        <div className="hero__img-wrap hu2" style={{
          borderRadius: "var(--rL)",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 420,
          background: "transparent",
          boxShadow: "0 24px 60px rgba(0,0,0,0.1)",
        }}>
          <img 
            src="https://images.unsplash.com/photo-1581092335397-9583eb92d232?q=80&w=2070" 
            alt="Precision Wiring Assembly" 
            style={{ width: "100%", height: "100%", objectFit: "cover", minHeight: 420 }} 
          />
        </div>

      </div>
    </section>
  )
}
