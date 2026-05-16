import type { MetadataRoute } from "next"
import { getProducts } from "@/lib/sheets"

const BASE = process.env.NEXT_PUBLIC_STORE_URL ?? "https://clientstore.com"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let productUrls: MetadataRoute.Sitemap = []

  try {
    const products = await getProducts()
    productUrls = products.map((p) => ({
      url: `${BASE}/products/${p.handle}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }))
  } catch {
    // Sheets may not be reachable at build time — skip product URLs
  }


  return [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...productUrls,
  ]
}
