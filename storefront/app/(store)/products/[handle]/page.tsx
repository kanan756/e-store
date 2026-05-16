import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getProductByHandle } from "@/lib/sheets"
import { ProductSchema } from "@/components/ProductSchema"
import ProductDetailClient from "@/components/ProductDetailClient"

interface PageProps {
  params: Promise<{ handle: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params
  const product = await getProductByHandle(handle)
  if (!product) return { title: "Product Not Found" }

  return {
    title: product.name,
    description: product.description || undefined,
    openGraph: {
      title: product.name,
      description: product.description || undefined,
      images: product.imageUrl ? [{ url: product.imageUrl }] : [],
    },
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { handle } = await params
  const product = await getProductByHandle(handle)

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
