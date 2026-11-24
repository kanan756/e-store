"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import type { Product, ProductMediaItem, ProductVideoItem } from "@/lib/sheets"

interface ProductFormProps {
  initialData?: Product
  isEdit?: boolean
}

const DEFAULT_CATEGORIES = [
  "Smart Home Solutions",
  "Kitchen Essentials",
  "Storage & Organization",
  "Cleaning Accessories",
  "Cable Assembly",
  "Wiring Harness",
  "Connectors & Molding",
  "Everyday Essentials",
  "Industrial & Automation",
]

export default function ProductForm({ initialData, isEdit = false }: ProductFormProps) {
  const router = useRouter()

  // Form State
  const [productId, setProductId] = useState(
    initialData?.productId || initialData?.id || `prod_${Date.now()}`
  )
  const [productName, setProductName] = useState(initialData?.productName || initialData?.name || "")
  const [slug, setSlug] = useState(initialData?.slug || initialData?.handle || "")
  const [sku, setSku] = useState(initialData?.sku || initialData?.partNumber || "")
  const [category, setCategory] = useState(initialData?.category || DEFAULT_CATEGORIES[0])
  const [customCategory, setCustomCategory] = useState("")
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || "")
  const [description, setDescription] = useState(initialData?.description || "")
  const [price, setPrice] = useState(
    initialData?.price ? (initialData.price / 100).toString() : ""
  )
  const [discountPrice, setDiscountPrice] = useState(
    initialData?.discountPrice ? (initialData.discountPrice / 100).toString() : ""
  )
  const [stock, setStock] = useState(
    initialData?.stock !== undefined ? initialData.stock.toString() : "50"
  )
  const [status, setStatus] = useState<"Active" | "Inactive">(
    initialData?.status === "Inactive" ? "Inactive" : "Active"
  )

  // Media State
  const [images, setImages] = useState<ProductMediaItem[]>(() => {
    if (initialData?.additionalImages && initialData.additionalImages.length > 0) {
      return initialData.additionalImages
    }
    if (initialData?.primaryImage || initialData?.imageUrl) {
      return [{ url: initialData.primaryImage || initialData.imageUrl, isPrimary: true }]
    }
    return []
  })

  const [videos, setVideos] = useState<ProductVideoItem[]>(() => {
    if (initialData?.additionalVideos && initialData.additionalVideos.length > 0) {
      return initialData.additionalVideos
    }
    if (initialData?.primaryVideo) {
      return [{ url: initialData.primaryVideo }]
    }
    return []
  })

  // Uploading / saving state
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  // Auto-generate slug when product name changes
  const handleNameChange = (name: string) => {
    setProductName(name)
    if (!isEdit && (!slug || slug === slugify(productName))) {
      setSlug(slugify(name))
    }
  }

  function slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  }

  // Handle Image Uploads
  const handleImageUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return
    setUploadingImage(true)
    setErrorMessage("")

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("productId", productId)
        formData.append("resourceType", "image")

        const res = await fetch("/api/product-manager/upload", {
          method: "POST",
          body: formData,
        })
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || `Failed to upload image ${file.name}`)
        }

        const newMedia: ProductMediaItem = {
          id: data.media.id,
          url: data.media.url,
          publicId: data.media.publicId,
          width: data.media.width,
          height: data.media.height,
          isPrimary: images.length === 0, // first image becomes primary automatically
        }

        setImages((prev) => [...prev, newMedia])
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to upload one or more images.")
    } finally {
      setUploadingImage(false)
      if (imageInputRef.current) imageInputRef.current.value = ""
    }
  }

  // Handle Video Uploads
  const handleVideoUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return
    setUploadingVideo(true)
    setErrorMessage("")

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("productId", productId)
        formData.append("resourceType", "video")

        const res = await fetch("/api/product-manager/upload", {
          method: "POST",
          body: formData,
        })
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || `Failed to upload video ${file.name}`)
        }

        const newVideo: ProductVideoItem = {
          id: data.media.id,
          url: data.media.url,
          publicId: data.media.publicId,
          thumbnail: data.media.thumbnail,
          duration: data.media.duration,
          title: file.name,
        }

        setVideos((prev) => [...prev, newVideo])
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to upload video.")
    } finally {
      setUploadingVideo(false)
      if (videoInputRef.current) videoInputRef.current.value = ""
    }
  }

  // Reorder Images
  const moveImage = (index: number, direction: "left" | "right") => {
    setImages((prev) => {
      const arr = [...prev]
      const targetIndex = direction === "left" ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= arr.length) return prev
      const temp = arr[index]
      arr[index] = arr[targetIndex]
      arr[targetIndex] = temp
      return arr
    })
  }

  // Set Primary Image
  const setPrimaryImage = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      }))
    )
  }

  // Remove Image
  const removeImage = async (index: number) => {
    const item = images[index]
    setImages((prev) => {
      const remaining = prev.filter((_, i) => i !== index)
      // If deleted image was primary, make the first remaining image primary
      if (item.isPrimary && remaining.length > 0) {
        remaining[0].isPrimary = true
      }
      return remaining
    })

    if (item.publicId) {
      fetch("/api/product-manager/media/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId: item.publicId, resourceType: "image" }),
      }).catch(() => {})
    }
  }

  // Reorder Videos
  const moveVideo = (index: number, direction: "up" | "down") => {
    setVideos((prev) => {
      const arr = [...prev]
      const targetIndex = direction === "up" ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= arr.length) return prev
      const temp = arr[index]
      arr[index] = arr[targetIndex]
      arr[targetIndex] = temp
      return arr
    })
  }

  // Remove Video
  const removeVideo = async (index: number) => {
    const item = videos[index]
    setVideos((prev) => prev.filter((_, i) => i !== index))

    if (item.publicId) {
      fetch("/api/product-manager/media/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId: item.publicId, resourceType: "video" }),
      }).catch(() => {})
    }
  }

  // Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")
    setSuccessMessage("")

    // Validation
    if (!productName.trim()) {
      setErrorMessage("Product name is required.")
      return
    }

    const regularPriceCents = Math.round(parseFloat(price || "0") * 100)
    if (isNaN(regularPriceCents) || regularPriceCents < 0) {
      setErrorMessage("Please enter a valid regular price.")
      return
    }

    let discountCents: number | undefined = undefined
    if (discountPrice && discountPrice.trim() !== "") {
      discountCents = Math.round(parseFloat(discountPrice) * 100)
      if (isNaN(discountCents) || discountCents < 0) {
        setErrorMessage("Please enter a valid discount price.")
        return
      }
      if (discountCents > regularPriceCents) {
        setErrorMessage("Discounted price cannot exceed regular price.")
        return
      }
    }

    const stockNumber = parseInt(stock || "0", 10)
    if (isNaN(stockNumber) || stockNumber < 0) {
      setErrorMessage("Please enter a valid stock quantity.")
      return
    }

    setSubmitting(true)

    try {
      const primaryItem = images.find((i) => i.isPrimary) || images[0]
      const finalCategory = customCategory.trim() || category

      const payload = {
        productId: productId.trim(),
        productName: productName.trim(),
        slug: slug.trim() || slugify(productName),
        sku: sku.trim(),
        category: finalCategory,
        shortDescription: shortDescription.trim(),
        description: description.trim(),
        price: regularPriceCents,
        discountPrice: discountCents,
        stock: stockNumber,
        status,
        primaryImage: primaryItem ? primaryItem.url : "",
        additionalImages: images,
        primaryVideo: videos.length > 0 ? videos[0].url : "",
        additionalVideos: videos,
      }

      const endpoint = isEdit
        ? `/api/product-manager/products/${initialData?.id || productId}`
        : "/api/product-manager/products"

      const method = isEdit ? "PUT" : "POST"

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to save product.")
      }

      setSuccessMessage(
        isEdit ? "Product updated successfully!" : "Product created successfully!"
      )

      setTimeout(() => {
        router.push("/secure-product-manager/products")
        router.refresh()
      }, 1200)
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred while saving.")
      setSubmitting(false)
    }
  }

  return (
    <div>
      {/* ── Breadcrumb & Top Bar ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 6 }}>
            <Link href="/secure-product-manager/products" style={{ color: "#F36B12", textDecoration: "none" }}>
              Products
            </Link>{" "}
            / {isEdit ? `Edit: ${initialData?.name || productId}` : "Add New Product"}
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#17191C", margin: 0 }}>
            {isEdit ? "Edit Product Details" : "Create New Product"}
          </h1>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/secure-product-manager/products" className="pm-btn pm-btn-secondary">
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="pm-btn pm-btn-primary"
          >
            {submitting ? "Saving Product…" : isEdit ? "Update Product" : "Save & Publish"}
          </button>
        </div>
      </div>

      {/* ── Alerts ── */}
      {errorMessage && (
        <div
          style={{
            padding: "14px 18px",
            background: "#FEF2F2",
            border: "1px solid #FCA5A5",
            borderRadius: 8,
            color: "#DC2626",
            fontSize: 14,
            fontWeight: 600,
            marginBottom: 24,
          }}
        >
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div
          style={{
            padding: "14px 18px",
            background: "#ECFDF5",
            border: "1px solid #A7F3D0",
            borderRadius: 8,
            color: "#065F46",
            fontSize: 14,
            fontWeight: 600,
            marginBottom: 24,
          }}
        >
          ✓ {successMessage}
        </div>
      )}

      {/* ── Main Form Layout ── */}
      <form onSubmit={handleSubmit}>
        <div className="pm-form-grid">
          {/* Left Column: General & Descriptions & Media */}
          <div>
            {/* General Info Card */}
            <div className="pm-card" style={{ padding: "28px", marginBottom: 28 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: "#17191C", margin: "0 0 20px" }}>
                Basic Product Information
              </h2>

              <div className="pm-field-group">
                <label className="pm-label">
                  Product Name <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <input
                  type="text"
                  className="pm-input"
                  placeholder="e.g. Spiral Coiled Multi-Core Industrial Cable"
                  value={productName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                <div className="pm-field-group">
                  <label className="pm-label">
                    Product ID <span style={{ color: "#9CA3AF", fontSize: 12 }}>(Unique)</span>
                  </label>
                  <input
                    type="text"
                    className="pm-input"
                    placeholder="prod_123456"
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    disabled={isEdit}
                    required
                  />
                </div>

                <div className="pm-field-group">
                  <label className="pm-label">Product Slug / URL Handle</label>
                  <input
                    type="text"
                    className="pm-input"
                    placeholder="spiral-coiled-industrial-cable"
                    value={slug}
                    onChange={(e) => setSlug(slugify(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                <div className="pm-field-group">
                  <label className="pm-label">SKU / Part Number</label>
                  <input
                    type="text"
                    className="pm-input"
                    placeholder="CLS-CAB-004"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                  />
                </div>

                <div className="pm-field-group">
                  <label className="pm-label">Category</label>
                  <select
                    className="pm-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {DEFAULT_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="Custom">+ Custom Category</option>
                  </select>
                  {category === "Custom" && (
                    <input
                      type="text"
                      className="pm-input"
                      placeholder="Type custom category name…"
                      style={{ marginTop: 8 }}
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                    />
                  )}
                </div>
              </div>

              <div className="pm-field-group">
                <label className="pm-label">Short Description</label>
                <textarea
                  className="pm-textarea"
                  rows={2}
                  placeholder="A concise summary displayed on search cards and headers…"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                />
              </div>

              <div className="pm-field-group" style={{ marginBottom: 0 }}>
                <label className="pm-label">Detailed Full Description</label>
                <textarea
                  className="pm-textarea"
                  rows={6}
                  placeholder="Detailed technical specifications, features, materials, and usage guidelines…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            {/* ── Multiple Image Management ── */}
            <div className="pm-card" style={{ padding: "28px", marginBottom: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 800, color: "#17191C", margin: "0 0 4px" }}>
                    Product Images ({images.length})
                  </h2>
                  <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>
                    Upload high-res images (JPG, PNG, WebP up to 10MB). Drag & drop to add multiple files.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="pm-btn pm-btn-secondary"
                  style={{ fontSize: 13, padding: "7px 14px" }}
                  disabled={uploadingImage}
                >
                  {uploadingImage ? "Uploading…" : "+ Choose Images"}
                </button>
              </div>

              <input
                ref={imageInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                style={{ display: "none" }}
                onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
              />

              {/* Drag & Drop Dropzone */}
              <div
                className="pm-dropzone"
                onDragOver={(e) => {
                  e.preventDefault()
                  e.currentTarget.classList.add("dragover")
                }}
                onDragLeave={(e) => {
                  e.preventDefault()
                  e.currentTarget.classList.remove("dragover")
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  e.currentTarget.classList.remove("dragover")
                  if (e.dataTransfer.files) handleImageUpload(e.dataTransfer.files)
                }}
                onClick={() => imageInputRef.current?.click()}
              >
                <div style={{ color: "#F36B12", marginBottom: 8 }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#17191C", marginBottom: 4 }}>
                  {uploadingImage ? "Uploading image assets to media storage…" : "Drop product images here or click to browse"}
                </div>
                <div style={{ fontSize: 12, color: "#9CA3AF" }}>
                  Supports multiple uploads • JPG, PNG, WebP • Max 10MB each
                </div>
              </div>

              {/* Uploaded Images Grid */}
              {images.length > 0 && (
                <div className="pm-media-grid">
                  {images.map((img, idx) => (
                    <div key={img.id || img.url + idx} className={`pm-media-card ${img.isPrimary ? "primary" : ""}`}>
                      <div style={{ position: "relative", width: "100%", height: 110, background: "#F3F4F6" }}>
                        <Image src={img.url} alt={`Product ${idx + 1}`} fill style={{ objectFit: "cover" }} unoptimized />
                        {img.isPrimary && (
                          <div
                            style={{
                              position: "absolute",
                              top: 6,
                              left: 6,
                              background: "#F36B12",
                              color: "#FFFFFF",
                              fontSize: 10,
                              fontWeight: 800,
                              padding: "2px 6px",
                              borderRadius: 4,
                            }}
                          >
                            PRIMARY
                          </div>
                        )}
                      </div>

                      <div className="pm-media-actions">
                        <button
                          type="button"
                          onClick={() => setPrimaryImage(idx)}
                          title="Set as Primary Image"
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: 12,
                            color: img.isPrimary ? "#F36B12" : "#9CA3AF",
                          }}
                        >
                          ★
                        </button>

                        <div style={{ display: "flex", gap: 4 }}>
                          <button
                            type="button"
                            onClick={() => moveImage(idx, "left")}
                            disabled={idx === 0}
                            style={{ background: "none", border: "none", cursor: idx === 0 ? "default" : "pointer", opacity: idx === 0 ? 0.3 : 1 }}
                            title="Move Left"
                          >
                            ◀
                          </button>
                          <button
                            type="button"
                            onClick={() => moveImage(idx, "right")}
                            disabled={idx === images.length - 1}
                            style={{ background: "none", border: "none", cursor: idx === images.length - 1 ? "default" : "pointer", opacity: idx === images.length - 1 ? 0.3 : 1 }}
                            title="Move Right"
                          >
                            ▶
                          </button>
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#EF4444" }}
                            title="Remove Image"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Multiple Video Management ── */}
            <div className="pm-card" style={{ padding: "28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 800, color: "#17191C", margin: "0 0 4px" }}>
                    Product Videos ({videos.length})
                  </h2>
                  <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>
                    Upload demonstration or showcase videos (MP4, WebM, MOV up to 100MB).
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="pm-btn pm-btn-secondary"
                  style={{ fontSize: 13, padding: "7px 14px" }}
                  disabled={uploadingVideo}
                >
                  {uploadingVideo ? "Uploading…" : "+ Choose Videos"}
                </button>
              </div>

              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                multiple
                style={{ display: "none" }}
                onChange={(e) => e.target.files && handleVideoUpload(e.target.files)}
              />

              <div
                className="pm-dropzone"
                onDragOver={(e) => {
                  e.preventDefault()
                  e.currentTarget.classList.add("dragover")
                }}
                onDragLeave={(e) => {
                  e.preventDefault()
                  e.currentTarget.classList.remove("dragover")
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  e.currentTarget.classList.remove("dragover")
                  if (e.dataTransfer.files) handleVideoUpload(e.dataTransfer.files)
                }}
                onClick={() => videoInputRef.current?.click()}
              >
                <div style={{ color: "#4F46E5", marginBottom: 8 }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="23 7 16 12 23 17 23 7" />
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                  </svg>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#17191C", marginBottom: 4 }}>
                  {uploadingVideo ? "Uploading video file to storage…" : "Drop product videos here or click to browse"}
                </div>
                <div style={{ fontSize: 12, color: "#9CA3AF" }}>
                  MP4, WebM, MOV • Max 100MB each • Auto video preview
                </div>
              </div>

              {/* Uploaded Videos Grid */}
              {videos.length > 0 && (
                <div style={{ marginTop: 20, display: "grid", gap: 16 }}>
                  {videos.map((vid, idx) => (
                    <div
                      key={vid.id || vid.url + idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        padding: 12,
                        background: "#F9FAFB",
                        border: "1px solid #E5E7EB",
                        borderRadius: 10,
                      }}
                    >
                      <div
                        style={{
                          width: 140,
                          height: 80,
                          borderRadius: 8,
                          overflow: "hidden",
                          background: "#000000",
                          position: "relative",
                          flexShrink: 0,
                        }}
                      >
                        <video
                          src={vid.url}
                          controls
                          preload="metadata"
                          style={{ width: "100%", height: "100%", objectFit: "contain" }}
                        />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: "#17191C", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {vid.title || `Video ${idx + 1}`}
                        </div>
                        <div style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>
                          {vid.duration ? `${Math.round(vid.duration)}s duration • ` : ""}
                          <a href={vid.url} target="_blank" rel="noreferrer" style={{ color: "#F36B12", textDecoration: "none" }}>
                            Open direct link ↗
                          </a>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          type="button"
                          onClick={() => moveVideo(idx, "up")}
                          disabled={idx === 0}
                          className="pm-btn pm-btn-secondary"
                          style={{ padding: "6px 10px", fontSize: 12 }}
                          title="Move Up"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          onClick={() => moveVideo(idx, "down")}
                          disabled={idx === videos.length - 1}
                          className="pm-btn pm-btn-secondary"
                          style={{ padding: "6px 10px", fontSize: 12 }}
                          title="Move Down"
                        >
                          ▼
                        </button>
                        <button
                          type="button"
                          onClick={() => removeVideo(idx)}
                          className="pm-btn pm-btn-danger"
                          style={{ padding: "6px 10px", fontSize: 12 }}
                          title="Delete Video"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Pricing, Inventory & Status */}
          <div>
            {/* Status & Visibility Card */}
            <div className="pm-card" style={{ padding: "24px", marginBottom: 24 }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: "#17191C", margin: "0 0 16px" }}>
                Product Status
              </h2>

              <div className="pm-field-group">
                <label className="pm-label">Visibility Status</label>
                <select
                  className="pm-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "Active" | "Inactive")}
                >
                  <option value="Active">Active (Visible to Customers)</option>
                  <option value="Inactive">Inactive (Hidden from Customers)</option>
                </select>
                <p style={{ fontSize: 12, color: "#6B7280", marginTop: 6 }}>
                  {status === "Active"
                    ? "✓ Product is publicly accessible in search and product listings."
                    : "🔒 Product is hidden and cannot be added to customer carts."}
                </p>
              </div>
            </div>

            {/* Pricing Card */}
            <div className="pm-card" style={{ padding: "24px", marginBottom: 24 }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: "#17191C", margin: "0 0 16px" }}>
                Pricing & Valuation
              </h2>

              <div className="pm-field-group">
                <label className="pm-label">
                  Regular Price ($) <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="pm-input"
                  placeholder="29.99"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>

              <div className="pm-field-group" style={{ marginBottom: 0 }}>
                <label className="pm-label">Discounted / Sale Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="pm-input"
                  placeholder="24.99"
                  value={discountPrice}
                  onChange={(e) => setDiscountPrice(e.target.value)}
                />
                <span style={{ fontSize: 11.5, color: "#6B7280", marginTop: 4, display: "block" }}>
                  Optional sale price. Must be lower than regular price.
                </span>
              </div>
            </div>

            {/* Inventory Card */}
            <div className="pm-card" style={{ padding: "24px", marginBottom: 24 }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: "#17191C", margin: "0 0 16px" }}>
                Inventory Management
              </h2>

              <div className="pm-field-group" style={{ marginBottom: 0 }}>
                <label className="pm-label">Stock Quantity</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  className="pm-input"
                  placeholder="100"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  required
                />
                <span style={{ fontSize: 11.5, color: parseInt(stock, 10) <= 0 ? "#EF4444" : "#059669", marginTop: 6, display: "block", fontWeight: 600 }}>
                  {parseInt(stock, 10) <= 0
                    ? "⚠️ Stock is 0: Product will show as Out of Stock."
                    : `✓ Available inventory: ${stock} units.`}
                </span>
              </div>
            </div>

            {/* Save Card */}
            <div className="pm-card" style={{ padding: "24px" }}>
              <button
                type="submit"
                disabled={submitting}
                className="pm-btn pm-btn-primary"
                style={{ width: "100%", padding: "14px 20px", fontSize: 15 }}
              >
                {submitting ? "Saving Product…" : isEdit ? "Update Product" : "Save & Publish"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
