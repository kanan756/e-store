"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"

const SLIDES = [
  { src: "/images/carousel-1.webp", alt: "Wire harness manufacturing" },
  { src: "/images/carousel-2.webp", alt: "Cable assembly production" },
  { src: "/images/carousel-3.webp", alt: "Precision electrical assembly" },
]

function ArrowRight() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

export default function Hero() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const t = setInterval(() => setActive(i => (i + 1) % SLIDES.length), 4000)
    return () => clearInterval(t)
  }, [paused])

  return (
    <section className="hero-v2">
      <div className="hero-v2__inner">

        {/* ── Left: content ── */}
        <div className="hero-v2__left">
          <div className="hero-v2__block">
            <h1 className="hero-v2__h1">
              <span className="hero-v2__h1-primary">Precision</span>
              <span className="hero-v2__h1-muted">Wire Harness &</span>
              <span className="hero-v2__h1-muted">Cable Assembly.</span>
            </h1>

            <p className="hero-v2__desc">
              Precision-driven custom wire harness and cable assembly manufacturer with 30+ <br /> years of combined experience.
              From low-volume prototyping to high-volume production <br />— consistent, durable, and built to your exact specifications across a wide range of industries.
            </p>

            <div className="hero-v2__stats">
              <div className="hero-v2__stat">
                <span className="hero-v2__stat-val">30+</span>
                <span className="hero-v2__stat-lbl">Years Experience</span>
              </div>
              <div className="hero-v2__stat">
                <span className="hero-v2__stat-val">5–15 Days</span>
                <span className="hero-v2__stat-lbl">Lead Time</span>
              </div>
              <div className="hero-v2__stat">
                <span className="hero-v2__stat-val">1 Piece</span>
                <span className="hero-v2__stat-lbl">Min. Order</span>
              </div>
              <div className="hero-v2__stat">
                <span className="hero-v2__stat-val">&lt;24 Hours</span>
                <span className="hero-v2__stat-lbl">Quote Reply</span>
              </div>
            </div>

            <div className="hero-v2__ctabar">
              <Link href="/contact" className="hero-v2__cta-primary">
                Contact Us <ArrowRight />
              </Link>
              <Link href="#quote" className="hero-v2__cta-secondary">
                Request a Quote <ArrowRight />
              </Link>
            </div>
          </div>
        </div>

        {/* ── Right: portrait carousel + dots + footer row ── */}
        <div className="hero-v2__right">

          <div
            className="hero-v2__carousel"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {SLIDES.map((slide, i) => (
              <div
                key={slide.src}
                className="hero-v2__carousel-slide"
                style={{ opacity: i === active ? 1 : 0 }}
              >
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  sizes="50vw"
                  style={{ objectFit: "cover" }}
                  priority={i === 0}
                />
              </div>
            ))}
          </div>

          {/* Dots below image */}
          <div className="hero-v2__carousel-dots" role="tablist" aria-label="Carousel slides">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === active}
                aria-label={`Slide ${i + 1}`}
                className={`hero-v2__carousel-dot${i === active ? " active" : ""}`}
                onClick={() => setActive(i)}
              />
            ))}
          </div>

        </div>

      </div>
    </section>
  )
}
