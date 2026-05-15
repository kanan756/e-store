"use client"

import Image from "next/image"
import Link from "next/link"
import { useCallback, useState } from "react"
import { useCart } from "@/context/cart-context"
import { formatPrice, getVariantPriceAmount } from "@/lib/medusa-client"
import type { StoreProduct } from "@/lib/types"

function ArrowIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12,5 19,12 12,19" />
    </svg>
  )
}

interface ProductCardProps {
  product: StoreProduct
  index?: number
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem, loading } = useCart()
  const [adding, setAdding] = useState(false)

  const firstVariant = product.variants?.[0]
  const price = getVariantPriceAmount(firstVariant)
  const variantId = firstVariant?.id

  const handleAddToCart = useCallback(async () => {
    if (!variantId) return
    setAdding(true)
    try {
      await addItem(variantId)
    } finally {
      setAdding(false)
    }
  }, [addItem, variantId])

  const thumbnail = product.thumbnail
  const title = product.title ?? "Product"
  const href = product.handle ? `/products/${product.handle}` : "/products"

  return (
    <div className="prodC rv" style={{ transitionDelay: `${index * 0.07}s` }}>
      <div className="prodC__img">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={title}
            fill
            sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"
            style={{ objectFit: "cover" }}
          />
        ) : (
          <PlaceholderImage title={title} />
        )}
        {product.tags?.[0] && (
          <span className="prodC__tag">{product.tags[0].value}</span>
        )}
      </div>
      <div className="prodC__bd">
        <div className="prodC__cat">
          {product.collection?.title ?? product.type?.value ?? "Product"}
        </div>
        <div className="prodC__nm">{title}</div>
        <div className="prodC__pr">
          {price != null ? formatPrice(price) : "—"}
        </div>
        <div className="prodC__row">
          <button
            className="btn bp bsm"
            onClick={handleAddToCart}
            disabled={adding || loading || !variantId}
          >
            {adding ? "Adding…" : "Add to Cart"}
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
