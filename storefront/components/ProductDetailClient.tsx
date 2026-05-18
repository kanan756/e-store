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
    if (url.startsWith("/")) return true
    try { new URL(url); return true } catch { return false }
  }

  const images = product.imageUrl ? product.imageUrl.split(",").map(i => i.trim()).filter(isValidUrl) : []
  const hasImages = images.length > 0
  const [activeImage, setActiveImage] = useState(0)

  return (
    <div className="prod-det-grid">
      {/* ── Image Gallery ─────────────────────────────────────────────── */}
      <div>
        <div style={{ borderRadius: "var(--rL)", overflow: "hidden", aspectRatio: "4/3", position: "relative", background: "var(--bg2)", marginBottom: 16 }}>
          {hasImages ? (
            <>
              <Image
                src={images[activeImage]}
                alt={product.name}
                fill
                sizes="(max-width: 700px) 100vw, 50vw"
                style={{ objectFit: "cover", transition: "all 0.3s ease" }}
                priority
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                    style={{
                      position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                      width: 40, height: 40, borderRadius: "50%", background: "rgba(0,0,0,0.5)",
                      color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                      zIndex: 2
                    }}
                    aria-label="Previous image"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                  </button>
                  <button
                    onClick={() => setActiveImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                    style={{
                      position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                      width: 40, height: 40, borderRadius: "50%", background: "rgba(0,0,0,0.5)",
                      color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                      zIndex: 2
                    }}
                    aria-label="Next image"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                  </button>
                </>
              )}
            </>
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--textM)", fontFamily: "monospace", fontSize: 12, padding: 16, textAlign: "center" }}>
              {product.name} (No Image)
            </div>
          )}
        </div>
        
        {/* Thumbnails */}
        {hasImages && images.length > 1 && (
          <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(idx)}
                style={{
                  position: "relative", width: 80, height: 60, flexShrink: 0,
                  borderRadius: "var(--r)", overflow: "hidden",
                  border: activeImage === idx ? "2px solid var(--acc)" : "1px solid var(--bd)",
                  opacity: activeImage === idx ? 1 : 0.6,
                  transition: "all 0.2s"
                }}
              >
                <Image src={img} alt={`${product.name} thumbnail ${idx + 1}`} fill sizes="80px" style={{ objectFit: "cover" }} />
              </button>
            ))}
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
