import type { Metadata } from "next"
import Hero from "@/components/Hero"
import About from "@/components/About"
import Categories from "@/components/Categories"
import FeaturedProducts from "@/components/FeaturedProducts"
import WhyUs from "@/components/WhyUs"
import Banner from "@/components/Banner"
import Cta from "@/components/Cta"
import { medusa } from "@/lib/medusa-client"

export const metadata: Metadata = {
  title: "Client Store — Premium Industrial Products",
  description:
    "Curated premium industrial and lifestyle products — crafted for quality, performance, and modern everyday needs.",
}

export const revalidate = 60

async function getFeaturedProducts() {
  try {
    const { products } = await medusa.products.list({ limit: 6 })
    return products
  } catch {
    return []
  }
}

export default async function HomePage() {
  const products = await getFeaturedProducts()

  return (
    <>
      <Hero />
      <About />
      <Categories />
      <FeaturedProducts products={products} />
      <WhyUs />
      <Banner />
      <Cta />
    </>
  )
}
