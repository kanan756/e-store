import type { Metadata } from "next"
import Hero from "@/components/Hero"
import About from "@/components/About"
import IndustriesStrip from "@/components/IndustriesStrip"
import FeaturedProducts from "@/components/FeaturedProducts"
import Capabilities from "@/components/Capabilities"
import WhyUs from "@/components/WhyUs"
import Banner from "@/components/Banner"
import Cta from "@/components/Cta"
import { getProducts } from "@/lib/sheets"

export const metadata: Metadata = {
  title: "Superior Harness & Assembly — Custom Wire Harness Manufacturer",
  description:
    "Custom wire harness and cable assembly manufacturer specializing in high-quality engineered wiring solutions for OEMs, medical devices, robotics, and EV applications.",
}

export const revalidate = 60

export default async function HomePage() {
  const allProducts = await getProducts()
  const products = allProducts.slice(0, 6)

  return (
    <>
      <Hero />
      <About />
      <IndustriesStrip />
      <FeaturedProducts products={products} />
      <Capabilities />
      <WhyUs />
      <Banner />
      <Cta />
    </>
  )
}
