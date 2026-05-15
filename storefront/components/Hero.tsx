"use client"

import Link from "next/link"

function ArrowIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12,5 19,12 12,19" />
    </svg>
  )
}

export default function Hero() {
  return (
    <section id="home" className="hero">
      <div className="W">
        <div className="hero__c">
          <div className="lbl hero__lbl hu1">
            PREMIUM INDUSTRIAL &amp; LIFESTYLE PRODUCTS
          </div>
          <h1 className="D1 hero__h hu2">
            DISCOVER<br />PREMIUM<br />PRODUCTS
          </h1>
          <p className="hero__sub hu3">
            Curated collections crafted for quality,<br />
            performance, and modern everyday needs.
          </p>
          <div className="hero__btns hu4">
            <Link href="/products" className="btn bp">
              Shop Now <ArrowIcon />
            </Link>
            <Link href="/#categories" className="btn bo">
              Explore Categories
            </Link>
          </div>
        </div>
      </div>
      <div className="hero__scroll">
        <span className="hscl" />
        SCROLL
      </div>
    </section>
  )
}
