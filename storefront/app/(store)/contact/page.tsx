import type { Metadata } from "next"
import ContactClient from "./ContactClient"

export const metadata: Metadata = {
  title: "Contact Us | CLASPO — Smart Home Solutions",
  description:
    "Get in touch with CLASPO for product inquiries, customer support, or order assistance. We respond within 1–2 business days.",
}

export default function ContactPage() {
  return <ContactClient />
}
