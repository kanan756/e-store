"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useState } from "react"
import { useSession } from "next-auth/react"
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
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#F36B12" stroke="#F36B12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    )
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#747474" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    <svg width="13" height="13" viewBox="0 0 24 24" fill="#F36B12" stroke="#F36B12" strokeWidth="1">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const { addItem } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const isLiked = isInWishlist(product.handle || product.id)
  const href = product.handle ? `/products/${product.handle}` : "/products"

  const isValidUrl = (url: string) => {
    if (!url || url === "-" || typeof url !== "string") return false
    if (url.startsWith("/")) return true
    try { new URL(url); return true } catch { return false }
  }

  // Extract primary image from primaryImage, imageUrl, or additionalImages array
  let primaryImage: string | null = null
  if (product.primaryImage && isValidUrl(product.primaryImage)) {
    primaryImage = product.primaryImage
  } else if (product.imageUrl) {
    const list = product.imageUrl.split(",").map(u => u.trim()).filter(isValidUrl)
    if (list.length > 0) primaryImage = list[0]
  } else if (Array.isArray(product.additionalImages) && product.additionalImages.length > 0) {
    const first = product.additionalImages[0]?.url
    if (first && isValidUrl(first)) primaryImage = first
  }

  const availableColors = Array.isArray(product.colors)
    ? product.colors.filter((c) => c.available !== false && (c.stock == null || c.stock > 0))
    : []
  const hasColorConfig = Array.isArray(product.colors) && product.colors.length > 0
  const allColorsUnavailable = hasColorConfig && availableColors.length === 0
  const effectivePassiveStock =
    hasColorConfig && availableColors.length === 1 && availableColors[0].stock != null
      ? availableColors[0].stock
      : product.stock
  const outOfStock =
    product.inStock === false ||
    (effectivePassiveStock !== undefined && effectivePassiveStock <= 0) ||
    allColorsUnavailable
  const isLowStock =
    !outOfStock &&
    effectivePassiveStock !== undefined &&
    effectivePassiveStock >= 1 &&
    effectivePassiveStock <= 10

  // Compute pricing with discount support from Product Manager
  const regularPrice = Number.isFinite(Number(product.price)) ? Number(product.price) : 0
  const parsedDiscount =
    product.discountPrice != null && Number.isFinite(Number(product.discountPrice))
      ? Number(product.discountPrice)
      : null
  const hasDiscount = Boolean(
    parsedDiscount !== null && parsedDiscount > 0 && parsedDiscount < regularPrice
  )
  const sellingPrice = hasDiscount ? parsedDiscount! : regularPrice
  const originalPrice = hasDiscount ? regularPrice : 0
  const discountPercent = hasDiscount
    ? Math.round(((regularPrice - parsedDiscount!) / regularPrice) * 100)
    : 0
  const hasPrice = sellingPrice > 0

  const reviews = Array.isArray(product.reviews) ? product.reviews : []
  const reviewCount = reviews.length
  const averageRating =
    reviewCount > 0
      ? reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / reviewCount
      : 0

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (availableColors.length > 1) {
      router.push(href)
      return
    }

    if (!session?.user) {
      const message = "Please log in to your CLASPO account to add products to your cart."
      router.push(`/login?callbackUrl=${encodeURIComponent(href)}&message=${encodeURIComponent(message)}`)
      return
    }

    const autoColor = availableColors.length === 1 ? availableColors[0] : null

    setAdding(true)
    addItem({
      id: product.handle || product.id,
      productId: product.productId || product.id,
      name: product.name,
      price: sellingPrice,
      regularPrice,
      discountPrice: hasDiscount ? parsedDiscount : null,
      stock: autoColor?.stock != null ? autoColor.stock : product.stock,
      inStock: product.inStock,
      imageUrl: primaryImage || "",
      category: product.category,
      selectedColor: autoColor
        ? { id: autoColor.id, name: autoColor.name, hex: autoColor.hex }
        : null,
    })
    setAdding(false)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }, [addItem, availableColors, product, session, router, href, sellingPrice, regularPrice, hasDiscount, parsedDiscount, primaryImage])

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(product.handle || product.id)
  }

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: "#FFFFFF",
        borderRadius: "12px",
        border: isHovered ? "1px solid #F36B12" : "1px solid #E5E5E5",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        transition: "all 0.2s ease",
        boxShadow: isHovered
          ? "0 8px 24px rgba(243, 107, 18, 0.12)"
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
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)",
                padding: "20px",
                textAlign: "center",
              }}
            >
              <div style={{ position: "relative", width: 110, height: 32, opacity: 0.75, marginBottom: 8 }}>
                <Image
                  src="/images/claspo-latest-logo.png"
                  alt="CLASPO"
                  fill
                  style={{ objectFit: "contain" }}
                  unoptimized
                />
              </div>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#9CA3AF",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                Product Preview
              </span>
            </div>
          )}

          {/* Badges */}
          <div style={{ position: "absolute", top: 12, left: 12, display: "flex", flexDirection: "column", gap: 6, zIndex: 2 }}>
            {outOfStock ? (
              <span
                style={{
                  background: "#303638",
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
                  background: "#F36B12",
                  color: "#FFFFFF",
                  fontSize: "10.5px",
                  fontWeight: 800,
                  letterSpacing: "0.04em",
                  padding: "4px 9px",
                  borderRadius: "4px",
                  boxShadow: "0 2px 6px rgba(243, 107, 18, 0.35)",
                }}
              >
                SAVE {discountPercent}%
              </span>
            ) : (
              <span
                style={{
                  background: "#FFF0E5",
                  color: "#D9570A",
                  border: "1px solid rgba(243, 107, 18, 0.25)",
                  fontSize: "10px",
                  fontWeight: 800,
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
              border: "1px solid #E5E5E5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
              transition: "transform 0.2s, background 0.2s, border-color 0.2s",
              zIndex: 3,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "scale(1.08)"
              e.currentTarget.style.borderColor = "#F36B12"
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "scale(1)"
              e.currentTarget.style.borderColor = "#E5E5E5"
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
              color: "#747474",
            }}
          >
            {product.category || "Home Solution"}
          </span>

          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {reviewCount > 0 ? (
              <>
                <StarIcon />
                <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#17191C" }}>
                  {averageRating.toFixed(1)} ({reviewCount})
                </span>
              </>
            ) : (
              <span style={{ fontSize: "11px", fontWeight: 600, color: "#747474" }}>
                No reviews yet
              </span>
            )}
          </div>
        </div>

        {/* Product Title */}
        <Link
          href={href}
          style={{
            textDecoration: "none",
            color: "#17191C",
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
            transition: "color 0.15s ease",
          }}
          title={product.name}
          onMouseEnter={e => {
            e.currentTarget.style.color = "#F36B12"
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = "#17191C"
          }}
        >
          {product.name}
        </Link>

        {/* Part Number / Description */}
        {product.partNumber && (
          <div style={{ fontSize: "11.5px", color: "#747474", fontFamily: "monospace", marginBottom: availableColors.length > 0 ? 8 : 12 }}>
            SKU: <span style={{ color: "#17191C", fontWeight: 600 }}>{product.partNumber}</span>
          </div>
        )}

        {/* Compact Available Colour Swatches */}
        {availableColors.length > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 12,
              flexWrap: "wrap",
            }}
            aria-label={`${availableColors.length} available ${availableColors.length === 1 ? "colour" : "colours"}`}
          >
            {availableColors.slice(0, 5).map((c) => (
              <span
                key={c.id || c.name}
                title={c.name}
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  backgroundColor: c.hex,
                  border: "1.5px solid #D1D5DB",
                  boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.08)",
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
            ))}
            {availableColors.length > 5 && (
              <span style={{ fontSize: "11px", fontWeight: 600, color: "#6B7280" }}>
                +{availableColors.length - 5}
              </span>
            )}
            <span style={{ fontSize: "11px", color: "#6B7280", fontWeight: 500, marginLeft: 2 }}>
              {availableColors.length} {availableColors.length === 1 ? "colour" : "colours"}
            </span>
          </div>
        )}

        {/* Price Row */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: "auto", marginBottom: isLowStock ? 8 : 16, flexWrap: "wrap" }}>
          <span style={{ fontSize: "18px", fontWeight: 900, color: hasDiscount ? "#F36B12" : "#17191C", fontFamily: "var(--font-sora), sans-serif" }}>
            {hasPrice ? formatPrice(sellingPrice) : "Contact for Price"}
          </span>

          {hasPrice && originalPrice > 0 && (
            <span style={{ fontSize: "12.5px", color: "#747474", textDecoration: "line-through", fontWeight: 500 }}>
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>

        {isLowStock && (
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#C2410C", marginBottom: 12 }}>
            Only {effectivePassiveStock} left in stock!
          </div>
        )}

        {/* Add to Cart CTA */}
        <button
          onClick={handleAddToCart}
          disabled={adding || added || outOfStock}
          style={{
            width: "100%",
            padding: "11px 16px",
            borderRadius: "6px",
            border: "none",
            background: outOfStock ? "#F5F5F5" : added ? "#303638" : "#F36B12",
            color: outOfStock ? "#747474" : "#FFFFFF",
            fontSize: "13px",
            fontWeight: 700,
            cursor: outOfStock ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            transition: "all 0.2s ease",
            boxShadow: !outOfStock && !added ? "0 4px 12px rgba(243, 107, 18, 0.28)" : "none",
            fontFamily: "inherit",
          }}
          onMouseEnter={e => {
            if (!outOfStock && !added) {
              e.currentTarget.style.background = "#D9570A"
              e.currentTarget.style.transform = "translateY(-1px)"
            }
          }}
          onMouseLeave={e => {
            if (!outOfStock && !added) {
              e.currentTarget.style.background = "#F36B12"
              e.currentTarget.style.transform = "translateY(0)"
            }
          }}
        >
          <CartIcon />
          <span>
            {outOfStock
              ? "Out of Stock"
              : added
                ? "✓ Added to Bag"
                : adding
                  ? "Adding..."
                  : availableColors.length > 1
                    ? "Select Colour"
                    : "Add to Cart"}
          </span>
        </button>
      </div>
    </div>
  )
}
