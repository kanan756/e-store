import { notFound } from "next/navigation"
import { getAllOrders, getProducts } from "@/lib/sheets"
import OrderDetailClient from "./OrderDetailClient"

export const metadata = {
  title: "Order Details – CLASPO Product Manager",
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const { orderId } = await params
  const decodedId = decodeURIComponent(orderId)

  const [orders, products] = await Promise.all([getAllOrders(), getProducts(true)])
  const order = orders.find((o) => o.orderId === decodedId)

  if (!order) {
    notFound()
  }

  return <OrderDetailClient initialOrder={order} products={products} />
}
