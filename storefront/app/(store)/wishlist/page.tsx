import type { Metadata } from "next"
import { getProducts } from "@/lib/sheets"
import WishlistClient from "./WishlistClient"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "My Wishlist",
  description: "View and manage your saved CLASPO products.",
}

export default async function WishlistPage() {
  const products = await getProducts()
  return <WishlistClient products={products} />
}
