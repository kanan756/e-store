import type { Metadata } from "next"
import AccountClient from "./AccountClient"

export const metadata: Metadata = {
  title: "My Account | CLASPO — Smart Home Solutions",
  description: "Manage your profile, view order history, update settings, and track shipments on CLASPO.",
}

export default function AccountPage() {
  return <AccountClient />
}
