/**
 * @file lib/sheets.ts
 * @description Google Sheets data layer for the CLASPO E-Commerce application.
 *   Acts as the primary database — Users, Orders, User Activity, Password Reset,
 *   Products, Blogs, Inquiries, Quotes, and Subscribers are read from and written
 *   to a Google Spreadsheet via the Google Sheets API v4.
 *
 *   Tabs:
 *     - Users          : userId, fullName, username, phoneNumber, email, passwordHash,
 *                        provider, profileImage, emailVerified, createdAt, updatedAt
 *     - Orders         : orderId, userId, orderNumber, customerName, email, phoneNumber,
 *                        shippingAddress, items, subtotal, shippingCharge, discount,
 *                        totalAmount, paymentMethod, paymentStatus, orderStatus,
 *                        transactionId, createdAt, updatedAt
 *     - User Activity  : activityId, userId, activityType, description, createdAt
 *     - Password Reset : resetId, userId, email, tokenHash, expiresAt, used, createdAt
 *     - Products, Blogs, Inquiries, Quotes, Subscribers
 */

import { google } from "googleapis"
import { cache } from "react"
import fs from "fs"
import path from "path"

// ── Rate Limiting / Caching ───────────────────────────────────────────────────
// Google Sheets has a 60 requests per minute quota. This wrapper caches results
// in-memory for TTL duration while consolidating concurrent in-flight requests.
function withTTL<T extends (...args: any[]) => Promise<any>>(fn: T, ttlMs = 60_000): T {
  const cacheMap = new Map<string, { data: any; timestamp: number }>()
  const inflightMap = new Map<string, Promise<any>>()

  return (async (...args: any[]) => {
    const key = JSON.stringify(args)
    const cached = cacheMap.get(key)

    if (cached && Date.now() - cached.timestamp < ttlMs) {
      return cached.data
    }

    const inflight = inflightMap.get(key)
    if (inflight) return inflight

    const promise = fn(...args)
      .then((data) => {
        cacheMap.set(key, { data, timestamp: Date.now() })
        inflightMap.delete(key)
        return data
      })
      .catch((err) => {
        inflightMap.delete(key)
        throw err
      })

    inflightMap.set(key, promise)
    return promise
  }) as any
}

// ── Auth & Sheet ID Helpers ───────────────────────────────────────────────────
let cachedAuth: any = null

export function getAuth() {
  if (cachedAuth) return cachedAuth

  const rawKey = process.env.GOOGLE_PRIVATE_KEY ?? ""
  const privateKey = rawKey
    .replace(/^"|"$/g, "")
    .replace(/\\n/g, "\n")
    .trim()

  cachedAuth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: privateKey,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  })

  return cachedAuth
}

export function getSheetId(): string {
  const raw = process.env.GOOGLE_SHEET_ID ?? ""
  const match = raw.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
  return match ? match[1] : raw.trim()
}

export function isSheetsConfigured(): boolean {
  const sheetId = getSheetId()
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const key = process.env.GOOGLE_PRIVATE_KEY
  return Boolean(sheetId && email && key)
}

// ── Schema Definitions ────────────────────────────────────────────────────────
export const REQUIRED_SHEETS = {
  Users: [
    "userId",
    "fullName",
    "username",
    "phoneNumber",
    "email",
    "passwordHash",
    "provider",
    "profileImage",
    "emailVerified",
    "createdAt",
    "updatedAt",
  ],
  Orders: [
    "orderId",
    "userId",
    "orderNumber",
    "customerName",
    "email",
    "phoneNumber",
    "shippingAddress",
    "items",
    "subtotal",
    "shippingCharge",
    "discount",
    "totalAmount",
    "paymentMethod",
    "paymentStatus",
    "orderStatus",
    "transactionId",
    "createdAt",
    "updatedAt",
  ],
  "User Activity": [
    "activityId",
    "userId",
    "activityType",
    "description",
    "createdAt",
  ],
  "Password Reset": [
    "resetId",
    "userId",
    "email",
    "tokenHash",
    "expiresAt",
    "used",
    "createdAt",
  ],
} as const

export const STORE_SHEETS = {
  Products: [
    "productId",
    "productName",
    "slug",
    "sku",
    "category",
    "shortDescription",
    "description",
    "price",
    "discountPrice",
    "stock",
    "primaryImage",
    "additionalImages",
    "primaryVideo",
    "additionalVideos",
    "status",
    "createdAt",
    "updatedAt",
  ],
  Blogs: [
    "title",
    "keywords",
    "slug",
    "publishDate",
    "content",
    "metaDescription",
    "imageUrl",
    "published",
  ],
  Inquiries: [
    "id",
    "name",
    "email",
    "subject",
    "message",
    "submittedAt",
    "status",
  ],
  Quotes: [
    "id",
    "name",
    "email",
    "phone",
    "company",
    "application",
    "quantity",
    "description",
    "submittedAt",
    "status",
    "hasAttachment",
  ],
  Subscribers: [
    "id",
    "email",
    "source",
    "submittedAt",
    "status",
  ],
} as const

// ── Types ─────────────────────────────────────────────────────────────────────
export interface User {
  rowIndex?: number
  userId: string
  fullName: string
  username: string
  phoneNumber: string
  email: string
  passwordHash: string
  provider: "credentials" | "google"
  profileImage: string
  emailVerified: string
  createdAt: string
  updatedAt: string
}

// Backward compatibility alias for customer references
export type Customer = User

export interface Order {
  rowIndex?: number
  orderId: string
  userId: string
  orderNumber: string
  customerName: string
  email: string
  phoneNumber: string
  shippingAddress: string
  items: string
  product: string // alias for UI compatibility
  subtotal: number
  shippingCharge: number
  discount: number
  totalAmount: number
  amount: number // alias for UI compatibility
  paymentMethod: string
  paymentStatus: string
  orderStatus: string
  status: string // alias for UI compatibility
  transactionId: string
  createdAt: string
  updatedAt: string
  comments?: string
  updatedBy?: string
}

export interface UserActivityRecord {
  rowIndex?: number
  activityId: string
  userId: string
  activityType: string
  description: string
  createdAt: string
}

export interface PasswordResetRecord {
  rowIndex?: number
  resetId: string
  userId: string
  email: string
  tokenHash: string
  expiresAt: string
  used: string
  createdAt: string
}

export interface ProductMediaItem {
  id?: string
  url: string
  publicId?: string
  width?: number
  height?: number
  isPrimary?: boolean
}

export interface ProductVideoItem {
  id?: string
  url: string
  publicId?: string
  thumbnail?: string
  duration?: number
  title?: string
}

