import type { Metadata } from "next"
import { getProducts } from "@/lib/sheets"
import ShopFilters from "@/components/ShopFilters"

export const metadata: Metadata = {
  title: "Shop All Products",
  description: "Browse our full catalog of premium industrial and lifestyle products.",
}

export const revalidate = 60

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const resolvedSearchParams = await searchParams
  const products = await getProducts()
  const query = resolvedSearchParams?.q?.toLowerCase() || ""

  return (
    <div style={{ paddingTop: 120, paddingBottom: 80, background: "var(--bg)", minHeight: "100vh" }}>
      <div className="W">
        <ShopFilters initialProducts={products} initialQuery={query} />
      </div>
    </div>
  )
}
