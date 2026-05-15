import type { Metadata } from "next"
import { Sora, DM_Sans } from "next/font/google"
import "@/styles/globals.css"
import { CartProvider } from "@/context/cart-context"
import { ThemeScript } from "@/components/ThemeScript"

const sora = Sora({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "800"],
  variable: "--font-sora",
  display: "swap",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-dm-sans",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Inline script runs before paint to apply saved theme and prevent flash */}
        <ThemeScript />
      </head>
      <body className={`${sora.variable} ${dmSans.variable}`}>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  )
}
