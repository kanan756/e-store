"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"

function ArrowIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12,5 19,12 12,19" />
    </svg>
  )
}

function ChevLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function ChevRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

const SLIDES = [
  {
    src: "https://images.unsplash.com/photo-1581092335397-9583eb92d232?q=80&w=1400",
    alt: "Precision Wire Assembly",
  },
  {
    src: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=1400",
    alt: "Wire Harness Manufacturing",
  },
  {
    src: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?q=80&w=1400",
    alt: "Cable Assembly Production",
  },
]

export default function Hero() {
  const [idx, setIdx] = useState(0)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)
  const n = SLIDES.length

  const start = () => {
    if (timer.current) clearInterval(timer.current)
    timer.current = setInterval(() => setIdx(p => (p + 1) % n), 5000)
  }
  const stop = () => { if (timer.current) clearInterval(timer.current) }

  useEffect(() => { start(); return stop }, [])

  const go = (i: number) => { setIdx((i + n) % n); start() }

  return (
    <section id="home" className="hero">
      <div className="W hero__split">

        {/* ── LEFT — Text ───────────────────────────────────────────── */}
        <div className="hero__c">
          <div className="lbl hero__lbl hu1">
            Superior Harness &amp; Assembly
          </div>

          <h1 className="D1 hero__h hu2">
            PRECISION<br />WIRING &amp;<br />ASSEMBLY
          </h1>

          <p className="hero__sub hu3">
            Precision-driven custom wire harness &amp; cable assembly manufacturer with over 30 years of combined industry experience — delivering reliable, cost-effective wiring solutions tailored to your exact specifications.
          </p>

          <div className="hero__btns hu4">
            <Link href="/products" className="btn bp">
              Shop Now <ArrowIcon />
            </Link>
            <Link href="#quote" className="btn bod">
              Get a Quote
            </Link>
          </div>
        </div>

        {/* ── RIGHT — Carousel ──────────────────────────────────────── */}
        <div
          className="hero-carousel hu2"
          style={{ height: 520 }}
          onMouseEnter={stop}
          onMouseLeave={start}
        >
          <div
            className="hero-carousel__track"
            style={{ transform: `translateX(-${idx * 100}%)` }}
          >
            {SLIDES.map((s, i) => (
              <div className="hero-carousel__slide" key={i}>
                <Image
                  src={s.src}
                  alt={s.alt}
                  fill
                  priority={i === 0}
                  sizes="(max-width: 900px) 100vw, 60vw"
                  style={{ objectFit: "cover" }}
                />
              </div>
            ))}
          </div>

          {/* Prev / Next */}
          <button
            className="hero-carousel__btn hero-carousel__btn--prev"
            onClick={() => go(idx - 1)}
            aria-label="Previous slide"
          >
            <ChevLeft />
          </button>
          <button
            className="hero-carousel__btn hero-carousel__btn--next"
            onClick={() => go(idx + 1)}
            aria-label="Next slide"
          >
            <ChevRight />
          </button>

          {/* Dots */}
          <div className="hero-carousel__dots">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                className={`hero-carousel__dot${i === idx ? " hero-carousel__dot--active" : ""}`}
                onClick={() => go(i)}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
