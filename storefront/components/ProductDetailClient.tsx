"use client"

/**
 * @file ProductDetailClient.tsx
 * @description Single-page Product Detail experience for CLASPO:
 *   1. Product Image & Video Gallery (Cloudinary media, zoom, fullscreen, video playback)
 *   2. Product Name, Average Rating, Review Count, Price in INR (₹), Discount Price, Stock Status
 *   3. Product Description
 *   4. How to Use (numbered steps from Google Sheets)
 *   5. Product Reviews (average rating, total count, individual reviews with dates)
 *   6. Add Your Review (verified-purchase, duplicate-protected review submission)
 *   7. Add to Cart & Place Order purchasing options
 */

import { useState, useCallback, useMemo, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useCart } from "@/context/cart-context"
import type { Product, ProductReviewItem } from "@/lib/sheets"
import { formatPrice } from "@/lib/format"

export interface UnifiedMediaItem {
  type: "image" | "video"
  url: string
  thumbnail?: string
  title?: string
}

interface ReviewEligibility {
  loading: boolean
  authenticated: boolean
  hasPurchased: boolean
  alreadyReviewed: boolean
  canReview: boolean
}

function formatReviewDate(iso?: string): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export default function ProductDetailClient({ product }: { product: Product }) {
  const router = useRouter()
  const { data: session, status: sessionStatus } = useSession()
  const { addItem } = useCart()

  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [placingOrder, setPlacingOrder] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [activeMediaIndex, setActiveMediaIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  // Reviews state (seeded from Google Sheets, updated live on customer submission)
  const [reviews, setReviews] = useState<ProductReviewItem[]>(() =>
    Array.isArray(product.reviews) ? product.reviews : []
  )
  const [eligibility, setEligibility] = useState<ReviewEligibility>({
    loading: false,
    authenticated: false,
    hasPurchased: false,
    alreadyReviewed: false,
    canReview: false,
  })
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewTitle, setReviewTitle] = useState("")
  const [reviewDescription, setReviewDescription] = useState("")
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewError, setReviewError] = useState("")
  const [reviewSuccess, setReviewSuccess] = useState("")

  const productHandle = product.handle || product.id
  const productUrl = `/products/${productHandle}`
  const loginMessage = "Please log in to your CLASPO account to continue."

  // ── Check verified-purchase review eligibility ─────────────────────────────
  useEffect(() => {
    if (sessionStatus === "loading") return
    if (!session?.user?.email) {
      setEligibility({
        loading: false,
        authenticated: false,
        hasPurchased: false,
        alreadyReviewed: false,
        canReview: false,
      })
      return
    }

    let cancelled = false
    setEligibility((prev) => ({ ...prev, loading: true }))
    fetch(`/api/products/${encodeURIComponent(productHandle)}/reviews`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return
        setEligibility({
          loading: false,
          authenticated: Boolean(data.authenticated),
          hasPurchased: Boolean(data.hasPurchased),
          alreadyReviewed: Boolean(data.alreadyReviewed),
          canReview: Boolean(data.canReview),
        })
      })
      .catch(() => {
        if (!cancelled) {
          setEligibility((prev) => ({ ...prev, loading: false }))
        }
      })

    return () => {
      cancelled = true
    }
  }, [session?.user?.email, sessionStatus, productHandle])

  // ── Unified Media Extractor (Images + Videos) ──────────────────────────────
  const mediaItems: UnifiedMediaItem[] = useMemo(() => {
    const list: UnifiedMediaItem[] = []
    const seenUrls = new Set<string>()

    const isValidUrl = (url?: string) => {
      if (!url || url === "-") return false
      if (url.startsWith("/")) return true
      try {
        new URL(url)
        return true
      } catch {
        return false
      }
    }

    if (isValidUrl(product.primaryImage)) {
      list.push({ type: "image", url: product.primaryImage! })
      seenUrls.add(product.primaryImage!)
    }

    if (product.imageUrl) {
      const split = product.imageUrl.split(",").map((s) => s.trim()).filter(isValidUrl)
      for (const u of split) {
        if (!seenUrls.has(u)) {
          list.push({ type: "image", url: u })
          seenUrls.add(u)
        }
      }
    }

    if (product.additionalImages && Array.isArray(product.additionalImages)) {
      for (const img of product.additionalImages) {
        if (isValidUrl(img.url) && !seenUrls.has(img.url)) {
          if (img.isPrimary) {
            list.unshift({ type: "image", url: img.url })
          } else {
            list.push({ type: "image", url: img.url })
          }
          seenUrls.add(img.url)
        }
      }
    }

    if (isValidUrl(product.primaryVideo)) {
      list.push({
        type: "video",
        url: product.primaryVideo!,
        thumbnail: list.find((m) => m.type === "image")?.url,
      })
      seenUrls.add(product.primaryVideo!)
    }

    if (product.additionalVideos && Array.isArray(product.additionalVideos)) {
      for (const vid of product.additionalVideos) {
        if (isValidUrl(vid.url) && !seenUrls.has(vid.url)) {
          list.push({
            type: "video",
            url: vid.url,
            thumbnail: vid.thumbnail || list.find((m) => m.type === "image")?.url,
            title: vid.title,
          })
          seenUrls.add(vid.url)
        }
      }
    }

    return list
  }, [product])

  const currentMedia = mediaItems[activeMediaIndex] || mediaItems[0] || null

  const reviewCount = reviews.length
  const averageRating = useMemo(() => {
    if (reviewCount === 0) return 0
    return reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / reviewCount
  }, [reviews, reviewCount])

  const howToUseSteps = useMemo(
    () =>
      Array.isArray(product.howToUse)
        ? [...product.howToUse].sort((a, b) => (a.stepNumber ?? 0) - (b.stepNumber ?? 0))
        : [],
    [product.howToUse]
  )

  const isInactive = product.status === "Inactive"
  const isOutOfStock = !product.inStock || (product.stock !== undefined && product.stock <= 0)
  const hasDiscount = product.discountPrice != null && product.discountPrice > 0 && product.discountPrice < product.price
  const effectivePrice = hasDiscount ? product.discountPrice! : product.price
  const maxStock = product.stock && product.stock > 0 ? product.stock : 999

  // ── Purchasing Actions ─────────────────────────────────────────────────────
  const handleAddToCart = useCallback(() => {
    if (!session?.user) {
      router.push(`/login?callbackUrl=${encodeURIComponent(productUrl)}&message=${encodeURIComponent(loginMessage)}`)
      return
    }
    setAdding(true)
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: productHandle,
        name: product.name,
        price: effectivePrice,
        imageUrl: product.imageUrl || mediaItems[0]?.url || "",
        category: product.category,
      })
    }
    setAdding(false)
    setAdded(true)
    setTimeout(() => setAdded(false), 2500)
  }, [addItem, effectivePrice, mediaItems, product.category, product.imageUrl, product.name, productHandle, productUrl, quantity, router, session])

  const handlePlaceOrder = useCallback(() => {
    if (!session?.user) {
      router.push(`/login?callbackUrl=${encodeURIComponent(productUrl)}&message=${encodeURIComponent(loginMessage)}`)
      return
    }
    setPlacingOrder(true)
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: productHandle,
        name: product.name,
        price: effectivePrice,
        imageUrl: product.imageUrl || mediaItems[0]?.url || "",
        category: product.category,
      })
    }
    router.push("/checkout")
  }, [addItem, effectivePrice, mediaItems, product.category, product.imageUrl, product.name, productHandle, productUrl, quantity, router, session])

  // ── Customer Review Submission ─────────────────────────────────────────────
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    setReviewError("")
    setReviewSuccess("")

    if (!reviewTitle.trim() || !reviewDescription.trim()) {
      setReviewError("Please enter both a review title and description.")
      return
    }

    setSubmittingReview(true)
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(productHandle)}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: reviewRating,
          title: reviewTitle.trim(),
          description: reviewDescription.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit review.")
      }

      if (Array.isArray(data.reviews)) {
        setReviews(data.reviews)
      } else if (data.review) {
        setReviews((prev) => [data.review, ...prev])
      }

      setReviewTitle("")
      setReviewDescription("")
      setReviewRating(5)
      setReviewSuccess(data.message || "Thank you! Your review has been published.")
      setEligibility((prev) => ({
        ...prev,
        alreadyReviewed: true,
        canReview: false,
      }))
    } catch (err: any) {
      setReviewError(err.message || "Unable to submit review. Please try again.")
    } finally {
      setSubmittingReview(false)
    }
  }

  return (
    <div className="pd-shell" style={{ background: "#FFFFFF" }}>
      {/* ── Breadcrumb & Section Quick Nav ── */}
      <div style={{ borderBottom: "1px solid #E5E5E5", background: "#FAFAFA", padding: "14px 0" }}>
        <div className="W" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ fontSize: 13, color: "#747474", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <Link href="/products" style={{ color: "#303638", textDecoration: "none", fontWeight: 600 }}>
              Products
            </Link>
            <span>/</span>
            <span>{product.category || "Product"}</span>
            <span>/</span>
            <span style={{ color: "#17191C", fontWeight: 700 }}>{product.name}</span>
          </div>

          <nav style={{ display: "flex", gap: 18, fontSize: 13, fontWeight: 600, flexWrap: "wrap" }}>
            <a href="#pd-description" style={{ color: "#303638", textDecoration: "none" }}>Description</a>
            {howToUseSteps.length > 0 && (
              <a href="#pd-how-to-use" style={{ color: "#303638", textDecoration: "none" }}>How to Use</a>
            )}
            <a href="#pd-reviews" style={{ color: "#303638", textDecoration: "none" }}>
              Reviews ({reviewCount})
            </a>
            <a href="#pd-add-review" style={{ color: "#F36B12", textDecoration: "none" }}>Write a Review</a>
          </nav>
        </div>
      </div>

      {/* ── 1 & 2. Hero: Media Gallery + Product Info & Purchasing ── */}
      <section style={{ padding: "40px 0 56px", borderBottom: "1px solid #E5E5E5" }}>
        <div className="W">
          <div className="pd-overview-grid" style={{ gap: 48, alignItems: "start" }}>
            {/* 1. Product Image & Video Gallery */}
            <div>
              <div
                className="pd-img-main"
                style={{
                  position: "relative",
                  background: "#F9FAFB",
                  border: "1px solid #E5E5E5",
                  borderRadius: 12,
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 420,
                  aspectRatio: "4 / 3",
                }}
              >
                {currentMedia ? (
                  currentMedia.type === "video" ? (
                    <div style={{ width: "100%", height: "100%", background: "#000000", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <video
                        key={currentMedia.url}
                        src={currentMedia.url}
                        controls
                        autoPlay
                        playsInline
                        preload="metadata"
                        style={{ width: "100%", height: "100%", maxHeight: 500, objectFit: "contain" }}
                      />
                    </div>
                  ) : (
                    <>
                      <img
                        src={currentMedia.url}
                        alt={product.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: isZoomed ? "cover" : "contain",
                          cursor: isZoomed ? "zoom-out" : "zoom-in",
                          transition: "transform 0.25s ease",
                          transform: isZoomed ? "scale(1.45)" : "scale(1)",
                          display: "block",
                        }}
                        onClick={() => setIsZoomed(!isZoomed)}
                      />

                      <button
                        type="button"
                        onClick={() => setLightboxOpen(true)}
                        title="Full-screen image view"
                        aria-label="Open full-screen image"
                        style={{
                          position: "absolute",
                          top: 14,
                          right: 14,
                          background: "rgba(255, 255, 255, 0.92)",
                          border: "1px solid #E5E5E5",
                          borderRadius: "50%",
                          width: 40,
                          height: 40,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                          color: "#17191C",
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="15 3 21 3 21 9" />
                          <polyline points="9 21 3 21 3 15" />
                          <line x1="21" y1="3" x2="14" y2="10" />
                          <line x1="3" y1="21" x2="10" y2="14" />
                        </svg>
                      </button>
                    </>
                  )
                ) : (
                  <div className="pd-img-placeholder">{product.name}</div>
                )}

                {mediaItems.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="pd-img-arrow pd-img-arrow--l"
                      onClick={() => {
                        setIsZoomed(false)
                        setActiveMediaIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1))
                      }}
                      aria-label="Previous media"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
                    </button>
                    <button
                      type="button"
                      className="pd-img-arrow pd-img-arrow--r"
                      onClick={() => {
                        setIsZoomed(false)
                        setActiveMediaIndex((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1))
                      }}
                      aria-label="Next media"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                    </button>
                  </>
                )}
              </div>

              {/* Image & Video Thumbnails */}
              {mediaItems.length > 1 && (
                <div className="pd-thumbs" style={{ marginTop: 14 }}>
                  {mediaItems.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`pd-thumb${activeMediaIndex === idx ? " active" : ""}`}
                      onClick={() => {
                        setIsZoomed(false)
                        setActiveMediaIndex(idx)
                      }}
                      style={{ position: "relative", overflow: "hidden" }}
                      aria-label={item.type === "video" ? `Play video ${idx + 1}` : `View image ${idx + 1}`}
                    >
                      {item.type === "video" ? (
                        <div style={{ width: "100%", height: "100%", background: "#1F2324", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                          {item.thumbnail ? (
                            <img src={item.thumbnail} alt="Video thumbnail" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : null}
                          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ color: "#FFFFFF", fontSize: 12, background: "#F36B12", width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              ▶
                            </span>
                          </div>
                        </div>
                      ) : (
                        <img src={item.url} alt={`${product.name} thumbnail ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Product Information & Purchasing Controls */}
            <div className="pd-overview-info">
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
                <span className="lbl" style={{ margin: 0 }}>{product.category || "Product"}</span>
                {product.partNumber && (
                  <span style={{ fontFamily: "monospace", fontSize: 12, color: "#747474", background: "#F5F5F5", padding: "3px 8px", borderRadius: 4 }}>
                    SKU: {product.partNumber}
                  </span>
                )}
              </div>

              <h1 className="D3" style={{ fontSize: "clamp(26px, 3.4vw, 42px)", color: "#17191C", margin: "0 0 14px", lineHeight: 1.15 }}>
                {product.name}
              </h1>

              {/* Average Star Rating & Total Review Count */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
                <a
                  href="#pd-reviews"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 12px",
                    borderRadius: 20,
                    background: "#FFF4ED",
                    border: "1px solid #FED7AA",
                    textDecoration: "none",
                    color: "#17191C",
                    fontSize: 13.5,
                    fontWeight: 700,
                  }}
                >
                  <span style={{ color: "#F36B12", letterSpacing: 1 }}>
                    {"★".repeat(Math.round(averageRating || 5))}
                    <span style={{ color: "#D1D5DB" }}>{"★".repeat(5 - Math.round(averageRating || 5))}</span>
                  </span>
                  <span>{reviewCount > 0 ? averageRating.toFixed(1) : "No ratings yet"}</span>
                  <span style={{ color: "#747474", fontWeight: 500 }}>
                    ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
                  </span>
                </a>

                {/* Stock / Availability Badge */}
                {isInactive ? (
                  <span style={{ background: "#F3F4F6", color: "#6B7280", padding: "5px 12px", borderRadius: 20, fontSize: 12.5, fontWeight: 700 }}>
                    Currently Unavailable
                  </span>
                ) : isOutOfStock ? (
                  <span style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA", padding: "5px 12px", borderRadius: 20, fontSize: 12.5, fontWeight: 700 }}>
                    Out of Stock
                  </span>
                ) : (
                  <span style={{ background: "#ECFDF5", color: "#059669", border: "1px solid #A7F3D0", padding: "5px 12px", borderRadius: 20, fontSize: 12.5, fontWeight: 700 }}>
                    ✓ In Stock {product.stock != null ? `(${product.stock} available)` : ""}
                  </span>
                )}
              </div>

              {/* Price in INR (₹) & Discount Price */}
              <div style={{ marginBottom: 18, padding: "16px 20px", background: "#FAFAFA", border: "1px solid #E5E5E5", borderRadius: 10 }}>
                {hasDiscount ? (
                  <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
                    <span style={{ color: "#F36B12", fontSize: "34px", fontWeight: 900 }}>
                      {formatPrice(product.discountPrice!)}
                    </span>
                    <span style={{ color: "#9CA3AF", fontSize: "20px", textDecoration: "line-through", fontWeight: 600 }}>
                      {formatPrice(product.price)}
                    </span>
                    <span style={{ background: "#ECFDF5", color: "#059669", fontSize: 12, fontWeight: 800, padding: "4px 10px", borderRadius: 4 }}>
                      SAVE {Math.round(((product.price - product.discountPrice!) / product.price) * 100)}%
                    </span>
                  </div>
                ) : (
                  <div style={{ color: "#17191C", fontSize: "34px", fontWeight: 900 }}>
                    {product.price > 0 ? formatPrice(product.price) : "Contact for price"}
                  </div>
                )}
                <div style={{ fontSize: 12.5, color: "#747474", marginTop: 4 }}>
                  Inclusive of standard packaging • Prices in INR (₹)
                </div>
              </div>

              {/* Short Summary */}
              {product.shortDescription && (
                <p style={{ fontSize: 15.5, fontWeight: 500, color: "#303638", marginBottom: 20, lineHeight: 1.6 }}>
                  {product.shortDescription}
                </p>
              )}

              {/* Quantity Selector */}
              {!isInactive && !isOutOfStock && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14, marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#17191C", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Quantity:
                    </span>
                    <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid #E5E5E5", borderRadius: 6, background: "#FFFFFF", overflow: "hidden" }}>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        aria-label="Decrease quantity"
                        style={{ width: 38, height: 38, background: "#FFF0E5", border: "none", color: "#D9570A", fontSize: 16, cursor: "pointer", fontWeight: 700 }}
                      >
                        -
                      </button>
                      <span style={{ minWidth: 44, textAlign: "center", fontSize: 15, fontWeight: 700, color: "#17191C" }}>
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))}
                        aria-label="Increase quantity"
                        style={{ width: 38, height: 38, background: "#FFF0E5", border: "none", color: "#D9570A", fontSize: 16, cursor: "pointer", fontWeight: 700 }}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {effectivePrice > 0 && (
                    <div style={{ fontSize: 14, color: "#303638", fontWeight: 600 }}>
                      Subtotal:{" "}
                      <span style={{ color: "#17191C", fontWeight: 800, fontSize: 17 }}>
                        {formatPrice(effectivePrice * quantity)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Confirmation Toast */}
              {added && (
                <div
                  role="status"
                  style={{
                    marginBottom: 14,
                    padding: "11px 16px",
                    borderRadius: 8,
                    background: "#ECFDF5",
                    border: "1px solid #A7F3D0",
                    color: "#065F46",
                    fontSize: 13.5,
                    fontWeight: 700,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <span>✓ Added {quantity} × {product.name} to your cart!</span>
                  <Link href="/cart" style={{ color: "#059669", textDecoration: "underline", fontWeight: 800, whiteSpace: "nowrap" }}>
                    View Cart →
                  </Link>
                </div>
              )}

              {/* Add to Cart & Place Order Buttons */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={adding || isOutOfStock || isInactive}
                  style={{
                    padding: "14px 20px",
                    borderRadius: 8,
                    background: isInactive || isOutOfStock ? "#F5F5F5" : "#F36B12",
                    color: isInactive || isOutOfStock ? "#747474" : "#FFFFFF",
                    cursor: isInactive || isOutOfStock ? "not-allowed" : "pointer",
                    border: isInactive || isOutOfStock ? "1px solid #E5E5E5" : "1px solid #F36B12",
                    fontWeight: 700,
                    fontSize: 14.5,
                    boxShadow: isInactive || isOutOfStock ? "none" : "0 4px 14px rgba(243, 107, 18, 0.28)",
                  }}
                >
                  {isInactive
                    ? "Unavailable"
                    : isOutOfStock
                    ? "Out of Stock"
                    : added
                    ? "✓ Added to Cart"
                    : adding
                    ? "Adding…"
                    : "Add to Cart"}
                </button>

                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={placingOrder || isOutOfStock || isInactive}
                  style={{
                    padding: "14px 20px",
                    borderRadius: 8,
                    background: isInactive || isOutOfStock ? "#F5F5F5" : "#303638",
                    color: isInactive || isOutOfStock ? "#747474" : "#FFFFFF",
                    cursor: isInactive || isOutOfStock ? "not-allowed" : "pointer",
                    border: isInactive || isOutOfStock ? "1px solid #E5E5E5" : "1px solid #303638",
                    fontWeight: 700,
                    fontSize: 14.5,
                  }}
                >
                  {placingOrder ? "Redirecting…" : "Place Order"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Product Description Section ── */}
      <section id="pd-description" style={{ padding: "52px 0", borderBottom: "1px solid #E5E5E5", background: "#FAFAFA" }}>
        <div className="W">
          <div className="lbl" style={{ marginBottom: 10 }}>PRODUCT DETAILS</div>
          <h2 className="D3" style={{ fontSize: "clamp(22px, 2.8vw, 32px)", color: "#17191C", margin: "0 0 18px" }}>
            Product Description
          </h2>
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E5E5E5",
              borderRadius: 12,
              padding: "28px 32px",
              color: "#303638",
              fontSize: 15.5,
              lineHeight: 1.75,
              whiteSpace: "pre-line",
            }}
          >
            {product.description ||
              "Thoughtfully engineered everyday solutions from CLASPO. Built for enduring performance, functional convenience, and lasting satisfaction."}
          </div>
        </div>
      </section>

      {/* ── 4. How to Use Section ── */}
      {howToUseSteps.length > 0 && (
        <section id="pd-how-to-use" style={{ padding: "56px 0", borderBottom: "1px solid #E5E5E5", background: "#FFFFFF" }}>
          <div className="W">
            <div style={{ marginBottom: 28 }}>
              <div className="lbl" style={{ marginBottom: 10 }}>STEP-BY-STEP GUIDE</div>
              <h2 className="D3" style={{ fontSize: "clamp(22px, 2.8vw, 32px)", color: "#17191C", margin: 0 }}>
                How to Use
              </h2>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 20,
              }}
            >
              {howToUseSteps.map((step, idx) => (
                <div
                  key={step.id || idx}
                  style={{
                    background: "#FAFAFA",
                    border: "1px solid #E5E5E5",
                    borderRadius: 12,
                    padding: 24,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        background: "#F36B12",
                        color: "#FFFFFF",
                        fontSize: 15,
                        fontWeight: 800,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {idx + 1}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#747474" }}>
                      Step {idx + 1}
                    </span>
                  </div>

                  {step.title && (
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#17191C", margin: 0 }}>
                      {step.title}
                    </h3>
                  )}

                  <p style={{ fontSize: 14.5, color: "#4B5563", lineHeight: 1.6, margin: 0, whiteSpace: "pre-line" }}>
                    {step.instruction}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 5. Product Reviews Section ── */}
      <section id="pd-reviews" style={{ padding: "56px 0", borderBottom: "1px solid #E5E5E5", background: "#FAFAFA" }}>
        <div className="W">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20, marginBottom: 32 }}>
            <div>
              <div className="lbl" style={{ marginBottom: 10 }}>CUSTOMER FEEDBACK</div>
              <h2 className="D3" style={{ fontSize: "clamp(22px, 2.8vw, 32px)", color: "#17191C", margin: 0 }}>
                Product Reviews
              </h2>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                background: "#FFFFFF",
                border: "1px solid #E5E5E5",
                borderRadius: 12,
                padding: "14px 20px",
              }}
            >
              <div style={{ fontSize: 32, fontWeight: 900, color: "#17191C", lineHeight: 1 }}>
                {reviewCount > 0 ? averageRating.toFixed(1) : "—"}
              </div>
              <div>
                <div style={{ color: "#F36B12", fontSize: 16, letterSpacing: 1.5 }}>
                  {"★".repeat(Math.round(averageRating || 0))}
                  <span style={{ color: "#D1D5DB" }}>{"★".repeat(5 - Math.round(averageRating || 0))}</span>
                </div>
                <div style={{ fontSize: 12.5, color: "#747474", marginTop: 2 }}>
                  {reviewCount === 0
                    ? "No reviews yet"
                    : `Based on ${reviewCount} ${reviewCount === 1 ? "review" : "reviews"}`}
                </div>
              </div>
            </div>
          </div>

          {reviewCount > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 20,
              }}
            >
              {reviews.map((rev) => (
                <article
                  key={rev.id}
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #E5E5E5",
                    borderRadius: 12,
                    padding: 24,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <div style={{ color: "#F36B12", fontSize: 15, letterSpacing: 1.5 }}>
                      {"★".repeat(rev.rating)}
                      <span style={{ color: "#D1D5DB" }}>{"★".repeat(5 - rev.rating)}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#303638" }}>
                      {rev.rating}.0 / 5
                    </span>
                  </div>

                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#17191C", margin: 0 }}>
                    {rev.title}
                  </h3>

                  <p style={{ fontSize: 14.5, color: "#4B5563", lineHeight: 1.6, margin: 0, whiteSpace: "pre-line", flex: 1 }}>
                    {rev.description}
                  </p>

                  <div style={{ borderTop: "1px solid #F3F4F6", paddingTop: 12, marginTop: 4, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, fontSize: 12.5, color: "#747474" }}>
                    <span style={{ fontWeight: 700, color: "#303638" }}>
                      {rev.reviewerName}
                    </span>
                    {rev.createdAt && (
                      <span>{formatReviewDate(rev.createdAt)}</span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div style={{ background: "#FFFFFF", border: "1px solid #E5E5E5", borderRadius: 12, padding: 28, color: "#747474", fontSize: 14.5 }}>
              No customer reviews yet. Verified buyers can share their experience below.
            </div>
          )}
        </div>
      </section>

      {/* ── 6. Add Your Review Form ── */}
      <section id="pd-add-review" style={{ padding: "56px 0", borderBottom: "1px solid #E5E5E5", background: "#FFFFFF" }}>
        <div className="W">
          <div style={{ maxWidth: 720 }}>
            <div className="lbl" style={{ marginBottom: 10 }}>SHARE YOUR EXPERIENCE</div>
            <h2 className="D3" style={{ fontSize: "clamp(22px, 2.8vw, 32px)", color: "#17191C", margin: "0 0 20px" }}>
              Add Your Review
            </h2>

            {reviewSuccess && (
              <div
                role="status"
                style={{
                  marginBottom: 20,
                  padding: "14px 18px",
                  background: "#ECFDF5",
                  border: "1px solid #A7F3D0",
                  borderRadius: 10,
                  color: "#065F46",
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                ✓ {reviewSuccess}
              </div>
            )}

            {sessionStatus === "loading" || eligibility.loading ? (
              <div style={{ padding: 24, background: "#FAFAFA", border: "1px solid #E5E5E5", borderRadius: 12, color: "#747474", fontSize: 14 }}>
                Checking your review eligibility…
              </div>
            ) : !session?.user ? (
              <div style={{ padding: 28, background: "#FAFAFA", border: "1px solid #E5E5E5", borderRadius: 12 }}>
                <p style={{ margin: "0 0 16px", fontSize: 15, color: "#303638", lineHeight: 1.6 }}>
                  Please log in to your CLASPO account to leave a verified customer review.
                </p>
                <Link
                  href={`/login?callbackUrl=${encodeURIComponent(productUrl + "#pd-add-review")}&message=${encodeURIComponent("Please log in to submit a product review.")}`}
                  className="btn bp"
                  style={{ display: "inline-flex" }}
                >
                  Log In to Review
                </Link>
              </div>
            ) : eligibility.alreadyReviewed ? (
              <div style={{ padding: 24, background: "#FFF4ED", border: "1px solid #FED7AA", borderRadius: 12, color: "#9A3412", fontSize: 14.5, fontWeight: 600 }}>
                You have already submitted a review for this product. Thank you for your feedback!
              </div>
            ) : !eligibility.hasPurchased ? (
              <div style={{ padding: 24, background: "#FAFAFA", border: "1px solid #E5E5E5", borderRadius: 12, color: "#4B5563", fontSize: 14.5, lineHeight: 1.6 }}>
                Only verified customers who have purchased <strong>{product.name}</strong> can submit a review.
              </div>
            ) : (
              <form
                onSubmit={handleSubmitReview}
                style={{
                  background: "#FAFAFA",
                  border: "1px solid #E5E5E5",
                  borderRadius: 12,
                  padding: 28,
                }}
              >
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#17191C", marginBottom: 8 }}>
                    Your Rating <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        aria-label={`Rate ${star} out of 5 stars`}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: 28,
                          lineHeight: 1,
                          padding: "2px 4px",
                          color: star <= reviewRating ? "#F36B12" : "#D1D5DB",
                        }}
                      >
                        ★
                      </button>
                    ))}
                    <span style={{ marginLeft: 8, fontSize: 14, fontWeight: 700, color: "#303638" }}>
                      {reviewRating} / 5
                    </span>
                  </div>
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label htmlFor="review-title-input" style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#17191C", marginBottom: 8 }}>
                    Review Title <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <input
                    id="review-title-input"
                    type="text"
                    required
                    maxLength={150}
                    placeholder="Summarize your experience"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: 8,
                      border: "1px solid #D1D5DB",
                      background: "#FFFFFF",
                      color: "#17191C",
                      fontSize: 14.5,
                    }}
                  />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label htmlFor="review-desc-input" style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#17191C", marginBottom: 8 }}>
                    Review Description <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <textarea
                    id="review-desc-input"
                    required
                    rows={4}
                    maxLength={2000}
                    placeholder="What did you like or dislike about this product?"
                    value={reviewDescription}
                    onChange={(e) => setReviewDescription(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: 8,
                      border: "1px solid #D1D5DB",
                      background: "#FFFFFF",
                      color: "#17191C",
                      fontSize: 14.5,
                      resize: "vertical",
                    }}
                  />
                </div>

                {reviewError && (
                  <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 8, background: "#FEF2F2", border: "1px solid #FCA5A5", color: "#DC2626", fontSize: 13.5, fontWeight: 600 }}>
                    {reviewError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn bp"
                  style={{ padding: "13px 28px", fontSize: 14.5 }}
                >
                  {submittingReview ? "Submitting Review…" : "Submit Review"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── 7. Bottom Purchasing Bar ── */}
      {!isInactive && !isOutOfStock && (
        <section style={{ padding: "40px 0", background: "#303638", color: "#FFFFFF" }}>
          <div className="W" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#F36B12", marginBottom: 4 }}>
                READY TO ORDER
              </div>
              <div style={{ fontSize: 20, fontWeight: 800 }}>
                {product.name} — {effectivePrice > 0 ? formatPrice(effectivePrice * quantity) : "Contact for price"}
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={adding}
                style={{
                  padding: "13px 26px",
                  borderRadius: 8,
                  background: "#F36B12",
                  color: "#FFFFFF",
                  border: "none",
                  fontWeight: 700,
                  fontSize: 14.5,
                  cursor: "pointer",
                }}
              >
                {added ? "✓ Added to Cart" : "Add to Cart"}
              </button>
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={placingOrder}
                style={{
                  padding: "13px 26px",
                  borderRadius: 8,
                  background: "#FFFFFF",
                  color: "#17191C",
                  border: "none",
                  fontWeight: 700,
                  fontSize: 14.5,
                  cursor: "pointer",
                }}
              >
                {placingOrder ? "Redirecting…" : "Place Order"}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ── Full-Screen Lightbox Modal ── */}
      {lightboxOpen && currentMedia && currentMedia.type === "image" && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.9)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close full-screen image"
            style={{
              position: "absolute",
              top: 20,
              right: 24,
              background: "rgba(255, 255, 255, 0.2)",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "50%",
              width: 44,
              height: 44,
              fontSize: 22,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>

          <img
            src={currentMedia.url}
            alt={product.name}
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
              objectFit: "contain",
              borderRadius: 8,
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
