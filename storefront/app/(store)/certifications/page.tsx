import { getSettings } from "@/lib/settings"
import CertificationsClient from "./CertificationsClient"

export const metadata = {
  title: "Certifications — CLASPO",
  description: "View our industry certifications including IPC/WHMA-A-620, ISO 9001:2015, ITAR, and UL listing.",
}

export default function CertificationsPage() {
  const settings = getSettings()

  return <CertificationsClient show={settings.showCertifications} />
}
