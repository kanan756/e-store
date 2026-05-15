"use client"

import Image from "next/image"
import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { formatPrice, getVariantPriceAmount } from "@/lib/medusa-client"
import { useCart } from "@/context/cart-context"
import type { StoreProduct, StoreVariant } from "@/lib/types"

function ArrowIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12,5 19,12 12,19" />
    </svg>
  )
}

export default function ProductDetailClient({ product }: { product: StoreProduct }) {
  const router = useRouter()
  const { addItem } = useCart()
  const [selectedVariant, setSelectedVariant] = useState<StoreVariant | undefined>(
    product.variants[0]
  )
  const [adding, setAdding] = useState(false)

  const price = getVariantPriceAmount(selectedVariant)
  const inStock = (selectedVariant?.inventory_quantity ?? 0) > 0
  const title = product.title ?? "Product"

  const handleAddToCart = useCallback(async () => {
    if (!selectedVariant?.id) return
    setAdding(true)
    try {
      await addItem(selectedVariant.id)
      router.push("/cart")
    } finally {
      setAdding(false)
    }
  }, [addItem, selectedVariant, router])

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }}>
      {/* ── Image ───────────────────────────────────────────────────────── */}
      <div style={{ borderRadius: "var(--rL)", overflow: "hidden", aspectRatio: "4/3", position: "relative", background: "var(--bg2)" }}>
        {product.thumbnail ? (
          <Image
            src={product.thumbnail}
            alt={title}
            fill
            sizes="50vw"
            style={{ objectFit: "cover" }}
            priority
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--textM)", fontFamily: "monospace", fontSize: 12, padding: 16, textAlign: "center" }}>
            {title}
          </div>
        )}
      </div>

      {/* ── Details ─────────────────────────────────────────────────────── */}
      <div style={{ paddingTop: 20 }}>
        <div className="lbl" style={{ marginBottom: 16 }}>
          {product.collection?.title ?? product.type?.value ?? "Product"}
        </div>
        <h1 className="D3" style={{ marginBottom: 16 }}>{title}</h1>
        <div style={{ fontFamily: "var(--font-sora)", fontSize: 36, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 24, color: "var(--acc)" }}>
          {price != null ? formatPrice(price) : "—"}
        </div>

        {product.description && (
          <p className="Bd" style={{ marginBottom: 32 }}>{product.description}</p>
        )}

        {/* Variant selector */}
        {product.variants.length > 1 && (
          <div style={{ marginBottom: 32 }}>
            <div className="form-label" style={{ marginBottom: 12 }}>Select Variant</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  className={`btn ${selectedVariant?.id === v.id ? "bp" : "bod"} bsm`}
                  onClick={() => setSelectedVariant(v)}
                >
                  {v.title}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginBottom: 32, fontSize: 13, color: inStock ? "#22c55e" : "#ef4444", fontWeight: 600 }}>
          {inStock ? "✓ In Stock" : "✗ Out of Stock"}
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            className="btn bp"
            onClick={handleAddToCart}
            disabled={adding || !inStock}
            style={{ flex: 1 }}
          >
            {adding ? "Adding…" : "Add to Cart"} <ArrowIcon />
          </button>
        </div>
      </div>
    </div>
  )
}
