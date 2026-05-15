import type { MetadataRoute } from "next"
import { medusa } from "@/lib/medusa-client"

const BASE = process.env.NEXT_PUBLIC_STORE_URL ?? "https://clientstore.com"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let productUrls: MetadataRoute.Sitemap = []

  try {
    const { products } = await medusa.products.list({ limit: 500 })
    productUrls = products.map((p) => ({
      url: `${BASE}/products/${p.handle}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }))
  } catch {
    // Backend may not be reachable at build time — skip product URLs
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
