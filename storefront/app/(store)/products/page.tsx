import type { Metadata } from "next"
import type { Product } from "@/lib/sheets"
import ProductCard from "@/components/ProductCard"

export const metadata: Metadata = {
  title: "Shop All Products",
  description: "Browse our full catalog of premium industrial and lifestyle products.",
}

export const revalidate = 60

async function getAllProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_STORE_URL}/api/products`, {
      next: { revalidate: 60 },
    })
    const data = await res.json()
    return data.products ?? []
  } catch {
    return []
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const resolvedSearchParams = await searchParams
  let products = await getAllProducts()
  const query = resolvedSearchParams?.q?.toLowerCase() || ""

  if (query) {
    products = products.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.category.toLowerCase().includes(query)
    )
  }

  return (
    <div style={{ paddingTop: 120, paddingBottom: 80, background: "var(--bg)", minHeight: "100vh" }}>
      <div className="W">
        {/* Page header */}
        <div style={{ marginBottom: 64 }}>
          <div className="lbl" style={{ marginBottom: 16 }}>ALL PRODUCTS</div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <h1 className="D2">{query ? `Search: "${resolvedSearchParams?.q}"` : "Shop Everything"}</h1>
            {query && (
              <a href="/products" className="btn bod" style={{ padding: "8px 16px", fontSize: 13, marginTop: 8 }}>
                Clear Search
              </a>
            )}
          </div>
        </div>

        {products.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text2)" }}>
            <p>No products found. Add your first product in the Google Sheet.</p>
          </div>
        ) : (
          <div className="prodG">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
