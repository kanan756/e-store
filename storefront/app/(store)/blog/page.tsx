/**
 * @file app/(store)/blog/page.tsx
 * @description Public blog listing page — Server Component.
 *   Fetches all published blog posts from Google Sheets via getBlogs(true)
 *   and renders them as a responsive card grid with cover image, keyword
 *   tags, excerpt, and publish date.
 *
 *   Revalidates every 3600 seconds (1 hour) via Next.js ISR.
 *   Card hover animations are handled via a scoped CSS rule (no client JS
 *   needed, keeps the component as a Server Component for SEO).
 *
 * @owner Heet-P
 * @lastModified May 16, 2026
 */

import { getBlogs } from "@/lib/sheets"
import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Blog — Industry Insights & Updates",
  description: "Explore industry insights, product guides, and company updates from Client Store.",
}

export const revalidate = 3600

function isValidUrl(url: string) {
  if (!url) return false
  try { new URL(url); return true } catch { return false }
}

export default async function BlogListPage() {
  const blogs = await getBlogs(true) // published only

  return (
    <div style={{ minHeight: "100vh", paddingTop: 120, paddingBottom: 80 }}>
      {/* Inline hover style — avoids JS handlers in Server Component */}
      <style>{`
        .blog-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .blog-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.3); }
      `}</style>

      <div className="W">
        {/* Header */}
        <div style={{ marginBottom: 56 }}>
          <div className="lbl" style={{ marginBottom: 16 }}>INSIGHTS &amp; UPDATES</div>
          <h1 className="D2">Our Blog</h1>
          <p className="Bd" style={{ marginTop: 12, maxWidth: 560 }}>
            Industry knowledge, product guides, and company news — curated for professionals.
          </p>
        </div>

        {blogs.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "80px 0", color: "var(--text2)",
            background: "var(--cBg)", borderRadius: "var(--rL)", border: "1px solid var(--bd)",
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
            <p style={{ fontSize: 18 }}>No blog posts yet. Check back soon!</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 28 }}>
            {blogs.map((blog) => (
              <Link key={blog.slug} href={`/blog/${blog.slug}`} style={{ textDecoration: "none", display: "block" }}>
                <article className="blog-card" style={{
                  background: "var(--cBg)", border: "1px solid var(--bd)",
                  borderRadius: "var(--rL)", overflow: "hidden", height: "100%",
                }}>
                  {/* Cover image */}
                  <div style={{ aspectRatio: "16/9", background: "var(--bg2)", position: "relative", overflow: "hidden" }}>
                    {isValidUrl(blog.imageUrl) ? (
                      <Image src={blog.imageUrl} alt={blog.title} fill sizes="400px" style={{ objectFit: "cover" }} />
                    ) : (
                      <div style={{
                        height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                        background: "linear-gradient(135deg, #1e1e2a, #252535)", fontSize: 40,
                      }}>📝</div>
                    )}
                  </div>

                  <div style={{ padding: 24 }}>
                    {blog.keywords && (
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                        {blog.keywords.split(",").slice(0, 3).map((kw) => (
                          <span key={kw} style={{
                            fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                            background: "rgba(37,99,235,0.12)", color: "#60a5fa",
                            textTransform: "uppercase", letterSpacing: "0.05em",
                          }}>{kw.trim()}</span>
                        ))}
                      </div>
                    )}

                    <h2 style={{
                      fontFamily: "var(--font-sora)", fontSize: 18, fontWeight: 800,
                      color: "var(--text)", margin: "0 0 10px", lineHeight: 1.35,
                    }}>{blog.title}</h2>

                    {blog.metaDescription && (
                      <p style={{
                        fontSize: 14, color: "var(--text2)", margin: "0 0 16px", lineHeight: 1.6,
                        display: "-webkit-box", WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical", overflow: "hidden",
                      }}>{blog.metaDescription}</p>
                    )}

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      {blog.publishDate && (
                        <span style={{ fontSize: 12, color: "var(--textM)" }}>
                          {new Date(blog.publishDate).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </span>
                      )}
                      <span style={{ fontSize: 13, color: "#60a5fa", fontWeight: 700 }}>Read more →</span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