export interface Product {
  rowIndex?: number
  id: string              // productId (e.g. prod_...)
  productId?: string       // alias for clarity
  name: string            // productName
  productName?: string     // alias
  slug?: string           // slug
  handle: string          // URL slug (backward compatible)
  sku?: string            // SKU
  partNumber?: string     // alias to sku
  category: string
  shortDescription?: string
  description: string
  price: number           // Regular price
  discountPrice?: number | null  // Discounted price
  stock?: number          // Available inventory count
  inStock: boolean        // Stock status (stock > 0 and status === 'Active')
  imageUrl: string        // Primary image URL (backward compatible)
  primaryImage?: string
  additionalImages?: ProductMediaItem[]
  primaryVideo?: string
  additionalVideos?: ProductVideoItem[]
  status?: "Active" | "Inactive" | string
  createdAt?: string
  updatedAt?: string
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

export interface Quote {
  rowIndex?: number
  id: string
  name: string
  email: string
  phone: string
  company: string
  application: string
  quantity: string
  description: string
  submittedAt: string
  status: string
  hasAttachment?: string
}

export interface Subscriber {
  rowIndex?: number
  id: string
  email: string
  source: string
  submittedAt: string
  status: string
}

export interface VisitorEvent {
  page: string
  referrer: string
  utmSource: string
  utmMedium: string
  utmCampaign: string
}

// ── Database Initialization (Auto-Create Tabs & Headers) ──────────────────────
let dbInitPromise: Promise<void> | null = null

export async function ensureAllSheetsInitialized(): Promise<void> {
  if (dbInitPromise) return dbInitPromise

  dbInitPromise = (async () => {
    if (!isSheetsConfigured()) {
      return
    }

    try {
      const auth = getAuth()
      const sheets = google.sheets({ version: "v4", auth })
      const spreadsheetId = getSheetId()

      const meta = await sheets.spreadsheets.get({ spreadsheetId })
      const existingSheetList = meta.data.sheets ?? []
      const existingTitles = new Set(existingSheetList.map((s) => s.properties?.title ?? ""))

      const allDefinitions: Record<string, readonly string[]> = {
        ...REQUIRED_SHEETS,
        ...STORE_SHEETS,
      }

      const sheetsToCreate: string[] = []
      for (const title of Object.keys(allDefinitions)) {
        if (!existingTitles.has(title)) {
          sheetsToCreate.push(title)
        }
      }

      // Add missing sheets in batch
      if (sheetsToCreate.length > 0) {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: sheetsToCreate.map((title) => ({
              addSheet: { properties: { title } },
            })),
          },
        })
      }

      // Populate header row for each tab if not already present
      for (const [title, columns] of Object.entries(allDefinitions)) {
        const headerRange = `${title}!1:1`
        const headerCheck = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: headerRange,
        })
        const currentHeaders = headerCheck.data.values?.[0] ?? []
        if (currentHeaders.length === 0) {
          await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${title}!A1:${String.fromCharCode(64 + columns.length)}1`,
            valueInputOption: "RAW",
            requestBody: {
              values: [columns as string[]],
            },
          })
        }
      }

      // If default "Sheet1" exists and our main sheets are initialized, remove empty Sheet1
      const sheet1 = existingSheetList.find((s) => s.properties?.title === "Sheet1")
      if (sheet1 && sheet1.properties?.sheetId !== undefined) {
        const sheet1Check = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: "Sheet1!A1:B2",
        })
        const hasData = (sheet1Check.data.values?.length ?? 0) > 0
        if (!hasData && existingSheetList.length > 1) {
          try {
            await sheets.spreadsheets.batchUpdate({
              spreadsheetId,
              requestBody: {
                requests: [{ deleteSheet: { sheetId: sheet1.properties.sheetId } }],
              },
            })
          } catch {
            // Ignore if Sheet1 is the only sheet or cannot be deleted
          }
        }
      }
    } catch (err) {
      console.error("ensureAllSheetsInitialized error:", err)
      dbInitPromise = null
    }
  })()

  return dbInitPromise
}

// ── Local Fallback Stores (used when offline/local without sheets creds) ────────
const LOCAL_USERS_FILE = path.join(process.cwd(), ".users_store.json")
const LOCAL_ORDERS_FILE = path.join(process.cwd(), ".orders_store.json")
const LOCAL_ACTIVITY_FILE = path.join(process.cwd(), ".activity_store.json")
const LOCAL_RESET_FILE = path.join(process.cwd(), ".reset_store.json")

function loadLocalFile<T>(filePath: string): T[] {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8")
      return JSON.parse(data)
    }
  } catch {
    // ignore
  }
  return []
}

function saveLocalFile<T>(filePath: string, data: T[]): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8")
  } catch {
    // ignore
  }
}

// ── Users / Customer Management ───────────────────────────────────────────────
export async function getAllUsers(): Promise<User[]> {
  const localList = loadLocalFile<User>(LOCAL_USERS_FILE)
  if (!isSheetsConfigured()) {
    return localList
  }

  try {
    await ensureAllSheetsInitialized()
    const auth = getAuth()
    const sheets = google.sheets({ version: "v4", auth })
    const spreadsheetId = getSheetId()

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Users!A2:K",
    })

    const rows = res.data.values ?? []
    const sheetUsers: User[] = rows
      .map((r, i) => ({
        rowIndex: i + 2,
        userId: r[0] ?? "",
        fullName: r[1] ?? "",
        username: r[2] ?? "",
        phoneNumber: r[3] ?? "",
        email: (r[4] ?? "").toLowerCase(),
        passwordHash: r[5] ?? "",
        provider: (r[6] ?? "credentials") as "credentials" | "google",
        profileImage: r[7] ?? "",
        emailVerified: r[8] ?? "",
        createdAt: r[9] ?? "",
        updatedAt: r[10] ?? "",
      }))
      .filter((u) => u.userId !== "")

    // Merge any local user not yet synced
    const sheetIds = new Set(sheetUsers.map((u) => u.userId))
    const merged = [...sheetUsers]
    for (const loc of localList) {
      if (!sheetIds.has(loc.userId)) {
        merged.push(loc)
      }
    }
    return merged
  } catch (err) {
    console.error("Error reading Users sheet:", err)
    return localList
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const cleanEmail = email.trim().toLowerCase()
  const users = await getAllUsers()
  return users.find((u) => u.email.toLowerCase() === cleanEmail) || null
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const cleanUsername = username.trim().toLowerCase()
  const users = await getAllUsers()
  return users.find((u) => u.username.toLowerCase() === cleanUsername) || null
}

export async function getUserById(userId: string): Promise<User | null> {
  const users = await getAllUsers()
  return users.find((u) => u.userId === userId) || null
}

export async function appendUser(user: Omit<User, "rowIndex">): Promise<User> {
  const newUser: User = { ...user }
  const localList = loadLocalFile<User>(LOCAL_USERS_FILE)
  localList.push(newUser)
  saveLocalFile(LOCAL_USERS_FILE, localList)

  if (isSheetsConfigured()) {
    try {
      await ensureAllSheetsInitialized()
      const auth = getAuth()
      const sheets = google.sheets({ version: "v4", auth })
      const spreadsheetId = getSheetId()

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: "Users!A:K",
        valueInputOption: "RAW",
        requestBody: {
          values: [
            [
              newUser.userId,
              newUser.fullName,
              newUser.username,
              newUser.phoneNumber,
              newUser.email.toLowerCase(),
              newUser.passwordHash,
              newUser.provider,
              newUser.profileImage || "",
              newUser.emailVerified || "",
              newUser.createdAt,
              newUser.updatedAt,
            ],
          ],
        },
      })
    } catch (err) {
      console.error("Error appending to Users sheet:", err)
    }
  }

  return newUser
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<boolean> {
  let updated = false
  const now = new Date().toISOString()

  const localList = loadLocalFile<User>(LOCAL_USERS_FILE)
  const idx = localList.findIndex((u) => u.userId === userId)
  if (idx !== -1) {
    localList[idx] = { ...localList[idx], ...updates, updatedAt: now }
    saveLocalFile(LOCAL_USERS_FILE, localList)
    updated = true
  }

  if (isSheetsConfigured()) {
    try {
      await ensureAllSheetsInitialized()
      const users = await getAllUsers()
      const target = users.find((u) => u.userId === userId)
      if (target && target.rowIndex) {
        const auth = getAuth()
        const sheets = google.sheets({ version: "v4", auth })
        const spreadsheetId = getSheetId()
        const merged: User = { ...target, ...updates, updatedAt: now }

        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `Users!A${target.rowIndex}:K${target.rowIndex}`,
          valueInputOption: "RAW",
          requestBody: {
            values: [
              [
                merged.userId,
                merged.fullName,
                merged.username,
                merged.phoneNumber,
                merged.email.toLowerCase(),
                merged.passwordHash,
                merged.provider,
                merged.profileImage || "",
                merged.emailVerified || "",
                merged.createdAt,
                merged.updatedAt,
              ],
            ],
          },
        })

        if (idx === -1) {
          localList.push(merged)
          saveLocalFile(LOCAL_USERS_FILE, localList)
        }
        return true
      }
    } catch (err) {
      console.error("Error updating Users sheet:", err)
    }
  }

  return updated
}

// Backward compatibility function aliases for Customer naming
export const getAllCustomers = getAllUsers
export const getCustomerByEmail = getUserByEmail
export const getCustomerByUsername = getUserByUsername
export const getCustomerById = getUserById
export const appendCustomer = appendUser
export const updateCustomer = updateUser

// ── User Activity Logging ─────────────────────────────────────────────────────
export async function logUserActivity(
  userId: string,
  activityType: string,
  description: string
): Promise<UserActivityRecord> {
  const activityId = `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
  const createdAt = new Date().toISOString()
  const record: UserActivityRecord = {
    activityId,
    userId,
    activityType,
    description,
    createdAt,
  }

  const localList = loadLocalFile<UserActivityRecord>(LOCAL_ACTIVITY_FILE)
  localList.push(record)
  saveLocalFile(LOCAL_ACTIVITY_FILE, localList)

  if (isSheetsConfigured()) {
    try {
      await ensureAllSheetsInitialized()
      const auth = getAuth()
      const sheets = google.sheets({ version: "v4", auth })
      const spreadsheetId = getSheetId()

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: "User Activity!A:E",
        valueInputOption: "RAW",
        requestBody: {
          values: [[activityId, userId, activityType, description, createdAt]],
        },
      })
    } catch (err) {
      console.error("Error logging user activity to sheet:", err)
    }
  }

  return record
}

