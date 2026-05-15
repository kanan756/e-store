"use client"

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import { medusa } from "@/lib/medusa-client"
import type { StoreCart } from "@/lib/types"

const CART_ID_KEY = "cs_cart_id"

// ── Types ─────────────────────────────────────────────────────────────────────
interface CartContextValue {
  cart: StoreCart | null
  loading: boolean
  error: string
  totalItems: number
  addItem: (variantId: string, quantity?: number) => Promise<void>
  removeItem: (lineItemId: string) => Promise<void>
  updateQuantity: (lineItemId: string, quantity: number) => Promise<void>
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
  const [cart, setCart] = useState<StoreCart | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // ── Helper: create a new cart and persist its ID ───────────────────────────
  const createCart = useCallback(async (): Promise<StoreCart> => {
    const { cart: newCart } = await medusa.carts.create()
    localStorage.setItem(CART_ID_KEY, newCart.id)
    return newCart as unknown as StoreCart
  }, [])

  // ── On mount: rehydrate cart from localStorage ─────────────────────────────
  useEffect(() => {
    const savedId = localStorage.getItem(CART_ID_KEY)
    if (!savedId) return
    const storedCartId = savedId

    let mounted = true

    async function validateStoredCart() {
      setLoading(true)
      try {
        const { cart: existing } = await medusa.carts.retrieve(storedCartId)
        if (!mounted) return

        if (existing && existing.completed_at === null) {
          setCart(existing as unknown as StoreCart)
        } else {
          localStorage.removeItem(CART_ID_KEY)
          setCart(null)
        }
      } catch {
        localStorage.removeItem(CART_ID_KEY)
        if (mounted) setCart(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    void validateStoredCart()

    return () => {
      mounted = false
    }
  }, [])

  // ── Add item ───────────────────────────────────────────────────────────────
  const addItem = useCallback(
    async (variantId: string, quantity = 1) => {
      setLoading(true)
      setError("")
      try {
        let cartId = cart?.id ?? localStorage.getItem(CART_ID_KEY)
        let currentCart = cart

        if (!cartId) {
          currentCart = await createCart()
          cartId = currentCart.id
        }

        const { cart: updated } = await medusa.carts.lineItems.create(cartId, {
          variant_id: variantId,
          quantity,
        })
        setCart(updated as unknown as StoreCart)
      } catch {
        setError("We couldn't add that item. Please try again.")
      } finally {
        setLoading(false)
      }
    },
    [cart, createCart]
  )

  // ── Remove item ────────────────────────────────────────────────────────────
  const removeItem = useCallback(
    async (lineItemId: string) => {
      if (!cart) return
      setLoading(true)
      setError("")
      try {
        const { cart: updated } = await medusa.carts.lineItems.delete(
          cart.id,
          lineItemId
        )
        setCart(updated as unknown as StoreCart)
      } catch {
        setError("We couldn't remove that item. Please try again.")
      } finally {
        setLoading(false)
      }
    },
    [cart]
  )

  // ── Update quantity ────────────────────────────────────────────────────────
  const updateQuantity = useCallback(
    async (lineItemId: string, quantity: number) => {
      if (!cart) return
      if (quantity < 1) return removeItem(lineItemId)
      setLoading(true)
      setError("")
      try {
        const { cart: updated } = await medusa.carts.lineItems.update(
          cart.id,
          lineItemId,
          { quantity }
        )
        setCart(updated as unknown as StoreCart)
      } catch {
        setError("We couldn't update that item. Please try again.")
      } finally {
        setLoading(false)
      }
    },
    [cart, removeItem]
  )

  // ── Clear cart (called after order is placed) ──────────────────────────────
  const clearCart = useCallback(() => {
    localStorage.removeItem(CART_ID_KEY)
    setCart(null)
    setError("")
  }, [])

  const totalItems =
    cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0

  return (
    <CartContext.Provider
      value={{ cart, loading, error, totalItems, addItem, removeItem, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  )
}
