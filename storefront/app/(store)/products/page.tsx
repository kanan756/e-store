import type { Metadata } from "next"
import { getProducts } from "@/lib/sheets"
import ProductCatalog from "@/components/ProductCatalog"

export const metadata: Metadata = {
  title: "Products & Collections | CLASPO — Smart Home Solutions",
  description: "Browse our dynamic catalog of practical home solutions, kitchen essentials, space-saving storage, and everyday utilities.",
}

// Ensure dynamically fetched products from Google Sheets are always fresh
export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>
}) {
  const resolved = await searchParams
  const categoryParam = resolved?.category || "all"
  const queryParam = resolved?.q || ""

  // Fetch all active products directly from Google Sheets
  const products = await getProducts()

  return (
    <div style={{ background: "var(--bg, #F9FAFB)", minHeight: "100vh" }}>
      {/* ── Inner Banner ── */}
      <div style={{ paddingTop: 120 }}>
        <section className="inner-banner">
          <div className="W">
            <div className="inner-banner__eyebrow">Product Collections</div>
            <h1 className="D2 inner-banner__h">Smart Home Essentials</h1>
            <p className="inner-banner__p">
              Explore our full range of practical home solutions, space-saving organizers, and everyday utilities &mdash; crafted for a smarter living experience.
            </p>
          </div>
        </section>
      </div>

      {/* ── Dynamic Products Catalog & Category Filters ── */}
      <section style={{ padding: "48px 0 80px" }}>
        <ProductCatalog
          initialProducts={products}
          initialCategory={categoryParam}
          initialQuery={queryParam}
        />
      </section>

      {/* ── Bottom Brand CTA ── */}
      <section style={{ padding: "80px 0", background: "#303638", color: "#FFFFFF" }}>
        <div className="W" style={{ textAlign: "center", maxWidth: 680, margin: "0 auto" }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, marginBottom: 14, color: "#FFFFFF", letterSpacing: "-0.02em" }}>
            Making Everyday Living Effortless
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.85)", lineHeight: 1.65, marginBottom: 28 }}>
            Discover practical, stylish, and durable solutions designed to make your daily routine smarter and simpler.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href="/contact"
              style={{
                background: "#F36B12",
                color: "#FFFFFF",
                fontSize: 14,
                fontWeight: 700,
                padding: "14px 32px",
                borderRadius: 9999,
                textDecoration: "none",
                boxShadow: "0 4px 14px rgba(243, 107, 18, 0.35)",
              }}
            >
              Contact Support &rarr;
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
