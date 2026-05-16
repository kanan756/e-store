"use client"

import Image from "next/image"
import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/context/cart-context"
import type { Product } from "@/lib/sheets"

function ArrowIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12,5 19,12 12,19" />
    </svg>
  )
}

function formatPrice(rs: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR",
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(rs)
}

export default function ProductDetailClient({ product }: { product: Product }) {
  const router = useRouter()
  const { addItem } = useCart()
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)

  const handleAddToCart = useCallback(() => {
    setAdding(true)
    addItem({
      id: product.handle || product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      category: product.category,
    })
    setAdding(false)
    setAdded(true)
    setTimeout(() => {
      setAdded(false)
      router.push("/cart")
    }, 800)
  }, [addItem, product, router])

  const isValidUrl = (url: string) => {
    if (!url || url === "-") return false
    try { new URL(url); return true } catch { return false }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }}>
      {/* ── Image ───────────────────────────────────────────────────────── */}
      <div style={{ borderRadius: "var(--rL)", overflow: "hidden", aspectRatio: "4/3", position: "relative", background: "var(--bg2)" }}>
        {isValidUrl(product.imageUrl) ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="50vw"
            style={{ objectFit: "cover" }}
            priority
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--textM)", fontFamily: "monospace", fontSize: 12, padding: 16, textAlign: "center" }}>
            {product.name}
          </div>
        )}
      </div>

      {/* ── Details ─────────────────────────────────────────────────────── */}
      <div style={{ paddingTop: 20 }}>
        <div className="lbl" style={{ marginBottom: 16 }}>{product.category || "Product"}</div>
        <h1 className="D3" style={{ marginBottom: 16 }}>{product.name}</h1>
        <div style={{ fontFamily: "var(--font-sora)", fontSize: 36, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 24, color: "var(--acc)" }}>
          {product.price > 0 ? formatPrice(product.price) : "Contact for price"}
        </div>

        {product.description && (
          <p className="Bd" style={{ marginBottom: 32 }}>{product.description}</p>
        )}

        <div style={{ display: "flex", gap: 12 }}>
          <button
            className="btn bp"
            onClick={handleAddToCart}
            disabled={adding}
            style={{ flex: 1, background: added ? "#16a34a" : undefined }}
          >
            {added ? "✓ Added to Cart!" : adding ? "Adding…" : "Add to Cart"} {!added && <ArrowIcon />}
          </button>
        </div>
      </div>
    </div>
  )
}
