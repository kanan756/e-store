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
export interface CartSelectedColor {
  id?: string
  name: string
  hex: string
}

export interface CartItem {
  id: string         // product handle or id
  productId?: string // immutable Google Sheets productId (prod_...)
  name: string
  price: number      // effective selling price in INR
  regularPrice?: number
  discountPrice?: number | null
  quantity: number
  imageUrl: string
  category: string
  stock?: number
  inStock?: boolean
  selectedColor?: CartSelectedColor | null
  unavailableReason?: "deleted" | "inactive" | "out_of_stock" | "color_unavailable" | null
}

export interface CartPriceChange {
  id: string
  productId: string
  name: string
  previousPrice: number
  newPrice: number
}

export interface CartStockAdjustment {
  id: string
  name: string
  previousQty: number
  newQty: number
}

interface CartContextValue {
  items: CartItem[]
  loading: boolean
  syncing: boolean
  totalItems: number
  subtotal: number
  priceChanges: CartPriceChange[]
  stockAdjustments: CartStockAdjustment[]
  hasUnavailableItems: boolean
  priceChangeConfirmed: boolean
  confirmPriceChanges: () => void
  syncCart: () => Promise<void>
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void
  removeItem: (id: string, colorName?: string | null) => void
  updateQuantity: (id: string, quantity: number, colorName?: string | null) => void
  clearCart: () => void
}

// ── Context ───────────────────────────────────────────────────────────────────
const CartContext = createContext<CartContextValue | null>(null)

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used inside CartProvider")
  return ctx
}

function normalizeColorKey(colorName?: string | null): string {
  return (colorName || "").trim().toLowerCase()
}

