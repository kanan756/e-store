/**
 * @file lib/sheets.ts
 * @description Google Sheets data layer for the Client Store application.
 *   Acts as the primary database replacement — all Products, Orders, Blogs,
 *   and Inquiries are read from and written to a shared Google Spreadsheet
 *   via the Google Sheets API v4.  The Service Account credentials are loaded
 *   from environment variables at runtime so no secrets ever touch the repo.
 *
 *   Exported functions are grouped by entity:
 *     - Products  : getProducts, getProductByHandle, appendProduct, updateProduct, deleteProduct
 *     - Orders    : appendOrder, getOrdersByEmail, getAllOrders, updateOrderStatus
 *     - Blogs     : getBlogs, getBlogBySlug, appendBlog, deleteBlog, updateBlogPublished
 *     - Inquiries : appendInquiry, getAllInquiries, updateInquiryStatus
 *
 * @owner Heet-P
 * @lastModified May 16, 2026
 */

import { google } from "googleapis"

// ── Auth ──────────────────────────────────────────────────────────────────────
function getAuth() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n")
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: privateKey,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  })
}

const SHEET_ID = process.env.GOOGLE_SHEET_ID!

// ── Types ─────────────────────────────────────────────────────────────────────
export interface Product {
  rowIndex?: number
  id: string
  name: string
  category: string
  description: string
  imageUrl: string
  price: number
  handle: string
}

export interface Order {
  rowIndex?: number
  orderId: string
  customerName: string
  email: string
  product: string
  amount: number
  status: string
  comments: string
  updatedBy: string
}

export interface Blog {
  rowIndex?: number
  title: string
  keywords: string
  slug: string
  publishDate: string
  content: string
  metaDescription: string
  imageUrl: string
  published: boolean
}

export interface Inquiry {
  rowIndex?: number
  id: string
  name: string
  email: string
  subject: string
  message: string
  submittedAt: string
  status: string
}

// ── Products ──────────────────────────────────────────────────────────────────
export async function getProducts(): Promise<Product[]> {
  const auth = getAuth()
  const sheets = google.sheets({ version: "v4", auth })

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "Products!A2:G",
  })

  const rows = res.data.values ?? []
  return rows
    .map((r, i) => ({
      rowIndex: i + 2,
      id: String(i + 1),
      name: r[0] ?? "",
      category: r[1] ?? "",
      description: r[2] ?? "",
      imageUrl: r[3] ?? "",
      price: Number(r[4]) || 0,
      handle: r[5] ?? slugify(r[0] ?? ""),
    }))
    .filter((p) => p.name !== "") // skip empty rows
}

export async function getProductByHandle(handle: string): Promise<Product | null> {
  const products = await getProducts()
  return products.find((p) => p.handle === handle) ?? null
}

// ── Orders ────────────────────────────────────────────────────────────────────
export async function appendOrder(order: {
  customerName: string
  email: string
  product: string
  amount: number
  paymentId: string
}): Promise<string> {
  const auth = getAuth()
  const sheets = google.sheets({ version: "v4", auth })

  const orderId = `ORD-${Date.now()}`
  const now = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: "Orders!A:H",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[
        orderId,
        order.customerName,
        order.email,
        order.product,
        order.amount,
        "Processing",           // default status
        `Payment ID: ${order.paymentId}`,
        `System (${now})`,
      ]],
    },
  })

  return orderId
}

export async function getOrdersByEmail(email: string): Promise<Order[]> {
  const auth = getAuth()
  const sheets = google.sheets({ version: "v4", auth })

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "Orders!A2:H",
  })

  const rows = res.data.values ?? []
  return rows
    .filter((r) => r[2]?.toLowerCase() === email.toLowerCase())
    .map((r) => ({
      orderId: r[0] ?? "",
      customerName: r[1] ?? "",
      email: r[2] ?? "",
      product: r[3] ?? "",
      amount: Number(r[4]) || 0,
      status: r[5] ?? "Processing",
      comments: r[6] ?? "",
      updatedBy: r[7] ?? "",
    }))
}

export async function getOrderByPaymentId(paymentId: string): Promise<Order | null> {
  const orders = await getAllOrders()
  return orders.find(o => o.comments.includes(paymentId)) ?? null
}

// ── Blogs ─────────────────────────────────────────────────────────────────────
export async function getBlogs(publishedOnly = false): Promise<Blog[]> {
  const auth = getAuth()
  const sheets = google.sheets({ version: "v4", auth })

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "Blogs!A2:H",
  })

  const rows = res.data.values ?? []
  return rows
    .map((r, i) => ({
      rowIndex: i + 2,
      title: r[0] ?? "",
      keywords: r[1] ?? "",
      slug: r[2] ?? slugify(r[0] ?? ""),
      publishDate: r[3] ?? "",
      content: r[4] ?? "",
      metaDescription: r[5] ?? "",
      imageUrl: r[6] ?? "",
      published: (r[7] ?? "true").toLowerCase() !== "false",
    }))
    .filter((b) => b.title !== "")
    .filter((b) => !publishedOnly || b.published)
}

export async function getBlogBySlug(slug: string): Promise<Blog | null> {
  const blogs = await getBlogs()
  return blogs.find((b) => b.slug === slug) ?? null
}

