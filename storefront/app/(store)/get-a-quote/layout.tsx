import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Get a Quote",
  description:
    "Request a custom wire harness or cable assembly quote. Send us your drawings, specifications, or project details and we will respond within 1–2 business days.",
}

export default function QuoteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
