/**
 * @file app/admin/dashboard/page.tsx
 * @description Password-protected Admin Dashboard — Client Component.
 *   Provides a full management interface for the Client Store, split into
 *   five sidebar-navigated tabs:
 *
 *   1. Overview     – KPI cards: total products, orders, and revenue.
 *   2. Products     – Add / Edit / Delete products (writes to Google Sheets).
 *   3. Orders       – View all orders, update shipment status & tracking notes,
 *                     toggle customer email notifications per update.
 *   4. Blog Posts   – Add blog entries with title, keywords, slug, cover image,
 *                     publish date, content, and Published/Draft toggle.
 *   5. Inquiries    – View contact form submissions, expand messages,
 *                     update inquiry status (New → In Progress → Replied → Closed).
 *
 *   Auth: Reads `admin_session` cookie set by /api/admin/auth.
 *   If the session cookie is missing, redirect to /admin login page.
 *
 * @owner Heet-P
 * @lastModified May 16, 2026
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import type { Product, Order, Blog, Inquiry } from "@/lib/sheets"

// ── Styles ────────────────────────────────────────────────────────────────────
const s = {
  page: {
    minHeight: "100vh",
    background: "#f8f9fa",
    fontFamily: "'Inter', system-ui, sans-serif",
    color: "#1c1c18",
  } as React.CSSProperties,
  sidebar: {
    width: 240,
    background: "#ffffff",
    borderRight: "1px solid #e9ecef",
    position: "fixed" as const,
    top: 0, left: 0, bottom: 0,
    display: "flex", flexDirection: "column" as const,
    zIndex: 10,
  },
  main: {
    marginLeft: 240,
    padding: "32px 40px",
    minHeight: "100vh",
  } as React.CSSProperties,
  card: {
    background: "#e9ecef",
    border: "1px solid #e9ecef",
    borderRadius: 16,
    padding: 24,
  } as React.CSSProperties,
  btn: {
    padding: "9px 18px", borderRadius: 8, border: "none",
    cursor: "pointer", fontSize: 13, fontWeight: 600,
  } as React.CSSProperties,
  input: {
    width: "100%", boxSizing: "border-box" as const,
    padding: "10px 14px", background: "#f8f9fa",
    border: "1px solid rgba(0,0,0,0.15)", borderRadius: 8,
    color: "#1c1c18", fontSize: 14, outline: "none",
  } as React.CSSProperties,
  label: {
    display: "block", color: "#434844", fontSize: 12,
    fontWeight: 600, marginBottom: 6, textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
  } as React.CSSProperties,
}

function formatPrice(rs: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(rs)
}

// ── Nav Item ──────────────────────────────────────────────────────────────────
function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 20px", background: active ? "rgba(0,0,0,0.12)" : "transparent",
        border: "none", borderLeft: active ? "3px solid #111111" : "3px solid transparent",
        color: active ? "#111111" : "#434844", cursor: "pointer",
        fontSize: 14, fontWeight: active ? 700 : 500, width: "100%", textAlign: "left",
        transition: "all 0.15s",
      }}
    >
      <span style={{ opacity: active ? 1 : 0.7 }}>{icon}</span> {label}
    </button>
  )
}

// ── Product Form ──────────────────────────────────────────────────────────────
function ProductForm({
  initial, rowIndex, onSave, onCancel,
}: {
  initial?: Partial<Product>
  rowIndex?: number
  onSave: () => void
  onCancel: () => void
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    category: initial?.category ?? "",
    description: initial?.description ?? "",
    imageUrl: initial?.imageUrl ?? "",
    price: initial?.price ?? 0,
    handle: initial?.handle ?? "",
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: field === "price" ? Number(e.target.value) : e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/admin/products", {
        method: rowIndex !== undefined ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rowIndex !== undefined ? { rowIndex, ...form } : form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onSave()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save")
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <label style={s.label}>Product Name *</label>
          <input style={s.input} value={form.name} onChange={set("name")} required placeholder="Winter Jacket" />
        </div>
        <div>
          <label style={s.label}>Category</label>
          <input style={s.input} value={form.category} onChange={set("category")} placeholder="Apparel" />
        </div>
      </div>
      <div>
        <label style={s.label}>Description</label>
        <textarea
          value={form.description} onChange={set("description")} placeholder="Product description..."
          style={{ ...s.input, minHeight: 80, resize: "vertical" }}
        />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <label style={s.label}>Image URL</label>
          <input style={s.input} value={form.imageUrl} onChange={set("imageUrl")} placeholder="https://..." />
        </div>
        <div>
          <label style={s.label}>Price (in Rs — e.g. 600 for ₹600)</label>
          <input style={s.input} type="number" value={form.price} onChange={set("price")} min="0" placeholder="600" />
        </div>
      </div>
      <div>
        <label style={s.label}>Handle (URL slug — auto-generated if empty)</label>
        <input style={s.input} value={form.handle} onChange={set("handle")} placeholder="winter-jacket" />
      </div>
      {error && <div style={{ color: "#ef4444", fontSize: 13, padding: "8px 12px", background: "rgba(239,68,68,0.1)", borderRadius: 8 }}>{error}</div>}
      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
        <button type="button" onClick={onCancel} style={{ ...s.btn, background: "#f8f9fa", color: "#434844" }}>Cancel</button>
        <button type="submit" disabled={saving} style={{ ...s.btn, background: "#111111", color: "#ffffff", opacity: saving ? 0.7 : 1 }}>
          {saving ? "Saving…" : rowIndex !== undefined ? "Update Product" : "Add Product"}
        </button>
      </div>
    </form>
  )
}

// ── Products Tab ──────────────────────────────────────────────────────────────
function ProductsTab() {
  const [products, setProducts] = useState<(Product & { rowIndex: number })[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<(Product & { rowIndex: number }) | null>(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const res = await fetch("/api/admin/products")
    const data = await res.json()
    setProducts(data.products ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const handleDelete = async (rowIndex: number, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    await fetch("/api/admin/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rowIndex }),
    })
    fetchProducts()
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Products</h2>
        <button onClick={() => { setShowForm(true); setEditing(null) }}
          style={{ ...s.btn, background: "#111111", color: "#ffffff" }}>+ Add Product</button>
      </div>

      {(showForm || editing) && (
        <div style={{ ...s.card, marginBottom: 24 }}>
          <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700 }}>{editing ? "Edit Product" : "New Product"}</h3>
          <ProductForm
            initial={editing ?? undefined}
            rowIndex={editing?.rowIndex}
            onSave={() => { setShowForm(false); setEditing(null); fetchProducts() }}
            onCancel={() => { setShowForm(false); setEditing(null) }}
          />
        </div>
      )}

      <div style={s.card}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "#666" }}>Loading products…</div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "#666" }}>No products yet. Click &quot;Add Product&quot; to get started.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e9ecef" }}>
                {["Name", "Category", "Price", "Handle", "Actions"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 12px", color: "#434844", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...products].reverse().map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid #e9ecef" }}>
                  <td style={{ padding: "14px 12px", fontWeight: 600 }}>{p.name}</td>
                  <td style={{ padding: "14px 12px", color: "#434844" }}>{p.category || "—"}</td>
                  <td style={{ padding: "14px 12px", color: "#111111" }}>{p.price > 0 ? formatPrice(p.price) : "—"}</td>
                  <td style={{ padding: "14px 12px", color: "#666", fontFamily: "monospace", fontSize: 12 }}>{p.handle}</td>
                  <td style={{ padding: "14px 12px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => setEditing(p)} style={{ ...s.btn, background: "#f8f9fa", color: "#434844", padding: "6px 12px" }}>Edit</button>
                      <button onClick={() => handleDelete(p.rowIndex, p.name)} style={{ ...s.btn, background: "rgba(239,68,68,0.1)", color: "#ef4444", padding: "6px 12px" }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ── Orders Tab ────────────────────────────────────────────────────────────────
const ORDER_STATUSES = ["Processing", "Packed", "Shipped", "In Transit", "Delivered", "Cancelled"]

function OrdersTab() {
  const [orders, setOrders] = useState<(Order & { rowIndex: number })[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<(Order & { rowIndex: number }) | null>(null)
  const [editStatus, setEditStatus] = useState("")
  const [editComments, setEditComments] = useState("")
  const [saving, setSaving] = useState(false)

  const [sendEmail, setSendEmail] = useState(true)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    const res = await fetch("/api/admin/orders")
    const data = await res.json()
    setOrders(data.orders ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const startEdit = (order: Order & { rowIndex: number }) => {
    setEditing(order)
    setEditStatus(order.status)
    setEditComments(order.comments)
    setSendEmail(true) // default to notifying customer
  }

  const saveOrder = async () => {
    if (!editing) return
    setSaving(true)
    const res = await fetch("/api/admin/orders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rowIndex: editing.rowIndex, status: editStatus, comments: editComments, sendEmail }),
    })
    const data = await res.json()
    setSaving(false)
    setEditing(null)
    if (data.emailSent) alert(`✅ Status updated & email sent to ${editing.email}`)
    else if (sendEmail) alert("⚠️ Status updated, but email could not be sent. Check Gmail credentials in .env.local.")
    fetchOrders()
  }

  const statusColor: Record<string, string> = {
    Processing: "#f59e0b", Packed: "#8b5cf6", Shipped: "#2563eb",
    "In Transit": "#0891b2", Delivered: "#16a34a", Cancelled: "#ef4444",
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Orders</h2>
        <button onClick={fetchOrders} style={{ ...s.btn, background: "#f8f9fa", color: "#434844" }}>↻ Refresh</button>
      </div>

      {editing && (
        <div style={{ ...s.card, marginBottom: 24 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>Update Order — {editing.orderId}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={s.label}>Status</label>
              <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} style={{ ...s.input }}>
                {ORDER_STATUSES.map((st) => <option key={st} value={st}>{st}</option>)}
              </select>
            </div>
            <div>
              <label style={s.label}>Comment / Tracking Note</label>
              <input style={s.input} value={editComments} onChange={(e) => setEditComments(e.target.value)} placeholder="e.g. Dispatched via DTDC, tracking #123..." />
            </div>
          </div>
          {/* Email toggle */}
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", marginBottom: 16, color: "#434844", fontSize: 14 }}>
            <input
              type="checkbox"
              checked={sendEmail}
              onChange={(e) => setSendEmail(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: "#111111" }}
            />
            <span>📧 Send status update email to <strong style={{ color: "#111111" }}>{editing.email}</strong></span>
          </label>
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button onClick={() => setEditing(null)} style={{ ...s.btn, background: "#f8f9fa", color: "#434844" }}>Cancel</button>
            <button onClick={saveOrder} disabled={saving} style={{ ...s.btn, background: "#111111", color: "#ffffff" }}>
              {saving ? "Saving…" : "Update Status"}
            </button>
          </div>
        </div>
      )}

      <div style={s.card}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "#666" }}>Loading orders…</div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "#666" }}>No orders yet.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e9ecef" }}>
                {["Order ID", "Customer", "Product", "Amount", "Status", "Actions"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 12px", color: "#434844", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...orders].reverse().map((o) => (
                <tr key={o.orderId} style={{ borderBottom: "1px solid #e9ecef" }}>
                  <td style={{ padding: "14px 12px", fontFamily: "monospace", fontSize: 12, color: "#111111" }}>{o.orderId}</td>
                  <td style={{ padding: "14px 12px" }}>
                    <div style={{ fontWeight: 600 }}>{o.customerName}</div>
                    <div style={{ fontSize: 12, color: "#666" }}>{o.email}</div>
                  </td>
                  <td style={{ padding: "14px 12px", color: "#434844", fontSize: 13, maxWidth: 200 }}>{o.product}</td>
                  <td style={{ padding: "14px 12px", fontWeight: 700 }}>{o.amount > 0 ? formatPrice(o.amount) : "—"}</td>
                  <td style={{ padding: "14px 12px" }}>
                    <span style={{
                      padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                      background: `${statusColor[o.status] ?? "#888"}20`,
                      color: statusColor[o.status] ?? "#888",
                    }}>{o.status}</span>
                  </td>
                  <td style={{ padding: "14px 12px" }}>
                    <button onClick={() => startEdit(o)} style={{ ...s.btn, background: "#f8f9fa", color: "#434844", padding: "6px 12px" }}>
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ── Blogs Tab ─────────────────────────────────────────────────────────────────
function BlogsTab() {
  const [blogs, setBlogs] = useState<(Blog & { rowIndex: number })[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: "", keywords: "", slug: "", publishDate: "", content: "", metaDescription: "", imageUrl: "", published: true })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  const fetchBlogs = useCallback(async () => {
    setLoading(true)
    const res = await fetch("/api/admin/blogs")
    const data = await res.json()
    setBlogs(data.blogs ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchBlogs() }, [fetchBlogs])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setError("")
    try {
      const res = await fetch("/api/admin/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setShowForm(false)
      setForm({ title: "", keywords: "", slug: "", publishDate: "", content: "", metaDescription: "", imageUrl: "", published: true })
      fetchBlogs()
    } catch (err) { setError(err instanceof Error ? err.message : "Failed"); setSaving(false) }
  }

  const handleDelete = async (rowIndex: number, title: string) => {
    if (!confirm(`Delete blog "${title}"?`)) return
    await fetch("/api/admin/blogs", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rowIndex }) })
    fetchBlogs()
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Blog Posts</h2>
        <button onClick={() => setShowForm(true)} style={{ ...s.btn, background: "#111111", color: "#ffffff" }}>+ New Blog Post</button>
      </div>

      {showForm && (
        <div style={{ ...s.card, marginBottom: 24 }}>
          <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700 }}>New Blog Post</h3>
          <form onSubmit={handleAdd} style={{ display: "grid", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={s.label}>Title *</label>
                <input style={s.input} value={form.title} onChange={set("title")} required placeholder="5 Ways to..." />
              </div>
              <div>
                <label style={s.label}>Slug (auto if empty)</label>
                <input style={s.input} value={form.slug} onChange={set("slug")} placeholder="5-ways-to..." />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={s.label}>Keywords (comma-separated)</label>
                <input style={s.input} value={form.keywords} onChange={set("keywords")} placeholder="seo, product, tips" />
              </div>
              <div>
                <label style={s.label}>Publish Date</label>
                <input style={s.input} type="date" value={form.publishDate} onChange={set("publishDate")} />
              </div>
            </div>
            <div>
              <label style={s.label}>Image URL (optional)</label>
              <input style={s.input} value={form.imageUrl} onChange={set("imageUrl")} placeholder="https://... (cover image)" />
            </div>
            <div>
              <label style={s.label}>Meta Description</label>
              <input style={s.input} value={form.metaDescription} onChange={set("metaDescription")} placeholder="Short summary for search engines..." />
            </div>
            <div>
              <label style={s.label}>Content</label>
              <textarea value={form.content} onChange={set("content")} placeholder="Blog content here..." style={{ ...s.input, minHeight: 120, resize: "vertical" }} />
            </div>
            {error && <div style={{ color: "#ef4444", fontSize: 13, padding: "8px 12px", background: "rgba(239,68,68,0.1)", borderRadius: 8 }}>{error}</div>}
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button type="button" onClick={() => setShowForm(false)} style={{ ...s.btn, background: "#f8f9fa", color: "#434844" }}>Cancel</button>
              <button type="submit" disabled={saving} style={{ ...s.btn, background: "#111111", color: "#ffffff" }}>{saving ? "Saving…" : "Publish Blog"}</button>
            </div>
          </form>
        </div>
      )}

      <div style={s.card}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "#666" }}>Loading blogs…</div>
        ) : blogs.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "#666" }}>No blog posts yet. Click &quot;New Blog Post&quot; to start.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e9ecef" }}>
                {["Title", "Slug", "Publish Date", "Keywords", "Status", "Actions"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 12px", color: "#434844", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...blogs].reverse().map((b) => (
                <tr key={b.slug + b.rowIndex} style={{ borderBottom: "1px solid #e9ecef" }}>
                  <td style={{ padding: "14px 12px", fontWeight: 600 }}>{b.title}</td>
                  <td style={{ padding: "14px 12px", color: "#666", fontFamily: "monospace", fontSize: 12 }}>{b.slug}</td>
                  <td style={{ padding: "14px 12px", color: "#434844" }}>{b.publishDate || "—"}</td>
                  <td style={{ padding: "14px 12px", color: "#434844", fontSize: 12 }}>{b.keywords || "—"}</td>
                  <td style={{ padding: "14px 12px" }}>
                    <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                      background: b.published ? "rgba(0,0,0,0.15)" : "rgba(136,136,136,0.12)",
                      color: b.published ? "#111111" : "#888",
                    }}>{b.published ? "Published" : "Draft"}</span>
                  </td>
                  <td style={{ padding: "14px 12px" }}>
                    <button onClick={() => handleDelete(b.rowIndex, b.title)} style={{ ...s.btn, background: "rgba(239,68,68,0.1)", color: "#ef4444", padding: "6px 12px" }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ── Inquiries Tab ───────────────────────────────────────────────────────────────
const INQ_STATUSES = ["New", "In Progress", "Replied", "Closed"]
const INQ_COLORS: Record<string, string> = {
  New: "#f59e0b", "In Progress": "#2563eb", Replied: "#16a34a", Closed: "#888",
}

function InquiriesTab() {
  const [inquiries, setInquiries] = useState<(Inquiry & { rowIndex: number })[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  const fetchInquiries = useCallback(async () => {
    setLoading(true)
    const res = await fetch("/api/admin/inquiries")
    const data = await res.json()
    setInquiries(data.inquiries ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchInquiries() }, [fetchInquiries])

  const updateStatus = async (rowIndex: number, status: string) => {
    await fetch("/api/admin/inquiries", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rowIndex, status }),
    })
    fetchInquiries()
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Inquiries</h2>
        <button onClick={fetchInquiries} style={{ ...s.btn, background: "#f8f9fa", color: "#434844" }}>↻ Refresh</button>
      </div>
      <div style={s.card}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "#666" }}>Loading inquiries…</div>
        ) : inquiries.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "#666" }}>No inquiries yet.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[...inquiries].reverse().map((inq) => (
              <div key={inq.id} style={{
                border: `1px solid ${expanded === inq.id ? "rgba(0,0,0,0.2)" : "#e9ecef"}`,
                borderRadius: 12, overflow: "hidden",
              }}>
                <div
                  onClick={() => setExpanded(expanded === inq.id ? null : inq.id)}
                  style={{ padding: "16px 20px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}
                >
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>{inq.subject}</div>
                    <div style={{ fontSize: 13, color: "#434844" }}>
                      {inq.name} &bull; <a href={`mailto:${inq.email}`} style={{ color: "#111111" }}>{inq.email}</a>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                    <span style={{
                      padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                      background: `${INQ_COLORS[inq.status] ?? "#888"}20`,
                      color: INQ_COLORS[inq.status] ?? "#888",
                    }}>{inq.status}</span>
                    <span style={{ color: "#555", fontSize: 16 }}>{expanded === inq.id ? "▲" : "▼"}</span>
                  </div>
                </div>
                {expanded === inq.id && (
                  <div style={{ padding: "0 20px 20px", borderTop: "1px solid #e9ecef" }}>
                    <div style={{ padding: "14px 16px", background: "#f8f9fa", borderRadius: 10, margin: "16px 0", lineHeight: 1.7, color: "#434844", fontSize: 14 }}>
                      {inq.message}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <label style={{ ...s.label, margin: 0 }}>Status:</label>
                      <select
                        value={inq.status}
                        onChange={(e) => updateStatus(inq.rowIndex, e.target.value)}
                        style={{ ...s.input, width: "auto", padding: "6px 12px" }}
                      >
                        {INQ_STATUSES.map((st) => <option key={st}>{st}</option>)}
                      </select>
                      <span style={{ fontSize: 12, color: "#555", marginLeft: 8 }}>{inq.submittedAt}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Stats Cards ───────────────────────────────────────────────────────────────
function StatsTab({ orders: recentOrders }: { orders: Order[] }) {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0 })
  const [latestOrders, setLatestOrders] = useState<Order[]>(recentOrders)

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/products").then((r) => r.json()),
      fetch("/api/admin/orders").then((r) => r.json()),
    ]).then(([pd, od]) => {
      const orders: Order[] = od.orders ?? []
      setLatestOrders(orders.slice(-5).reverse())
      setStats({
        products: pd.products?.length ?? 0,
        orders: orders.length,
        revenue: orders.reduce((sum: number, o: Order) => sum + o.amount, 0),
      })
    })
  }, [])

  const STATUS_COLOR: Record<string, string> = {
    Processing: "#f59e0b", Packed: "#8b5cf6", Shipped: "#2563eb",
    "In Transit": "#0891b2", Delivered: "#16a34a", Cancelled: "#ef4444",
  }

  const kpis = [
    {
      label: "TOTAL PRODUCTS",
      value: stats.products,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        </svg>
      ),
    },
    {
      label: "ORDERS PROCESSED",
      value: stats.orders,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
          <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
          <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
        </svg>
      ),
    },
    {
      label: "TOTAL REVENUE",
      value: stats.revenue > 0 ? formatPrice(stats.revenue) : "₹0",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
          <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      ),
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, fontFamily: "monospace", letterSpacing: "0.12em", color: "#111111", marginBottom: 12, textTransform: "uppercase" }}>OVERVIEW</div>
        <h2 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#111111" }}>Dashboard</h2>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 32 }}>
        {kpis.map((c) => (
          <div key={c.label} style={{
            ...s.card,
            display: "flex", flexDirection: "column", gap: 16,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ fontSize: 11, fontFamily: "monospace", letterSpacing: "0.1em", color: "#434844", textTransform: "uppercase" }}>{c.label}</div>
              <div style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: "rgba(0,0,0,0.1)", border: "1px solid rgba(0,0,0,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{c.icon}</div>
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: "#111111", letterSpacing: "-0.02em" }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div style={{ ...s.card }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#111111" }}>Recent Orders</h3>
          <span style={{ fontSize: 12, color: "#111111", fontFamily: "monospace", letterSpacing: "0.05em", cursor: "default" }}>VIEW ALL IN ORDERS TAB →</span>
        </div>
        {latestOrders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "#434844" }}>No orders yet.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e9ecef" }}>
                {["ORDER ID", "CUSTOMER", "PRODUCT", "AMOUNT", "STATUS"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 14px", color: "#434844", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "monospace" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...latestOrders].reverse().map((o, i) => (
                <tr key={o.orderId + i} style={{ borderBottom: "1px solid #e9ecef" }}>
                  <td style={{ padding: "14px", fontFamily: "monospace", fontSize: 13, color: "#111111", fontWeight: 700 }}>{o.orderId}</td>
                  <td style={{ padding: "14px", fontSize: 14, color: "#1c1c18" }}>{o.customerName}</td>
                  <td style={{ padding: "14px", fontSize: 13, color: "#b0ada6", fontStyle: "italic", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.product}</td>
                  <td style={{ padding: "14px", fontSize: 14, fontWeight: 700, color: "#111111" }}>{o.amount > 0 ? formatPrice(o.amount) : "—"}</td>
                  <td style={{ padding: "14px" }}>
                    <span style={{
                      padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                      background: `${STATUS_COLOR[o.status] ?? "#434844"}18`,
                      color: STATUS_COLOR[o.status] ?? "#434844",
                      border: `1px solid ${STATUS_COLOR[o.status] ?? "#434844"}33`,
                    }}>{o.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [tab, setTab] = useState<"overview" | "products" | "orders" | "blogs" | "inquiries">("overview")
  const router = useRouter()

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" })
    router.push("/admin")
  }

  return (
    <div style={s.page}>
      {/* Sidebar */}
      <aside style={s.sidebar}>
        <div style={{ padding: "24px 20px 16px", borderBottom: "1px solid #e9ecef" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
              background: "rgba(0,0,0,0.15)", border: "1px solid rgba(0,0,0,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#111111", letterSpacing: "-0.01em" }}>Admin Panel</div>
              <div style={{ fontSize: 11, color: "#434844", marginTop: 1, fontFamily: "monospace" }}>SHA · Management</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: "12px 0" }}>
          <NavItem icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>} label="Overview" active={tab === "overview"} onClick={() => setTab("overview")} />
          <NavItem icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>} label="Products" active={tab === "products"} onClick={() => setTab("products")} />
          <NavItem icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>} label="Orders" active={tab === "orders"} onClick={() => setTab("orders")} />
          <NavItem icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>} label="Blog Posts" active={tab === "blogs"} onClick={() => setTab("blogs")} />
          <NavItem icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>} label="Inquiries" active={tab === "inquiries"} onClick={() => setTab("inquiries")} />
        </nav>

        <div style={{ padding: "16px 20px", borderTop: "1px solid #e9ecef" }}>
          <a href="/" target="_blank" style={{ display: "block", color: "#434844", fontSize: 13, marginBottom: 10, textDecoration: "none" }}>
            ↗ View Store
          </a>
          <button onClick={handleLogout} style={{ ...s.btn, background: "transparent", color: "#ef4444", padding: "8px 0", width: "100%", textAlign: "left" }}>
            ← Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={s.main}>
        {tab === "overview" && <StatsTab orders={[]} />}
        {tab === "products" && <ProductsTab />}
        {tab === "orders" && <OrdersTab />}
        {tab === "blogs" && <BlogsTab />}
        {tab === "inquiries" && <InquiriesTab />}
      </main>
    </div>
  )
}
