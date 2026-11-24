"use client"

import { useState } from "react"

export default function LogoutButton() {
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    if (loading) return
    setLoading(true)
    try {
      await fetch("/api/product-manager/auth/logout", { method: "POST" })
    } finally {
      window.location.href = "/secure-product-login"
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="pm-logout-btn"
      title="Sign out of product manager"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
      <span>{loading ? "Signing out…" : "Logout"}</span>
    </button>
  )
}
