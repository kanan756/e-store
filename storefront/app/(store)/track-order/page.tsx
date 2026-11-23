import type { Metadata } from "next"
import TrackOrderClient from "./TrackOrderClient"

export const metadata: Metadata = {
  title: "Track Your Order | CLASPO",
  description:
    "Track the status of your CLASPO orders and view real-time shipping updates.",
  robots: { index: false },
}

export default function TrackOrderPage() {
  return <TrackOrderClient />
}
