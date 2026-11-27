"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"

interface WishlistContextType {
  wishlist: string[]
  wishlistCount: number
  loading: boolean
  toggleWishlist: (id: string) => void
  removeFromWishlist: (id: string) => void
  isInWishlist: (id: string) => boolean
}

const WishlistContext = createContext<WishlistContextType>({
  wishlist: [],
  wishlistCount: 0,
  loading: true,
  toggleWishlist: () => {},
  removeFromWishlist: () => {},
  isInWishlist: () => false,
})

const LEGACY_STORAGE_KEY = "claspo_wishlist_v1"
const GUEST_STORAGE_KEY = "claspo_wishlist_v1_guest"

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [wishlist, setWishlist] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const userKey =
    (session?.user as any)?.id || session?.user?.email?.toLowerCase() || null
  const storageKey = userKey ? `claspo_wishlist_v1_${userKey}` : GUEST_STORAGE_KEY

  useEffect(() => {
    if (status === "loading") {
      setLoading(true)
      return
    }

    try {
      const saved = localStorage.getItem(storageKey)
      let items: string[] = saved ? JSON.parse(saved) : []
      if (!Array.isArray(items)) items = []

      // Migrate any legacy/guest items into the authenticated user's wishlist once
      if (userKey) {
        const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY)
        const guestRaw = localStorage.getItem(GUEST_STORAGE_KEY)
        const extra: string[] = [
          ...(legacyRaw ? JSON.parse(legacyRaw) : []),
          ...(guestRaw ? JSON.parse(guestRaw) : []),
        ]
        if (Array.isArray(extra) && extra.length > 0) {
          const merged = Array.from(new Set([...items, ...extra]))
          items = merged
          localStorage.setItem(storageKey, JSON.stringify(merged))
          localStorage.removeItem(LEGACY_STORAGE_KEY)
          localStorage.removeItem(GUEST_STORAGE_KEY)
        }
      }

      setWishlist(items)
    } catch {
      setWishlist([])
    } finally {
      setLoading(false)
    }
  }, [storageKey, userKey, status])

  const persist = useCallback(
    (next: string[]) => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(next))
      } catch {
        // ignore storage quota errors
      }
    },
    [storageKey]
  )

  const toggleWishlist = useCallback(
    (id: string) => {
      setWishlist((prev) => {
        const exists = prev.includes(id)
        const next = exists ? prev.filter((item) => item !== id) : [...prev, id]
        persist(next)
        return next
      })
    },
    [persist]
  )

  const removeFromWishlist = useCallback(
    (id: string) => {
      setWishlist((prev) => {
        const next = prev.filter((item) => item !== id)
        persist(next)
        return next
      })
    },
    [persist]
  )

  const isInWishlist = useCallback(
    (id: string) => wishlist.includes(id),
    [wishlist]
  )

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        loading,
        toggleWishlist,
        removeFromWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  return useContext(WishlistContext)
}
