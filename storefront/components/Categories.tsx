import Link from "next/link"

const CATS = [
  { name: "Electronics",  sub: "Advanced tech & gadgets",   href: "/products?category=electronics"  },
  { name: "Fashion",      sub: "Premium apparel & style",   href: "/products?category=fashion"      },
  { name: "Accessories",  sub: "Precision-crafted details", href: "/products?category=accessories"  },
  { name: "Essentials",   sub: "Industrial daily use",      href: "/products?category=essentials"   },
]

function ArrowIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12,5 19,12 12,19" />
    </svg>
  )
}

// SVG placeholder matching the design's striped pattern
function CategoryPlaceholder({ name }: { name: string }) {
  const id = `cat-${name.replace(/\W/g, "")}`
  const colors: Record<string, { bg: string; line: string }> = {
    Electronics:  { bg: "#0D1520", line: "#1A2F44" },
    Fashion:      { bg: "#1A0F12", line: "#2E1A22" },
    Accessories:  { bg: "#0D1A14", line: "#1A2E22" },
    Essentials:   { bg: "#1A1408", line: "#2E2210" },
  }
  const { bg, line } = colors[name] ?? { bg: "#1A1A18", line: "#2A2A24" }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" style={{ width: "100%", height: "100%" }}>
      <rect width="300" height="400" fill={bg} />
      <defs>
        <pattern id={id} width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="9" y1="0" x2="9" y2="18" stroke={line} strokeWidth="2" opacity="0.6" />
        </pattern>
      </defs>
      <rect width="300" height="400" fill={`url(#${id})`} />
      <text x="150" y="200" fontFamily="monospace" fontSize="11" fill={line} opacity="0.9" textAnchor="middle" dominantBaseline="middle">
        {name.toUpperCase()}
      </text>
    </svg>
  )
}

export default function Categories() {
  return (
    <section id="categories" className="S" style={{ background: "var(--bg2)" }}>
      <div className="W">
        <div className="sHdr sHdr--c rv">
          <div className="lbl">SHOP BY CATEGORY</div>
          <h2 className="D2" style={{ marginTop: 16 }}>Explore Our Collections</h2>
        </div>
        <div className="catG">
          {CATS.map((c, i) => (
            <Link
              key={c.name}
              href={c.href}
              className="catC rv"
              style={{ transitionDelay: `${i * 0.07}s` }}
            >
              <CategoryPlaceholder name={c.name} />
              <div className="catC__ov" />
              <div className="catC__info">
                <div className="catC__name">{c.name}</div>
                <div className="catC__sub">{c.sub}</div>
              </div>
              <div className="catC__arr">
                <ArrowIcon />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
