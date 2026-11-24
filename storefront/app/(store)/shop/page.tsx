import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>
}) {
  const resolved = await searchParams
  const params = new URLSearchParams()
  if (resolved?.q) params.set("q", resolved.q)
  if (resolved?.category) params.set("category", resolved.category)
  const qs = params.toString()
  redirect(qs ? `/products?${qs}` : "/products")
}
