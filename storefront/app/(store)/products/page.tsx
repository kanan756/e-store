import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"

export const metadata: Metadata = {
  title: "Products & Collections | CLASPO — Smart Home Solutions",
  description: "Explore our curated collections of kitchen tools, home organization, space-saving storage, cleaning essentials, and adhesive solutions.",
}

const PRODUCTS = [
  {
    id: "kitchen-tools",
    title: "Kitchen Tools & Gadgets",
    img: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800",
    desc: "Innovative culinary gadgets, ergonomic meal prep tools, and rotating spice turntables designed to make cooking and kitchen routines effortless.",
    capabilities: [
      "Ergonomic food prep tools & slicers",
      "360° rotating turntable spice organizers",
      "Food-grade silicone & stainless steel materials",
      "Compact dishwasher-safe designs",
      "Smart pantry storage accessories",
    ],
    href: "/shop?category=Kitchen+Essentials",
  },
  {
    id: "home-organization",
    title: "Home Organization & Storage",
    img: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800",
    desc: "Modular drawer dividers, closet organizers, and shelf decluttering essentials that bring neat elegance and harmony to your living space.",
    capabilities: [
      "Expandable modular drawer dividers",
      "Closet & wardrobe garment organizers",
      "Stackable clear storage bins & boxes",
      "Under-sink 2-tier sliding organizers",
      "Durable, easy-wipe composite materials",
    ],
    href: "/shop?category=Home+Organization",
  },
  {
    id: "cleaning-essentials",
    title: "Cleaning Essentials",
    img: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=800",
    desc: "Efficient brushes, microfiber systems, and multi-surface hygiene utilities that make keeping your home spotless, sanitary, and fresh effortless.",
    capabilities: [
      "Multi-angle crevice & tile cleaning brushes",
      "Microfiber absorbent cloth sets",
      "Ergonomic squeegees for glass & mirrors",
      "Quick-dry antimicrobial bristles",
      "Compact hanging storage loops",
    ],
    href: "/shop?category=Cleaning+Essentials",
  },
  {
    id: "adhesive-solutions",
    title: "Adhesive & No-Drill Solutions",
    img: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800",
    desc: "Heavy-duty damage-free wall hooks, floating racks, and adhesive corner mounts engineered for firm, drill-free installation on tiles, glass, and wood.",
    capabilities: [
      "Ultra-strong waterproof acrylic adhesive backing",
      "Holds up to 15 lbs with zero wall damage",
      "Clean residue-free removal",
      "Corrosion-resistant stainless & ABS hooks",
      "Ideal for rental homes and tile walls",
    ],
    href: "/shop?category=Adhesive+Solutions",
  },
  {
    id: "space-saving",
    title: "Space-Saving Products",
    img: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=800",
    desc: "Collapsible containers, stackable racks, and multi-tier compact systems maximizing every square inch of your home cabinets and countertops.",
    capabilities: [
      "Collapsible food-grade silicone storage",
      "Tiered corner shelving units",
      "Vertical hanging organizer racks",
      "Modular nesting designs",
      "Maximizes compact apartment spaces",
    ],
    href: "/shop?category=Storage+Solutions",
  },
  {
    id: "bathroom-accessories",
    title: "Bathroom Accessories",
    img: "https://images.unsplash.com/photo-1584622781564-1d987f7333c1?q=80&w=800",
    desc: "Rust-resistant shower caddies, self-draining soap trays, and bath storage mounts blending modern minimalist aesthetics with everyday durability.",
    capabilities: [
      "Rustproof aluminum & matte finishes",
      "Rapid water-draining slotted bases",
      "Adhesive drill-free wall mounts",
      "Integrated razor & loofah hooks",
      "Waterproof & easy to sanitize",
    ],
    href: "/shop?category=Bathroom+Accessories",
  },
  {
    id: "smart-home",
    title: "Smart Home Essentials",
    img: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800",
    desc: "Thoughtful household gadgets, cable tidies, and smart conveniences crafted to elevate comfort, organization, and peace of mind.",
    capabilities: [
      "Cable management clips & organizers",
      "Touchless automatic sensor accessories",
      "Magnetic wall utensil & tool bars",
      "Sleek minimalist silhouettes",
      "Built for modern everyday living",
    ],
    href: "/shop",
  },
]

