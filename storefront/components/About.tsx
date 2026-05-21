/**
 * @file components/About.tsx
 * @description About snippet shown on the home page.
 *   Links to the full /about page for more details.
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

export default function About() {
  return (
    <section id="about" className="abt" style={{ 
      position: "relative",
      overflow: "hidden"
    }}>
      <InteractiveBackground />
      <div className="W" style={{ position: "relative", zIndex: 1 }}>
        <div className="abt__c">
          <div className="lbl abt__lbl rv d1">ABOUT US</div>
          <h2 className="D2 abt__h rv d2">
            SUPERIOR<br />HARNESS &amp;<br />ASSEMBLY LLC
          </h2>
          <p className="abt__p rv d3">
            We are a custom wire harness and cable assembly manufacturer providing high-quality engineered wiring solutions for OEMs, medical devices, robotics, EV applications, and industrial automation. We support both prototype and production-level manufacturing with flexible low minimum order quantities.
          </p>
          <Link href="/about" className="btn bod rv d4" style={{ marginTop: 36 }}>
            Learn More <ArrowIcon />
          </Link>
        </div>
      </div>
    </section>
  )
}
