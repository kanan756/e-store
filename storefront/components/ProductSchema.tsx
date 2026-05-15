import type { StoreProduct } from "@/lib/types"
import { getVariantPriceAmount } from "@/lib/medusa-client"

export function ProductSchema({ product }: { product: StoreProduct }) {
  const price = getVariantPriceAmount(product.variants?.[0])
  const inStock = (product.variants?.[0]?.inventory_quantity ?? 0) > 0

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description ?? "",
    image: product.thumbnail ?? "",
    brand: {
      "@type": "Brand",
      name: "Client Store",
    },
    offers: {
      "@type": "Offer",
      price: price != null ? price / 100 : undefined,
      priceCurrency: "INR",
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${process.env.NEXT_PUBLIC_STORE_URL ?? "https://clientstore.com"}/products/${product.handle}`,
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
