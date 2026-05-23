/**
 * @file app/api/admin/blogs/route.ts
 * @description Admin-protected CRUD API for blog post management.
 *   GET    – Returns all blog posts from the Google Sheet.
 *   POST   – Validates and appends a new blog row (including imageUrl, published flag).
 *   DELETE – Clears a blog row from the sheet by rowIndex.
 *
 *   Blog data maps to the Blogs sheet columns:
 *     A=Title, B=Keywords, C=Slug, D=PublishDate, E=Content,
 *     F=MetaDescription, G=ImageUrl, H=Published
 *
 *   Authentication: cookie-based session (`admin_session=authenticated`).
 *
 * @owner Heet-P
 * @lastModified May 16, 2026
 */

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getBlogs, appendBlog, deleteBlog } from "@/lib/sheets"
import { z } from "zod"

async function checkAuth() {
  const cookieStore = await cookies()
  const session = cookieStore.get("admin_session")
  if (!session?.value) return false
  const { verifyAdminToken } = await import("@/app/api/admin/auth/route")
  return verifyAdminToken(session.value)
}

const blogSchema = z.object({
  title: z.string().min(1),
  keywords: z.string().default(""),
  slug: z.string().default(""),
  publishDate: z.string().default(""),
  content: z.string().default(""),
  metaDescription: z.string().default(""),
  imageUrl: z.string().default(""),
  published: z.boolean().default(true),
})

export async function GET() {
  if (!(await checkAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const blogs = await getBlogs()
    return NextResponse.json({ blogs })
  } catch {
    return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  if (!(await checkAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const body = await request.json()
    const parsed = blogSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
    await appendBlog(parsed.data)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to add blog" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  if (!(await checkAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const { rowIndex } = await request.json()
    if (!Number.isInteger(rowIndex) || rowIndex < 2) {
      return NextResponse.json({ error: "Invalid rowIndex" }, { status: 400 })
    }
    await deleteBlog(rowIndex)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to delete blog" }, { status: 500 })
  }
}
