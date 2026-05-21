import type { Metadata } from "next"
import type { Product } from "@/lib/sheets"
import ShopFilters from "@/components/ShopFilters"

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
  const products = await getAllProducts()
  const query = resolvedSearchParams?.q?.toLowerCase() || ""

  return (
    <div style={{ paddingTop: 120, paddingBottom: 80, background: "var(--bg)", minHeight: "100vh" }}>
      <div className="W">
        <ShopFilters initialProducts={products} initialQuery={query} />
      </div>
    </div>
  )
}
