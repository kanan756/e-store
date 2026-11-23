"use client"

import Image from "next/image"
import Link from "next/link"
import { useCallback, useState } from "react"
import { useCart } from "@/context/cart-context"
import { useWishlist } from "@/context/wishlist-context"
import type { Product } from "@/lib/sheets"
import { formatPrice } from "@/lib/format"

interface ProductCardProps {
  product: Product
  index?: number
}

function HeartIcon({ filled }: { filled: boolean }) {
  if (filled) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#111111" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    )
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#777777" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function CartIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="#111111" stroke="#111111" strokeWidth="1">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const isLiked = isInWishlist(product.handle || product.id)

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
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
    setTimeout(() => setAdded(false), 2000)
  }, [addItem, product])

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(product.handle || product.id)
  }

  const href = product.handle ? `/products/${product.handle}` : "/products"

  const isValidUrl = (url: string) => {
    if (!url || url === "-") return false
    if (url.startsWith("/")) return true
    try { new URL(url); return true } catch { return false }
  }

  const images = product.imageUrl 
    ? product.imageUrl.split(",").map(i => i.trim()).filter(isValidUrl)
    : []
  const primaryImage = images.length > 0 ? images[0] : null
  const outOfStock = product.inStock === false

  // Compute realistic original price for visual discount display
  const hasPrice = product.price > 0
  const originalPrice = hasPrice ? Math.round(product.price * 1.18) : 0
  const discountPercent = hasPrice ? 15 : 0

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: "#FFFFFF",
        borderRadius: "12px",
        border: isHovered ? "1px solid #111111" : "1px solid #DADADA",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        transition: "all 0.2s ease",
        boxShadow: isHovered
          ? "0 8px 24px rgba(0, 0, 0, 0.08)"
          : "0 2px 8px rgba(0, 0, 0, 0.03)",
        transform: isHovered ? "translateY(-3px)" : "translateY(0)",
      }}
    >
      {/* ── Image & Badges Container ── */}
      <Link href={href} style={{ textDecoration: "none", position: "relative", display: "block" }}>
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "220px",
            background: "#F5F5F5",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              unoptimized={true}
              sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 25vw"
              style={{
                objectFit: "contain",
                padding: "16px",
                transition: "transform 0.3s ease",
                transform: isHovered ? "scale(1.06)" : "scale(1)",
                filter: outOfStock ? "grayscale(70%)" : "none",
              }}
            />
          ) : (
            <div style={{ color: "#777777", fontSize: "12px", fontFamily: "monospace" }}>CLASPO</div>
          )}

          {/* Badges */}
          <div style={{ position: "absolute", top: 12, left: 12, display: "flex", flexDirection: "column", gap: 6, zIndex: 2 }}>
            {outOfStock ? (
              <span
                style={{
                  background: "#111111",
                  color: "#FFFFFF",
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  padding: "4px 8px",
                  borderRadius: "4px",
                }}
              >
                Out of Stock
              </span>
            ) : discountPercent > 0 ? (
              <span
                style={{
                  background: "#111111",
                  color: "#FFFFFF",
                  fontSize: "10.5px",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  padding: "4px 9px",
                  borderRadius: "4px",
                }}
              >
                SAVE {discountPercent}%
              </span>
            ) : (
              <span
                style={{
                  background: "#F5F5F5",
                  color: "#111111",
                  border: "1px solid #DADADA",
                  fontSize: "10px",
                  fontWeight: 700,
                  padding: "4px 8px",
                  borderRadius: "4px",
                }}
              >
                Verified
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleToggleWishlist}
            aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "#FFFFFF",
              border: "1px solid #DADADA",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
              transition: "transform 0.2s, background 0.2s",
              zIndex: 3,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "scale(1.08)"
              e.currentTarget.style.borderColor = "#111111"
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "scale(1)"
              e.currentTarget.style.borderColor = "#DADADA"
            }}
          >
            <HeartIcon filled={isLiked} />
          </button>
        </div>
      </Link>

      {/* ── Content Body ── */}
      <div style={{ padding: "18px 18px 20px", display: "flex", flexDirection: "column", flex: 1 }}>
        {/* Category & Rating */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "#777777",
            }}
          >
            {product.category || "Home Solution"}
          </span>

          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <StarIcon />
            <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#111111" }}>5.0</span>
          </div>
        </div>

        {/* Product Title */}
        <Link
          href={href}
          style={{
            textDecoration: "none",
            color: "#111111",
            fontSize: "15px",
            fontWeight: 700,
            lineHeight: 1.35,
            marginBottom: 8,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            height: "40px",
            fontFamily: "var(--font-sora), sans-serif",
          }}
          title={product.name}
        >
          {product.name}
        </Link>

        {/* Part Number / Description */}
        {product.partNumber && (
          <div style={{ fontSize: "11.5px", color: "#777777", fontFamily: "monospace", marginBottom: 12 }}>
            SKU: <span style={{ color: "#111111", fontWeight: 600 }}>{product.partNumber}</span>
          </div>
        )}

        {/* Price Row */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: "auto", marginBottom: 16 }}>
          <span style={{ fontSize: "18px", fontWeight: 900, color: "#111111", fontFamily: "var(--font-sora), sans-serif" }}>
            {hasPrice ? formatPrice(product.price) : "Contact for Price"}
          </span>

          {hasPrice && originalPrice > 0 && (
            <span style={{ fontSize: "12.5px", color: "#777777", textDecoration: "line-through", fontWeight: 500 }}>
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>

        {/* Add to Cart CTA */}
        <button
          onClick={handleAddToCart}
          disabled={adding || added || outOfStock}
          style={{
            width: "100%",
            padding: "11px 16px",
            borderRadius: "6px",
            border: "none",
            background: outOfStock ? "#F5F5F5" : added ? "#303638" : "#111111",
            color: outOfStock ? "#777777" : "#FFFFFF",
            fontSize: "13px",
            fontWeight: 700,
            cursor: outOfStock ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            transition: "all 0.2s ease",
            boxShadow: !outOfStock && !added ? "0 2px 8px rgba(0, 0, 0, 0.1)" : "none",
            fontFamily: "inherit",
          }}
          onMouseEnter={e => {
            if (!outOfStock && !added) {
              e.currentTarget.style.background = "#303638"
            }
          }}
          onMouseLeave={e => {
            if (!outOfStock && !added) {
              e.currentTarget.style.background = "#111111"
            }
          }}
        >
          <CartIcon />
          <span>{outOfStock ? "Out of Stock" : added ? "✓ Added to Bag" : adding ? "Adding..." : "Add to Cart"}</span>
        </button>
      </div>
    </div>
  )
}
