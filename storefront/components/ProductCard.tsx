/**
 * @file components/ProductCard.tsx
 * @description Reusable product card component used on the shop listing page.
 *   Renders product image (with URL validation fallback to placeholder),
 *   category label, product name, price, and an "Add to Cart" / "View" CTA.
 *
 *   Props:
 *     product  – Product object from Google Sheets
 *     index    – Card index used for staggered reveal animation delay
 *
 *   Image handling: validates URL before passing to next/image to prevent
 *   crashes when imageUrl is empty, "-", or an invalid URL string.
 *
 * @owner Heet-P
 * @lastModified May 16, 2026
 */

"use client"

import Image from "next/image"
import Link from "next/link"
import { useCallback, useState } from "react"
import { useCart } from "@/context/cart-context"
import type { Product } from "@/lib/sheets"

function ArrowIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12,5 19,12 12,19" />
    </svg>
  )
}

interface ProductCardProps {
  product: Product
  index?: number
}

function formatPrice(rs: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR",
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(rs)
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
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
    setTimeout(() => setAdded(false), 2000)
  }, [addItem, product])

  const href = product.handle ? `/products/${product.handle}` : "/products"

  const isValidUrl = (url: string) => {
    if (!url || url === "-") return false
    try { new URL(url); return true } catch { return false }
  }

  return (
    <div className="prodC rv" style={{ transitionDelay: `${index * 0.07}s` }}>
      <div className="prodC__img">
        {isValidUrl(product.imageUrl) ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"
            style={{ objectFit: "cover" }}
          />
        ) : (
          <PlaceholderImage title={product.name} />
        )}
      </div>
      <div className="prodC__bd">
        <div className="prodC__cat">{product.category || "Product"}</div>
        <div className="prodC__nm">{product.name}</div>
        <div className="prodC__pr">
          {product.price > 0 ? formatPrice(product.price) : "Contact for price"}
        </div>
        <div className="prodC__row">
          <button
            className="btn bp bsm"
            onClick={handleAddToCart}
            disabled={adding}
            style={added ? { background: "#16a34a" } : {}}
          >
            {added ? "✓ Added!" : adding ? "Adding…" : "Add to Cart"}
          </button>
          <Link href={href} className="btn bod bsm">
            View <ArrowIcon />
          </Link>
        </div>
      </div>
    </div>
  )
}

function PlaceholderImage({ title }: { title: string }) {
  const id = `prod-${title.replace(/\W/g, "")}`
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" style={{ width: "100%", height: "100%" }}>
      <rect width="800" height="600" fill="#141418" />
      <defs>
        <pattern id={id} width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="9" y1="0" x2="9" y2="18" stroke="#20202C" strokeWidth="2" opacity="0.6" />
        </pattern>
      </defs>
      <rect width="800" height="600" fill={`url(#${id})`} />
      <text x="400" y="297" fontFamily="monospace" fontSize="11" fill="#20202C" opacity="0.9" textAnchor="middle" dominantBaseline="middle">
        {title.toUpperCase()}
      </text>
    </svg>
  )
}
