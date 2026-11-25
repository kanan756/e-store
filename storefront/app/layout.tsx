import type { Metadata } from "next"
import "@/styles/globals.css"
import Providers from "@/components/Providers"


export const metadata: Metadata = {
  title: {
    default: "CLASPO – Smart Home Solutions & Everyday Essentials",
    template: "%s | CLASPO",
  },
  description:
    "Discover smart home solutions, kitchen essentials, storage products, cleaning accessories, and practical everyday products at CLASPO.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_STORE_URL ?? "https://claspo.store"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "CLASPO",
    title: "CLASPO – Smart Home Solutions & Everyday Essentials",
    description: "Discover smart home solutions, kitchen essentials, storage products, cleaning accessories, and practical everyday products at CLASPO.",
  },
  twitter: {
    card: "summary_large_image",
    title: "CLASPO – Smart Home Solutions & Everyday Essentials",
    description: "Discover smart home solutions, kitchen essentials, storage products, cleaning accessories, and practical everyday products at CLASPO.",
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap"
        />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-VG1DPLRRCB"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-VG1DPLRRCB');
          `
        }} />
      </head>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
