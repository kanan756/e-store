import Link from "next/link"
import Image from "next/image"
import type { Blog } from "@/lib/sheets"

interface LatestBlogsProps {
  blogs?: Blog[]
}

const FALLBACK_BLOGS = [
  {
    title: "Understanding IPC/WHMA-A-620 Class 3 Requirements for Critical Wire Harnesses",
    slug: "understanding-ipc-whma-a-620-class-3",
    publishDate: "2026-04-12",
    metaDescription: "A deep dive into acceptance criteria, crimp pull forces, and insulation clearance requirements for medical and aerospace grade harnesses.",
    imageUrl: "/images/custom-wire-harness.webp",
    keywords: "Engineering, Standards",
  },
  {
    title: "Ultrasonic Splicing vs. Traditional Soldering in High-Flex Automotive Applications",
    slug: "ultrasonic-splicing-vs-soldering-automotive",
    publishDate: "2026-03-28",
    metaDescription: "Why solid-state acoustic welding eliminates brittle solder joints, reduces joint resistance, and extends cyclic fatigue life.",
    imageUrl: "/images/ultrasonic-splicing.webp",
    keywords: "Manufacturing, Wire Tech",
  },
  {
    title: "Selecting Low-Pressure Overmolding Resins for IP67 & IP68 Marine & EV Assemblies",
    slug: "selecting-overmolding-resins-ip67-marine-ev",
    publishDate: "2026-03-15",
    metaDescription: "How thermoplastic polyamide chemistry protects internal electronic sensors and connector pins from water immersion and severe vibration.",
    imageUrl: "/images/over-molding.webp",
    keywords: "Design Guide, Overmolding",
  },
]

export default function LatestBlogs({ blogs = [] }: LatestBlogsProps) {
  // Use actual blogs from Google Sheets first, fallback to curated technical posts if empty
  const displayBlogs = blogs && blogs.length > 0 ? blogs.slice(0, 3) : FALLBACK_BLOGS

  return (
    <section className="sec" style={{ background: "#FFFFFF", padding: "80px 0" }}>
      <div className="W">
        {/* Header */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 20, marginBottom: 44 }}>
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "var(--claspo-lavender)",
                color: "var(--claspo-purple)",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: "6px 14px",
                borderRadius: 9999,
                marginBottom: 14,
              }}
            >
              Latest Insights
            </div>
            <h2
              style={{
                fontSize: "clamp(26px, 3.5vw, 38px)",
                fontWeight: 800,
                color: "var(--claspo-text)",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
                margin: 0,
              }}
            >
              Engineering &amp; Manufacturing Articles
            </h2>
          </div>

          <Link
            href="/blog"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              color: "var(--claspo-purple)",
              fontWeight: 700,
              fontSize: 14,
              textDecoration: "none",
            }}
          >
            Browse All Articles
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12,5 19,12 12,19" />
            </svg>
          </Link>
        </div>

        {/* 3 Blog Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 28,
          }}
        >
          {displayBlogs.map((b, i) => (
            <article
              key={b.slug || i}
              style={{
                background: "#FFFFFF",
                borderRadius: 18,
                border: "1px solid #EBE9F2",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 4px 18px rgba(0,0,0,0.03)",
                transition: "transform 0.25s ease, box-shadow 0.25s ease",
              }}
              className="claspo-blog-card"
            >
              {/* Media */}
              <Link href={`/blog/${b.slug}`} style={{ position: "relative", width: "100%", aspectRatio: "16/9", display: "block", background: "#EDE9F6", overflow: "hidden" }}>
                <Image
                  src={b.imageUrl || "/images/custom-wire-harness.webp"}
                  alt={b.title}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </Link>

              {/* Body */}
              <div style={{ padding: "24px 22px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
                  <span
                    style={{
                      background: "var(--claspo-lavender)",
                      color: "var(--claspo-purple)",
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "4px 8px",
                      borderRadius: 6,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {b.keywords?.split(",")[0] || "Article"}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--claspo-muted)" }}>
                    {b.publishDate || "Recent"}
                  </span>
                </div>

                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: "var(--claspo-text)",
                    lineHeight: 1.35,
                    marginBottom: 10,
                    letterSpacing: "-0.01em",
                  }}
                >
                  <Link href={`/blog/${b.slug}`} style={{ color: "inherit", textDecoration: "none" }}>
                    {b.title}
                  </Link>
                </h3>

                <p
                  style={{
                    fontSize: 14,
                    color: "var(--claspo-muted)",
                    lineHeight: 1.6,
                    margin: "0 0 18px 0",
                    flexGrow: 1,
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {b.metaDescription || "Read our technical analysis and recommendations from the CLASPO engineering team."}
                </p>

                <div style={{ marginTop: "auto", paddingTop: 14, borderTop: "1px solid #F1F1F5" }}>
                  <Link
                    href={`/blog/${b.slug}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 13.5,
                      fontWeight: 700,
                      color: "var(--claspo-purple)",
                      textDecoration: "none",
                    }}
                  >
                    Read Article
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12,5 19,12 12,19" />
                    </svg>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
