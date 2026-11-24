import { getProducts, getProductMetrics } from "@/lib/sheets"
import DashboardClient from "../DashboardClient"

export const metadata = {
  title: "All Products – CLASPO Product Manager",
}

export default async function AllProductsPage() {
  const metrics = await getProductMetrics()
  const products = await getProducts(true)

  return (
    <DashboardClient
      initialMetrics={metrics}
      initialProducts={products}
    />
  )
}
