import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "About Us | CLASPO — Smart Home Solutions & Everyday Essentials",
  description:
    "Making Everyday Living Smarter, Simpler, and Better. Discover CLASPO's mission, vision, and curated range of innovative home, kitchen, and storage solutions.",
}

const WHAT_WE_OFFER = [
  {
    title: "Kitchen Tools & Gadgets",
    desc: "Time-saving prep tools, ergonomic utensils, and smart culinary accessories designed to simplify your everyday kitchen tasks.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2v20M6 2v20M2 12h20M7 2a5 5 0 0 1 5 5v5M17 2a5 5 0 0 0-5 5v5" />
      </svg>
    ),
  },
  {
    title: "Home Organization & Storage",
    desc: "Modular drawer dividers, closet organizers, and shelf decluttering essentials that bring neat elegance to your living space.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    title: "Cleaning Essentials",
    desc: "Efficient brushes, microfiber systems, and multi-surface hygiene utilities that make keeping your home spotless effortless.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      </svg>
    ),
  },
  {
    title: "Adhesive & No-Drill Solutions",
    desc: "Heavy-duty damage-free wall hooks, floating racks, and adhesive corner mounts engineered for firm, drill-free installation.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
  },
  {
    title: "Space-Saving Products",
    desc: "Collapsible containers, stackable racks, and multi-tier compact systems maximizing every square inch of your home.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 14 10 14 10 20" />
        <polyline points="20 10 14 10 14 4" />
        <line x1="14" y1="10" x2="21" y2="3" />
        <line x1="10" y1="14" x2="3" y2="21" />
      </svg>
    ),
  },
  {
    title: "Bathroom Accessories",
    desc: "Rust-resistant shower caddies, toothbrush sanitizing mounts, and quick-dry bath essentials blending modern style with durability.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" />
        <path d="M6 12V5a3 3 0 0 1 6 0v7" />
      </svg>
    ),
  },
  {
    title: "Smart Home Essentials",
    desc: "Thoughtful household gadgets, cable tidies, and smart conveniences crafted to elevate the comfort of modern domestic life.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
]

const WHY_CHOOSE = [
  {
    title: "Practical Innovation",
    desc: "We focus on real solutions that address daily pain points, making repetitive tasks quicker and simpler.",
  },
  {
    title: "Quality-Focused Selection",
    desc: "Every product is vetted for durability, safe non-toxic materials, and enduring daily performance.",
  },
  {
    title: "Affordable Convenience",
    desc: "Premium home improvements shouldn't cost a fortune. We deliver high utility at accessible price points.",
  },
  {
    title: "Everyday Functionality",
    desc: "Designed to seamlessly integrate into your routine without steep learning curves or complicated assembly.",
  },
  {
    title: "Customer-Centric Approach",
    desc: "Your satisfaction is paramount. Dedicated support, fast shipping, and easy returns back every order.",
  },
  {
    title: "Smarter Living",
    desc: "Helping households discover creative, neat, and efficient ways to elevate their daily lifestyle.",
  },
]