export async function getUserActivities(userId: string): Promise<UserActivityRecord[]> {
  const localList = loadLocalFile<UserActivityRecord>(LOCAL_ACTIVITY_FILE).filter(
    (a) => a.userId === userId
  )
  if (!isSheetsConfigured()) {
    return localList
  }

  try {
    await ensureAllSheetsInitialized()
    const auth = getAuth()
    const sheets = google.sheets({ version: "v4", auth })
    const spreadsheetId = getSheetId()

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "User Activity!A2:E",
    })

    const rows = res.data.values ?? []
    return rows
      .map((r, i) => ({
        rowIndex: i + 2,
        activityId: r[0] ?? "",
        userId: r[1] ?? "",
        activityType: r[2] ?? "",
        description: r[3] ?? "",
        createdAt: r[4] ?? "",
      }))
      .filter((a) => a.userId === userId)
  } catch (err) {
    console.error("Error fetching user activities:", err)
    return localList
  }
}

// ── Password Reset Management ─────────────────────────────────────────────────
export async function appendPasswordReset(
  record: Omit<PasswordResetRecord, "rowIndex">
): Promise<PasswordResetRecord> {
  const localList = loadLocalFile<PasswordResetRecord>(LOCAL_RESET_FILE)
  localList.push(record)
  saveLocalFile(LOCAL_RESET_FILE, localList)

  if (isSheetsConfigured()) {
    try {
      await ensureAllSheetsInitialized()
      const auth = getAuth()
      const sheets = google.sheets({ version: "v4", auth })
      const spreadsheetId = getSheetId()

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: "Password Reset!A:G",
        valueInputOption: "RAW",
        requestBody: {
          values: [
            [
              record.resetId,
              record.userId,
              record.email.toLowerCase(),
              record.tokenHash,
              record.expiresAt,
              record.used,
              record.createdAt,
            ],
          ],
        },
      })
    } catch (err) {
      console.error("Error appending to Password Reset sheet:", err)
    }
  }

  return record
}

