/**
 * @file components/Cta.tsx
 * @description Call-to-action section on the home page.
 *   "Contact Us" now correctly links to the /contact page.
 *
 * @owner Heet-P
 * @lastModified May 18, 2026
 */

import Link from "next/link"
import { InteractiveBackground } from "@/components/InteractiveBackground"

function ArrowIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12,5 19,12 12,19" />
    </svg>
  )
}

export default function Cta() {
  return (
    <section id="cta" className="cta" style={{ 
      position: "relative",
      overflow: "hidden"
    }}>
      <InteractiveBackground />
      <div className="W" style={{ position: "relative", zIndex: 1 }}>
        <h2 className="D3 cta__h rv">
          Ready to Partner With Us?
        </h2>
        <p className="cta__s rv d1">
          Get in touch for custom wire harness, cable assembly, or PCB assembly solutions tailored to your OEM requirements.
        </p>
        <Link href="/contact" className="btn bp rv d2">
          Contact Us <ArrowIcon />
        </Link>
      </div>
    </section>
  )
}
