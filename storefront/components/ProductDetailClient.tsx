"use client"

/**
 * @file ProductDetailClient.tsx
 * @description Renders individual product details, multi-image and video gallery, tabs, and interactive purchase controls.
 * 
 * Features:
 * 1. Multi-media gallery supporting both images and playable videos
 * 2. Full-screen image preview and zoom capabilities
 * 3. Lazy video playback directly inside the media viewer
 * 4. Discount pricing display (sale price + regular price crossed out)
 * 5. Authentication protection for Add to Cart and Buy Now
 */

import { useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useCart } from "@/context/cart-context"
import type { Product } from "@/lib/sheets"
import { formatPrice } from "@/lib/format"

function ArrowIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12,5 19,12 12,19" />
    </svg>
  )
}

const ALL_TABS = [
  { id: "overview",   label: "Overview"      },
  { id: "features",   label: "Features"      },
  { id: "services",   label: "Services"      },
  { id: "gallery",    label: "Gallery"       },
  { id: "customize",  label: "Customize"     },
] as const

type TabId = typeof ALL_TABS[number]["id"]

export interface UnifiedMediaItem {
  type: "image" | "video"
  url: string
  thumbnail?: string
  title?: string
}

export default function ProductDetailClient({ product }: { product: Product }) {
  const router = useRouter()
  const { data: session } = useSession()
  const { addItem } = useCart()
  const [adding, setAdding]         = useState(false)
  const [added, setAdded]           = useState(false)
  const [quantity, setQuantity]     = useState(1)
  const [activeTab, setActiveTab]   = useState<TabId>("overview")
  const [activeMediaIndex, setActiveMediaIndex] = useState(0)
  const [isZoomed, setIsZoomed]     = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const productUrl = `/products/${product.handle || product.id}`
  const loginMessage = "Please log in to your CLASPO account to add products to your cart."

  // ── Unified Media Extractor (Images + Videos) ──────────────────────────────
  const mediaItems: UnifiedMediaItem[] = useMemo(() => {
    const list: UnifiedMediaItem[] = []
    const seenUrls = new Set<string>()

    const isValidUrl = (url?: string) => {
      if (!url || url === "-") return false
      if (url.startsWith("/")) return true
      try { new URL(url); return true } catch { return false }
    }

    // 1. Primary Image
    if (isValidUrl(product.primaryImage)) {
      list.push({ type: "image", url: product.primaryImage! })
      seenUrls.add(product.primaryImage!)
    }

    // 2. Legacy / Comma-separated imageUrls
    if (product.imageUrl) {
      const split = product.imageUrl.split(",").map((s) => s.trim()).filter(isValidUrl)
      for (const u of split) {
        if (!seenUrls.has(u)) {
          list.push({ type: "image", url: u })
          seenUrls.add(u)
        }
      }
    }

    // 3. Structured additionalImages
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

    // 4. Primary Video
    if (isValidUrl(product.primaryVideo)) {
      list.push({
        type: "video",
        url: product.primaryVideo!,
        thumbnail: list[0]?.url,
      })
      seenUrls.add(product.primaryVideo!)
    }

    // 5. Additional Videos
    if (product.additionalVideos && Array.isArray(product.additionalVideos)) {
      for (const vid of product.additionalVideos) {
        if (isValidUrl(vid.url) && !seenUrls.has(vid.url)) {
          list.push({
            type: "video",
            url: vid.url,
            thumbnail: vid.thumbnail || list[0]?.url,
            title: vid.title,
          })
          seenUrls.add(vid.url)
        }
      }
    }

    return list
  }, [product])

  const currentMedia = mediaItems[activeMediaIndex] || mediaItems[0] || null
  const hasMedia = mediaItems.length > 0
  const tabs = hasMedia ? ALL_TABS : ALL_TABS.filter((t) => t.id !== "gallery")

  const handleAddToCart = useCallback(() => {
    if (!session?.user) {
      router.push(`/login?callbackUrl=${encodeURIComponent(productUrl)}&message=${encodeURIComponent(loginMessage)}`)
      return
    }
    setAdding(true)
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.handle || product.id,
        name: product.name,
        price: product.discountPrice ?? product.price,
        imageUrl: product.imageUrl || mediaItems[0]?.url || "",
        category: product.category,
      })
    }
    setAdding(false)
    setAdded(true)
    setTimeout(() => { setAdded(false) }, 2000)
  }, [addItem, product, quantity, session, router, productUrl, loginMessage, mediaItems])

  const handleBuyNow = useCallback(() => {
    if (!session?.user) {
      router.push(`/login?callbackUrl=${encodeURIComponent(productUrl)}&message=${encodeURIComponent(loginMessage)}`)
      return
    }
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.handle || product.id,
        name: product.name,
        price: product.discountPrice ?? product.price,
        imageUrl: product.imageUrl || mediaItems[0]?.url || "",
        category: product.category,
      })
    }
    router.push("/checkout")
  }, [addItem, product, quantity, router, session, productUrl, loginMessage, mediaItems])

  const isInactive = product.status === "Inactive"
  const isOutOfStock = !product.inStock || (product.stock !== undefined && product.stock <= 0)

  const reviews = useMemo(() => (Array.isArray(product.reviews) ? product.reviews : []), [product.reviews])
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

  return (
    <div className="pd-shell">
      {/* ── Product Header ── */}
      <div className="pd-hdr">
        <div className="W">
          <div className="lbl" style={{ marginBottom: 12 }}>
            {product.category || "Product"}
            {product.partNumber && (
              <span style={{ marginLeft: 16, fontFamily: "monospace", color: "var(--text2)" }}>
                PN: {product.partNumber}
              </span>
            )}
            {isInactive && (
              <span style={{ marginLeft: 12, background: "#F3F4F6", color: "#6B7280", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
                INACTIVE
              </span>
            )}
          </div>
          <h1 className="D3" style={{ fontSize: "clamp(32px, 5vw, 64px)" }}>{product.name}</h1>
        </div>
      </div>

      {/* ── Tab Layout ── */}
      <div className="pd-layout">
        {/* Sidebar */}
        <aside className="pd-sidebar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`pd-tab-btn${activeTab === tab.id ? " active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </aside>

        {/* Content Panel */}
        <div className="pd-panel">
          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <div className="pd-overview-grid">
              {/* Media Gallery Column */}
              <div>
                <div
                  className="pd-img-main"
                  style={{
                    position: "relative",
                    background: "#F9FAFB",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 400,
                  }}
                >
                  {currentMedia ? (
                    currentMedia.type === "video" ? (
                      <div style={{ width: "100%", height: "100%", background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <video
                          key={currentMedia.url}
                          src={currentMedia.url}
                          controls
                          autoPlay
                          playsInline
                          preload="metadata"
                          style={{ maxWidth: "100%", maxHeight: "100%" }}
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
                            transform: isZoomed ? "scale(1.4)" : "scale(1)",
                            display: "block",
                          }}
                          onClick={() => setIsZoomed(!isZoomed)}
                        />

                        {/* Expand / Lightbox Button */}
                        <button
                          type="button"
                          onClick={() => setLightboxOpen(true)}
                          title="Full-screen image view"
                          style={{
                            position: "absolute",
                            top: 14,
                            right: 14,
                            background: "rgba(255, 255, 255, 0.9)",
                            border: "1px solid #E5E5E5",
                            borderRadius: "50%",
                            width: 38,
                            height: 38,
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

                  {/* Navigation Arrows */}
                  {mediaItems.length > 1 && (
                    <>
                      <button
                        className="pd-img-arrow pd-img-arrow--l"
                        onClick={() => {
                          setIsZoomed(false)
                          setActiveMediaIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1))
                        }}
                        aria-label="Previous item"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                      </button>
                      <button
                        className="pd-img-arrow pd-img-arrow--r"
                        onClick={() => {
                          setIsZoomed(false)
                          setActiveMediaIndex((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1))
                        }}
                        aria-label="Next item"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnails Row */}
                {mediaItems.length > 1 && (
                  <div className="pd-thumbs" style={{ marginTop: 14 }}>
                    {mediaItems.map((item, idx) => (
                      <button
                        key={idx}
                        className={`pd-thumb${activeMediaIndex === idx ? " active" : ""}`}
                        onClick={() => {
                          setIsZoomed(false)
                          setActiveMediaIndex(idx)
                        }}
                        style={{ position: "relative", overflow: "hidden" }}
                      >
                        {item.type === "video" ? (
                          <div style={{ width: "100%", height: "100%", background: "#1F2324", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                            {item.thumbnail ? (
                              <img src={item.thumbnail} alt="Video thumbnail" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : null}
                            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <span style={{ color: "#FFFFFF", fontSize: 13, background: "#F36B12", width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
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

              {/* Pricing & CTA Column */}
              <div className="pd-overview-info">
                {reviewCount > 0 && (
                  <a
                    href="#pd-reviews"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 14,
                      padding: "6px 12px",
                      borderRadius: 20,
                      background: "#FFF4ED",
                      border: "1px solid #FED7AA",
                      textDecoration: "none",
                      color: "#17191C",
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    <span style={{ color: "#F36B12", letterSpacing: 1 }}>
                      {"★".repeat(Math.round(averageRating))}
                      <span style={{ color: "#D1D5DB" }}>{"★".repeat(5 - Math.round(averageRating))}</span>
                    </span>
                    <span>{averageRating.toFixed(1)}</span>
                    <span style={{ color: "#6B7280", fontWeight: 500 }}>
                      ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
                    </span>
                  </a>
                )}

                {product.shortDescription && (
                  <p style={{ fontSize: 16, fontWeight: 600, color: "#303638", marginBottom: 16, lineHeight: 1.5 }}>
                    {product.shortDescription}
                  </p>
                )}

                <p className="Bd" style={{ marginBottom: 24, color: "#777777", lineHeight: 1.6 }}>
                  {product.description || "Thoughtfully engineered everyday solutions from CLASPO. Built for enduring performance, functional convenience, and lasting satisfaction."}
                </p>

                {/* Pricing Block with Discount Support */}
                <div style={{ marginBottom: 20 }}>
                  {product.discountPrice != null && product.discountPrice > 0 ? (
                    <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
                      <span style={{ color: "#F36B12", fontSize: "34px", fontWeight: 900 }}>
                        {formatPrice(product.discountPrice)}
                      </span>
                      <span style={{ color: "#9CA3AF", fontSize: "20px", textDecoration: "line-through", fontWeight: 600 }}>
                        {formatPrice(product.price)}
                      </span>
                      <span style={{ background: "#ECFDF5", color: "#059669", fontSize: 12, fontWeight: 800, padding: "3px 8px", borderRadius: 4 }}>
                        SAVE {Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
                      </span>
                    </div>
                  ) : (
                    <div className="pd-price" style={{ color: "#17191C", fontSize: "32px", fontWeight: 900 }}>
                      {product.price > 0 ? formatPrice(product.price) : "Contact for price"}
                    </div>
                  )}
                </div>

                {/* Quantity Selector */}
                {!isInactive && !isOutOfStock && (
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#17191C", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Quantity:
                    </span>
                    <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid #E5E5E5", borderRadius: 6, background: "#FFFFFF", overflow: "hidden" }}>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        style={{ width: 36, height: 36, background: "#FFF0E5", border: "none", color: "#D9570A", fontSize: 16, cursor: "pointer", fontWeight: 700 }}
                      >
                        -
                      </button>
                      <span style={{ minWidth: 40, textAlign: "center", fontSize: 14, fontWeight: 700, color: "#17191C" }}>
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => q + 1)}
                        style={{ width: 36, height: 36, background: "#FFF0E5", border: "none", color: "#D9570A", fontSize: 16, cursor: "pointer", fontWeight: 700 }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                  <button
                    className="btn bp"
                    onClick={handleAddToCart}
                    disabled={adding || added || isOutOfStock || isInactive}
                    style={{
                      width: "100%",
                      padding: "13px 24px",
                      borderRadius: 6,
                      background: added ? "#303638" : (isInactive || isOutOfStock ? "#F5F5F5" : "#F36B12"),
                      color: isInactive || isOutOfStock ? "#747474" : "#FFFFFF",
                      cursor: isInactive || isOutOfStock ? "not-allowed" : "pointer",
                      border: isInactive || isOutOfStock ? "1px solid #E5E5E5" : "1px solid #F36B12",
                      fontWeight: 700,
                      fontSize: 14,
                      boxShadow: isInactive || isOutOfStock || added ? "none" : "0 4px 14px rgba(243, 107, 18, 0.3)",
                    }}
                  >
                    {isInactive
                      ? "Currently Unavailable"
                      : isOutOfStock
                      ? "Out of Stock"
                      : added
                      ? "✓ Added to Bag!"
                      : adding
                      ? "Adding…"
                      : "Add to Cart"}
                  </button>

                  {!isInactive && !isOutOfStock && (
                    <button
                      type="button"
                      onClick={handleBuyNow}
                      style={{
                        width: "100%",
                        padding: "13px 24px",
                        borderRadius: 6,
                        background: "#303638",
                        color: "#FFFFFF",
                        cursor: "pointer",
                        border: "1px solid #303638",
                        fontWeight: 700,
                        fontSize: 14,
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#17191C"
                        e.currentTarget.style.borderColor = "#17191C"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#303638"
                        e.currentTarget.style.borderColor = "#303638"
                      }}
                    >
                      Buy It Now
                    </button>
                  )}
                </div>

                <div className="pd-overview-desc" style={{ borderTop: "1px solid #E5E5E5", paddingTop: 20 }}>
                  <p className="Bd" style={{ color: "#777777", fontSize: "14px", lineHeight: 1.6, margin: 0 }}>
                    Manufactured to rigorous quality benchmarks, offering reliable durability, high daily functionality, and easy maintenance.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* FEATURES */}
          {activeTab === "features" && (
            <div>
              <div className="pd-tab-hdr">
                <h2 className="pd-tab-title">Features &amp; Materials</h2>
                <p className="Bd pd-tab-sub">Technical specifications and materials used in {product.name.toLowerCase()}.</p>
              </div>
              <div className="pd-two-col">
                <div>
                  <h3 className="pd-section-h">Salient Features</h3>
                  <p className="Bd" style={{ marginBottom: 20, color: "var(--text2)" }}>
                    {product.name} is designed for optimal performance, ergonomic convenience, and extended durability.
                  </p>
                  <ul className="pd-list">
                    {[
                      "Engineered for daily resilience and reliable operation",
                      "Manufactured to meet strict quality control standards",
                      "Resistant to routine wear, environmental factors, and heat",
                      "Optimized for effortless household and workplace utility",
                    ].map((item, i) => (
                      <li key={i}><span className="pd-list-bullet">›</span><span>{item}</span></li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="pd-section-h">Materials</h3>
                  <p className="Bd" style={{ marginBottom: 20, color: "var(--text2)" }}>
                    Selected premium materials crafted for long-lasting performance.
                  </p>
                  <ul className="pd-list">
                    {[
                      "High-grade composite materials",
                      "Precision-machined connection points",
                      "Impact and temperature resistant finishes",
                      "Eco-conscious and compliant construction",
                    ].map((item, i) => (
                      <li key={i}><span className="pd-list-bullet">›</span><span>{item}</span></li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* SERVICES */}
          {activeTab === "services" && (
            <div>
              <div className="pd-tab-hdr">
                <h2 className="pd-tab-title">Product Facility and Service</h2>
              </div>
              <p className="Bd" style={{ marginBottom: 32, color: "var(--text2)" }}>
                The {product.name.toLowerCase()} is supported by CLASPO&rsquo;s dedicated customer service and warranty assistance. We ensure every unit meets the highest standard before delivery.
              </p>
              <a href="#quote" className="btn bp" style={{ display: "inline-flex" }}>
                Request a Quotation <ArrowIcon />
              </a>
            </div>
          )}

          {/* GALLERY TAB */}
          {activeTab === "gallery" && hasMedia && (
            <div>
              <div className="pd-tab-hdr">
                <h2 className="pd-tab-title">Product Gallery &amp; Media</h2>
                <p className="Bd pd-tab-sub">Visual showcase and demonstration videos for {product.name}.</p>
              </div>

              <div className="pd-gallery-grid">
                {mediaItems.map((item, idx) => (
                  <div key={idx} className="pd-gallery-item" style={{ overflow: "hidden", borderRadius: 8, background: "#F9FAFB" }}>
                    {item.type === "video" ? (
                      <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", background: "#000000" }}>
                        <video
                          src={item.url}
                          controls
                          playsInline
                          preload="metadata"
                          style={{ width: "100%", height: "100%", objectFit: "contain" }}
                        />
                      </div>
                    ) : (
                      <img
                        src={item.url}
                        alt={`${product.name} profile ${idx + 1}`}
                        style={{ width: "100%", height: "auto", display: "block", padding: 16 }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CUSTOMIZE */}
          {activeTab === "customize" && (
            <div>
              <div className="pd-tab-hdr">
                <h2 className="pd-tab-title">Customization</h2>
              </div>
              <p className="Bd" style={{ marginBottom: 32, color: "var(--text2)" }}>
                Your order can be customized according to your specifications or bulk requirements. We offer custom packaging, dimensions, labeling, and component adjustments.
              </p>
              <div className="pd-cta-card">
                <h3 className="pd-cta-card__h">
                  Have custom dimensions or specific volume requirements?
                </h3>
                <p className="Bd" style={{ marginBottom: 28, color: "var(--text2)" }}>
                  Please reach out to our support and enterprise sales team today.
                </p>
                <a href="/contact" className="btn bp" style={{ display: "inline-flex" }}>
                  Contact Us <ArrowIcon />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Dedicated How to Use Section ── */}
      {howToUseSteps.length > 0 && (
        <section id="pd-how-to-use" style={{ padding: "56px 0", borderTop: "1px solid var(--bd)", background: "#FFFFFF" }}>
          <div className="W">
            <div style={{ marginBottom: 32 }}>
              <div className="lbl" style={{ marginBottom: 10 }}>STEP-BY-STEP GUIDE</div>
              <h2 className="D3" style={{ fontSize: "clamp(24px, 3vw, 36px)", color: "#17191C", margin: 0 }}>
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
                    gap: 12,
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

      {/* ── Dedicated Customer Reviews Section ── */}
      {reviewCount > 0 && (
        <section id="pd-reviews" style={{ padding: "56px 0", borderTop: "1px solid var(--bd)", background: "#FAFAFA" }}>
          <div className="W">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20, marginBottom: 32 }}>
              <div>
                <div className="lbl" style={{ marginBottom: 10 }}>CUSTOMER FEEDBACK</div>
                <h2 className="D3" style={{ fontSize: "clamp(24px, 3vw, 36px)", color: "#17191C", margin: 0 }}>
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
                  {averageRating.toFixed(1)}
                </div>
                <div>
                  <div style={{ color: "#F36B12", fontSize: 16, letterSpacing: 1.5 }}>
                    {"★".repeat(Math.round(averageRating))}
                    <span style={{ color: "#D1D5DB" }}>{"★".repeat(5 - Math.round(averageRating))}</span>
                  </div>
                  <div style={{ fontSize: 12.5, color: "#747474", marginTop: 2 }}>
                    Based on {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
                  </div>
                </div>
              </div>
            </div>

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

                  <div style={{ borderTop: "1px solid #F3F4F6", paddingTop: 12, marginTop: 4, fontSize: 13, fontWeight: 600, color: "#303638" }}>
                    — {rev.reviewerName}
                  </div>
                </article>
              ))}
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
