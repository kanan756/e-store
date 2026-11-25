"use client"

/**
 * @file ProductDetailClient.tsx
 * @description CLASPO Product Detail Page:
 *   1. Top Product Section: Media gallery (images + videos, zoom, fullscreen) + Product info (name, rating, review count, INR price/discount, availability, description).
 *   2. Tabbed Content Section: Single container with 3 tabs:
 *      - Tab 1: How to Use (numbered steps from Google Sheets)
 *      - Tab 2: Product Reviews (average rating, total count, individual reviews with dates)
 *      - Tab 3: Add Review (verified-purchase 1–5 star form)
 *   3. Bottom Sticky Order Summary Panel: Horizontal sticky bar at the bottom of the viewport
 *      that stops cleanly before the website footer.
 */

import { useState, useCallback, useMemo, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useCart } from "@/context/cart-context"
import type { Product, ProductReviewItem } from "@/lib/sheets"
import { formatPrice, FLAT_SHIPPING_INR } from "@/lib/format"

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

type DetailTab = "how-to-use" | "reviews" | "add-review"
type ReviewSortOption = "newest" | "highest" | "lowest"

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
  const [videoError, setVideoError] = useState(false)

  // Tabbed Content Section state
  const [activeTab, setActiveTab] = useState<DetailTab>("how-to-use")
  const [footerVisible, setFooterVisible] = useState(false)

  const targetProductId = product.productId || product.id

  // Reviews state
  const [reviews, setReviews] = useState<ProductReviewItem[]>(() =>
    Array.isArray(product.reviews)
      ? product.reviews.filter((r) => !r.productId || r.productId === targetProductId)
      : []
  )
  const [reviewSort, setReviewSort] = useState<ReviewSortOption>("newest")
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [reviewsFetchError, setReviewsFetchError] = useState("")
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

  const fetchProductReviews = useCallback(async () => {
    if (!targetProductId) return
    setReviewsLoading(true)
    setReviewsFetchError("")
    try {
      const res = await fetch(`/api/reviews?productId=${encodeURIComponent(targetProductId)}`, {
        cache: "no-store",
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Unable to load product reviews.")
      }
      if (Array.isArray(data.reviews)) {
        setReviews(
          data.reviews.filter((r: ProductReviewItem) => !r.productId || r.productId === targetProductId)
        )
      }
    } catch (err: any) {
      setReviewsFetchError(err.message || "Unable to load latest reviews.")
    } finally {
      setReviewsLoading(false)
    }
  }, [targetProductId])

  useEffect(() => {
    void fetchProductReviews()
  }, [fetchProductReviews])

  // Hide fixed bottom order panel when website footer enters viewport
  useEffect(() => {
    const footerEl = document.querySelector("footer")
    if (!footerEl || typeof IntersectionObserver === "undefined") return

    const observer = new IntersectionObserver(
      (entries) => {
        const isIntersecting = entries.some((entry) => entry.isIntersecting)
        setFooterVisible(isIntersecting)
      },
      { threshold: 0.01 }
    )

    observer.observe(footerEl)
    return () => {
      observer.disconnect()
    }
  }, [])

  // Check verified-purchase review eligibility
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

  // Unified Media Extractor (Cloudinary Images + Videos)
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

  const sortedReviews = useMemo(() => {
    const list = [...reviews]
    if (reviewSort === "highest") {
      return list.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0))
    }
    if (reviewSort === "lowest") {
      return list.sort((a, b) => (Number(a.rating) || 0) - (Number(b.rating) || 0))
    }
    // newest first
    return list.sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return tb - ta
    })
  }, [reviews, reviewSort])

  const howToUseSteps = useMemo(
    () =>
      Array.isArray(product.howToUse)
        ? [...product.howToUse].sort((a, b) => (a.stepNumber ?? 0) - (b.stepNumber ?? 0))
        : [],
    [product.howToUse]
  )

  const productColors = useMemo(
    () => (Array.isArray(product.colors) ? product.colors : []),
    [product.colors]
  )
  const availableColors = useMemo(
    () => productColors.filter((c) => c.available !== false && (c.stock == null || c.stock > 0)),
    [productColors]
  )
  const hasColorOptions = productColors.length > 0
  const allColorsUnavailable = hasColorOptions && availableColors.length === 0

  const [selectedColorId, setSelectedColorId] = useState<string>(() =>
    availableColors.length === 1 ? availableColors[0].id : ""
  )
  const [colorError, setColorError] = useState<string>("")

  const selectedColor = useMemo(
    () => availableColors.find((c) => c.id === selectedColorId) || null,
    [availableColors, selectedColorId]
  )

  const isInactive = product.status === "Inactive"
  const isOutOfStock = !product.inStock || (product.stock !== undefined && product.stock <= 0) || allColorsUnavailable
  const hasDiscount = product.discountPrice != null && product.discountPrice > 0 && product.discountPrice < product.price
  const effectivePrice = hasDiscount ? product.discountPrice! : product.price
  const baseMaxStock = product.stock && product.stock > 0 ? product.stock : 999
  const maxStock = selectedColor?.stock != null ? Math.min(baseMaxStock, Math.max(1, selectedColor.stock)) : baseMaxStock
  const itemsSubtotal = effectivePrice * quantity
  const shippingCharge = FLAT_SHIPPING_INR
  const totalWithShipping = effectivePrice > 0 ? itemsSubtotal + shippingCharge : 0

  const handleAddToCart = useCallback(() => {
    if (availableColors.length > 0 && !selectedColor) {
      setColorError("Please select a colour before adding to cart.")
      document.getElementById("pd-colors-section")?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }
    if (!session?.user) {
      router.push(`/login?callbackUrl=${encodeURIComponent(productUrl)}&message=${encodeURIComponent(loginMessage)}`)
      return
    }
    setColorError("")
    setAdding(true)
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: productHandle,
        productId: product.productId || product.id,
        name: product.name,
        price: effectivePrice,
        regularPrice: product.price,
        discountPrice: hasDiscount ? product.discountPrice : null,
        stock: selectedColor?.stock != null ? selectedColor.stock : product.stock,
        inStock: product.inStock,
        imageUrl: product.imageUrl || mediaItems[0]?.url || "",
        category: product.category,
        selectedColor: selectedColor
          ? { id: selectedColor.id, name: selectedColor.name, hex: selectedColor.hex }
          : null,
      })
    }
    setAdding(false)
    setAdded(true)
    setTimeout(() => setAdded(false), 2500)
  }, [addItem, availableColors.length, effectivePrice, hasDiscount, mediaItems, product.category, product.discountPrice, product.id, product.imageUrl, product.inStock, product.name, product.price, product.productId, product.stock, productHandle, productUrl, quantity, router, selectedColor, session])

  const handlePlaceOrder = useCallback(() => {
    if (availableColors.length > 0 && !selectedColor) {
      setColorError("Please select a colour before placing your order.")
      document.getElementById("pd-colors-section")?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }
    if (!session?.user) {
      router.push(`/login?callbackUrl=${encodeURIComponent(productUrl)}&message=${encodeURIComponent(loginMessage)}`)
      return
    }
    setColorError("")
    setPlacingOrder(true)
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: productHandle,
        productId: product.productId || product.id,
        name: product.name,
        price: effectivePrice,
        regularPrice: product.price,
        discountPrice: hasDiscount ? product.discountPrice : null,
        stock: selectedColor?.stock != null ? selectedColor.stock : product.stock,
        inStock: product.inStock,
        imageUrl: product.imageUrl || mediaItems[0]?.url || "",
        category: product.category,
        selectedColor: selectedColor
          ? { id: selectedColor.id, name: selectedColor.name, hex: selectedColor.hex }
          : null,
      })
    }
    router.push("/checkout")
  }, [addItem, availableColors.length, effectivePrice, hasDiscount, mediaItems, product.category, product.discountPrice, product.id, product.imageUrl, product.inStock, product.name, product.price, product.productId, product.stock, productHandle, productUrl, quantity, router, selectedColor, session])

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
        setReviews(
          data.reviews.filter((r: ProductReviewItem) => !r.productId || r.productId === targetProductId)
        )
      } else if (data.review) {
        setReviews((prev) => [data.review, ...prev])
      }

      // Re-fetch latest reviews for this exact Product ID from Google Sheets
      await fetchProductReviews()

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

  const jumpToTab = (tab: DetailTab) => {
    setActiveTab(tab)
    const el = document.getElementById("pd-tabs-container")
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  return (
    <>
      <div className="pd-shell" style={{ background: "#FFFFFF" }}>
      {/* ── Breadcrumb Bar ── */}
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
        </div>
      </div>

      {/* ── 1. TOP PRODUCT SECTION (Media Gallery + Product Information) ── */}
      <section style={{ padding: "40px 0 48px", borderBottom: "1px solid #E5E5E5" }}>
        <div className="W">
          <div className="pd-overview-grid" style={{ gap: 48, alignItems: "start" }}>
            {/* Left: Images & Videos Gallery */}
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
                  minHeight: 400,
                  aspectRatio: "4 / 3",
                }}
              >
                {currentMedia ? (
                  currentMedia.type === "video" ? (
                    <div style={{ width: "100%", height: "100%", background: "#000000", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                      {videoError ? (
                        <div style={{ padding: 24, textAlign: "center", color: "#FFFFFF" }}>
                          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>
                            Unable to play this video in your browser
                          </div>
                          <a
                            href={currentMedia.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#F36B12", fontWeight: 700, textDecoration: "underline", fontSize: 13.5 }}
                          >
                            Open video directly ↗
                          </a>
                        </div>
                      ) : (
                        <video
                          key={currentMedia.url}
                          src={currentMedia.url}
                          poster={currentMedia.thumbnail}
                          controls
                          playsInline
                          preload="metadata"
                          onError={() => setVideoError(true)}
                          style={{ width: "100%", height: "100%", maxHeight: 500, objectFit: "contain" }}
                        />
                      )}
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
                        setVideoError(false)
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
                        setVideoError(false)
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
                        setVideoError(false)
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

            {/* Right: Product Information Only (Order summary is in bottom sticky panel) */}
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

              {/* Rating, Review Count & Stock Availability */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
                <button
                  type="button"
                  onClick={() => jumpToTab("reviews")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 12px",
                    borderRadius: 20,
                    background: "#FFF4ED",
                    border: "1px solid #FED7AA",
                    cursor: "pointer",
                    color: "#17191C",
                    fontSize: 13.5,
                    fontWeight: 700,
                  }}
                >
                  <span style={{ color: "#F36B12", letterSpacing: 1 }}>
                    {"★".repeat(Math.round(reviewCount > 0 ? averageRating : 0))}
                    <span style={{ color: "#D1D5DB" }}>{"★".repeat(5 - Math.round(reviewCount > 0 ? averageRating : 0))}</span>
                  </span>
                  <span>{reviewCount > 0 ? averageRating.toFixed(1) : "No reviews yet"}</span>
                  <span style={{ color: "#747474", fontWeight: 500 }}>
                    ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
                  </span>
                </button>

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

              {/* Price & Discount Price in INR (₹) */}
              <div style={{ marginBottom: 22, padding: "16px 20px", background: "#FAFAFA", border: "1px solid #E5E5E5", borderRadius: 10 }}>
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
                  Price in INR (₹) • Flat shipping {formatPrice(shippingCharge)}
                </div>
              </div>

              {/* Available Colours Selector */}
              {hasColorOptions && (
                <div
                  id="pd-colors-section"
                  style={{
                    marginBottom: 22,
                    padding: "16px 18px",
                    background: "#FFFFFF",
                    border: colorError ? "1.5px solid #DC2626" : "1px solid #E5E5E5",
                    borderRadius: 10,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13.5, fontWeight: 800, color: "#17191C" }}>
                      Available Colours
                    </span>
                    {selectedColor ? (
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: "#F36B12" }}>
                        Selected: {selectedColor.name}
                      </span>
                    ) : availableColors.length > 0 ? (
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#6B7280" }}>
                        Please select a colour
                      </span>
                    ) : (
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#DC2626" }}>
                        All colours currently unavailable
                      </span>
                    )}
                  </div>

                  <div role="radiogroup" aria-label="Available Colours" style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {productColors.map((c) => {
                      const isAvail = c.available !== false && (c.stock == null || c.stock > 0)
                      const isSelected = selectedColorId === c.id && isAvail
                      return (
                        <label
                          key={c.id}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "8px 14px",
                            borderRadius: 8,
                            border: isSelected ? "2px solid #F36B12" : "1px solid #D1D5DB",
                            backgroundColor: isSelected ? "#FFF7F2" : isAvail ? "#FFFFFF" : "#F3F4F6",
                            cursor: isAvail ? "pointer" : "not-allowed",
                            opacity: isAvail ? 1 : 0.55,
                            transition: "all 0.15s ease",
                            userSelect: "none",
                          }}
                        >
                          <input
                            type="radio"
                            name="product-color"
                            value={c.id}
                            checked={isSelected}
                            disabled={!isAvail}
                            onChange={() => {
                              setSelectedColorId(c.id)
                              setColorError("")
                              if (c.stock != null && quantity > c.stock) {
                                setQuantity(Math.max(1, c.stock))
                              }
                            }}
                            style={{ accentColor: "#F36B12", margin: 0, cursor: isAvail ? "pointer" : "not-allowed" }}
                          />
                          <span
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: "50%",
                              backgroundColor: c.hex,
                              border: "1.5px solid #D1D5DB",
                              boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.08)",
                              flexShrink: 0,
                            }}
                          />
                          <span style={{ fontSize: 13.5, fontWeight: isSelected ? 700 : 600, color: "#17191C" }}>
                            {c.name}
                          </span>
                          {!isAvail && (
                            <span style={{ fontSize: 11, fontWeight: 600, color: "#DC2626" }}>
                              (Unavailable)
                            </span>
                          )}
                        </label>
                      )
                    })}
                  </div>

                  {colorError && (
                    <div style={{ marginTop: 10, fontSize: 12.5, fontWeight: 700, color: "#DC2626" }}>
                      {colorError}
                    </div>
                  )}
                </div>
              )}

              {/* Product Description */}
              {product.shortDescription && (
                <p style={{ fontSize: 16, fontWeight: 600, color: "#17191C", marginBottom: 12, lineHeight: 1.55 }}>
                  {product.shortDescription}
                </p>
              )}

              <div style={{ color: "#4B5563", fontSize: 15, lineHeight: 1.75, whiteSpace: "pre-line" }}>
                {product.description ||
                  "Thoughtfully engineered everyday solutions from CLASPO. Built for enduring performance, functional convenience, and lasting satisfaction."}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. TABBED CONTENT SECTION (Single Container with 3 Tabs) ── */}
      <section id="pd-tabs-container" style={{ padding: "48px 0 48px", background: "#FAFAFA" }}>
        <div className="W">
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E5E5E5",
              borderRadius: 14,
              overflow: "hidden",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)",
            }}
          >
            {/* Tab Header Bar */}
            <div
              role="tablist"
              aria-label="Product details tabs"
              style={{
                display: "flex",
                borderBottom: "1px solid #E5E5E5",
                background: "#303638",
                overflowX: "auto",
              }}
            >
              {(
                [
                  { id: "how-to-use", label: "How to Use" },
                  { id: "reviews", label: "Product Reviews" },
                  { id: "add-review", label: "Add Review" },
                ] as const
              ).map((tab) => {
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      padding: "16px 28px",
                      border: "none",
                      borderBottom: isActive ? "3px solid #F36B12" : "3px solid transparent",
                      background: isActive ? "#FFFFFF" : "transparent",
                      color: isActive ? "#17191C" : "#E5E7EB",
                      fontSize: 14.5,
                      fontWeight: 700,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* Tab Panels */}
            <div style={{ padding: "32px 28px" }}>
              {/* TAB 1: HOW TO USE */}
              {activeTab === "how-to-use" && (
                <div>
                  <div style={{ marginBottom: 24 }}>
                    <div className="lbl" style={{ marginBottom: 8 }}>STEP-BY-STEP GUIDE</div>
                    <h2 className="D3" style={{ fontSize: "clamp(20px, 2.5vw, 28px)", color: "#17191C", margin: 0 }}>
                      How to Use
                    </h2>
                  </div>

                  {howToUseSteps.length > 0 ? (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                        gap: 18,
                      }}
                    >
                      {howToUseSteps.map((step, idx) => (
                        <div
                          key={step.id || idx}
                          style={{
                            background: "#FAFAFA",
                            border: "1px solid #E5E5E5",
                            borderRadius: 12,
                            padding: 22,
                            display: "flex",
                            flexDirection: "column",
                            gap: 10,
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <span
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: "50%",
                                background: "#F36B12",
                                color: "#FFFFFF",
                                fontSize: 14,
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
                            <h3 style={{ fontSize: 15.5, fontWeight: 700, color: "#17191C", margin: 0 }}>
                              {step.title}
                            </h3>
                          )}

                          <p style={{ fontSize: 14.5, color: "#4B5563", lineHeight: 1.6, margin: 0, whiteSpace: "pre-line" }}>
                            {step.instruction}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: "#747474", fontSize: 14.5, margin: 0 }}>
                      Usage instructions for this product will be added soon.
                    </p>
                  )}
                </div>
              )}

              {/* TAB 2: PRODUCT REVIEWS */}
              {activeTab === "reviews" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20, marginBottom: 24 }}>
                    <div>
                      <div className="lbl" style={{ marginBottom: 8 }}>CUSTOMER FEEDBACK</div>
                      <h2 className="D3" style={{ fontSize: "clamp(20px, 2.5vw, 28px)", color: "#17191C", margin: 0 }}>
                        Product Reviews
                      </h2>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                      {reviewCount > 1 && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <label
                            htmlFor="pd-review-sort"
                            style={{ fontSize: 12.5, fontWeight: 700, color: "#4B5563", whiteSpace: "nowrap" }}
                          >
                            Sort by:
                          </label>
                          <select
                            id="pd-review-sort"
                            value={reviewSort}
                            onChange={(e) => setReviewSort(e.target.value as ReviewSortOption)}
                            style={{
                              padding: "8px 12px",
                              borderRadius: 8,
                              border: "1px solid #D1D5DB",
                              background: "#FFFFFF",
                              color: "#17191C",
                              fontSize: 13,
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            <option value="newest">Newest First</option>
                            <option value="highest">Highest Rating</option>
                            <option value="lowest">Lowest Rating</option>
                          </select>
                        </div>
                      )}

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 14,
                          background: "#FAFAFA",
                          border: "1px solid #E5E5E5",
                          borderRadius: 12,
                          padding: "12px 18px",
                        }}
                      >
                        <div style={{ fontSize: 30, fontWeight: 900, color: "#17191C", lineHeight: 1 }}>
                          {reviewCount > 0 ? averageRating.toFixed(1) : "—"}
                        </div>
                        <div>
                          <div style={{ color: "#F36B12", fontSize: 15, letterSpacing: 1.5 }}>
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
                  </div>

                  {reviewsFetchError && (
                    <div
                      role="alert"
                      style={{
                        marginBottom: 16,
                        padding: "10px 14px",
                        borderRadius: 8,
                        background: "#FEF2F2",
                        border: "1px solid #FECACA",
                        color: "#DC2626",
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      {reviewsFetchError}
                    </div>
                  )}

                  {reviewsLoading && reviewCount === 0 ? (
                    <div style={{ background: "#FAFAFA", border: "1px solid #E5E5E5", borderRadius: 12, padding: 24, color: "#747474", fontSize: 14.5 }}>
                      Loading customer reviews…
                    </div>
                  ) : reviewCount > 0 ? (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                        gap: 18,
                      }}
                    >
                      {sortedReviews.map((rev) => (
                        <article
                          key={rev.id}
                          style={{
                            background: "#FAFAFA",
                            border: "1px solid #E5E5E5",
                            borderRadius: 12,
                            padding: 22,
                            display: "flex",
                            flexDirection: "column",
                            gap: 10,
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <div style={{ color: "#F36B12", fontSize: 15, letterSpacing: 1.5 }}>
                              {"★".repeat(rev.rating)}
                              <span style={{ color: "#D1D5DB" }}>{"★".repeat(5 - rev.rating)}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              {(rev.verified ?? Boolean(rev.orderId)) && (
                                <span
                                  style={{
                                    fontSize: 11,
                                    fontWeight: 700,
                                    color: "#059669",
                                    background: "#ECFDF5",
                                    border: "1px solid #A7F3D0",
                                    padding: "2px 8px",
                                    borderRadius: 999,
                                  }}
                                >
                                  ✓ Verified Purchase
                                </span>
                              )}
                              <span style={{ fontSize: 12, fontWeight: 700, color: "#303638" }}>
                                {rev.rating}.0 / 5
                              </span>
                            </div>
                          </div>

                          <h3 style={{ fontSize: 15.5, fontWeight: 700, color: "#17191C", margin: 0 }}>
                            {rev.title}
                          </h3>

                          <p style={{ fontSize: 14.5, color: "#4B5563", lineHeight: 1.6, margin: 0, whiteSpace: "pre-line", flex: 1 }}>
                            {rev.description}
                          </p>

                          <div style={{ borderTop: "1px solid #E5E5E5", paddingTop: 10, marginTop: 4, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, fontSize: 12.5, color: "#747474" }}>
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
                    <div style={{ background: "#FAFAFA", border: "1px solid #E5E5E5", borderRadius: 12, padding: 24, color: "#747474", fontSize: 14.5 }}>
                      No reviews yet. Verified buyers can share their experience in the Add Review tab.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: ADD REVIEW */}
              {activeTab === "add-review" && (
                <div style={{ maxWidth: 680 }}>
                  <div className="lbl" style={{ marginBottom: 8 }}>SHARE YOUR EXPERIENCE</div>
                  <h2 className="D3" style={{ fontSize: "clamp(20px, 2.5vw, 28px)", color: "#17191C", margin: "0 0 18px" }}>
                    Add Review
                  </h2>

                  {reviewSuccess && (
                    <div
                      role="status"
                      style={{
                        marginBottom: 18,
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
                    <div style={{ padding: 22, background: "#FAFAFA", border: "1px solid #E5E5E5", borderRadius: 12, color: "#747474", fontSize: 14 }}>
                      Checking your review eligibility…
                    </div>
                  ) : !session?.user ? (
                    <div style={{ padding: 24, background: "#FAFAFA", border: "1px solid #E5E5E5", borderRadius: 12 }}>
                      <p style={{ margin: "0 0 16px", fontSize: 14.5, color: "#303638", lineHeight: 1.6 }}>
                        Please log in to your CLASPO account to leave a verified customer review.
                      </p>
                      <Link
                        href={`/login?callbackUrl=${encodeURIComponent(productUrl)}&message=${encodeURIComponent("Please log in to submit a product review.")}`}
                        className="btn bp"
                        style={{ display: "inline-flex" }}
                      >
                        Log In to Review
                      </Link>
                    </div>
                  ) : eligibility.alreadyReviewed ? (
                    <div style={{ padding: 22, background: "#FFF4ED", border: "1px solid #FED7AA", borderRadius: 12, color: "#9A3412", fontSize: 14.5, fontWeight: 600 }}>
                      You have already submitted a review for this product. Thank you for your feedback!
                    </div>
                  ) : !eligibility.hasPurchased ? (
                    <div style={{ padding: 22, background: "#FAFAFA", border: "1px solid #E5E5E5", borderRadius: 12, color: "#4B5563", fontSize: 14.5, lineHeight: 1.6 }}>
                      Only verified customers who have purchased <strong>{product.name}</strong> can submit a review.
                    </div>
                  ) : (
                    <form
                      onSubmit={handleSubmitReview}
                      style={{
                        background: "#FAFAFA",
                        border: "1px solid #E5E5E5",
                        borderRadius: 12,
                        padding: 24,
                      }}
                    >
                      <div style={{ marginBottom: 16 }}>
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

                      <div style={{ marginBottom: 16 }}>
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

                      <div style={{ marginBottom: 18 }}>
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
                        style={{ padding: "12px 26px", fontSize: 14.5 }}
                      >
                        {submittingReview ? "Submitting Review…" : "Submit Review"}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. NATURAL-FLOW BOTTOM ORDER SECTION (Scrolls normally with page) ── */}
      <section aria-label="Bottom order summary" style={{ padding: "36px 0 72px", background: "#FFFFFF", borderTop: "1px solid #E5E5E5" }}>
        <div className="W">
          <div
            style={{
              background: "#FAFAFA",
              border: "1px solid #E5E5E5",
              borderRadius: 14,
              padding: "24px 28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 24,
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#747474" }}>
                  Product Price
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: "#17191C" }}>
                    {effectivePrice > 0 ? formatPrice(effectivePrice) : "N/A"}
                  </span>
                  {hasDiscount && (
                    <span style={{ fontSize: 13.5, color: "#9CA3AF", textDecoration: "line-through" }}>
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>
              </div>

              {selectedColor && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#747474" }}>
                    Colour
                  </div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 700, color: "#17191C" }}>
                    <span
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        backgroundColor: selectedColor.hex,
                        border: "1px solid #D1D5DB",
                        display: "inline-block",
                      }}
                    />
                    {selectedColor.name}
                  </div>
                </div>
              )}

              {!isInactive && !isOutOfStock && (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: "#303638" }}>
                    Quantity:
                  </span>
                  <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid #E5E5E5", borderRadius: 6, background: "#FFFFFF", overflow: "hidden" }}>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      aria-label="Decrease quantity"
                      style={{ width: 36, height: 36, background: "#FFF0E5", border: "none", color: "#D9570A", fontSize: 16, cursor: "pointer", fontWeight: 700 }}
                    >
                      -
                    </button>
                    <span style={{ minWidth: 38, textAlign: "center", fontSize: 14.5, fontWeight: 700, color: "#17191C" }}>
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))}
                      aria-label="Increase quantity"
                      style={{ width: 36, height: 36, background: "#FFF0E5", border: "none", color: "#D9570A", fontSize: 16, cursor: "pointer", fontWeight: 700 }}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#747474" }}>
                  Shipping
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#303638" }}>
                  {formatPrice(shippingCharge)}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#747474" }}>
                  Final Total
                </div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#F36B12" }}>
                  {totalWithShipping > 0 ? formatPrice(totalWithShipping) : "Contact for price"}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={adding || isOutOfStock || isInactive}
                style={{
                  padding: "13px 24px",
                  borderRadius: 8,
                  background: isInactive || isOutOfStock ? "#F5F5F5" : "#F36B12",
                  color: isInactive || isOutOfStock ? "#747474" : "#FFFFFF",
                  border: isInactive || isOutOfStock ? "1px solid #E5E5E5" : "1px solid #F36B12",
                  fontWeight: 700,
                  fontSize: 14.5,
                  cursor: isInactive || isOutOfStock ? "not-allowed" : "pointer",
                  minHeight: 44,
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
                  padding: "13px 24px",
                  borderRadius: 8,
                  background: isInactive || isOutOfStock ? "#F5F5F5" : "#303638",
                  color: isInactive || isOutOfStock ? "#747474" : "#FFFFFF",
                  border: isInactive || isOutOfStock ? "1px solid #E5E5E5" : "1px solid #303638",
                  fontWeight: 700,
                  fontSize: 14.5,
                  cursor: isInactive || isOutOfStock ? "not-allowed" : "pointer",
                  minHeight: 44,
                }}
              >
                {placingOrder ? "Redirecting…" : "Place Order"}
              </button>
            </div>
          </div>
        </div>
      </section>

      </div>

      {/* ── 3. FIXED BOTTOM ORDER SUMMARY PANEL (Outside scrollable container, hides at footer) ── */}
      <div
        className={`pd-fixed-bar${footerVisible ? " is-hidden" : ""}`}
        role="region"
        aria-label="Order summary"
        aria-hidden={footerVisible}
      >
        <div className="W">
          {added && (
            <div
              role="status"
              style={{
                marginBottom: 10,
                padding: "8px 14px",
                borderRadius: 6,
                background: "#ECFDF5",
                border: "1px solid #A7F3D0",
                color: "#065F46",
                fontSize: 13,
                fontWeight: 700,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span>✓ Added {quantity} × {product.name} to your cart!</span>
              <Link href="/cart" style={{ color: "#059669", textDecoration: "underline", fontWeight: 800 }}>
                View Cart →
              </Link>
            </div>
          )}

          <div className="pd-sticky-inner">
            {/* Price, Discount, Quantity, Shipping, Total */}
            <div className="pd-sticky-metrics">
              <div className="pd-sticky-hide-sm">
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#747474" }}>
                  Unit Price
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: "#17191C" }}>
                    {effectivePrice > 0 ? formatPrice(effectivePrice) : "N/A"}
                  </span>
                  {hasDiscount && (
                    <span style={{ fontSize: 12.5, color: "#9CA3AF", textDecoration: "line-through" }}>
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>
              </div>

              {/* Selected Colour in Sticky Bar */}
              {selectedColor && (
                <div className="pd-sticky-hide-sm" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      backgroundColor: selectedColor.hex,
                      border: "1px solid #D1D5DB",
                      display: "inline-block",
                    }}
                  />
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: "#17191C" }}>
                    {selectedColor.name}
                  </span>
                </div>
              )}

              {/* Quantity Selector */}
              {selectedColor && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#747474" }}>
                    Colour
                  </div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 700, color: "#17191C" }}>
                    <span
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        backgroundColor: selectedColor.hex,
                        border: "1px solid #D1D5DB",
                        display: "inline-block",
                      }}
                    />
                    {selectedColor.name}
                  </div>
                </div>
              )}

              {!isInactive && !isOutOfStock && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="pd-sticky-hide-sm" style={{ fontSize: 12, fontWeight: 700, color: "#303638" }}>
                    Qty:
                  </span>
                  <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid #E5E5E5", borderRadius: 6, background: "#FFFFFF", overflow: "hidden" }}>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      aria-label="Decrease quantity"
                      style={{ width: 34, height: 34, background: "#FFF0E5", border: "none", color: "#D9570A", fontSize: 16, cursor: "pointer", fontWeight: 700 }}
                    >
                      -
                    </button>
                    <span style={{ minWidth: 34, textAlign: "center", fontSize: 14, fontWeight: 700, color: "#17191C" }}>
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))}
                      aria-label="Increase quantity"
                      style={{ width: 34, height: 34, background: "#FFF0E5", border: "none", color: "#D9570A", fontSize: 16, cursor: "pointer", fontWeight: 700 }}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <div className="pd-sticky-hide-sm">
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#747474" }}>
                  Shipping
                </div>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: "#303638" }}>
                  {formatPrice(shippingCharge)}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#747474" }}>
                  Total (incl. shipping)
                </div>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#F36B12" }}>
                  {totalWithShipping > 0 ? formatPrice(totalWithShipping) : "Contact for price"}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pd-sticky-actions">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={adding || isOutOfStock || isInactive}
                style={{
                  padding: "12px 22px",
                  borderRadius: 8,
                  background: isInactive || isOutOfStock ? "#F5F5F5" : "#F36B12",
                  color: isInactive || isOutOfStock ? "#747474" : "#FFFFFF",
                  border: isInactive || isOutOfStock ? "1px solid #E5E5E5" : "1px solid #F36B12",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: isInactive || isOutOfStock ? "not-allowed" : "pointer",
                  whiteSpace: "nowrap",
                  minHeight: 44,
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
                  padding: "12px 22px",
                  borderRadius: 8,
                  background: isInactive || isOutOfStock ? "#F5F5F5" : "#303638",
                  color: isInactive || isOutOfStock ? "#747474" : "#FFFFFF",
                  border: isInactive || isOutOfStock ? "1px solid #E5E5E5" : "1px solid #303638",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: isInactive || isOutOfStock ? "not-allowed" : "pointer",
                  whiteSpace: "nowrap",
                  minHeight: 44,
                }}
              >
                {placingOrder ? "Redirecting…" : "Place Order"}
              </button>
            </div>
          </div>
        </div>
      </div>

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
    </>
  )
}
