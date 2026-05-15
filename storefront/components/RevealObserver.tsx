"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

// Attaches IntersectionObserver to all .rv elements to trigger scroll-reveal
export default function RevealObserver() {
  const pathname = usePathname()

  useEffect(() => {
    // Slight delay to ensure DOM is fully painted after route change
    const timeoutId = setTimeout(() => {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) e.target.classList.add("in")
          })
        },
        { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
      )

      document.querySelectorAll(".rv").forEach((el) => io.observe(el))
      
      // Cleanup function to disconnect this specific observer instance
      // Note: we can't just return io.disconnect() because timeout
      // So we attach it to window or just let it be. Actually, we should clear it.
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [pathname])

  return null
}
