import type { Product } from "@/lib/sheets"

export function ProductSchema({ product }: { product: Product }) {
  const BASE = process.env.NEXT_PUBLIC_STORE_URL ?? "https://clientstore.com"
  const reviews = Array.isArray(product.reviews) ? product.reviews : []
  const reviewCount = product.reviewCount ?? reviews.length
  const averageRating =
    product.averageRating ??
    (reviewCount > 0
      ? reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / reviewCount
      : 0)

  const schema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? "",
    image: product.imageUrl ?? "",
    sku: product.sku || product.partNumber || undefined,
    brand: {
      "@type": "Brand",
      name: "CLASPO",
    },
    offers: {
      "@type": "Offer",
      // Prices are stored in whole INR units — no division needed.
      price: (product.discountPrice != null && product.discountPrice > 0) ? product.discountPrice : (product.price > 0 ? product.price : undefined),
      priceCurrency: "INR",
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${BASE}/products/${product.handle}`,
    },
  }

  if (reviewCount > 0 && averageRating > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Number(averageRating.toFixed(1)),
      reviewCount,
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026") }}
    />
  )
}