export async function getPasswordResetByTokenHash(
  tokenHash: string,
  email: string
): Promise<PasswordResetRecord | null> {
  const cleanEmail = email.trim().toLowerCase()
  const localList = loadLocalFile<PasswordResetRecord>(LOCAL_RESET_FILE)
  const localMatch = localList.find(
    (r) => r.tokenHash === tokenHash && r.email.toLowerCase() === cleanEmail && r.used !== "true"
  )

  if (!isSheetsConfigured()) {
    return localMatch || null
  }

  try {
    await ensureAllSheetsInitialized()
    const auth = getAuth()
    const sheets = google.sheets({ version: "v4", auth })
    const spreadsheetId = getSheetId()

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Password Reset!A2:G",
    })

    const rows = res.data.values ?? []
    const sheetRecords: PasswordResetRecord[] = rows.map((r, i) => ({
      rowIndex: i + 2,
      resetId: r[0] ?? "",
      userId: r[1] ?? "",
      email: (r[2] ?? "").toLowerCase(),
      tokenHash: r[3] ?? "",
      expiresAt: r[4] ?? "",
      used: r[5] ?? "false",
      createdAt: r[6] ?? "",
    }))

    const match = sheetRecords.find(
      (r) => r.tokenHash === tokenHash && r.email.toLowerCase() === cleanEmail && r.used !== "true"
    )

    return match || localMatch || null
  } catch (err) {
    console.error("Error reading Password Reset sheet:", err)
    return localMatch || null
  }
}

export async function markPasswordResetAsUsed(resetId: string): Promise<boolean> {
  let updated = false
  const localList = loadLocalFile<PasswordResetRecord>(LOCAL_RESET_FILE)
  const idx = localList.findIndex((r) => r.resetId === resetId)
  if (idx !== -1) {
    localList[idx].used = "true"
    saveLocalFile(LOCAL_RESET_FILE, localList)
    updated = true
  }

  if (isSheetsConfigured()) {
    try {
      await ensureAllSheetsInitialized()
      const auth = getAuth()
      const sheets = google.sheets({ version: "v4", auth })
      const spreadsheetId = getSheetId()

      const res = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "Password Reset!A2:G",
      })

      const rows = res.data.values ?? []
      const rowIndex = rows.findIndex((r) => r[0] === resetId)
      if (rowIndex !== -1) {
        const targetRow = rowIndex + 2
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `Password Reset!F${targetRow}`,
          valueInputOption: "RAW",
          requestBody: { values: [["true"]] },
        })
        return true
      }
    } catch (err) {
      console.error("Error marking Password Reset as used:", err)
    }
  }

  return updated
}

// ── Orders Management (Sheet 2: Orders) ───────────────────────────────────────
export async function appendOrder(orderData: {
  customerName: string
  email: string
  userId?: string
  orderNumber?: string
  phoneNumber?: string
  shippingAddress?: string
  items?: string
  product?: string
  subtotal?: number
  shippingCharge?: number
  discount?: number
  totalAmount?: number
  amount?: number
  paymentMethod?: string
  paymentStatus?: string
  orderStatus?: string
  transactionId?: string
  paymentId?: string
}): Promise<string> {
  const orderId = `ORD-${Date.now()}`
  const orderNumber = orderData.orderNumber || `CLS-${Date.now().toString().slice(-6)}`
  const cleanEmail = orderData.email.trim().toLowerCase()

  // Try to associate with an existing user if userId wasn't provided
  let resolvedUserId = orderData.userId || ""
  if (!resolvedUserId) {
    try {
      const user = await getUserByEmail(cleanEmail)
      if (user) {
        resolvedUserId = user.userId
      }
    } catch {
      // ignore
    }
  }

  const items = orderData.items || orderData.product || "CLASPO Electronics Order"
  const totalAmount = orderData.totalAmount ?? orderData.amount ?? 0
  const subtotal = orderData.subtotal ?? totalAmount
  const shippingCharge = orderData.shippingCharge ?? 0
  const discount = orderData.discount ?? 0
  const paymentMethod = orderData.paymentMethod || "Stripe"
  const paymentStatus = orderData.paymentStatus || "Paid"
  const orderStatus = orderData.orderStatus || "Processing"
  const transactionId = orderData.transactionId || orderData.paymentId || ""
  const now = new Date().toISOString()

  const orderRecord: Order = {
    orderId,
    userId: resolvedUserId,
    orderNumber,
    customerName: orderData.customerName,
    email: cleanEmail,
    phoneNumber: orderData.phoneNumber || "",
    shippingAddress: orderData.shippingAddress || "",
    items,
    product: items,
    subtotal,
    shippingCharge,
    discount,
    totalAmount,
    amount: totalAmount,
    paymentMethod,
    paymentStatus,
    orderStatus,
    status: orderStatus,
    transactionId,
    comments: transactionId ? `Payment ID: ${transactionId}` : "",
    createdAt: now,
    updatedAt: now,
  }

  const localOrders = loadLocalFile<Order>(LOCAL_ORDERS_FILE)
  localOrders.push(orderRecord)
  saveLocalFile(LOCAL_ORDERS_FILE, localOrders)

  if (isSheetsConfigured()) {
    try {
      await ensureAllSheetsInitialized()
      const auth = getAuth()
      const sheets = google.sheets({ version: "v4", auth })
      const spreadsheetId = getSheetId()

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: "Orders!A:R",
        valueInputOption: "RAW",
        requestBody: {
          values: [
            [
              orderRecord.orderId,
              orderRecord.userId,
              orderRecord.orderNumber,
              orderRecord.customerName,
              orderRecord.email,
              orderRecord.phoneNumber,
              orderRecord.shippingAddress,
              orderRecord.items,
              orderRecord.subtotal,
              orderRecord.shippingCharge,
              orderRecord.discount,
              orderRecord.totalAmount,
              orderRecord.paymentMethod,
              orderRecord.paymentStatus,
              orderRecord.orderStatus,
              orderRecord.transactionId,
              orderRecord.createdAt,
              orderRecord.updatedAt,
            ],
          ],
        },
      })

      if (resolvedUserId) {
        await logUserActivity(
          resolvedUserId,
          "ORDER_PLACED",
          `Order ${orderNumber} placed for ${orderRecord.items}`
        ).catch(() => {})
      }
    } catch (err) {
      console.error("Error appending to Orders sheet:", err)
    }
  }

  return orderId
}

