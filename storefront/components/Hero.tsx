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

const CHIPS = ["Wire Harnessing", "Cable Assembly", "PCB Assembly", "OEM Solutions"]

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
    <section id="home" className="hero">
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

          {/* USP Chips */}
          <div className="hero__chips hu3">
            {CHIPS.map((c) => (
              <span key={c} className="hero__chip">{c}</span>
            ))}
          </div>

          <div className="hero__btns hu4">
            <Link href="/products" className="btn bp">
              Shop Now <ArrowIcon />
            </Link>
            <Link href="/about" className="btn bo">
              About Us
            </Link>
          </div>
        </div>

        {/* ── RIGHT 60% — Placeholder (replace with final illustration) ── */}
        <div className="hero__img-wrap hu2" style={{
          border: "1px solid rgba(74, 225, 131, 0.25)",
          boxShadow: "0 0 32px rgba(74, 225, 131, 0.12), inset 0 0 48px rgba(74, 225, 131, 0.04)",
          borderRadius: "var(--rL)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          minHeight: 420,
          background: "transparent",
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(74,225,131,0.5)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
          </svg>
          <span style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: 11,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "rgba(74, 225, 131, 0.5)",
          }}>
            Hero Illustration — Coming Soon
          </span>
          <span style={{
            fontSize: 12,
            color: "var(--textM)",
            letterSpacing: "0.04em",
          }}>
            Wire Harnessing · Cable Assembly · PCB Assembly
          </span>
        </div>

      </div>
    </section>
  )
}
