"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { formatPrice } from "@/lib/format"
import type { Product } from "@/lib/sheets"

interface DashboardClientProps {
  initialMetrics: {
    total: number
    active: number
    inactive: number
    outOfStock: number
  }
  initialProducts: Product[]
}

export default function DashboardClient({
  initialMetrics,
  initialProducts,
}: DashboardClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [metrics, setMetrics] = useState(initialMetrics)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState("")

  // Distinct categories
  const categories = useMemo(() => {
    const set = new Set<string>()
    products.forEach((p) => {
      if (p.category) set.add(p.category)
    })
    return ["All", ...Array.from(set).sort()]
  }, [products])

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !searchTerm ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesCat =
        selectedCategory === "All" ||
        p.category.toLowerCase() === selectedCategory.toLowerCase()

      return matchesSearch && matchesCat
    })
  }, [products, searchTerm, selectedCategory])

  const handleDelete = async (productId: string, hard = false) => {
    setDeletingId(productId)
    try {
      const res = await fetch(`/api/product-manager/products/${productId}?hard=${hard}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (res.ok) {
        if (hard) {
          setProducts((prev) => prev.filter((p) => p.id !== productId))
        } else {
          setProducts((prev) =>
            prev.map((p) =>
              p.id === productId ? { ...p, status: "Inactive", inStock: false } : p
            )
          )
        }
        setActionSuccess(data.message || "Operation completed successfully")
        setTimeout(() => setActionSuccess(""), 4000)

        // Refresh metrics
        const updated = await fetch("/api/product-manager/products?limit=1").then((r) => r.json())
        if (updated.metrics) setMetrics(updated.metrics)
      } else {
        alert(data.error || "Failed to remove product")
      }
    } catch {
      alert("Network error. Please try again.")
    } finally {
      setDeletingId(null)
      setShowConfirmModal(null)
    }
  }

  return (
    <div>
      {/* ── Page Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14, marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#17191C", margin: "0 0 6px" }}>
            Product Catalog Overview
          </h1>
          <p style={{ fontSize: 14, color: "#6B7280", margin: 0 }}>
            Manage CLASPO products, inventory, media assets, and visibility.
          </p>
        </div>
        <Link href="/secure-product-manager/products/add" className="pm-btn pm-btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Action Notification */}
      {actionSuccess && (
        <div
          style={{
            padding: "12px 18px",
            background: "#ECFDF5",
            border: "1px solid #A7F3D0",
            borderRadius: 8,
            color: "#065F46",
            fontSize: 14,
            fontWeight: 600,
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* ── Stat Cards ── */}
      <div className="pm-stats-grid">
        <div className="pm-stat-card">
          <div className="pm-stat-header">
            <span className="pm-stat-label">Total Products</span>
            <span style={{ background: "#F3F4F6", padding: "6px", borderRadius: "6px" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              </svg>
            </span>
          </div>
          <div className="pm-stat-value">{metrics.total}</div>
        </div>

        <div className="pm-stat-card">
          <div className="pm-stat-header">
            <span className="pm-stat-label">Active on Site</span>
            <span style={{ background: "#ECFDF5", padding: "6px", borderRadius: "6px" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </span>
          </div>
          <div className="pm-stat-value" style={{ color: "#059669" }}>{metrics.active}</div>
        </div>

        <div className="pm-stat-card">
          <div className="pm-stat-header">
            <span className="pm-stat-label">Inactive / Hidden</span>
            <span style={{ background: "#F3F4F6", padding: "6px", borderRadius: "6px" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
              </svg>
            </span>
          </div>
          <div className="pm-stat-value" style={{ color: "#6B7280" }}>{metrics.inactive}</div>
        </div>

        <div className="pm-stat-card">
          <div className="pm-stat-header">
            <span className="pm-stat-label">Out of Stock</span>
            <span style={{ background: "#FEF2F2", padding: "6px", borderRadius: "6px" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </span>
          </div>
          <div className="pm-stat-value" style={{ color: metrics.outOfStock > 0 ? "#DC2626" : "#4B5563" }}>
            {metrics.outOfStock}
          </div>
        </div>
      </div>

      {/* ── Filters & Search Bar ── */}
      <div
        className="pm-card"
        style={{ padding: "16px 20px", marginBottom: 24, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}
      >
        <div style={{ flex: "1 1 220px", minWidth: 0, position: "relative" }}>
          <input
            type="text"
            className="pm-input"
            placeholder="Search by product name, ID, or SKU…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: 38 }}
          />
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9CA3AF"
            strokeWidth="2"
            style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        <div style={{ flex: "0 1 220px", minWidth: 0, width: "100%", maxWidth: 260 }}>
          <select
            className="pm-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                Category: {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Product Table ── */}
      <div className="pm-card">
        {filteredProducts.length === 0 ? (
          <div style={{ padding: "60px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
              No products found
            </div>
            <p style={{ fontSize: 14, color: "#6B7280", marginBottom: 20 }}>
              {products.length === 0
                ? "Your product catalog is currently empty. Start by adding your first product."
                : "No products match your current search or category filter criteria."}
            </p>
            <Link href="/secure-product-manager/products/add" className="pm-btn pm-btn-primary">
              + Add Product
            </Link>
          </div>
        ) : (
          <>
            <div className="pm-desktop-table">
              <table className="pm-table">
              <thead>
                <tr>
                  <th style={{ width: 64 }}>Preview</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Pricing</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Media</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => {
                  const imageCount = (p.additionalImages?.length || 0) + (p.primaryImage ? 1 : 0)
                  const videoCount = (p.additionalVideos?.length || 0) + (p.primaryVideo ? 1 : 0)
                  const isInactive = p.status === "Inactive"
                  const isOutOfStock = (p.stock ?? 0) <= 0

                  return (
                    <tr key={p.id} style={{ opacity: isInactive ? 0.65 : 1 }}>
                      <td>
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 8,
                            background: "#F3F4F6",
                            position: "relative",
                            overflow: "hidden",
                            border: "1px solid #E5E7EB",
                          }}
                        >
                          {p.imageUrl ? (
                            <Image
                              src={p.imageUrl}
                              alt={p.name}
                              fill
                              style={{ objectFit: "cover" }}
                              unoptimized
                            />
                          ) : (
                            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF" }}>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <polyline points="21 15 16 10 5 21" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 700, color: "#17191C", fontSize: 14.5 }}>
                          {p.name}
                        </div>
                        <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2, display: "flex", gap: 8 }}>
                          <span>ID: {p.id}</span>
                          {p.sku && <span>• SKU: {p.sku}</span>}
                        </div>
                      </td>

                      <td>
                        <span style={{ fontSize: 13, color: "#374151" }}>{p.category}</span>
                      </td>

                      <td>
                        <div style={{ fontWeight: 700, color: "#17191C" }}>
                          {formatPrice(p.price)}
                        </div>
                        {p.discountPrice != null && p.discountPrice > 0 && (
                          <div style={{ fontSize: 12, color: "#059669" }}>
                            Discount: {formatPrice(p.discountPrice)}
                          </div>
                        )}
                      </td>

                      <td>
                        <div style={{ fontWeight: 600, color: isOutOfStock ? "#DC2626" : "#374151" }}>
                          {p.stock ?? 0} units
                        </div>
                        {isOutOfStock && (
                          <span style={{ fontSize: 11, color: "#DC2626", fontWeight: 700 }}>
                            OUT OF STOCK
                          </span>
                        )}
                      </td>

                      <td>
                        <span className={`pm-badge ${isInactive ? "pm-badge-inactive" : "pm-badge-active"}`}>
                          {p.status || "Active"}
                        </span>
                      </td>

                      <td>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          <span className="pm-badge pm-badge-media" title="Images">
                            📷 {imageCount}
                          </span>
                          {videoCount > 0 && (
                            <span className="pm-badge" style={{ background: "#EEF2FF", color: "#4F46E5", border: "1px solid #C7D2FE", fontSize: 11 }} title="Videos">
                              🎬 {videoCount}
                            </span>
                          )}
                        </div>
                      </td>

                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: 8 }}>
                          <Link
                            href={`/secure-product-manager/products/edit/${p.id}`}
                            className="pm-btn pm-btn-secondary"
                            style={{ padding: "6px 12px", fontSize: 13 }}
                          >
                            Edit
                          </Link>

                          {isInactive ? (
                            <button
                              onClick={() => handleDelete(p.id, false)}
                              className="pm-btn pm-btn-secondary"
                              style={{ padding: "6px 12px", fontSize: 13, color: "#059669" }}
                              disabled={deletingId === p.id}
                            >
                              Activate
                            </button>
                          ) : (
                            <button
                              onClick={() => setShowConfirmModal(p.id)}
                              className="pm-btn pm-btn-danger"
                              style={{ padding: "6px 12px", fontSize: 13 }}
                              disabled={deletingId === p.id}
                            >
                              Deactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            </div>

            {/* Mobile Product Cards */}
            <div className="pm-mobile-cards">
              {filteredProducts.map((p) => {
                const imageCount = (p.additionalImages?.length || 0) + (p.primaryImage ? 1 : 0)
                const videoCount = (p.additionalVideos?.length || 0) + (p.primaryVideo ? 1 : 0)
                const isInactive = p.status === "Inactive"
                const isOutOfStock = (p.stock ?? 0) <= 0

                return (
                  <div
                    key={p.id}
                    style={{
                      border: "1px solid #E5E7EB",
                      borderRadius: 12,
                      padding: 14,
                      background: "#FFFFFF",
                      opacity: isInactive ? 0.68 : 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <div
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 8,
                          background: "#F3F4F6",
                          position: "relative",
                          overflow: "hidden",
                          border: "1px solid #E5E7EB",
                          flexShrink: 0,
                        }}
                      >
                        {p.imageUrl ? (
                          <Image
                            src={p.imageUrl}
                            alt={p.name}
                            fill
                            style={{ objectFit: "cover" }}
                            unoptimized
                          />
                        ) : null}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, color: "#17191C", fontSize: 14.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {p.name}
                        </div>
                        <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
                          {p.category} {p.sku ? `• ${p.sku}` : ""}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                          <span className={`pm-badge ${isInactive ? "pm-badge-inactive" : "pm-badge-active"}`}>
                            {p.status || "Active"}
                          </span>
                          <span className="pm-badge pm-badge-media">📷 {imageCount}</span>
                          {videoCount > 0 && (
                            <span className="pm-badge" style={{ background: "#EEF2FF", color: "#4F46E5", border: "1px solid #C7D2FE", fontSize: 11 }}>
                              🎬 {videoCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTop: "1px solid #F3F4F6", fontSize: 13 }}>
                      <div>
                        <span style={{ fontWeight: 800, color: "#17191C", fontSize: 15 }}>
                          {formatPrice(p.price)}
                        </span>
                        {p.discountPrice != null && p.discountPrice > 0 && (
                          <span style={{ fontSize: 12, color: "#059669", marginLeft: 8, fontWeight: 600 }}>
                            Sale: {formatPrice(p.discountPrice)}
                          </span>
                        )}
                      </div>
                      <span style={{ fontWeight: 700, color: isOutOfStock ? "#DC2626" : "#374151" }}>
                        {isOutOfStock ? "Out of Stock" : `${p.stock ?? 0} units`}
                      </span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <Link
                        href={`/secure-product-manager/products/edit/${p.id}`}
                        className="pm-btn pm-btn-secondary"
                        style={{ padding: "9px 12px", fontSize: 13 }}
                      >
                        Edit
                      </Link>
                      {isInactive ? (
                        <button
                          onClick={() => handleDelete(p.id, false)}
                          className="pm-btn pm-btn-secondary"
                          style={{ padding: "9px 12px", fontSize: 13, color: "#059669" }}
                          disabled={deletingId === p.id}
                        >
                          Activate
                        </button>
                      ) : (
                        <button
                          onClick={() => setShowConfirmModal(p.id)}
                          className="pm-btn pm-btn-danger"
                          style={{ padding: "9px 12px", fontSize: 13 }}
                          disabled={deletingId === p.id}
                        >
                          Deactivate
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* ── Deactivation / Delete Confirmation Modal ── */}
      {showConfirmModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 20,
          }}
        >
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 16,
              maxWidth: 480,
              width: "100%",
              padding: "28px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
            }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#17191C", margin: "0 0 10px" }}>
              Deactivate or Delete Product?
            </h3>
            <p style={{ fontSize: 14, color: "#4B5563", lineHeight: 1.5, margin: "0 0 24px" }}>
              Deactivating will safely hide this product from customers while protecting historical orders and references.
              Permanent deletion will completely remove the row from Google Sheets.
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={() => setShowConfirmModal(null)}
                className="pm-btn pm-btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showConfirmModal, false)}
                className="pm-btn pm-btn-primary"
              >
                Deactivate (Recommended)
              </button>
              <button
                onClick={() => handleDelete(showConfirmModal, true)}
                className="pm-btn pm-btn-danger"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
