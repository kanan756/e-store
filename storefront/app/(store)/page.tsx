import type { Metadata } from "next"
import { getProducts, getBlogs } from "@/lib/sheets"
import Hero from "@/components/Hero"
import ShoppingPlatforms from "@/components/ShoppingPlatforms"
import Categories from "@/components/Categories"
import FeaturedProducts from "@/components/FeaturedProducts"
import PromotionalBanners from "@/components/PromotionalBanners"
import WhyUs from "@/components/WhyUs"
import About from "@/components/About"
import Testimonials from "@/components/Testimonials"
import LatestBlogs from "@/components/LatestBlogs"
import Cta from "@/components/Cta"

export const metadata: Metadata = {
  title: "CLASPO – Smart Home Solutions & Everyday Essentials",
  description:
    "Discover smart home solutions, kitchen essentials, storage products, cleaning accessories, and practical everyday products at CLASPO.",
  openGraph: {
    title: "CLASPO – Smart Home Solutions & Everyday Essentials",
    description:
      "Discover smart home solutions, kitchen essentials, storage products, cleaning accessories, and practical everyday products at CLASPO.",
    url: "https://claspo.store",
    siteName: "CLASPO",
    type: "website",
  },
}

export const revalidate = 60

export default async function HomePage() {
  const [products, blogs] = await Promise.all([
    getProducts().catch(() => []),
    getBlogs(true).catch(() => []),
  ])

  return (
    <>
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Shop Your Way - Multi-Platform Ordering (Flipkart, Amazon, Instagram, WhatsApp) */}
      <ShoppingPlatforms />

      {/* 3. Product Categories (Discover Smarter Living) */}
      <Categories />

      {/* 4. Featured Products (Discover Our Popular Picks) */}
      <FeaturedProducts products={products} />

      {/* 5. Promotional Banners & Special Deals */}
      <PromotionalBanners />

      {/* 6. Why CLASPO (Small Solutions. Big Difference.) */}
      <WhyUs />

      {/* 7. About CLASPO (Making Everyday Living Smarter, Simpler, and Better) */}
      <About />

      {/* 8. Customer Reviews & Testimonials */}
      <Testimonials />

      {/* 9. Latest Blogs & Home Living Guides */}
      <LatestBlogs blogs={blogs} />

      {/* 10. Stay Connected with CLASPO Newsletter & Support */}
      <Cta />
    </>
  )
}
