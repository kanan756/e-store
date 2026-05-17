/**
 * @file components/About.tsx
 * @description About snippet shown on the home page.
 *   Links to the full /about page for more details.
 *
 * @owner Heet-P
 * @lastModified May 18, 2026
 */

import Link from "next/link"

function ArrowIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12,5 19,12 12,19" />
    </svg>
  )
}

export default function About() {
  return (
    <section id="about" className="abt">
      <div className="W">
        <div className="abt__c">
          <div className="lbl abt__lbl rv d1">ABOUT US</div>
          <h2 className="D2 abt__h rv d2">
            SUPERIOR<br />HARNESSING &amp;<br />ASSEMBLY
          </h2>
          <p className="abt__p rv d3">
            We specialise in precision wire harnessing, cable assembly, and PCB assembly services
            for OEMs, small manufacturers, robotics companies, medical device makers, and white goods producers.
            Built on a foundation of quality, reliability, and deep industry expertise.
          </p>
          <Link href="/about" className="btn bod rv d4" style={{ marginTop: 36 }}>
            Learn More <ArrowIcon />
          </Link>
        </div>
      </div>
    </section>
  )
}
