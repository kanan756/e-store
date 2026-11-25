"use client"

import { useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useWishlist } from "@/context/wishlist-context"
import { useCart } from "@/context/cart-context"
import type { Product } from "@/lib/sheets"
import { formatPrice } from "@/lib/format"

export default function WishlistClient({ products }: { products: Product[] }) {
  const router = useRouter()
  const { status } = useSession()
  const { wishlist, loading: wishlistLoading, removeFromWishlist } = useWishlist()
  const { addItem } = useCart()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(
        "/login?callbackUrl=" +
          encodeURIComponent("/wishlist") +
          "&message=" +
          encodeURIComponent("Please log in to your CLASPO account to view your wishlist.")
      )
    }
  }, [status, router])

  const savedProducts = useMemo(() => {
    if (!wishlist.length) return []
    const set = new Set(wishlist)
    return products.filter(
      (p) => set.has(p.handle) || set.has(p.id) || (p.slug && set.has(p.slug))
    )
  }, [products, wishlist])

  if (status === "loading" || wishlistLoading) {
    return (
      <div style={{ minHeight: "70vh", paddingTop: 140, paddingBottom: 80, textAlign: "center" }}>
        <div className="W">
          <p style={{ color: "#747474", fontSize: 16 }}>Loading your wishlist…</p>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return null
  }

  const handleMoveToCart = (product: Product) => {
    const effectivePrice =
      product.discountPrice != null && product.discountPrice > 0 && product.discountPrice < product.price
        ? product.discountPrice
        : product.price
    addItem({
      id: product.handle || product.id,
      productId: product.productId || product.id,
      name: product.name,
      price: effectivePrice,
      regularPrice: product.price,
      discountPrice:
        product.discountPrice != null && product.discountPrice > 0 && product.discountPrice < product.price
          ? product.discountPrice
          : null,
      stock: product.stock,
      inStock: product.inStock,
      imageUrl: product.imageUrl || product.primaryImage || "",
      category: product.category,
    })
  }

  return (
    <div style={{ minHeight: "80vh", background: "#FAFAFA", paddingTop: 130, paddingBottom: 80 }}>
      <div className="W">
        <div style={{ marginBottom: 36, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div className="lbl" style={{ marginBottom: 10 }}>SAVED ITEMS</div>
            <h1 className="D3" style={{ margin: 0, color: "#17191C" }}>
              My Wishlist ({savedProducts.length})
            </h1>
          </div>

          <Link
            href="/products"
            className="btn"
            style={{
              background: "#FFFFFF",
              border: "1px solid #E5E5E5",
              color: "#17191C",
            }}
          >
            Browse All Products
          </Link>
        </div>

        {savedProducts.length === 0 ? (
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E5E5E5",
              borderRadius: 16,
              padding: "64px 24px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 12, color: "#F36B12" }}>♡</div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#17191C", margin: "0 0 8px" }}>
              Your wishlist is empty
            </h2>
            <p style={{ color: "#747474", fontSize: 15, margin: "0 0 24px" }}>
              Save products you like by clicking the heart icon on any product card.
            </p>
            <Link href="/products" className="btn bp">
              Explore Products
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 24,
            }}
          >
            {savedProducts.map((product) => {
              const handle = product.handle || product.id
              const href = `/products/${handle}`
              const imgUrl = product.primaryImage || product.imageUrl?.split(",")[0]?.trim() || ""
              const hasDiscount =
                product.discountPrice != null &&
                product.discountPrice > 0 &&
                product.discountPrice < product.price
              const displayPrice = hasDiscount ? product.discountPrice! : product.price
              const outOfStock = !product.inStock || (product.stock !== undefined && product.stock <= 0)

              return (
                <div
                  key={product.id}
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #E5E5E5",
                    borderRadius: 12,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Link
                    href={href}
                    style={{
                      display: "block",
                      aspectRatio: "4 / 3",
                      background: "#F5F5F5",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={product.name}
                        style={{ width: "100%", height: "100%", objectFit: "contain", padding: 14, display: "block" }}
                      />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#747474", fontSize: 12 }}>
                        {product.name}
                      </div>
                    )}
                  </Link>

                  <div style={{ padding: 18, display: "flex", flexDirection: "column", flex: 1, gap: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#747474" }}>
                      {product.category || "Product"}
                    </div>

                    <Link
                      href={href}
                      style={{
                        textDecoration: "none",
                        color: "#17191C",
                        fontSize: 15.5,
                        fontWeight: 700,
                        lineHeight: 1.35,
                      }}
                    >
                      {product.name}
                    </Link>

                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: "auto" }}>
                      <span style={{ fontSize: 18, fontWeight: 900, color: "#17191C" }}>
                        {displayPrice > 0 ? formatPrice(displayPrice) : "Contact for Price"}
                      </span>
                      {hasDiscount && (
                        <span style={{ fontSize: 13, color: "#9CA3AF", textDecoration: "line-through" }}>
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, marginTop: 6 }}>
                      <button
                        type="button"
                        onClick={() => handleMoveToCart(product)}
                        disabled={outOfStock}
                        style={{
                          padding: "10px 14px",
                          borderRadius: 6,
                          border: "none",
                          background: outOfStock ? "#F5F5F5" : "#F36B12",
                          color: outOfStock ? "#747474" : "#FFFFFF",
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: outOfStock ? "not-allowed" : "pointer",
                        }}
                      >
                        {outOfStock ? "Out of Stock" : "Add to Cart"}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          removeFromWishlist(handle)
                          if (product.id !== handle) removeFromWishlist(product.id)
                        }}
                        aria-label={`Remove ${product.name} from wishlist`}
                        title="Remove from Wishlist"
                        style={{
                          padding: "10px 12px",
                          borderRadius: 6,
                          border: "1px solid #E5E5E5",
                          background: "#FFFFFF",
                          color: "#DC2626",
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
