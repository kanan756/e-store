import { getAllOrders, getProducts } from "@/lib/sheets"
import OrderTrackingClient from "./OrderTrackingClient"

export const metadata = {
  title: "Order Tracking Management – CLASPO Product Manager",
}

export default async function OrderTrackingPage() {
  const [orders, products] = await Promise.all([
    getAllOrders(),
    getProducts(true),
  ])

  return <OrderTrackingClient initialOrders={orders} products={products} />
}
