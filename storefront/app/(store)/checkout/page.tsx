import type { Metadata } from "next"
import CheckoutClient from "./CheckoutClient"

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your order securely with Stripe or Razorpay.",
  robots: { index: false },
}

export default function CheckoutPage() {
  return <CheckoutClient />
}