export const getOrdersByEmail = withTTL(async (email: string): Promise<Order[]> => {
  const cleanEmail = email.trim().toLowerCase()
  const localOrders = loadLocalFile<Order>(LOCAL_ORDERS_FILE).filter(
    (o) => o.email.toLowerCase() === cleanEmail
  )

  if (!isSheetsConfigured()) {
    return localOrders
  }

  try {
    await ensureAllSheetsInitialized()
    const auth = getAuth()
    const sheets = google.sheets({ version: "v4", auth })
    const spreadsheetId = getSheetId()

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Orders!A2:R",
    })

    const rows = res.data.values ?? []
    return rows
      .filter((r) => (r[4] ?? "").toLowerCase() === cleanEmail)
      .map((r, i) => {
        const orderId = r[0] ?? ""
        const userId = r[1] ?? ""
        const orderNumber = r[2] ?? ""
        const customerName = r[3] ?? ""
        const rowEmail = r[4] ?? ""
        const phoneNumber = r[5] ?? ""
        const shippingAddress = r[6] ?? ""
        const items = r[7] ?? ""
        const subtotal = Number(r[8]) || 0
        const shippingCharge = Number(r[9]) || 0
        const discount = Number(r[10]) || 0
        const totalAmount = Number(r[11]) || 0
        const paymentMethod = r[12] ?? ""
        const paymentStatus = r[13] ?? ""
        const orderStatus = r[14] ?? "Processing"
        const transactionId = r[15] ?? ""
        const createdAt = r[16] ?? ""
        const updatedAt = r[17] ?? ""

        return {
          rowIndex: i + 2,
          orderId,
          userId,
          orderNumber,
          customerName,
          email: rowEmail,
          phoneNumber,
          shippingAddress,
          items,
          product: items, // alias for existing UI
          subtotal,
          shippingCharge,
          discount,
          totalAmount,
          amount: totalAmount, // alias for existing UI
          paymentMethod,
          paymentStatus,
          orderStatus,
          status: orderStatus, // alias for existing UI
          transactionId,
          comments: transactionId ? `Payment ID: ${transactionId}` : "",
          createdAt,
          updatedAt,
        }
      })
  } catch (err) {
    console.error("Error reading Orders sheet:", err)
    return localOrders
  }
})

export const getOrdersByUserId = withTTL(async (userId: string): Promise<Order[]> => {
  const localOrders = loadLocalFile<Order>(LOCAL_ORDERS_FILE).filter((o) => o.userId === userId)
  if (!isSheetsConfigured()) {
    return localOrders
  }

  try {
    await ensureAllSheetsInitialized()
    const auth = getAuth()
    const sheets = google.sheets({ version: "v4", auth })
    const spreadsheetId = getSheetId()

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Orders!A2:R",
    })

    const rows = res.data.values ?? []
    return rows
      .filter((r) => r[1] === userId)
      .map((r, i) => ({
        rowIndex: i + 2,
        orderId: r[0] ?? "",
        userId: r[1] ?? "",
        orderNumber: r[2] ?? "",
        customerName: r[3] ?? "",
        email: r[4] ?? "",
        phoneNumber: r[5] ?? "",
        shippingAddress: r[6] ?? "",
        items: r[7] ?? "",
        product: r[7] ?? "",
        subtotal: Number(r[8]) || 0,
        shippingCharge: Number(r[9]) || 0,
        discount: Number(r[10]) || 0,
        totalAmount: Number(r[11]) || 0,
        amount: Number(r[11]) || 0,
        paymentMethod: r[12] ?? "",
        paymentStatus: r[13] ?? "",
        orderStatus: r[14] ?? "Processing",
        status: r[14] ?? "Processing",
        transactionId: r[15] ?? "",
        comments: r[15] ? `Payment ID: ${r[15]}` : "",
        createdAt: r[16] ?? "",
        updatedAt: r[17] ?? "",
      }))
  } catch (err) {
    console.error("Error fetching orders by userId:", err)
    return localOrders
  }
})

export const getAllOrders = withTTL(async (): Promise<Order[]> => {
  const localOrders = loadLocalFile<Order>(LOCAL_ORDERS_FILE)
  if (!isSheetsConfigured()) {
    return localOrders
  }

  try {
    await ensureAllSheetsInitialized()
    const auth = getAuth()
    const sheets = google.sheets({ version: "v4", auth })
    const spreadsheetId = getSheetId()

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Orders!A2:R",
    })

    const rows = res.data.values ?? []
    return rows
      .filter((r) => r[0])
      .map((r, i) => ({
        rowIndex: i + 2,
        orderId: r[0] ?? "",
        userId: r[1] ?? "",
        orderNumber: r[2] ?? "",
        customerName: r[3] ?? "",
        email: r[4] ?? "",
        phoneNumber: r[5] ?? "",
        shippingAddress: r[6] ?? "",
        items: r[7] ?? "",
        product: r[7] ?? "",
        subtotal: Number(r[8]) || 0,
        shippingCharge: Number(r[9]) || 0,
        discount: Number(r[10]) || 0,
        totalAmount: Number(r[11]) || 0,
        amount: Number(r[11]) || 0,
        paymentMethod: r[12] ?? "",
        paymentStatus: r[13] ?? "",
        orderStatus: r[14] ?? "Processing",
        status: r[14] ?? "Processing",
        transactionId: r[15] ?? "",
        comments: r[15] ? `Payment ID: ${r[15]}` : "",
        createdAt: r[16] ?? "",
        updatedAt: r[17] ?? "",
      }))
  } catch (err) {
    console.error("Error reading all orders:", err)
    return localOrders
  }
})

export const getOrderByPaymentId = withTTL(async (paymentId: string): Promise<Order | null> => {
  const orders = await getAllOrders()
  return (
    orders.find(
      (o) => o.transactionId === paymentId || (o.comments && o.comments.includes(paymentId))
    ) ?? null
  )
})

export async function updateOrderStatus(
  rowIndex: number,
  status: string,
  comments: string
): Promise<void> {
  if (!isSheetsConfigured()) return
  const auth = getAuth()
  const sheets = google.sheets({ version: "v4", auth })
  const spreadsheetId = getSheetId()
  const now = new Date().toISOString()

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `Orders!O${rowIndex}:R${rowIndex}`,
    valueInputOption: "RAW",
    requestBody: {
      values: [[status, comments, "", now]],
    },
  })
}

