import type { Metadata } from "next"
import SignupClient from "./SignupClient"

export const metadata: Metadata = {
  title: "Create Account | CLASPO — Smart Home Solutions",
  description: "Join CLASPO and discover smarter solutions for everyday living. Sign up for exclusive offers and easy order tracking.",
}

export default function SignupPage() {
  return <SignupClient />
}
