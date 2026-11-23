import type { Metadata } from "next"
import LoginClient from "./LoginClient"

export const metadata: Metadata = {
  title: "Sign In | CLASPO — Smart Home Solutions",
  description: "Sign in to your CLASPO account to manage your orders, track shipments, and experience smart shopping.",
}

export default function LoginPage() {
  return <LoginClient />
}
