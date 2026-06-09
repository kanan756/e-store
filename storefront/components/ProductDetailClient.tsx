"use client"

import Image from "next/image"
import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
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
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      {/* ── Hero Header ─────────────────────────────────────────────── */}
      <div style={{ background: "var(--bg2)", padding: "120px 0 60px", borderBottom: "1px solid var(--bdM)" }}>
        <div className="W" style={{ textAlign: "center" }}>
          <h1 className="D2" style={{ color: "var(--text)" }}>{product.name}</h1>
        </div>
      </div>

      <div className="W" style={{ paddingTop: 60, paddingBottom: 60 }}>
        {/* ── Product Intro (2-Column) ────────────────────────────────── */}
        <div className="prod-det-grid" style={{ marginBottom: 80 }}>
          {/* Image Gallery */}
          <div>
            <div style={{ borderRadius: "var(--rL)", overflow: "hidden", aspectRatio: "4/3", position: "relative", background: "var(--bg2)", marginBottom: 16 }}>
              {hasImages ? (
                <>
                  <img src={images[activeImage]} alt={product.name} style={{ width: "100%", height: "auto", display: "block",  objectFit: "contain" }} />
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
                    <img src={img} alt={`${product.name} thumbnail ${idx + 1}`} style={{ width: "100%", height: "auto", display: "block",  objectFit: "contain" }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Pricing & Add to Cart */}
          <div style={{ paddingTop: 20 }}>
            <div className="lbl" style={{ marginBottom: 16 }}>{product.category || "Product"}</div>
            
            <p className="Bd" style={{ marginBottom: 32 }}>
              {product.description || "Superior Harness & Assembly is an ISO certified manufacturer of a wide range of custom products. This product is one of our widely used and purchased items, known for its enduring quality and enhanced structure."}
            </p>

            <div style={{ fontFamily: "var(--font-sora)", fontSize: 36, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 24, color: "var(--acc)" }}>
              {product.price > 0 ? formatPrice(product.price) : "Contact for price"}
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                className="btn bp no-fill"
                onClick={handleAddToCart}
                disabled={adding || !product.inStock}
                style={{ 
                  flex: 1, 
                  background: added ? "#16a34a" : (!product.inStock ? "var(--bg3)" : undefined),
                  color: !product.inStock ? "var(--textM)" : undefined,
                  cursor: !product.inStock ? "not-allowed" : undefined,
                  borderColor: !product.inStock ? "var(--bd)" : undefined
                }}
              >
                {!product.inStock 
                  ? "Out of Stock" 
                  : added 
                    ? "✓ Added to Cart!" 
                    : adding 
                      ? "Adding…" 
                      : "Add to Cart"
                }
                {product.inStock && !added && <ArrowIcon />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Detailed Description ──────────────────────────────────────── */}
        <div style={{ textAlign: "center", maxWidth: 800, margin: "0 auto 80px" }}>
          <h2 className="D3" style={{ marginBottom: 24 }}>{product.name}</h2>
          <p className="Bd">
            The {product.name.toLowerCase()} are commonly used products that tend to be uniquely shaped in order to enhance hold and protect various components. {product.name}, being manufactured with the highest quality materials, has amazing durability while being resistant to temperature and environmental factors. This makes it highly recommendable for long-term usage.
            <br/><br/>
            At Superior Harness, we cater custom designed {product.name.toLowerCase()}, all made up of premium quality components. These items are widely utilized in automotive, industrial, and defense applications.
          </p>
        </div>

        {/* ── Features & Materials (2-Column) ─────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 60, marginBottom: 80 }}>
          <div>
            <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Salient Features</h3>
            <p className="Bd" style={{ marginBottom: 24 }}>
              {product.name} is a versatile component known for its excellent properties and wide range of applications.
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              <li style={{ display: "flex", gap: 12, marginBottom: 12, fontSize: 15, alignItems: "flex-start" }}>
                <span style={{ fontWeight: 800, color: "var(--acc)", marginTop: 2 }}>›</span> 
                <span>Suitable for usage in extreme temperatures ranging from -60 F to 400 F</span>
              </li>
              <li style={{ display: "flex", gap: 12, marginBottom: 12, fontSize: 15, alignItems: "flex-start" }}>
                <span style={{ fontWeight: 800, color: "var(--acc)", marginTop: 2 }}>›</span> 
                <span>Manufactured to meet strict ISO quality standards</span>
              </li>
              <li style={{ display: "flex", gap: 12, marginBottom: 12, fontSize: 15, alignItems: "flex-start" }}>
                <span style={{ fontWeight: 800, color: "var(--acc)", marginTop: 2 }}>›</span> 
                <span>Resistant to ozone and UV radiations</span>
              </li>
              <li style={{ display: "flex", gap: 12, marginBottom: 12, fontSize: 15, alignItems: "flex-start" }}>
                <span style={{ fontWeight: 800, color: "var(--acc)", marginTop: 2 }}>›</span> 
                <span>Available in industrial grade and custom specifications</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Materials</h3>
            <p className="Bd" style={{ marginBottom: 24 }}>
              We manufacture using various premium materials depending on application type and requirements. Here are some of the standard materials we work with:
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              <li style={{ display: "flex", gap: 12, marginBottom: 12, fontSize: 15, alignItems: "flex-start" }}>
                <span style={{ fontWeight: 800, color: "var(--acc)", marginTop: 2 }}>›</span> 
                <span>OEM-Grade Wiring</span>
              </li>
              <li style={{ display: "flex", gap: 12, marginBottom: 12, fontSize: 15, alignItems: "flex-start" }}>
                <span style={{ fontWeight: 800, color: "var(--acc)", marginTop: 2 }}>›</span> 
                <span>Automotive Connectors (Deutsch, Delphi)</span>
              </li>
              <li style={{ display: "flex", gap: 12, marginBottom: 12, fontSize: 15, alignItems: "flex-start" }}>
                <span style={{ fontWeight: 800, color: "var(--acc)", marginTop: 2 }}>›</span> 
                <span>Silicone & EPDM</span>
              </li>
              <li style={{ display: "flex", gap: 12, marginBottom: 12, fontSize: 15, alignItems: "flex-start" }}>
                <span style={{ fontWeight: 800, color: "var(--acc)", marginTop: 2 }}>›</span> 
                <span>High-temperature Neoprene</span>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Product Facility and Service ──────────────────────────────── */}
        <div style={{ marginBottom: 80 }}>
          <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Product Facility and Service</h3>
          <p className="Bd" style={{ marginBottom: 32 }}>
            The {product.name.toLowerCase()} is high in demand as it has many applications including industrial equipment sealing, vehicle wiring, and complex machinery. With an earnest aim to provide satisfactory and customized products, we ensure sturdy quality that will never fail your expectations. As per the customer's requirements, we are capable of manufacturing any custom and complex assembly.
          </p>
          <a href="#quote" className="btn bp" style={{ display: "inline-flex" }}>Request a Quotation</a>
        </div>

        {/* ── Profiles Carousel ─────────────────────────────────────────── */}
        {images.length > 0 && (
          <div style={{ marginBottom: 80 }}>
            <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Profiles</h3>
            <div style={{ display: "flex", gap: 24, overflowX: "auto", paddingBottom: 16 }}>
              {images.map((img, idx) => (
                <div key={idx} style={{ flexShrink: 0, width: 280, background: "var(--bg2)", borderRadius: "var(--r)", overflow: "hidden", border: "1px solid var(--bd)" }}>
                  <div>
                    <img src={img} alt={`${product.name} Profile ${idx + 1}`} style={{ width: "100%", height: "auto", display: "block", padding: 16 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Customization ─────────────────────────────────────────────── */}
        <div style={{ paddingBottom: 60 }}>
          <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Customization</h3>
          <p className="Bd" style={{ marginBottom: 40 }}>
            Your order can be completely customized, as per your requirements. We provide value-added services such as cut-to-length extrusion, wire splicing, terminal crimping, custom loom protection, and complex color-matching assemblies.
          </p>
          <div style={{ textAlign: "center", marginTop: 40, paddingTop: 40, borderTop: "1px solid var(--bd)" }}>
            <h4 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>
              Have specific custom material, size and component requirements? <br/>
              Please contact us today to get the best competitive prices.
            </h4>
            <a href="/contact" className="btn bp" style={{ display: "inline-flex" }}>Contact Us</a>
          </div>
        </div>

      </div>
    </div>
  )
}
