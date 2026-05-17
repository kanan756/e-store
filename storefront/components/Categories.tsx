import Link from "next/link"

const CATS = [
  {
    name: "Wire Harnesses",
    sub: "Custom OEM & small-batch wiring",
    href: "/products?category=wire-harnesses",
  },
  {
    name: "Cable Assemblies",
    sub: "Multi-industry connector builds",
    href: "/products?category=cable-assemblies",
  },
  {
    name: "PCB Assemblies",
    sub: "SMT & through-hole boards",
    href: "/products?category=pcb-assemblies",
  },
  {
    name: "OEM Solutions",
    sub: "White goods, robotics & medical",
    href: "/products?category=oem-solutions",
  },
]

function ArrowIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12,5 19,12 12,19" />
    </svg>
  )
}

// SVG placeholder with diagonal-line texture and category label
function CategoryPlaceholder({ name }: { name: string }) {
  const id = `cat-${name.replace(/\W/g, "")}`
  const colors: Record<string, { bg: string; line: string }> = {
    "Wire Harnesses":   { bg: "#0A1A12", line: "#143322" },
    "Cable Assemblies": { bg: "#0A1218", line: "#132030" },
    "PCB Assemblies":   { bg: "#101A0A", line: "#1E3014" },
    "OEM Solutions":    { bg: "#160F0A", line: "#2A1A10" },
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
          <h2 className="D2" style={{ marginTop: 16 }}>Our Product Categories</h2>
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