export default function AboutPage() {
  return (
    <main style={{ paddingTop: 120, background: "#FFFFFF" }}>
      {/* ── 1. Page Header ── */}
      <section style={{ background: "linear-gradient(180deg, #FFF8F3 0%, #FFFFFF 100%)", padding: "64px 0 48px", borderBottom: "1px solid #E5E5E5" }}>
        <div className="W" style={{ textAlign: "center", maxWidth: 840, margin: "0 auto" }}>
          <div
            style={{
              display: "inline-block",
              background: "#FFF0E5",
              color: "#D9570A",
              border: "1px solid rgba(243, 107, 18, 0.25)",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "6px 16px",
              borderRadius: 9999,
              marginBottom: 16,
            }}
          >
            About CLASPO
          </div>
          <h1
            style={{
              fontSize: "clamp(32px, 4.5vw, 48px)",
              fontWeight: 900,
              color: "#17191C",
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              marginBottom: 18,
            }}
          >
            Making Everyday Living <span style={{ color: "#F36B12" }}>Smarter, Simpler,</span> and Better.
          </h1>
          <p style={{ fontSize: 18, color: "#747474", lineHeight: 1.6, margin: 0 }}>
            Smart solutions for everyday living. Bringing thoughtful innovation, functional organization, and modern convenience to households worldwide.
          </p>
        </div>
      </section>

      {/* ── 2. Brand Story / Philosophy ── */}
      <section style={{ padding: "72px 0", background: "#FFFFFF" }}>
        <div className="W">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))",
              gap: 48,
              alignItems: "center",
            }}
          >
            {/* Visual Column */}
            <div style={{ position: "relative" }}>
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "4/3",
                  borderRadius: 24,
                  overflow: "hidden",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.06)",
                  border: "1px solid #E5E5E5",
                }}
              >
                <Image
                  src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1200"
                  alt="Modern organized home kitchen"
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>

              {/* Floating Badge */}
              <div
                style={{
                  position: "absolute",
                  bottom: -20,
                  right: 20,
                  background: "#FFFFFF",
                  borderRadius: 16,
                  padding: "16px 24px",
                  boxShadow: "0 8px 24px rgba(243, 107, 18, 0.15)",
                  border: "1.5px solid #FFF0E5",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: "#F36B12",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                  }}
                >
                  ✓
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#17191C" }}>CLASPO</div>
                  <div style={{ fontSize: 11, color: "#F36B12", fontWeight: 700, letterSpacing: "0.06em" }}>
                    SMART HOME SOLUTIONS
                  </div>
                </div>
              </div>
            </div>

            {/* Narrative Column */}
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: "#F36B12",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: 12,
                }}
              >
                Our Philosophy
              </div>
              <h2
                style={{
                  fontSize: "clamp(26px, 3.5vw, 36px)",
                  fontWeight: 800,
                  color: "#17191C",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.25,
                  marginBottom: 20,
                }}
              >
                Useful Innovation Should Make Everyday Tasks Effortless
              </h2>
              <p style={{ fontSize: 15.5, color: "#555555", lineHeight: 1.7, marginBottom: 16 }}>
                At <strong>CLASPO</strong>, we believe that everyday life should be easier, more organized, and more convenient. We are a modern home solutions brand dedicated to bringing smart, practical, and stylish products into your everyday routine.
              </p>
              <p style={{ fontSize: 15.5, color: "#555555", lineHeight: 1.7, marginBottom: 16 }}>
                From innovative kitchen tools and space-saving storage solutions to cleaning essentials, adhesive accessories, and household utilities, we carefully curate products that solve real-life problems.
              </p>
              <p style={{ fontSize: 15.5, color: "#555555", lineHeight: 1.7, marginBottom: 20 }}>
                We focus on combining functionality, reliability, affordability, and thoughtful design to deliver products that fit naturally into modern lifestyles. Whether you&apos;re organizing your home, simplifying your kitchen, improving storage, or discovering smarter everyday essentials, CLASPO is here to make a difference.
              </p>
              <div
                style={{
                  padding: "16px 20px",
                  background: "#FFF8F3",
                  borderRadius: 14,
                  borderLeft: "4px solid #F36B12",
                  borderTop: "1px solid #FFE4D1",
                  borderRight: "1px solid #FFE4D1",
                  borderBottom: "1px solid #FFE4D1",
                  color: "#D9570A",
                  fontWeight: 700,
                  fontSize: 15,
                }}
              >
                CLASPO &ndash; Smart Home Solutions
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Mission & Vision Dual Cards ── */}
      <section style={{ padding: "64px 0", background: "#F5F5F5", borderTop: "1px solid #E5E5E5", borderBottom: "1px solid #E5E5E5" }}>
        <div className="W">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))",
              gap: 32,
            }}
          >
            {/* Mission */}
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: 20,
                padding: "40px 36px",
                border: "1px solid #E5E5E5",
                boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: "#FFF0E5",
                  color: "#F36B12",
                  border: "1px solid rgba(243, 107, 18, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 20,
                }}
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h3 style={{ fontSize: 24, fontWeight: 800, color: "#17191C", marginBottom: 14, letterSpacing: "-0.01em" }}>
                Our Mission
              </h3>
              <p style={{ fontSize: 15.5, color: "#747474", lineHeight: 1.7, margin: 0 }}>
                Our mission is to simplify everyday living by offering practical, reliable, and affordable home solutions that bring greater convenience, organization, and efficiency to every household.
              </p>
            </div>

            {/* Vision */}
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: 20,
                padding: "40px 36px",
                border: "1px solid #E5E5E5",
                boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: "#F36B12",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 20,
                }}
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>
              <h3 style={{ fontSize: 24, fontWeight: 800, color: "#17191C", marginBottom: 14, letterSpacing: "-0.01em" }}>
                Our Vision
              </h3>
              <p style={{ fontSize: 15.5, color: "#747474", lineHeight: 1.7, margin: 0 }}>
                To become a trusted destination for innovative home and utility products, helping households discover smarter ways to organize, manage, and improve their everyday lives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. What We Offer ── */}
      <section style={{ padding: "80px 0", background: "#FFFFFF" }}>
        <div className="W">
          <div style={{ textAlign: "center", maxWidth: 680, margin: "0 auto 52px" }}>
            <div
              style={{
                display: "inline-block",
                background: "#FFF0E5",
                color: "#D9570A",
                border: "1px solid rgba(243, 107, 18, 0.2)",
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: "6px 14px",
                borderRadius: 9999,
                marginBottom: 12,
              }}
            >
              Our Range
            </div>
            <h2
              style={{
                fontSize: "clamp(28px, 3.8vw, 38px)",
                fontWeight: 800,
                color: "#17191C",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
                marginBottom: 12,
              }}
            >
              What We Offer
            </h2>
            <p style={{ fontSize: 16, color: "#747474", lineHeight: 1.6, margin: 0 }}>
              Thoughtfully curated collections created to solve real household challenges and make everyday living a joy.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 24,
            }}
          >
            {WHAT_WE_OFFER.map((item) => (
              <div
                key={item.title}
                style={{
                  background: "#F5F5F5",
                  borderRadius: 18,
                  padding: "32px 28px",
                  border: "1px solid #E5E5E5",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: "#FFF0E5",
                    color: "#F36B12",
                    border: "1px solid rgba(243, 107, 18, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 18,
                    boxShadow: "0 2px 6px rgba(243, 107, 18, 0.1)",
                  }}
                >
                  {item.icon}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "#17191C", marginBottom: 10 }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: 14, color: "#747474", lineHeight: 1.6, margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Why Choose CLASPO? ── */}
      <section style={{ padding: "80px 0", background: "#F5F5F5", borderTop: "1px solid #E5E5E5", borderBottom: "1px solid #E5E5E5" }}>
        <div className="W">
          <div style={{ textAlign: "center", maxWidth: 680, margin: "0 auto 52px" }}>
            <div
              style={{
                display: "inline-block",
                background: "#FFF0E5",
                color: "#D9570A",
                border: "1px solid rgba(243, 107, 18, 0.25)",
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: "6px 14px",
                borderRadius: 9999,
                marginBottom: 12,
              }}
            >
              The CLASPO Advantage
            </div>
            <h2
              style={{
                fontSize: "clamp(28px, 3.8vw, 38px)",
                fontWeight: 800,
                color: "#17191C",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
                marginBottom: 12,
              }}
            >
              Why Choose CLASPO?
            </h2>
            <p style={{ fontSize: 16, color: "#747474", lineHeight: 1.6, margin: 0 }}>
              Practical innovation, quality materials, and everyday simplicity designed around you.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))",
              gap: 24,
            }}
          >
            {WHY_CHOOSE.map((item, idx) => (
              <div
                key={item.title}
                style={{
                  background: "#FFFFFF",
                  borderRadius: 16,
                  padding: "28px 24px",
                  border: "1px solid #E5E5E5",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
                  display: "flex",
                  gap: 16,
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: "#F36B12",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: 13,
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  {idx + 1}
                </div>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: "#17191C", marginBottom: 6 }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: 14, color: "#747474", lineHeight: 1.6, margin: 0 }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. Shop CTA ── */}
      <section style={{ padding: "80px 0", background: "#303638", color: "#FFFFFF" }}>
        <div className="W" style={{ textAlign: "center", maxWidth: 720, margin: "0 auto" }}>
          <div
            style={{
              display: "inline-block",
              background: "rgba(243, 107, 18, 0.2)",
              color: "#F36B12",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "6px 14px",
              borderRadius: 9999,
              marginBottom: 16,
            }}
          >
            Smarter Living Starts Here
          </div>
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 42px)",
              fontWeight: 900,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              marginBottom: 16,
              color: "#FFFFFF",
            }}
          >
            Ready to Upgrade Your Home?
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.85)", lineHeight: 1.65, marginBottom: 32 }}>
            Explore our curated catalog of smart home essentials, kitchen organizers, and everyday utilities with fast shipping and dependable quality.
          </p>
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
                boxShadow: "0 4px 16px rgba(243, 107, 18, 0.35)",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              Explore Products
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12,5 19,12 12,19" />
              </svg>
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
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
