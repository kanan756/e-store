import Link from "next/link"

const SOCIALS = ["X", "in", "f", "IG"]
const QUICK_LINKS = ["Home", "About", "Shop", "Categories", "Contact"]
const SUPPORT_LINKS = ["FAQ", "Shipping Policy", "Returns", "Track Order", "Warranty"]

export default function Footer() {
  return (
    <footer className="ft">
      <div className="W">
        <div className="ft__g">
          {/* Brand */}
          <div>
            <div className="ft__brand">CLIENT STORE</div>
            <p className="ft__desc">
              Premium industrial and lifestyle products — crafted for
              professionals and everyday excellence.
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
                <Link key={l} href={l === "Shop" ? "/products" : l === "Home" ? "/" : `/#${l.toLowerCase()}`}>
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
                <Link key={l} href="#">{l}</Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <div className="ft__ch">Contact</div>
            <div className="ft__ci">hello@clientstore.com</div>
            <div className="ft__ci">+1 (800) 555-0190</div>
            <div className="ft__ci">
              Industrial Park<br />New York, NY 10001
            </div>
          </div>
        </div>

        <div className="ft__btm">
          <div className="ft__copy">© 2026 Client Store. All rights reserved.</div>
          <div className="ft__bls">
            <Link href="#">Privacy</Link>
            <Link href="#">Terms</Link>
            <Link href="#">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
