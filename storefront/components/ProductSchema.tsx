import type { Product } from "@/lib/sheets"

export function ProductSchema({ product }: { product: Product }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? "",
    image: product.imageUrl ?? "",
    brand: {
      "@type": "Brand",
      name: "Client Store",
    },
    offers: {
      "@type": "Offer",
      price: product.price > 0 ? product.price / 100 : undefined,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
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