// ── Admin: Products CRUD ──────────────────────────────────────────────────────
export async function appendProduct(product: Omit<Product, "id">): Promise<void> {
  const auth = getAuth()
  const sheets = google.sheets({ version: "v4", auth })
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: "Products!A:F",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[
        product.name,
        product.category,
        product.description,
        product.imageUrl,
        product.price,
        product.handle || slugify(product.name),
      ]],
    },
  })
}

export async function updateProduct(rowIndex: number, product: Omit<Product, "id">): Promise<void> {
  const auth = getAuth()
  const sheets = google.sheets({ version: "v4", auth })
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `Products!A${rowIndex}:F${rowIndex}`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[
        product.name,
        product.category,
        product.description,
        product.imageUrl,
        product.price,
        product.handle || slugify(product.name),
      ]],
    },
  })
}

export async function deleteProduct(rowIndex: number): Promise<void> {
  const auth = getAuth()
  const sheets = google.sheets({ version: "v4", auth })

  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: SHEET_ID,
  })
  
  const sheet = spreadsheet.data.sheets?.find(s => s.properties?.title === "Products")
  const sheetId = sheet?.properties?.sheetId
  
  if (sheetId === undefined) throw new Error("Products sheet not found")

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: sheetId,
              dimension: "ROWS",
              startIndex: rowIndex - 1,
              endIndex: rowIndex,
            }
          }
        }
      ]
    }
  })
}

// ── Admin: Orders ─────────────────────────────────────────────────────────────
export async function getAllOrders(): Promise<(Order & { rowIndex: number })[]> {
  const auth = getAuth()
  const sheets = google.sheets({ version: "v4", auth })
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "Orders!A2:H",
  })
  const rows = res.data.values ?? []
  return rows
    .filter((r) => r[0])
    .map((r, i) => ({
      rowIndex: i + 2, // actual sheet row
      orderId: r[0] ?? "",
      customerName: r[1] ?? "",
      email: r[2] ?? "",
      product: r[3] ?? "",
      amount: Number(r[4]) || 0,
      status: r[5] ?? "Processing",
      comments: r[6] ?? "",
      updatedBy: r[7] ?? "",
    }))
}

export async function updateOrderStatus(rowIndex: number, status: string, comments: string): Promise<void> {
  const auth = getAuth()
  const sheets = google.sheets({ version: "v4", auth })
  const now = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `Orders!F${rowIndex}:H${rowIndex}`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[status, comments, `Admin (${now})`]],
    },
  })
}

// ── Admin: Blogs CRUD ─────────────────────────────────────────────────────────
export async function appendBlog(blog: Blog): Promise<void> {
  const auth = getAuth()
  const sheets = google.sheets({ version: "v4", auth })
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: "Blogs!A:H",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[
        blog.title,
        blog.keywords,
        blog.slug || slugify(blog.title),
        blog.publishDate || new Date().toISOString().split("T")[0],
        blog.content,
        blog.metaDescription,
        blog.imageUrl ?? "",
        blog.published !== false ? "true" : "false",
      ]],
    },
  })
}

export async function deleteBlog(rowIndex: number): Promise<void> {
  const auth = getAuth()
  const sheets = google.sheets({ version: "v4", auth })

  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: SHEET_ID,
  })
  
  const sheet = spreadsheet.data.sheets?.find(s => s.properties?.title === "Blogs")
  const sheetId = sheet?.properties?.sheetId
  
  if (sheetId === undefined) throw new Error("Blogs sheet not found")

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: sheetId,
              dimension: "ROWS",
              startIndex: rowIndex - 1,
              endIndex: rowIndex,
            }
          }
        }
      ]
    }
  })
}

export async function updateBlogPublished(rowIndex: number, published: boolean): Promise<void> {
  const auth = getAuth()
  const sheets = google.sheets({ version: "v4", auth })
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `Blogs!H${rowIndex}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [[published ? "true" : "false"]] },
  })
}

// ── Inquiries ───────────────────────────────────────────────────────────────
export async function appendInquiry(inq: Omit<Inquiry, "id" | "submittedAt" | "status">): Promise<void> {
  const auth = getAuth()
  const sheets = google.sheets({ version: "v4", auth })
  const now = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: "Inquiries!A:F",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[
        `INQ-${Date.now()}`,
        inq.name,
        inq.email,
        inq.subject,
        inq.message,
        now,
        "New",
      ]],
    },
  })
}

export async function getAllInquiries(): Promise<(Inquiry & { rowIndex: number })[]> {
  const auth = getAuth()
  const sheets = google.sheets({ version: "v4", auth })
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "Inquiries!A2:G",
  })
  const rows = res.data.values ?? []
  return rows
    .map((r, i) => ({
      rowIndex: i + 2,
      id: r[0] ?? "",
      name: r[1] ?? "",
      email: r[2] ?? "",
      subject: r[3] ?? "",
      message: r[4] ?? "",
      submittedAt: r[5] ?? "",
      status: r[6] ?? "New",
    }))
    .filter((r) => r.id !== "")
}

export async function updateInquiryStatus(rowIndex: number, status: string): Promise<void> {
  const auth = getAuth()
  const sheets = google.sheets({ version: "v4", auth })
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `Inquiries!G${rowIndex}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [[status]] },
  })
}

// ── Util ──────────────────────────────────────────────────────────────────────
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}
