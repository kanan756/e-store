"use client"

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import { useSession } from "next-auth/react"

// ── Types ─────────────────────────────────────────────────────────────────────
export interface CartItem {
  id: string         // product handle used as stable ID
  name: string
  price: number      // in paise (e.g. 10000 = ₹100)
  quantity: number
  imageUrl: string
  category: string
}

interface CartContextValue {
  items: CartItem[]
  loading: boolean
  totalItems: number
  subtotal: number
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
}

// ── Context ───────────────────────────────────────────────────────────────────
const CartContext = createContext<CartContextValue | null>(null)

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used inside CartProvider")
  return ctx
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const isInitialLoad = useRef(true)

  // Derived user storage key
  const userId = (session?.user as any)?.id || session?.user?.email || null
  const userCartKey = userId ? `claspo_cart_${userId}` : null

  // Hydrate cart when authentication status changes
  useEffect(() => {
    if (status === "loading") {
      setLoading(true)
      return
    }

    if (status === "authenticated" && userCartKey) {
      try {
        let loadedItems: CartItem[] = []
        const saved = localStorage.getItem(userCartKey)
        if (saved) {
          loadedItems = JSON.parse(saved)
          if (!Array.isArray(loadedItems)) loadedItems = []
        }

        // Migrate any legacy guest cart data safely without contaminating other users
        const legacyGuest = localStorage.getItem("cs_cart_v2") || localStorage.getItem("claspo_cart_guest")
        if (legacyGuest) {
          try {
            const guestItems: CartItem[] = JSON.parse(legacyGuest)
            if (Array.isArray(guestItems) && guestItems.length > 0) {
              const merged = [...loadedItems]
              for (const gItem of guestItems) {
                const idx = merged.findIndex((i) => i.id === gItem.id)
                if (idx >= 0) {
                  merged[idx] = { ...merged[idx], quantity: Math.max(merged[idx].quantity, gItem.quantity) }
                } else {
                  merged.push(gItem)
                }
              }
              loadedItems = merged
              localStorage.setItem(userCartKey, JSON.stringify(merged))
            }
          } catch {
            // ignore corrupt legacy data
          } finally {
            localStorage.removeItem("cs_cart_v2")
            localStorage.removeItem("claspo_cart_guest")
          }
        }

        setItems(loadedItems)
      } catch {
        setItems([])
      } finally {
        setLoading(false)
        isInitialLoad.current = false
      }
    } else {
      // Unauthenticated / logged out: cart is empty, never reveal previous user's cart
      setItems([])
      setLoading(false)
      isInitialLoad.current = false
    }
  }, [status, userCartKey])

  // Persist to user-scoped localStorage on every cart change (only when authenticated)
  useEffect(() => {
    if (isInitialLoad.current || status !== "authenticated" || !userCartKey) {
      return
    }
    try {
      localStorage.setItem(userCartKey, JSON.stringify(items))
    } catch {
      // ignore storage errors
    }
  }, [items, status, userCartKey])

  const addItem = useCallback((product: Omit<CartItem, "quantity">, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id)
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
        )
      }
      return [...prev, { ...product, quantity }]
    })
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity < 1) {
      setItems((prev) => prev.filter((i) => i.id !== id))
    } else {
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, quantity } : i))
      )
    }
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
    if (userCartKey) {
      try {
        localStorage.removeItem(userCartKey)
      } catch {
        // ignore
      }
    }
  }, [userCartKey])

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{ items, loading, totalItems, subtotal, addItem, removeItem, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  )
}
