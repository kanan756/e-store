import type { Metadata } from "next"
import { getProducts, getBlogs } from "@/lib/sheets"
import Hero from "@/components/Hero"
import ShoppingPlatforms from "@/components/ShoppingPlatforms"
import Categories from "@/components/Categories"
import FeaturedProducts from "@/components/FeaturedProducts"
import PromotionalBanners from "@/components/PromotionalBanners"
import Capabilities from "@/components/Capabilities"
import IndustriesStrip from "@/components/IndustriesStrip"
import WhyUs from "@/components/WhyUs"
import About from "@/components/About"
import Testimonials from "@/components/Testimonials"
import LatestBlogs from "@/components/LatestBlogs"
import Cta from "@/components/Cta"

export const metadata: Metadata = {
  title: "CLASPO — Custom Wire Harnesses & Cable Assemblies | CLICK. PICK. DONE.",
  description:
    "CLASPO is a premier custom wire harness and cable assembly manufacturer. Serving automotive, robotics, medical, EV, and industrial OEM programs with IPC/WHMA-A-620 Class 3 certified precision.",
  openGraph: {
    title: "CLASPO — Custom Wire Harnesses & Cable Assemblies",
    description: "CLICK. PICK. DONE. Premium custom wire harness and cable assembly manufacturing.",
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

      {/* 3. Product Categories */}
      <Categories />

      {/* 4. Featured Products & Best Sellers */}
      <FeaturedProducts products={products} />

      {/* 5. Promotional Banners & Special Deals */}
      <PromotionalBanners />

      {/* 6. Manufacturing Capabilities */}
      <Capabilities />

      {/* 7. Industries We Serve (Precision Interconnects ticker) */}
      <IndustriesStrip />

      {/* 8. Why Choose CLASPO (Core Benefits & 100% Tested IPC-620) */}
      <WhyUs />

      {/* 9. About CLASPO (Executive Summary & Key Milestones) */}
      <About />

      {/* 10. Client Reviews & Engineering Testimonials */}
      <Testimonials />

      {/* 11. Latest Engineering Blogs & Technical Guides */}
      <LatestBlogs blogs={blogs} />

      {/* 12. Direct Quote Callout & Newsletter Subscription */}
      <Cta />
    </>
  )
}
