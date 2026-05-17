import type { Metadata } from "next"
import { Hanken_Grotesk, Inter, JetBrains_Mono } from "next/font/google"
import "@/styles/globals.css"
import { ThemeScript } from "@/components/ThemeScript"
import Providers from "@/components/Providers"

// Display / headline font — tight tracking, bold weights
const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sora",   // keep same CSS var name — no component changes needed
  display: "swap",
})

// Body copy — exceptional legibility across locales
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-dm-sans", // keep same CSS var name — no component changes needed
  display: "swap",
})

// Labels, metadata, technical specs — "Precision" brand pillar
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
  display: "swap",
})


export const metadata: Metadata = {
  title: {
    default: "Client Store — Premium Industrial Products",
    template: "%s | Client Store",
  },
  description:
    "Curated premium industrial and lifestyle products — crafted for quality, performance, and modern everyday needs.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_STORE_URL ?? "https://clientstore.com"
  ),
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Client Store",
  },
  twitter: {
    card: "summary_large_image",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        {/* Inline script runs before paint to apply saved theme and prevent flash */}
        <ThemeScript />
      </head>
      <body className={`${hanken.variable} ${inter.variable} ${mono.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
