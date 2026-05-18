import Link from "next/link"

function ArrowIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12,5 19,12 12,19" />
    </svg>
  )
}

export default function Banner() {
  return (
    <section className="bnr" style={{ 
      backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.75)), url('https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=2070')",
      backgroundSize: "cover",
      backgroundPosition: "center"
    }}>
      <div className="bnr__in W">
        <div className="lbl bnr__lbl rv">EXPLORE NOW</div>
        <h2 className="D2 bnr__h rv d1">SHOP COLLECTION</h2>
        <p className="bnr__s rv d2">Explore our latest premium selections.</p>
        <Link href="/products" className="btn bp rv d3">
          View Products <ArrowIcon />
        </Link>
      </div>
    </section>
  )
}
