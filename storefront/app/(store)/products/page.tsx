import type { Metadata } from "next"
import { medusa } from "@/lib/medusa-client"
import ProductCard from "@/components/ProductCard"

export const metadata: Metadata = {
  title: "Shop All Products",
  description:
    "Browse our full catalog of premium industrial and lifestyle products.",
}

export const revalidate = 60

async function getAllProducts() {
  try {
    const { products } = await medusa.products.list({ limit: 100 })
    return products
  } catch {
    return []
  }
}

export default async function ProductsPage() {
  const products = await getAllProducts()

  return (
    <div style={{ paddingTop: 120, paddingBottom: 80, background: "var(--bg)", minHeight: "100vh" }}>
      <div className="W">
        {/* Page header */}
        <div style={{ marginBottom: 64 }}>
          <div className="lbl" style={{ marginBottom: 16 }}>ALL PRODUCTS</div>
          <h1 className="D2">Shop Everything</h1>
        </div>

        {products.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text2)" }}>
            <p>No products found. Add your first product in the admin panel.</p>
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