// ── Products ──────────────────────────────────────────────────────────────────
export async function getProducts(includeInactive = false): Promise<Product[]> {
  if (!isSheetsConfigured()) {
    return []
  }
  try {
    await ensureAllSheetsInitialized()
    const auth = getAuth()
    const sheets = google.sheets({ version: "v4", auth })
    const spreadsheetId = getSheetId()

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Products!A1:Q",
    })

    const allRows = res.data.values ?? []
    if (allRows.length <= 1) return []

    const headerRow = allRows[0] ?? []
    const isNewSchema = headerRow[0]?.toLowerCase().includes("productid")
    const dataRows = allRows.slice(1)

    const products: Product[] = dataRows
      .map((r, i) => {
        const rowIndex = i + 2
        if (isNewSchema) {
          const productId = r[0] || `prod_${rowIndex}`
          const productName = r[1] || ""
          const slug = r[2] || slugify(productName)
          const sku = r[3] || ""
          const category = r[4] || "General"
          const shortDescription = r[5] || ""
          const description = r[6] || ""
          const price = Number(r[7]) || 0
          const discountPrice = r[8] ? Number(r[8]) : undefined
          const stock = Number(r[9]) || 0
          const primaryImage = r[10] || ""

          let additionalImages: ProductMediaItem[] = []
          try {
            if (r[11]) additionalImages = JSON.parse(r[11])
          } catch {}

          const primaryVideo = r[12] || ""
          let additionalVideos: ProductVideoItem[] = []
          try {
            if (r[13]) additionalVideos = JSON.parse(r[13])
          } catch {}

          const status: "Active" | "Inactive" = (r[14] || "Active") === "Inactive" ? "Inactive" : "Active"
          const createdAt = r[15] || new Date().toISOString()
          const updatedAt = r[16] || createdAt

          // Compose imageUrl for backward compatibility: primaryImage or first additional image
          const fallbackImage = additionalImages.length > 0 ? additionalImages[0].url : ""
          const resolvedImageUrl = primaryImage || fallbackImage || ""

          return {
            rowIndex,
            id: productId,
            productId,
            name: productName,
            productName,
            slug,
            handle: slug,
            sku,
            partNumber: sku,
            category,
            shortDescription,
            description,
            price,
            discountPrice,
            stock,
            inStock: status === "Active" && stock > 0,
            imageUrl: resolvedImageUrl,
            primaryImage,
            additionalImages,
            primaryVideo,
            additionalVideos,
            status,
            createdAt,
            updatedAt,
          }
        } else {
          // Legacy 8-column layout
          const name = r[0] ?? ""
          const category = r[1] ?? ""
          const description = r[2] ?? ""
          const imageUrl = r[3] ?? ""
          const price = Number(r[4]) || 0
          const handle = r[5] ?? slugify(name)
          const inStock = (r[6] ?? "true").toLowerCase() !== "false"
          const partNumber = r[7] ?? ""

          return {
            rowIndex,
            id: String(i + 1),
            productId: String(i + 1),
            name,
            productName: name,
            category,
            description,
            imageUrl,
            primaryImage: imageUrl,
            price,
            handle,
            slug: handle,
            inStock,
            stock: inStock ? 100 : 0,
            status: (inStock ? "Active" : "Inactive") as "Active" | "Inactive",
            partNumber,
            sku: partNumber,
          }
        }
      })
      .filter((p) => Boolean(p.name && p.name.trim() !== ""))

    if (!includeInactive) {
      return products.filter((p) => p.status !== "Inactive")
    }
    return products
  } catch (err) {
    console.warn("Failed to fetch products from Google Sheets:", err)
    return []
  }
}

export async function getProductByHandle(handle: string): Promise<Product | null> {
  const products = await getProducts(true)
  return products.find((p) => p.handle === handle || p.slug === handle || p.id === handle) ?? null
}

export async function getProductById(productId: string): Promise<Product | null> {
  const products = await getProducts(true)
  return products.find((p) => p.id === productId || p.productId === productId || String(p.rowIndex) === productId) ?? null
}

export async function getProductMetrics(): Promise<{
  total: number
  active: number
  inactive: number
  outOfStock: number
}> {
  const all = await getProducts(true)
  let active = 0
  let inactive = 0
  let outOfStock = 0

  for (const p of all) {
    if (p.status === "Inactive") {
      inactive++
    } else {
      active++
      if ((p.stock ?? 0) <= 0) {
        outOfStock++
      }
    }
  }

  return {
    total: all.length,
    active,
    inactive,
    outOfStock,
  }
}

