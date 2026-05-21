"use client"

import { SessionProvider } from "next-auth/react"
import { CartProvider } from "@/context/cart-context"
import { ThemeProvider } from "./ThemeProvider"

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
      <SessionProvider>
        <CartProvider>{children}</CartProvider>
      </SessionProvider>
    </ThemeProvider>
  )
}
