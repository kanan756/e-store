import type { Metadata } from "next"
import ForgotPasswordClient from "./ForgotPasswordClient"

export const metadata: Metadata = {
  title: "Forgot Password | CLASPO — Smart Home Solutions",
  description: "Reset your CLASPO password securely to regain access to your account.",
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />
}
