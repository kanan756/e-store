import type { Metadata } from "next"
import GetAQuoteClient from "./GetAQuoteClient"

export const metadata: Metadata = {
  title: "Get a Quote",
  description:
    "Request a custom quote for wire harness and cable assembly manufacturing. Share your specifications and we'll respond with a competitive price within 1–2 business days.",
}

export default function GetAQuotePage() {
  return <GetAQuoteClient />
}
