import Link from "next/link"

function ArrowIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12,5 19,12 12,19" />
    </svg>
  )
}

export default function Cta() {
  return (
    <section id="contact" className="cta">
      <div className="W">
        <h2 className="D3 cta__h rv">
          Ready To Elevate Your<br />Shopping Experience?
        </h2>
        <p className="cta__s rv d1">
          Get in touch with our team for personalized solutions.
        </p>
        <Link href="mailto:hello@clientstore.com" className="btn bp rv d2">
          Contact Us <ArrowIcon />
        </Link>
      </div>
    </section>
  )
}
