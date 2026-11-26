import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { getProductManagerSession } from "@/lib/pm-auth"
import "@/styles/product-manager.css"
import LogoutButton from "./LogoutButton"

export const metadata = {
  title: "CLASPO Product Management Portal",
  robots: {
    index: false,
    follow: false,
  },
}

export default async function SecureProductManagerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getProductManagerSession()

  if (!session) {
    redirect("/secure-product-login?error=unauthorized")
  }

  return (
    <div className="pm-portal-shell">
      {/* ── Sidebar Navigation ── */}
      <aside className="pm-sidebar">
        <div className="pm-sidebar-header">
          <div style={{ position: "relative", width: 110, height: 32 }}>
            <Image
              src="/images/claspo-latest-logo.png"
              alt="CLASPO"
              fill
              style={{ objectFit: "contain" }}
              unoptimized
            />
          </div>
          <span className="pm-sidebar-tag">Portal</span>
        </div>

        <nav className="pm-sidebar-nav">
          <Link href="/secure-product-manager" className="pm-nav-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
            </svg>
            <span>Dashboard</span>
          </Link>

          <Link href="/secure-product-manager/products" className="pm-nav-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <span>All Products</span>
          </Link>

          <Link href="/secure-product-manager/products/add" className="pm-nav-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            <span>Add New Product</span>
          </Link>

          <Link href="/secure-product-manager/orders" className="pm-nav-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
              <line x1="9" y1="12" x2="15" y2="12" />
              <line x1="9" y1="16" x2="13" y2="16" />
            </svg>
            <span>Orders</span>
          </Link>

          <Link href="/secure-product-manager/order-tracking" className="pm-nav-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="3" width="15" height="13" />
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
            <span>Order Tracking</span>
          </Link>
        </nav>

        <div className="pm-sidebar-footer">
          <div style={{ marginBottom: 12, padding: "0 4px" }}>
            <div style={{ fontSize: 11, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Logged in as
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#F3F4F6", wordBreak: "break-all" }}>
              {session.email}
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* ── Main Work Area ── */}
      
      <div className="pm-container">{children}</div>
    </div>
  )
}
