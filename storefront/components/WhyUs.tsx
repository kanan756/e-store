import { InteractiveBackground } from "@/components/InteractiveBackground"

function ArrowIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12,5 19,12 12,19" />
    </svg>
  )
}

const FEATS = [
  { t: "Premium Quality",     d: "Industrial-grade materials, rigorously tested and certified to international standards." },
  { t: "Fast Delivery",       d: "Expedited shipping directly to your door within 48 business hours, guaranteed." },
  { t: "Secure Payments",     d: "End-to-end encrypted transactions with multiple payment methods fully supported." },
  { t: "Trusted Service",     d: "Over 10,000 satisfied customers globally. 24/7 dedicated support, always." },
  { t: "Curated Collections", d: "Every product hand-picked and vetted by our industrial procurement experts." },
]

export default function WhyUs() {
  return (
    <section className="S" style={{ 
      position: "relative",
      overflow: "hidden",
      borderTop: "1px solid var(--bd)",
      borderBottom: "1px solid var(--bd)",
    }}>
      <InteractiveBackground />
      <div className="W" style={{ position: "relative", zIndex: 1 }}>
        <div className="wyG">
          <div className="wyL">
            <div className="lbl rv" style={{ marginBottom: 28 }}>WHY CHOOSE US</div>
            <h2 className="D1 rv d1" style={{ marginBottom: 24, fontSize: "56px", lineHeight: "1.1" }}>
              Built For<br />Professionals.<br />Designed For<br />Everyone.
            </h2>
            <p className="Bd rv d2" style={{ marginBottom: 40, fontSize: "20px" }}>
              Every product in our catalog is chosen with care, tested for quality, and backed
              by our unwavering commitment to excellence.
            </p>
            <button className="btn bp rv d3">
              Learn More <ArrowIcon />
            </button>
          </div>
          <div className="featL">
            {FEATS.map((f, i) => (
              <div key={i} className="feat rv" style={{ transitionDelay: `${i * 0.07}s` }}>
                <div className="feat__n">0{i + 1}</div>
                <div>
                  <div className="feat__t">{f.t}</div>
                  <div className="feat__d">{f.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
