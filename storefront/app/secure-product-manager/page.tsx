import { getProductMetrics, getProducts } from "@/lib/sheets"
import DashboardClient from "./DashboardClient"

export default async function ProductManagerHomePage() {
  const metrics = await getProductMetrics()
  const initialProducts = await getProducts(true)

  return (
    <DashboardClient
      initialMetrics={metrics}
      initialProducts={initialProducts}
    />
  )
}
