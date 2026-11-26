import { getAllOrders } from "@/lib/sheets"
import OrdersClient from "./OrdersClient"

export const metadata = {
  title: "Orders – CLASPO Product Manager",
}

export default async function OrdersPage() {
  const orders = await getAllOrders()
  return <OrdersClient initialOrders={orders} />
}
