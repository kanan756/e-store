"use client"

import Link from "next/link"
import Image from "next/image"
import type { Blog } from "@/lib/sheets"

interface LatestBlogsProps {
  blogs?: Blog[]
}

const FALLBACK_BLOGS = [
  {
    title: "10 Simple Space-Saving Storage Ideas to Declutter Small Kitchens",
    slug: "space-saving-storage-ideas-kitchen",
    publishDate: "2026-05-10",
    metaDescription: "Practical tips, vertical organizer hacks, and expandable racks to double your pantry and cabinet storage capacity.",
    imageUrl: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800",
    keywords: "Kitchen, Organization",
  },
  {
    title: "The Ultimate Guide to Damage-Free Wall Mounting with Heavy-Duty Adhesive Hooks",
    slug: "guide-damage-free-adhesive-wall-hooks",
    publishDate: "2026-04-28",
    metaDescription: "How to properly prep wall surfaces, hang heavy caddies without drilling, and remove hooks without leaving marks or peeling paint.",
    imageUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800",
    keywords: "Home Tips, Adhesive",
  },
  {
    title: "How to Organize Deep Drawers and Bathroom Cabinets for Daily Efficiency",
    slug: "organize-drawers-bathroom-cabinets",
    publishDate: "2026-04-15",
    metaDescription: "Discover how modular drawer dividers and moisture-resistant organizers make finding essentials effortless every morning.",
    imageUrl: "https://images.unsplash.com/photo-1584622781564-1d987f7333c1?q=80&w=800",
    keywords: "Smart Living, Storage",
  },
]

export default function LatestBlogs({ blogs = [] }: LatestBlogsProps) {
  // Use actual blogs from Google Sheets first, fallback to home living articles if empty
  const displayBlogs = blogs && blogs.length > 0 ? blogs.slice(0, 3) : FALLBACK_BLOGS

  return (
    <section className="sec" style={{ background: "#FFFFFF", padding: "80px 0", borderBottom: "1px solid #E5E5E5" }}>
      <div className="W">
        {/* Header */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 20, marginBottom: 44 }}>
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "#FFF0E5",
                color: "#D9570A",
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: "6px 14px",
                borderRadius: "4px",
                border: "1px solid rgba(243, 107, 18, 0.25)",
                marginBottom: 14,
              }}
            >
              Latest Insights
            </div>
            <h2
              style={{
                fontSize: "clamp(26px, 3.5vw, 38px)",
                fontWeight: 800,
                color: "#17191C",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
                margin: 0,
              }}
            >
              Home Ideas &amp; Everyday Guides
            </h2>
          </div>

          <Link
            href="/blog"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              color: "#F36B12",
              fontWeight: 700,
              fontSize: 14,
              textDecoration: "none",
              transition: "transform 0.15s ease, color 0.15s ease",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = "#D9570A"
              e.currentTarget.style.transform = "translateX(3px)"
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = "#F36B12"
              e.currentTarget.style.transform = "translateX(0)"
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
                borderRadius: 12,
                border: "1px solid #E5E5E5",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "#F36B12"
                e.currentTarget.style.transform = "translateY(-4px)"
                e.currentTarget.style.boxShadow = "0 10px 24px rgba(243, 107, 18, 0.12)"
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "#E5E5E5"
                e.currentTarget.style.transform = "translateY(0)"
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.03)"
              }}
            >
              {/* Media */}
              <Link href={`/blog/${b.slug}`} style={{ position: "relative", width: "100%", aspectRatio: "16/9", display: "block", background: "#F5F5F5", overflow: "hidden" }}>
                <Image
                  src={b.imageUrl || "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800"}
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
                      background: "#FFF0E5",
                      color: "#D9570A",
                      border: "1px solid rgba(243, 107, 18, 0.2)",
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "4px 8px",
                      borderRadius: 4,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {b.keywords?.split(",")[0] || "Home Guide"}
                  </span>
                  <span style={{ fontSize: 12, color: "#747474" }}>
                    {b.publishDate || "Recent"}
                  </span>
                </div>

                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: "#17191C",
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
                    color: "#747474",
                    lineHeight: 1.6,
                    margin: "0 0 18px 0",
                    flexGrow: 1,
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {b.metaDescription || "Read our practical home organization tips and product recommendations from CLASPO."}
                </p>

                <div style={{ marginTop: "auto", paddingTop: 14, borderTop: "1px solid #E5E5E5" }}>
                  <Link
                    href={`/blog/${b.slug}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 13.5,
                      fontWeight: 700,
                      color: "#F36B12",
                      textDecoration: "none",
                    }}
                  >
                    Read Guide
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
