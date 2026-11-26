"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import type {
  Product,
  ProductMediaItem,
  ProductVideoItem,
  ProductReviewItem,
  ProductHowToStep,
  ProductColorVariant,
} from "@/lib/sheets"

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
    initialData?.price != null ? initialData.price.toString() : ""
  )
  const [discountPrice, setDiscountPrice] = useState(
    initialData?.discountPrice != null ? initialData.discountPrice.toString() : ""
  )
  const [activeStock, setActiveStock] = useState(
    initialData?.activeStock !== undefined
      ? initialData.activeStock.toString()
      : initialData?.stock !== undefined
        ? initialData.stock.toString()
        : "50"
  )
  const initialPassiveStock = initialData?.stock !== undefined ? initialData.stock : 50
  const reservedStockQty = isEdit
    ? Math.max(0, (initialData?.activeStock ?? initialPassiveStock) - initialPassiveStock)
    : 0
  const parsedActiveStock = parseInt(activeStock || "0", 10)
  const calculatedPassiveStock = isEdit
    ? Math.max(0, (isNaN(parsedActiveStock) ? 0 : parsedActiveStock) - reservedStockQty)
    : Math.max(0, isNaN(parsedActiveStock) ? 0 : parsedActiveStock)
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

  // Reviews State
  const [reviews, setReviews] = useState<ProductReviewItem[]>(
    () => (Array.isArray(initialData?.reviews) ? initialData.reviews : [])
  )
  const [reviewerName, setReviewerName] = useState("")
  const [reviewTitle, setReviewTitle] = useState("")
  const [reviewDescription, setReviewDescription] = useState("")
  const [reviewRating, setReviewRating] = useState<number>(5)
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null)
  const [reviewFormError, setReviewFormError] = useState("")

  // How to Use State
  const [howToUse, setHowToUse] = useState<ProductHowToStep[]>(() =>
    Array.isArray(initialData?.howToUse)
      ? initialData.howToUse.map((s, idx) => ({ ...s, stepNumber: idx + 1 }))
      : []
  )
  const [stepTitle, setStepTitle] = useState("")
  const [stepInstruction, setStepInstruction] = useState("")
  const [editingStepId, setEditingStepId] = useState<string | null>(null)
  const [stepFormError, setStepFormError] = useState("")

  // Available Colours State
  const [colors, setColors] = useState<ProductColorVariant[]>(() =>
    Array.isArray(initialData?.colors) ? initialData.colors : []
  )
  const [colorName, setColorName] = useState("")
  const [colorHex, setColorHex] = useState("#17191C")
  const [colorAvailable, setColorAvailable] = useState(true)
  const [colorStock, setColorStock] = useState("")
  const [editingColorId, setEditingColorId] = useState<string | null>(null)
  const [colorFormError, setColorFormError] = useState("")

  // Uploading / saving state
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [pricingError, setPricingError] = useState("")

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

  // Review Handlers
  const resetReviewForm = () => {
    setReviewerName("")
    setReviewTitle("")
    setReviewDescription("")
    setReviewRating(5)
    setEditingReviewId(null)
    setReviewFormError("")
  }

  const handleSaveReview = () => {
    setReviewFormError("")
    if (!reviewerName.trim() || !reviewTitle.trim() || !reviewDescription.trim()) {
      setReviewFormError("Please enter reviewer name, review title, and review description.")
      return
    }
    if (editingReviewId) {
      setReviews((prev) =>
        prev.map((r) =>
          r.id === editingReviewId
            ? {
                ...r,
                reviewerName: reviewerName.trim(),
                title: reviewTitle.trim(),
                description: reviewDescription.trim(),
                rating: reviewRating,
              }
            : r
        )
      )
    } else {
      const newReview: ProductReviewItem = {
        id: `rev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        reviewerName: reviewerName.trim(),
        title: reviewTitle.trim(),
        description: reviewDescription.trim(),
        rating: reviewRating,
        createdAt: new Date().toISOString(),
      }
      setReviews((prev) => [...prev, newReview])
    }
    resetReviewForm()
  }

  const handleEditReview = (review: ProductReviewItem) => {
    setEditingReviewId(review.id)
    setReviewerName(review.reviewerName)
    setReviewTitle(review.title)
    setReviewDescription(review.description)
    setReviewRating(review.rating)
    setReviewFormError("")
  }

  const handleDeleteReview = (id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id))
    if (editingReviewId === id) resetReviewForm()
  }

  // How to Use Handlers
  const resetStepForm = () => {
    setStepTitle("")
    setStepInstruction("")
    setEditingStepId(null)
    setStepFormError("")
  }

  const handleSaveStep = () => {
    setStepFormError("")
    if (!stepInstruction.trim()) {
      setStepFormError("Please enter the usage instruction for this step.")
      return
    }
    if (editingStepId) {
      setHowToUse((prev) =>
        prev.map((s) =>
          s.id === editingStepId
            ? {
                ...s,
                title: stepTitle.trim() || undefined,
                instruction: stepInstruction.trim(),
              }
            : s
        )
      )
    } else {
      setHowToUse((prev) => [
        ...prev,
        {
          id: `step_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          stepNumber: prev.length + 1,
          title: stepTitle.trim() || undefined,
          instruction: stepInstruction.trim(),
        },
      ])
    }
    resetStepForm()
  }

  const handleEditStep = (step: ProductHowToStep) => {
    setEditingStepId(step.id)
    setStepTitle(step.title || "")
    setStepInstruction(step.instruction)
    setStepFormError("")
  }

  const handleDeleteStep = (id: string) => {
    setHowToUse((prev) =>
      prev
        .filter((s) => s.id !== id)
        .map((s, idx) => ({ ...s, stepNumber: idx + 1 }))
    )
    if (editingStepId === id) resetStepForm()
  }

  const moveStep = (index: number, direction: "up" | "down") => {
    setHowToUse((prev) => {
      const targetIndex = direction === "up" ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= prev.length) return prev
      const arr = [...prev]
      const temp = arr[index]
      arr[index] = arr[targetIndex]
      arr[targetIndex] = temp
      return arr.map((s, idx) => ({ ...s, stepNumber: idx + 1 }))
    })
  }

  // Available Colours Handlers
  const resetColorForm = () => {
    setColorName("")
    setColorHex("#17191C")
    setColorAvailable(true)
    setColorStock("")
    setEditingColorId(null)
    setColorFormError("")
  }

  const handleAddOrUpdateColor = () => {
    setColorFormError("")
    const trimmedName = colorName.trim()
    if (!trimmedName) {
      setColorFormError("Please enter a colour name (e.g. Black, White, Blue).")
      return
    }
    const normalizedHex = colorHex.trim()
    if (!/^#[0-9a-fA-F]{6}$/.test(normalizedHex) && !/^#[0-9a-fA-F]{3}$/.test(normalizedHex)) {
      setColorFormError("Please enter a valid hex colour code (e.g. #17191C).")
      return
    }
    const duplicate = colors.find(
      (c) =>
        c.id !== editingColorId &&
        c.name.trim().toLowerCase() === trimmedName.toLowerCase()
    )
    if (duplicate) {
      setColorFormError(`"${trimmedName}" is already added. Please use a unique colour name.`)
      return
    }

    let parsedStock: number | null = null
    if (colorStock.trim() !== "") {
      const n = Number(colorStock)
      if (!Number.isInteger(n) || n < 0) {
        setColorFormError("Colour stock must be a whole number (0 or more).")
        return
      }
      parsedStock = n
    }

    if (editingColorId) {
      setColors((prev) =>
        prev.map((c) => {
          if (c.id !== editingColorId) return c
          const prevActive = c.activeStock ?? c.stock
          const prevPassive = c.stock
          const colReserved =
            prevActive != null && prevPassive != null
              ? Math.max(0, prevActive - prevPassive)
              : 0
          return {
            ...c,
            name: trimmedName,
            hex: normalizedHex,
            available: colorAvailable,
            activeStock: parsedStock,
            stock: parsedStock != null ? Math.max(0, parsedStock - colReserved) : null,
          }
        })
      )
    } else {
      const newColor: ProductColorVariant = {
        id: `color_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: trimmedName,
        hex: normalizedHex,
        available: colorAvailable,
        activeStock: parsedStock,
        stock: parsedStock,
      }
      setColors((prev) => [...prev, newColor])
    }
    resetColorForm()
  }

  const startEditColor = (color: ProductColorVariant) => {
    setColorName(color.name)
    setColorHex(color.hex)
    setColorAvailable(color.available !== false)
    const initialColActive = color.activeStock ?? color.stock
    setColorStock(initialColActive !== undefined && initialColActive !== null ? String(initialColActive) : "")
    setEditingColorId(color.id)
    setColorFormError("")
  }

  const removeColor = (id: string) => {
    setColors((prev) => prev.filter((c) => c.id !== id))
    if (editingColorId === id) resetColorForm()
  }

  const toggleColorAvailability = (id: string) => {
    setColors((prev) =>
      prev.map((c) => (c.id === id ? { ...c, available: !c.available } : c))
    )
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

    const INVALID_PRICING_MSG = "Discounted price cannot be greater than the regular price."

    const regularPriceInr = Math.round(parseFloat(price || "0") * 100) / 100
    if (isNaN(regularPriceInr) || regularPriceInr < 0) {
      setPricingError("Please enter a valid regular price in INR.")
      setErrorMessage("Please enter a valid regular price in INR.")
      return
    }

    let discountInr: number | undefined = undefined
    if (discountPrice && discountPrice.trim() !== "") {
      discountInr = Math.round(parseFloat(discountPrice) * 100) / 100
      if (isNaN(discountInr) || discountInr < 0) {
        setPricingError("Please enter a valid discount price in INR.")
        setErrorMessage("Please enter a valid discount price in INR.")
        return
      }
      if (discountInr > regularPriceInr) {
        setPricingError(INVALID_PRICING_MSG)
        setErrorMessage(INVALID_PRICING_MSG)
        const el = document.getElementById("pm-pricing-card")
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" })
        return
      }
    }
    setPricingError("")

    const activeStockNumber = parseInt(activeStock || "0", 10)
    if (isNaN(activeStockNumber) || activeStockNumber < 0) {
      setErrorMessage("Please enter a valid Active Stock quantity.")
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
        price: regularPriceInr,
        discountPrice: discountInr ?? null,
        activeStock: activeStockNumber,
        stock: calculatedPassiveStock,
        status,
        primaryImage: primaryItem ? primaryItem.url : "",
        additionalImages: images,
        primaryVideo: videos.length > 0 ? videos[0].url : "",
        additionalVideos: videos,
        reviews,
        howToUse: howToUse.map((s, idx) => ({ ...s, stepNumber: idx + 1 })),
        colors,
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
      const msg = err.message || "An unexpected error occurred while saving."
      setErrorMessage(msg)
      if (/discounted price|regular price|invalid pricing/i.test(msg)) {
        setPricingError(msg)
        const el = document.getElementById("pm-pricing-card")
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" })
      } else if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" })
      }
      setSubmitting(false)
    }
  }

  return (
    <div>
      {/* ── Breadcrumb & Top Bar ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14, marginBottom: 28 }}>
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

              <div className="pm-2col">
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

              <div className="pm-2col">
                <div className="pm-field-group">
                  <label className="pm-label">Model Name / Number</label>
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
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
                      className="pm-video-row"
                    >
                      <div className="pm-video-thumb">
                        <video
                          src={vid.url}
                          poster={vid.thumbnail}
                          controls
                          playsInline
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

            {/* ── Available Colours Section ── */}
            <div className="pm-card" style={{ padding: "28px", marginTop: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 800, color: "#17191C", margin: "0 0 4px" }}>
                    Available Colours ({colors.length})
                  </h2>
                  <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>
                    Add colour variants for this product. Customers can select one on the product page.
                  </p>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: "#F9FAFB",
                  border: "1px solid #E5E7EB",
                  borderRadius: 10,
                  padding: 16,
                  marginBottom: colors.length > 0 ? 18 : 0,
                }}
              >
                {colorFormError && (
                  <div
                    style={{
                      backgroundColor: "#FEF2F2",
                      border: "1px solid #FECACA",
                      color: "#DC2626",
                      padding: "10px 12px",
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      marginBottom: 12,
                    }}
                  >
                    {colorFormError}
                  </div>
                )}

                <div className="pm-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                  <div>
                    <label className="pm-label">Colour Name *</label>
                    <input
                      type="text"
                      value={colorName}
                      onChange={(e) => {
                        setColorName(e.target.value)
                        if (colorFormError) setColorFormError("")
                      }}
                      placeholder="e.g. Matte Black, Pearl White"
                      className="pm-input"
                    />
                  </div>
                  <div>
                    <label className="pm-label">Colour Picker &amp; Hex</label>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <input
                        type="color"
                        value={/^#[0-9a-fA-F]{6}$/.test(colorHex) ? colorHex : "#17191C"}
                        onChange={(e) => setColorHex(e.target.value.toUpperCase())}
                        aria-label="Pick colour"
                        style={{
                          width: 44,
                          height: 40,
                          padding: 2,
                          border: "1px solid #D1D5DB",
                          borderRadius: 8,
                          backgroundColor: "#FFFFFF",
                          cursor: "pointer",
                          flexShrink: 0,
                        }}
                      />
                      <input
                        type="text"
                        value={colorHex}
                        onChange={(e) => {
                          setColorHex(e.target.value)
                          if (colorFormError) setColorFormError("")
                        }}
                        placeholder="#17191C"
                        className="pm-input"
                        style={{ fontFamily: "monospace" }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pm-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                  <div>
                    <label className="pm-label">Availability Status</label>
                    <select
                      value={colorAvailable ? "available" : "unavailable"}
                      onChange={(e) => setColorAvailable(e.target.value === "available")}
                      className="pm-input"
                    >
                      <option value="available">Available</option>
                      <option value="unavailable">Unavailable (Out of Stock / Disabled)</option>
                    </select>
                  </div>
                  <div>
                    <label className="pm-label">Colour Active Stock (Optional)</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={colorStock}
                      onChange={(e) => setColorStock(e.target.value)}
                      placeholder="Leave blank to use product stock"
                      className="pm-input"
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={handleAddOrUpdateColor}
                    className="pm-btn pm-btn-primary"
                    style={{ fontSize: 13 }}
                  >
                    {editingColorId ? "✓ Update Colour" : "+ Add Colour"}
                  </button>
                  {editingColorId && (
                    <button
                      type="button"
                      onClick={resetColorForm}
                      className="pm-btn pm-btn-secondary"
                      style={{ fontSize: 13 }}
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </div>

              {colors.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {colors.map((c) => {
                    const isAvail = c.available !== false && (c.stock == null || c.stock > 0)
                    return (
                      <div
                        key={c.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 12,
                          padding: "12px 14px",
                          backgroundColor: "#FFFFFF",
                          border: "1px solid #E5E7EB",
                          borderRadius: 10,
                          flexWrap: "wrap",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1 }}>
                          <span
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: "50%",
                              backgroundColor: c.hex,
                              border: "2px solid #E5E7EB",
                              boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.08)",
                              flexShrink: 0,
                            }}
                          />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                              <span style={{ fontSize: 14, fontWeight: 700, color: "#17191C" }}>
                                {c.name}
                              </span>
                              <span style={{ fontSize: 12, fontFamily: "monospace", color: "#6B7280" }}>
                                {c.hex.toUpperCase()}
                              </span>
                              <span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  padding: "2px 8px",
                                  borderRadius: 999,
                                  backgroundColor: isAvail ? "#ECFDF5" : "#FEF2F2",
                                  color: isAvail ? "#059669" : "#DC2626",
                                }}
                              >
                                {isAvail ? "Available" : "Unavailable"}
                              </span>
                              {(c.activeStock != null || c.stock != null) && (
                                <>
                                  <span
                                    style={{
                                      fontSize: 11,
                                      fontWeight: 600,
                                      padding: "2px 8px",
                                      borderRadius: 999,
                                      backgroundColor: "#EFF6FF",
                                      color: "#1D4ED8",
                                    }}
                                  >
                                    Active: {c.activeStock ?? c.stock}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: 11,
                                      fontWeight: 600,
                                      padding: "2px 8px",
                                      borderRadius: 999,
                                      backgroundColor: "#F3F4F6",
                                      color: "#374151",
                                    }}
                                  >
                                    Passive: {c.stock ?? c.activeStock}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          <button
                            type="button"
                            onClick={() => toggleColorAvailability(c.id)}
                            className="pm-btn pm-btn-secondary"
                            style={{ padding: "6px 10px", fontSize: 12 }}
                          >
                            {c.available !== false ? "Disable" : "Enable"}
                          </button>
                          <button
                            type="button"
                            onClick={() => startEditColor(c)}
                            className="pm-btn pm-btn-secondary"
                            style={{ padding: "6px 10px", fontSize: 12 }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => removeColor(c.id)}
                            className="pm-btn pm-btn-danger"
                            style={{ padding: "6px 10px", fontSize: 12 }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* ── How to Use Section ── */}
            <div className="pm-card" style={{ padding: "28px", marginTop: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 800, color: "#17191C", margin: "0 0 4px" }}>
                    How to Use ({howToUse.length} {howToUse.length === 1 ? "Step" : "Steps"})
                  </h2>
                  <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>
                    Add numbered usage instructions. Customers will see these steps on the product page.
                  </p>
                </div>
              </div>

              <div style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 10, padding: 18, marginBottom: 20 }}>
                <div className="pm-field-group">
                  <label className="pm-label">Step Title (Optional)</label>
                  <input
                    type="text"
                    className="pm-input"
                    placeholder="e.g. Connect the Power Harness"
                    value={stepTitle}
                    onChange={(e) => setStepTitle(e.target.value)}
                  />
                </div>

                <div className="pm-field-group">
                  <label className="pm-label">
                    Usage Instruction <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <textarea
                    className="pm-textarea"
                    rows={3}
                    placeholder="Describe this step clearly for the customer…"
                    value={stepInstruction}
                    onChange={(e) => setStepInstruction(e.target.value)}
                  />
                </div>

                {stepFormError && (
                  <div style={{ color: "#DC2626", fontSize: 12.5, fontWeight: 600, marginBottom: 12 }}>
                    {stepFormError}
                  </div>
                )}

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    type="button"
                    onClick={handleSaveStep}
                    className="pm-btn pm-btn-primary"
                    style={{ fontSize: 13, padding: "8px 16px" }}
                  >
                    {editingStepId ? "Update Step" : "+ Add Step"}
                  </button>
                  {editingStepId && (
                    <button
                      type="button"
                      onClick={resetStepForm}
                      className="pm-btn pm-btn-secondary"
                      style={{ fontSize: 13, padding: "8px 16px" }}
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </div>

              {howToUse.length > 0 && (
                <div style={{ display: "grid", gap: 12 }}>
                  {howToUse.map((step, idx) => (
                    <div
                      key={step.id}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        flexWrap: "wrap",
                        gap: 14,
                        padding: 14,
                        background: "#FFFFFF",
                        border: "1px solid #E5E7EB",
                        borderRadius: 10,
                      }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          background: "#F36B12",
                          color: "#FFFFFF",
                          fontSize: 13,
                          fontWeight: 800,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: 2,
                        }}
                      >
                        {idx + 1}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        {step.title && (
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#17191C", marginBottom: 4 }}>
                            {step.title}
                          </div>
                        )}
                        <div style={{ fontSize: 13.5, color: "#4B5563", lineHeight: 1.5, whiteSpace: "pre-line" }}>
                          {step.instruction}
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                        <button
                          type="button"
                          onClick={() => moveStep(idx, "up")}
                          disabled={idx === 0}
                          className="pm-btn pm-btn-secondary"
                          style={{ padding: "5px 9px", fontSize: 12 }}
                          title="Move Up"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          onClick={() => moveStep(idx, "down")}
                          disabled={idx === howToUse.length - 1}
                          className="pm-btn pm-btn-secondary"
                          style={{ padding: "5px 9px", fontSize: 12 }}
                          title="Move Down"
                        >
                          ▼
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEditStep(step)}
                          className="pm-btn pm-btn-secondary"
                          style={{ padding: "5px 10px", fontSize: 12 }}
                          title="Edit Step"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteStep(step.id)}
                          className="pm-btn pm-btn-danger"
                          style={{ padding: "5px 9px", fontSize: 12 }}
                          title="Delete Step"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Product Reviews Section ── */}
            <div className="pm-card" style={{ padding: "28px", marginTop: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 800, color: "#17191C", margin: "0 0 4px" }}>
                    Product Reviews ({reviews.length})
                  </h2>
                  <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>
                    Add curated or verified customer reviews to display on the product detail page.
                  </p>
                </div>
                {reviews.length > 0 && (
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#17191C", background: "#FFF4ED", border: "1px solid #FED7AA", padding: "5px 12px", borderRadius: 20 }}>
                    ★ {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)} avg ({reviews.length})
                  </div>
                )}
              </div>

              <div style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 10, padding: 18, marginBottom: 20 }}>
                <div className="pm-2col">
                  <div className="pm-field-group">
                    <label className="pm-label">
                      Reviewer Name <span style={{ color: "#EF4444" }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="pm-input"
                      placeholder="e.g. Rajesh Sharma"
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                    />
                  </div>

                  <div className="pm-field-group">
                    <label className="pm-label">
                      Rating (1–5 Stars) <span style={{ color: "#EF4444" }}>*</span>
                    </label>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, height: 40 }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: 22,
                            lineHeight: 1,
                            padding: "2px 4px",
                            color: star <= reviewRating ? "#F36B12" : "#D1D5DB",
                          }}
                          title={`${star} Star${star > 1 ? "s" : ""}`}
                        >
                          ★
                        </button>
                      ))}
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginLeft: 6 }}>
                        {reviewRating}/5
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pm-field-group">
                  <label className="pm-label">
                    Review Title <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="pm-input"
                    placeholder="e.g. Excellent build quality and durability"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                  />
                </div>

                <div className="pm-field-group">
                  <label className="pm-label">
                    Review Description <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <textarea
                    className="pm-textarea"
                    rows={3}
                    placeholder="Write the detailed product review…"
                    value={reviewDescription}
                    onChange={(e) => setReviewDescription(e.target.value)}
                  />
                </div>

                {reviewFormError && (
                  <div style={{ color: "#DC2626", fontSize: 12.5, fontWeight: 600, marginBottom: 12 }}>
                    {reviewFormError}
                  </div>
                )}

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    type="button"
                    onClick={handleSaveReview}
                    className="pm-btn pm-btn-primary"
                    style={{ fontSize: 13, padding: "8px 16px" }}
                  >
                    {editingReviewId ? "Update Review" : "+ Add Review"}
                  </button>
                  {editingReviewId && (
                    <button
                      type="button"
                      onClick={resetReviewForm}
                      className="pm-btn pm-btn-secondary"
                      style={{ fontSize: 13, padding: "8px 16px" }}
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </div>

              {reviews.length > 0 && (
                <div style={{ display: "grid", gap: 12 }}>
                  {reviews.map((rev) => (
                    <div
                      key={rev.id}
                      style={{
                        padding: 16,
                        background: "#FFFFFF",
                        border: "1px solid #E5E7EB",
                        borderRadius: 10,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 6 }}>
                        <div>
                          <div style={{ color: "#F36B12", fontSize: 14, letterSpacing: 1, marginBottom: 4 }}>
                            {"★".repeat(rev.rating)}
                            <span style={{ color: "#D1D5DB" }}>{"★".repeat(5 - rev.rating)}</span>
                          </div>
                          <div style={{ fontSize: 14.5, fontWeight: 700, color: "#17191C" }}>
                            {rev.title}
                          </div>
                          <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
                            By <strong style={{ color: "#374151" }}>{rev.reviewerName}</strong>
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                          <button
                            type="button"
                            onClick={() => handleEditReview(rev)}
                            className="pm-btn pm-btn-secondary"
                            style={{ padding: "5px 10px", fontSize: 12 }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteReview(rev.id)}
                            className="pm-btn pm-btn-danger"
                            style={{ padding: "5px 9px", fontSize: 12 }}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                      <p style={{ fontSize: 13.5, color: "#4B5563", margin: "8px 0 0", lineHeight: 1.5, whiteSpace: "pre-line" }}>
                        {rev.description}
                      </p>
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
            <div
              id="pm-pricing-card"
              className="pm-card"
              style={{
                padding: "24px",
                marginBottom: 24,
                borderColor: pricingError ? "#DC2626" : undefined,
              }}
            >
              <h2 style={{ fontSize: 15, fontWeight: 800, color: "#17191C", margin: "0 0 16px" }}>
                Pricing & Valuation (INR)
              </h2>

              <div className="pm-field-group">
                <label className="pm-label">
                  Regular Price / MRP (₹) <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="pm-input"
                  placeholder="499"
                  value={price}
                  onChange={(e) => {
                    const nextVal = e.target.value
                    setPrice(nextVal)
                    if (pricingError) {
                      const r = parseFloat(nextVal || "0")
                      const d = parseFloat(discountPrice || "0")
                      if (!discountPrice.trim() || (!isNaN(r) && !isNaN(d) && d <= r)) {
                        setPricingError("")
                        setErrorMessage("")
                      }
                    }
                  }}
                  required
                />
              </div>

              <div className="pm-field-group" style={{ marginBottom: 0 }}>
                <label className="pm-label">Discounted / Sale Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="pm-input"
                  placeholder="399"
                  value={discountPrice}
                  onChange={(e) => {
                    const nextVal = e.target.value
                    setDiscountPrice(nextVal)
                    if (pricingError) {
                      const r = parseFloat(price || "0")
                      const d = parseFloat(nextVal || "0")
                      if (!nextVal.trim() || (!isNaN(r) && !isNaN(d) && d <= r)) {
                        setPricingError("")
                        setErrorMessage("")
                      }
                    }
                  }}
                  style={
                    pricingError
                      ? { borderColor: "#DC2626", background: "#FEF2F2" }
                      : undefined
                  }
                />
                {pricingError ? (
                  <div
                    role="alert"
                    style={{
                      marginTop: 8,
                      padding: "8px 12px",
                      borderRadius: 6,
                      background: "#FEF2F2",
                      border: "1px solid #FCA5A5",
                      color: "#DC2626",
                      fontSize: 12.5,
                      fontWeight: 700,
                    }}
                  >
                    {pricingError}
                  </div>
                ) : (
                  <span style={{ fontSize: 11.5, color: "#6B7280", marginTop: 4, display: "block" }}>
                    Optional sale price in INR. Must be less than or equal to regular price.
                  </span>
                )}
              </div>
            </div>

            {/* Inventory Card */}
            <div className="pm-card" style={{ padding: "24px", marginBottom: 24 }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: "#17191C", margin: "0 0 16px" }}>
                Inventory Management
              </h2>

              <div className="pm-field-group" style={{ marginBottom: 16 }}>
                <label className="pm-label">Active Stock (Physical Inventory)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  className="pm-input"
                  placeholder="100"
                  value={activeStock}
                  onChange={(e) => setActiveStock(e.target.value)}
                  required
                />
                <span style={{ fontSize: 11.5, color: "#6B7280", marginTop: 6, display: "block" }}>
                  Total stock physically maintained by manager. Never overwritten by customer orders.
                </span>
              </div>

              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: 10,
                  background: calculatedPassiveStock <= 0 ? "#FEF2F2" : "#F0FDF4",
                  border: `1px solid ${calculatedPassiveStock <= 0 ? "#FECACA" : "#BBF7D0"}`,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#374151", textTransform: "uppercase" }}>
                    Passive Stock (Available)
                  </span>
                  <span
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      color: calculatedPassiveStock <= 0 ? "#DC2626" : "#059669",
                    }}
                  >
                    {calculatedPassiveStock} units
                  </span>
                </div>
                <div style={{ fontSize: 11.5, color: "#4B5563" }}>
                  Auto-calculated: Active ({isNaN(parsedActiveStock) ? 0 : parsedActiveStock}) − Reserved ({reservedStockQty}) = {calculatedPassiveStock}
                </div>
                {calculatedPassiveStock <= 0 && (
                  <div style={{ fontSize: 11.5, color: "#DC2626", fontWeight: 700, marginTop: 4 }}>
                    ⚠️ Passive stock is 0: Product will show as Out of Stock to customers.
                  </div>
                )}
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