export default function ProductsPage() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      {/* Inner Banner */}
      <div style={{ paddingTop: 120 }}>
        <section className="inner-banner">
          <div className="W">
            <div className="inner-banner__eyebrow">Product Collections</div>
            <h1 className="D2 inner-banner__h">Smart Home Essentials</h1>
            <p className="inner-banner__p">
              Explore our curated range of practical home solutions, space-saving organizers, and everyday utilities &mdash; crafted for a smarter living experience.
            </p>
          </div>
        </section>
      </div>

      {/* Products List */}
      <section className="sec" style={{ padding: "64px 0" }}>
        <div className="W">
          <div style={{ display: "flex", flexDirection: "column", gap: 64 }}>
            {PRODUCTS.map(({ id, title, img, desc, capabilities, href }, idx) => (
              <div
                key={id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                  gap: 48,
                  alignItems: "center",
                  background: "#FFFFFF",
                  border: "1px solid #E5E5E5",
                  borderRadius: 24,
                  padding: "40px",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                  direction: idx % 2 === 1 ? "rtl" : "ltr",
                }}
              >
                {/* Image */}
                <div style={{ direction: "ltr", position: "relative", height: 320, borderRadius: 16, overflow: "hidden", background: "#F5F5F5" }}>
                  <Image
                    src={img}
                    alt={title}
                    fill
                    style={{ objectFit: "cover" }}
                    sizes="(max-width: 900px) 100vw, 50vw"
                  />
                </div>

                {/* Content */}
                <div style={{ direction: "ltr" }}>
                  <div
                    style={{
                      display: "inline-block",
                      background: "#FFF0E5",
                      color: "#D9570A",
                      border: "1px solid rgba(243, 107, 18, 0.25)",
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      padding: "4px 12px",
                      borderRadius: 9999,
                      marginBottom: 12,
                    }}
                  >
                    CLASPO Collection
                  </div>
                  <h2 style={{ fontSize: 28, fontWeight: 900, color: "#17191C", marginBottom: 14, letterSpacing: "-0.02em" }}>{title}</h2>
                  <p style={{ fontSize: 15.5, lineHeight: 1.7, color: "#747474", marginBottom: 24 }}>{desc}</p>

                  {/* Capabilities list */}
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8, marginBottom: 28, padding: 0 }}>
                    {capabilities.map(cap => (
                      <li key={cap} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#444444" }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#F36B12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        {cap}
                      </li>
                    ))}
                  </ul>

                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <Link
                      href={href}
                      style={{
                        background: "#F36B12",
                        color: "#FFFFFF",
                        fontSize: 14,
                        fontWeight: 700,
                        padding: "12px 28px",
                        borderRadius: 9999,
                        textDecoration: "none",
                        boxShadow: "0 4px 14px rgba(243, 107, 18, 0.3)",
                      }}
                    >
                      Shop Collection &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "80px 0", background: "#303638", color: "#FFFFFF" }}>
        <div className="W" style={{ textAlign: "center", maxWidth: 680, margin: "0 auto" }}>
          <h2 style={{ fontSize: 34, fontWeight: 900, marginBottom: 14, color: "#FFFFFF", letterSpacing: "-0.02em" }}>Making Everyday Living Effortless</h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.85)", lineHeight: 1.65, marginBottom: 28 }}>Discover practical, stylish, and durable solutions designed to make your daily routine smarter and simpler.</p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/shop"
              style={{
                background: "#F36B12",
                color: "#FFFFFF",
                fontSize: 14,
                fontWeight: 800,
                padding: "14px 32px",
                borderRadius: 9999,
                textDecoration: "none",
                boxShadow: "0 4px 14px rgba(243, 107, 18, 0.35)",
              }}
            >
              Explore Full Catalog &rarr;
            </Link>
            <Link
              href="/contact"
              style={{
                background: "rgba(255,255,255,0.12)",
                color: "#FFFFFF",
                border: "1.5px solid rgba(255,255,255,0.3)",
                fontSize: 14,
                fontWeight: 700,
                padding: "14px 28px",
                borderRadius: 9999,
                textDecoration: "none",
              }}
            >
              Contact Support
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
