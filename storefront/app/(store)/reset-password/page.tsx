import type { Metadata } from "next"
import ResetPasswordClient from "./ResetPasswordClient"

export const metadata: Metadata = {
  title: "Set New Password | CLASPO — Smart Home Solutions",
  description: "Set a new secure password for your CLASPO account.",
}

export default function ResetPasswordPage() {
  return <ResetPasswordClient />
}
