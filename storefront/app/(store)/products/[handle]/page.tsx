import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { medusa } from "@/lib/medusa-client"
import { ProductSchema } from "@/components/ProductSchema"
import ProductDetailClient from "@/components/ProductDetailClient"

interface PageProps {
  params: Promise<{ handle: string }>
}

async function getProduct(handle: string) {
  try {
    const { products } = await medusa.products.list({ handle })
    return products[0] ?? null
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params
  const product = await getProduct(handle)
  if (!product) return { title: "Product Not Found" }
  const title = product.title ?? "Product"

  return {
    title,
    description: product.description ?? undefined,
    openGraph: {
      title,
      description: product.description ?? undefined,
      images: product.thumbnail ? [{ url: product.thumbnail }] : [],
    },
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { handle } = await params
  const product = await getProduct(handle)

  if (!product) notFound()

  return (
    <>
      <ProductSchema product={product} />
      <div style={{ paddingTop: 100, paddingBottom: 80, background: "var(--bg)", minHeight: "100vh" }}>
        <div className="W">
          <ProductDetailClient product={product} />
        </div>
      </div>
    </>
  )
}