function sameCartItem(
  a: Pick<CartItem, "id" | "productId" | "selectedColor">,
  b: Pick<CartItem, "id" | "productId" | "selectedColor">
): boolean {
  const productMatches =
    a.productId && b.productId ? a.productId === b.productId : a.id === b.id
  if (!productMatches) return false
  return normalizeColorKey(a.selectedColor?.name) === normalizeColorKey(b.selectedColor?.name)
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [priceChanges, setPriceChanges] = useState<CartPriceChange[]>([])
  const [stockAdjustments, setStockAdjustments] = useState<CartStockAdjustment[]>([])
  const [priceChangeConfirmed, setPriceChangeConfirmed] = useState(true)
  const isInitialLoad = useRef(true)
  const itemsRef = useRef<CartItem[]>([])
  itemsRef.current = items

  const userId = (session?.user as any)?.id || session?.user?.email || null
  const userCartKey = userId ? `claspo_cart_${userId}` : null

  const syncWithServer = useCallback(async (sourceItems?: CartItem[]) => {
    const target = sourceItems ?? itemsRef.current
    if (!target || target.length === 0) {
      setPriceChanges([])
      setStockAdjustments([])
      setPriceChangeConfirmed(true)
      return
    }

    setSyncing(true)
    try {
      const res = await fetch("/api/cart/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: target.map((i) => ({
            id: i.id,
            productId: i.productId,
            price: i.price,
            quantity: i.quantity,
            selectedColor: i.selectedColor ?? null,
          })),
        }),
      })
      if (!res.ok) return

      const data = await res.json()
      if (!Array.isArray(data.items)) return

      const detectedPriceChanges: CartPriceChange[] = []
      const detectedStockAdjustments: CartStockAdjustment[] = []

      const updated: CartItem[] = target.map((existing, idx) => {
        const existingColorKey = normalizeColorKey(existing.selectedColor?.name)
        const match =
          data.items[idx] ??
          data.items.find(
            (s: any) =>
              ((existing.productId && s.productId === existing.productId) ||
                s.legacyId === existing.id ||
                s.id === existing.id) &&
              normalizeColorKey(s.selectedColor?.name) === existingColorKey
          )
        if (!match) return existing

        if (match.priceChanged && match.found) {
          detectedPriceChanges.push({
            id: match.id,
            productId: match.productId,
            name: match.name || existing.name,
            previousPrice: match.previousPrice,
            newPrice: match.newPrice,
          })
        }

        if (match.stockAdjusted) {
          detectedStockAdjustments.push({
            id: match.id,
            name: match.name || existing.name,
            previousQty: existing.quantity,
            newQty: match.adjustedQuantity,
          })
        }

        if (!match.found) {
          return {
            ...existing,
            inStock: false,
            stock: 0,
            unavailableReason: "deleted",
          }
        }

        return {
          ...existing,
          id: match.id,
          productId: match.productId,
          name: match.name,
          category: match.category,
          imageUrl: match.imageUrl || existing.imageUrl,
          regularPrice: match.regularPrice,
          discountPrice: match.discountPrice,
          price: match.price,
          stock: match.stock,
          inStock: match.available,
          selectedColor: match.selectedColor !== undefined ? match.selectedColor : existing.selectedColor,
          unavailableReason: match.unavailableReason ?? null,
          quantity: match.stockAdjusted ? match.adjustedQuantity : existing.quantity,
        }
      })

      setItems(updated)
      if (detectedPriceChanges.length > 0) {
        setPriceChanges(detectedPriceChanges)
        setPriceChangeConfirmed(false)
      }
      if (detectedStockAdjustments.length > 0) {
        setStockAdjustments(detectedStockAdjustments)
      }
    } catch {
      // Keep existing items if offline
    } finally {
      setSyncing(false)
    }
  }, [])

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

        const legacyGuest = localStorage.getItem("cs_cart_v2") || localStorage.getItem("claspo_cart_guest")
        if (legacyGuest) {
          try {
            const guestItems: CartItem[] = JSON.parse(legacyGuest)
            if (Array.isArray(guestItems) && guestItems.length > 0) {
              const merged = [...loadedItems]
              for (const gItem of guestItems) {
                const idx = merged.findIndex((i) => sameCartItem(i, gItem))
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
        if (loadedItems.length > 0) {
          void syncWithServer(loadedItems)
        }
      } catch {
        setItems([])
      } finally {
        setLoading(false)
        isInitialLoad.current = false
      }
    } else {
      setItems([])
      setPriceChanges([])
      setStockAdjustments([])
      setPriceChangeConfirmed(true)
      setLoading(false)
      isInitialLoad.current = false
    }
  }, [status, userCartKey, syncWithServer])

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
      const existing = prev.find((i) => sameCartItem(i, product))
      if (existing) {
        const nextQty =
          product.stock != null && product.stock > 0
            ? Math.min(existing.quantity + quantity, product.stock)
            : existing.quantity + quantity
        return prev.map((i) =>
          sameCartItem(i, product) ? { ...i, ...product, quantity: nextQty } : i
        )
      }
      const initialQty =
        product.stock != null && product.stock > 0
          ? Math.min(quantity, product.stock)
          : quantity
      return [...prev, { ...product, quantity: initialQty }]
    })
  }, [])

  const removeItem = useCallback((id: string, colorName?: string | null) => {
    const targetColorKey = normalizeColorKey(colorName)
    setItems((prev) =>
      prev.filter((i) => {
        const matchesId = i.id === id || i.productId === id
        if (!matchesId) return true
        if (colorName !== undefined) {
          return normalizeColorKey(i.selectedColor?.name) !== targetColorKey
        }
        return false
      })
    )
    setPriceChanges((prev) => prev.filter((c) => c.id !== id && c.productId !== id))
  }, [])

  const updateQuantity = useCallback((id: string, quantity: number, colorName?: string | null) => {
    const targetColorKey = normalizeColorKey(colorName)
    const matchesTarget = (i: CartItem) => {
      const matchesId = i.id === id || i.productId === id
      if (!matchesId) return false
      if (colorName !== undefined) {
        return normalizeColorKey(i.selectedColor?.name) === targetColorKey
      }
      return true
    }

    if (quantity < 1) {
      setItems((prev) => prev.filter((i) => !matchesTarget(i)))
    } else {
      setItems((prev) =>
        prev.map((i) => {
          if (!matchesTarget(i)) return i
          const capped = i.stock != null && i.stock > 0 ? Math.min(quantity, i.stock) : quantity
          return { ...i, quantity: capped }
        })
      )
    }
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
    setPriceChanges([])
    setStockAdjustments([])
    setPriceChangeConfirmed(true)
    if (userCartKey) {
      try {
        localStorage.removeItem(userCartKey)
      } catch {
        // ignore
      }
    }
  }, [userCartKey])

  const confirmPriceChanges = useCallback(() => {
    setPriceChangeConfirmed(true)
    setPriceChanges([])
    setStockAdjustments([])
  }, [])

  const syncCart = useCallback(async () => {
    await syncWithServer()
  }, [syncWithServer])

  const hasUnavailableItems = items.some(
    (i) => i.inStock === false || Boolean(i.unavailableReason)
  )
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = items
    .filter((i) => i.inStock !== false && !i.unavailableReason)
    .reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        syncing,
        totalItems,
        subtotal,
        priceChanges,
        stockAdjustments,
        hasUnavailableItems,
        priceChangeConfirmed,
        confirmPriceChanges,
        syncCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
