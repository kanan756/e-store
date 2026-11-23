import type { Metadata } from "next"
import { getProducts } from "@/lib/sheets"
import ShopFilters from "@/components/ShopFilters"

export const metadata: Metadata = {
  title: "Shop All Products | CLASPO — Smart Home Solutions",
  description: "Browse our full catalog of smart home solutions, kitchen essentials, storage products, and everyday utilities.",
}

export const revalidate = 60

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>
}) {
  const resolvedSearchParams = await searchParams
  const products = await getProducts()
  const query = resolvedSearchParams?.q?.toLowerCase() || ""

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div style={{ paddingTop: 120 }}>
        <section className="inner-banner">
          <div className="W">
            <div className="inner-banner__eyebrow">Online Store</div>
            <h1 className="D2 inner-banner__h">Shop CLASPO Products</h1>
            <p className="inner-banner__p">
              Browse and order from our catalog of practical home solutions, kitchen gadgets, and storage organizers &mdash; designed to make your daily routine simpler, smarter, and more convenient.
            </p>
          </div>
        </section>
      </div>

      <div className="W" style={{ paddingTop: 56, paddingBottom: 80 }}>
        <ShopFilters initialProducts={products} initialQuery={query} />
      </div>
    </div>
  )
}