export async function createProduct(product: {
  productId?: string
  productName: string
  slug?: string
  sku?: string
  category: string
  shortDescription?: string
  description?: string
  price: number
  discountPrice?: number
  stock?: number
  primaryImage?: string
  additionalImages?: ProductMediaItem[]
  primaryVideo?: string
  additionalVideos?: ProductVideoItem[]
  status?: "Active" | "Inactive"
}): Promise<Product> {
  if (!isSheetsConfigured()) throw new Error("Google Sheets not configured")
  await ensureAllSheetsInitialized()
  const auth = getAuth()
  const sheets = google.sheets({ version: "v4", auth })
  const spreadsheetId = getSheetId()

  const productId = product.productId || `prod_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
  const slug = product.slug ? slugify(product.slug) : slugify(product.productName)
  const sku = product.sku || ""
  const category = product.category || "General"
  const shortDescription = product.shortDescription || ""
  const description = product.description || ""
  const price = product.price || 0
  const discountPrice = product.discountPrice != null ? product.discountPrice : ""
  const stock = product.stock != null ? product.stock : 0
  const primaryImage = product.primaryImage || (product.additionalImages?.[0]?.url || "")
  const additionalImagesJson = product.additionalImages ? JSON.stringify(product.additionalImages) : "[]"
  const primaryVideo = product.primaryVideo || (product.additionalVideos?.[0]?.url || "")
  const additionalVideosJson = product.additionalVideos ? JSON.stringify(product.additionalVideos) : "[]"
  const status = product.status || "Active"
  const now = new Date().toISOString()

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "Products!A:Q",
    valueInputOption: "RAW",
    requestBody: {
      values: [
        [
          productId,
          product.productName,
          slug,
          sku,
          category,
          shortDescription,
          description,
          price,
          discountPrice,
          stock,
          primaryImage,
          additionalImagesJson,
          primaryVideo,
          additionalVideosJson,
          status,
          now,
          now,
        ],
      ],
    },
  })

  return {
    id: productId,
    productId,
    name: product.productName,
    productName: product.productName,
    slug,
    handle: slug,
    sku,
    partNumber: sku,
    category,
    shortDescription,
    description,
    price,
    discountPrice: typeof discountPrice === "number" ? discountPrice : undefined,
    stock,
    inStock: status === "Active" && stock > 0,
    imageUrl: primaryImage,
    primaryImage,
    additionalImages: product.additionalImages,
    primaryVideo,
    additionalVideos: product.additionalVideos,
    status,
    createdAt: now,
    updatedAt: now,
  }
}

export async function updateProductById(
  productId: string,
  updates: Partial<Product>
): Promise<Product | null> {
  if (!isSheetsConfigured()) throw new Error("Google Sheets not configured")
  await ensureAllSheetsInitialized()
  const auth = getAuth()
  const sheets = google.sheets({ version: "v4", auth })
  const spreadsheetId = getSheetId()

  const existing = await getProductById(productId)
  if (!existing || !existing.rowIndex) return null

  const updatedName = updates.productName ?? updates.name ?? existing.name
  const updatedSlug = updates.slug ?? updates.handle ?? existing.handle
  const updatedSku = updates.sku ?? updates.partNumber ?? existing.sku ?? ""
  const updatedCategory = updates.category ?? existing.category
  const updatedShortDesc = updates.shortDescription ?? existing.shortDescription ?? ""
  const updatedDesc = updates.description ?? existing.description
  const updatedPrice = updates.price ?? existing.price
  const updatedDiscount = updates.discountPrice !== undefined ? updates.discountPrice : existing.discountPrice
  const updatedStock = updates.stock !== undefined ? updates.stock : (existing.stock ?? (existing.inStock ? 50 : 0))
  const updatedPrimaryImage = updates.primaryImage ?? updates.imageUrl ?? existing.primaryImage ?? existing.imageUrl
  const updatedAdditionalImages = updates.additionalImages ?? existing.additionalImages ?? []
  const updatedPrimaryVideo = updates.primaryVideo ?? existing.primaryVideo ?? ""
  const updatedAdditionalVideos = updates.additionalVideos ?? existing.additionalVideos ?? []
  const updatedStatus = updates.status ?? existing.status ?? "Active"
  const now = new Date().toISOString()

  const rowValues = [
    existing.id,
    updatedName,
    updatedSlug,
    updatedSku,
    updatedCategory,
    updatedShortDesc,
    updatedDesc,
    updatedPrice,
    updatedDiscount != null ? updatedDiscount : "",
    updatedStock,
    updatedPrimaryImage,
    JSON.stringify(updatedAdditionalImages),
    updatedPrimaryVideo,
    JSON.stringify(updatedAdditionalVideos),
    updatedStatus,
    existing.createdAt || now,
    now,
  ]

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `Products!A${existing.rowIndex}:Q${existing.rowIndex}`,
    valueInputOption: "RAW",
    requestBody: {
      values: [rowValues],
    },
  })

  return {
    ...existing,
    name: updatedName,
    productName: updatedName,
    slug: updatedSlug,
    handle: updatedSlug,
    sku: updatedSku,
    partNumber: updatedSku,
    category: updatedCategory,
    shortDescription: updatedShortDesc,
    description: updatedDesc,
    price: updatedPrice,
    discountPrice: updatedDiscount,
    stock: updatedStock,
    inStock: updatedStatus === "Active" && updatedStock > 0,
    primaryImage: updatedPrimaryImage,
    imageUrl: updatedPrimaryImage,
    additionalImages: updatedAdditionalImages,
    primaryVideo: updatedPrimaryVideo,
    additionalVideos: updatedAdditionalVideos,
    status: updatedStatus,
    updatedAt: now,
  }
}

export async function deleteProductById(
  productId: string,
  softDelete = true
): Promise<boolean> {
  if (!isSheetsConfigured()) return false
  await ensureAllSheetsInitialized()
  const auth = getAuth()
  const sheets = google.sheets({ version: "v4", auth })
  const spreadsheetId = getSheetId()

  const existing = await getProductById(productId)
  if (!existing || !existing.rowIndex) return false

  if (softDelete) {
    // Soft delete: set status to Inactive so historical orders and links are protected
    await updateProductById(productId, { status: "Inactive" })
    return true
  }

  // Hard delete if explicitly requested
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId })
  const sheet = spreadsheet.data.sheets?.find((s) => s.properties?.title === "Products")
  const sheetId = sheet?.properties?.sheetId
  if (sheetId === undefined) return false

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: sheetId,
              dimension: "ROWS",
              startIndex: existing.rowIndex - 1,
              endIndex: existing.rowIndex,
            },
          },
        },
      ],
    },
  })

  return true
}

export async function appendProduct(product: Omit<Product, "id">): Promise<void> {
  await createProduct({
    productName: product.name,
    category: product.category,
    description: product.description,
    price: product.price,
    primaryImage: product.imageUrl,
    slug: product.handle,
    sku: product.partNumber,
    stock: product.inStock ? 50 : 0,
    status: product.inStock ? "Active" : "Inactive",
  })
}

export async function updateProduct(rowIndex: number, product: Omit<Product, "id">): Promise<void> {
  const products = await getProducts(true)
  const target = products.find((p) => p.rowIndex === rowIndex)
  if (target) {
    await updateProductById(target.id, {
      name: product.name,
      category: product.category,
      description: product.description,
      price: product.price,
      primaryImage: product.imageUrl,
      imageUrl: product.imageUrl,
      handle: product.handle,
      sku: product.partNumber,
      stock: product.inStock ? 50 : 0,
      status: product.inStock ? "Active" : "Inactive",
    })
  }
}

export async function deleteProduct(rowIndex: number): Promise<void> {
  const products = await getProducts(true)
  const target = products.find((p) => p.rowIndex === rowIndex)
  if (target) {
    await deleteProductById(target.id, true)
  }
}

// ── Blogs ─────────────────────────────────────────────────────────────────────
export const getBlogs = cache(
  withTTL(async (publishedOnly = false): Promise<Blog[]> => {
    if (!isSheetsConfigured()) {
      return []
    }
    try {
      await ensureAllSheetsInitialized()
      const auth = getAuth()
      const sheets = google.sheets({ version: "v4", auth })
      const spreadsheetId = getSheetId()

      const res = await sheets.spreadsheets.values.get({
        spreadsheetId,
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
    } catch (err) {
      console.warn("Failed to fetch blogs from Google Sheets:", err)
      return []
    }
  })
)

export async function getBlogBySlug(slug: string): Promise<Blog | null> {
  const blogs = await getBlogs()
  return blogs.find((b) => b.slug === slug) ?? null
}

export async function appendBlog(blog: Blog): Promise<void> {
  if (!isSheetsConfigured()) return
  await ensureAllSheetsInitialized()
  const auth = getAuth()
  const sheets = google.sheets({ version: "v4", auth })
  const spreadsheetId = getSheetId()

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "Blogs!A:H",
    valueInputOption: "RAW",
    requestBody: {
      values: [
        [
          blog.title,
          blog.keywords,
          blog.slug || slugify(blog.title),
          blog.publishDate || new Date().toISOString().split("T")[0],
          blog.content,
          blog.metaDescription,
          blog.imageUrl ?? "",
          blog.published !== false ? "true" : "false",
        ],
      ],
    },
  })
}

export async function deleteBlog(rowIndex: number): Promise<void> {
  if (!isSheetsConfigured()) return
  await ensureAllSheetsInitialized()
  const auth = getAuth()
  const sheets = google.sheets({ version: "v4", auth })
  const spreadsheetId = getSheetId()

  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId })
  const sheet = spreadsheet.data.sheets?.find((s) => s.properties?.title === "Blogs")
  const sheetId = sheet?.properties?.sheetId
  if (sheetId === undefined) throw new Error("Blogs sheet not found")

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: sheetId,
              dimension: "ROWS",
              startIndex: rowIndex - 1,
              endIndex: rowIndex,
            },
          },
        },
      ],
    },
  })
}

export async function updateBlogPublished(rowIndex: number, published: boolean): Promise<void> {
  if (!isSheetsConfigured()) return
  await ensureAllSheetsInitialized()
  const auth = getAuth()
  const sheets = google.sheets({ version: "v4", auth })
  const spreadsheetId = getSheetId()

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `Blogs!H${rowIndex}`,
    valueInputOption: "RAW",
    requestBody: { values: [[published ? "true" : "false"]] },
  })
}

// ── Inquiries ─────────────────────────────────────────────────────────────────
export async function appendInquiry(
  inq: Omit<Inquiry, "id" | "submittedAt" | "status">
): Promise<void> {
  if (!isSheetsConfigured()) return
  await ensureAllSheetsInitialized()
  const auth = getAuth()
  const sheets = google.sheets({ version: "v4", auth })
  const spreadsheetId = getSheetId()
  const now = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "Inquiries!A:G",
    valueInputOption: "RAW",
    requestBody: {
      values: [
        [
          `INQ-${Date.now()}`,
          inq.name,
          inq.email,
          inq.subject,
          inq.message,
          now,
          "New",
        ],
      ],
    },
  })
}

export const getAllInquiries = withTTL(
  async (): Promise<(Inquiry & { rowIndex: number })[]> => {
    if (!isSheetsConfigured()) return []
    try {
      await ensureAllSheetsInitialized()
      const auth = getAuth()
      const sheets = google.sheets({ version: "v4", auth })
      const spreadsheetId = getSheetId()

      const res = await sheets.spreadsheets.values.get({
        spreadsheetId,
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
    } catch {
      return []
    }
  }
)

export async function updateInquiryStatus(rowIndex: number, status: string): Promise<void> {
  if (!isSheetsConfigured()) return
  await ensureAllSheetsInitialized()
  const auth = getAuth()
  const sheets = google.sheets({ version: "v4", auth })
  const spreadsheetId = getSheetId()

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `Inquiries!G${rowIndex}`,
    valueInputOption: "RAW",
    requestBody: { values: [[status]] },
  })
}

// ── Quotes ────────────────────────────────────────────────────────────────────
export async function appendQuote(
  q: Omit<Quote, "id" | "submittedAt" | "status">
): Promise<void> {
  if (!isSheetsConfigured()) return
  await ensureAllSheetsInitialized()
  const auth = getAuth()
  const sheets = google.sheets({ version: "v4", auth })
  const spreadsheetId = getSheetId()
  const now = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "Quotes!A:K",
    valueInputOption: "RAW",
    requestBody: {
      values: [
        [
          `QUO-${Date.now()}`,
          q.name,
          q.email,
          q.phone,
          q.company,
          q.application,
          q.quantity,
          q.description,
          now,
          "New",
          q.hasAttachment ?? "No",
        ],
      ],
    },
  })
}

export const getAllQuotes = withTTL(async (): Promise<(Quote & { rowIndex: number })[]> => {
  if (!isSheetsConfigured()) return []
  try {
    await ensureAllSheetsInitialized()
    const auth = getAuth()
    const sheets = google.sheets({ version: "v4", auth })
    const spreadsheetId = getSheetId()

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Quotes!A2:K",
    })

    const rows = res.data.values ?? []
    return rows
      .map((r, i) => ({
        rowIndex: i + 2,
        id: r[0] ?? "",
        name: r[1] ?? "",
        email: r[2] ?? "",
        phone: r[3] ?? "",
        company: r[4] ?? "",
        application: r[5] ?? "",
        quantity: r[6] ?? "",
        description: r[7] ?? "",
        submittedAt: r[8] ?? "",
        status: r[9] ?? "New",
        hasAttachment: r[10] ?? "No",
      }))
      .filter((r) => r.id !== "")
  } catch {
    return []
  }
})

export async function updateQuoteStatus(rowIndex: number, status: string): Promise<void> {
  if (!isSheetsConfigured()) return
  await ensureAllSheetsInitialized()
  const auth = getAuth()
  const sheets = google.sheets({ version: "v4", auth })
  const spreadsheetId = getSheetId()

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `Quotes!J${rowIndex}`,
    valueInputOption: "RAW",
    requestBody: { values: [[status]] },
  })
}

// ── Subscribers ───────────────────────────────────────────────────────────────
export async function appendSubscriber(
  sub: Omit<Subscriber, "id" | "submittedAt" | "status">
): Promise<void> {
  if (!isSheetsConfigured()) return
  await ensureAllSheetsInitialized()
  const auth = getAuth()
  const sheets = google.sheets({ version: "v4", auth })
  const spreadsheetId = getSheetId()
  const now = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "Subscribers!A:E",
    valueInputOption: "RAW",
    requestBody: {
      values: [[`SUB-${Date.now()}`, sub.email, sub.source, now, "Active"]],
    },
  })
}

export const getAllSubscribers = withTTL(
  async (): Promise<(Subscriber & { rowIndex: number })[]> => {
    if (!isSheetsConfigured()) return []
    try {
      await ensureAllSheetsInitialized()
      const auth = getAuth()
      const sheets = google.sheets({ version: "v4", auth })
      const spreadsheetId = getSheetId()

      const res = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "Subscribers!A2:E",
      })

      const rows = res.data.values ?? []
      return rows
        .map((r, i) => ({
          rowIndex: i + 2,
          id: r[0] ?? "",
          email: r[1] ?? "",
          source: r[2] ?? "",
          submittedAt: r[3] ?? "",
          status: r[4] ?? "Active",
        }))
        .filter((r) => r.id !== "")
    } catch {
      return []
    }
  }
)

// ── Visitor Events ────────────────────────────────────────────────────────────
export async function appendVisitorEvent(event: VisitorEvent): Promise<void> {
  if (!isSheetsConfigured()) return
  await ensureAllSheetsInitialized()
  const auth = getAuth()
  const sheets = google.sheets({ version: "v4", auth })
  const spreadsheetId = getSheetId()
  const now = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "VisitorEvents!A:G",
    valueInputOption: "RAW",
    requestBody: {
      values: [
        [
          `EVT-${Date.now()}`,
          event.page,
          event.referrer,
          event.utmSource,
          event.utmMedium,
          event.utmCampaign,
          now,
        ],
      ],
    },
  })
}

// ── Utilities ─────────────────────────────────────────────────────────────────
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}
