"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export default function RevealObserver() {
  const pathname = usePathname()

  useEffect(() => {
    // Hold a reference outside the timeout so the cleanup can reach it
    // whether or not the timer has already fired.
    let io: IntersectionObserver | null = null

    const timeoutId = setTimeout(() => {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) e.target.classList.add("in")
          })
        },
        { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
      )

      document.querySelectorAll(".rv").forEach((el) => io!.observe(el))
    }, 100)

    // Cleanup cancels the pending timer AND disconnects the observer if it
    // was already created — previously only the timer was cleared, leaving
    // the observer alive across route changes (memory leak).
    return () => {
      clearTimeout(timeoutId)
      io?.disconnect()
    }
  }, [pathname])

  return null
}
