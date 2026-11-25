import type { Product } from "@/lib/sheets"

export function ProductSchema({ product }: { product: Product }) {
  const BASE = process.env.NEXT_PUBLIC_STORE_URL ?? "https://clientstore.com"

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? "",
    image: product.imageUrl ?? "",
    brand: {
      "@type": "Brand",
      name: "CLASPO",
    },
    offers: {
      "@type": "Offer",
      // Prices are stored in whole INR units — no division needed.
      price: (product.discountPrice != null && product.discountPrice > 0) ? product.discountPrice : (product.price > 0 ? product.price : undefined),
      priceCurrency: "INR",
      // Fixed: was always "InStock" — now reflects the actual stock flag
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${BASE}/products/${product.handle}`,
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026") }}
    />
  )
}
