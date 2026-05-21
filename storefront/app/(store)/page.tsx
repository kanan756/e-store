import type { Metadata } from "next"
import Hero from "@/components/Hero"
import About from "@/components/About"
import Categories from "@/components/Categories"
import FeaturedProducts from "@/components/FeaturedProducts"
import WhyUs from "@/components/WhyUs"
import Banner from "@/components/Banner"
import Cta from "@/components/Cta"
import type { Product } from "@/lib/sheets"

export const metadata: Metadata = {
  title: "Superior Harness & Assembly LLC — Custom Wire Harness Manufacturer",
  description:
    "Custom wire harness and cable assembly manufacturer specializing in high-quality engineered wiring solutions for OEMs, medical devices, robotics, and EV applications.",
}

export const revalidate = 60

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_STORE_URL}/api/products`, {
      next: { revalidate: 60 },
    })
    const data = await res.json()
    return (data.products ?? []).slice(0, 6)
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
