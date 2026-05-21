/**
 * @file components/Footer.tsx
 * @description Global site footer — Server Component.
 *   Static four-column layout:
 *     1. Brand column  – Logo, tagline, social icon buttons
 *     2. Quick Links   – Home, About, Shop, Categories, Contact
 *     3. Support Links – FAQ, Shipping Policy, Returns, Track Order, Warranty
 *     4. Contact Info  – Email, phone, physical address
 *   Bottom bar: copyright notice + Privacy / Terms / Cookies links.
 *
 * @owner Heet-P
 * @lastModified May 16, 2026
 */

import Link from "next/link"

const SOCIALS = ["X", "in", "f", "IG"]
const QUICK_LINKS = ["Home", "About", "Shop", "Categories", "Contact"]
const SUPPORT_LINKS = ["Track Order"]

export default function Footer() {
  return (
    <footer className="ft">
      <div className="W">
        <div className="ft__g">
          {/* Brand */}
          <div>
            <div className="ft__brand">SUPERIOR HARNESS & ASSEMBLY LLC</div>
            <p className="ft__desc">
              Custom wire harness and cable assembly manufacturer specializing in high-quality engineered wiring solutions.
            </p>
            <div className="ft__soc">
              {SOCIALS.map((s) => (
                <div key={s} className="ft__sb">{s}</div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <div className="ft__ch">Quick Links</div>
            <div className="ft__lks">
              {QUICK_LINKS.map((l) => (
                <Link key={l} href={
                  l === "Shop" ? "/products" : 
                  l === "Home" ? "/" : 
                  l === "Contact" ? "/contact" : 
                  `/#${l.toLowerCase()}`
                }>
                  {l}
                </Link>
              ))}
            </div>
          </div>

          {/* Support */}
          <div>
            <div className="ft__ch">Support</div>
            <div className="ft__lks">
              {SUPPORT_LINKS.map((l) => (
                <Link key={l} href={l === "Track Order" ? "/track-order" : "#"}>{l}</Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <div className="ft__ch">Contact</div>
            <div className="ft__ci">pateltushar1987@gmail.com</div>
            <div className="ft__ci">734 891 0248</div>
            <div className="ft__ci">
              Canton<br />Michigan, 48187
            </div>
          </div>
        </div>

        <div className="ft__btm">
          <div className="ft__copy">© 2026 Superior Harness & Assembly LLC. All rights reserved.</div>
          <div className="ft__bls">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/cookies">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
