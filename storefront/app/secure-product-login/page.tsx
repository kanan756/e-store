"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import "@/styles/product-manager.css"

export default function SecureProductLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/product-manager/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Authentication failed")
        setLoading(false)
        return
      }

      // Successful manager login -> redirect to manager home
      window.location.href = "/secure-product-manager"
    } catch {
      setError("An unexpected network error occurred. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at 50% 30%, #3a4144 0%, #1f2324 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          background: "#FFFFFF",
          borderRadius: 16,
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.4)",
          padding: "40px 36px",
          boxSizing: "border-box",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ position: "relative", width: 150, height: 46, margin: "0 auto 16px" }}>
            <Image
              src="/images/claspo-latest-logo.png"
              alt="CLASPO"
              fill
              style={{ objectFit: "contain" }}
              priority
              unoptimized
            />
          </div>
          <div
            style={{
              display: "inline-block",
              background: "#FFF4ED",
              color: "#F36B12",
              border: "1px solid #FFE4D1",
              fontSize: 11,
              fontWeight: 800,
              textTransform: "uppercase",
              padding: "4px 10px",
              borderRadius: 6,
              letterSpacing: "0.08em",
              marginBottom: 10,
            }}
          >
            Authorized Portal Access
          </div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: "#17191C",
              margin: "0 0 6px",
              letterSpacing: "-0.02em",
            }}
          >
            Product Management
          </h1>
          <p style={{ fontSize: 13.5, color: "#6B7280", margin: 0 }}>
            Restricted to authorized product operations only.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              padding: "12px 16px",
              background: "#FEF2F2",
              border: "1px solid #FCA5A5",
              borderRadius: 8,
              color: "#DC2626",
              fontSize: 13.5,
              fontWeight: 600,
              marginBottom: 20,
              lineHeight: 1.4,
            }}
          >
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 18 }}>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 700,
                color: "#374151",
                marginBottom: 6,
              }}
            >
              Authorized Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="info@claspo.store"
              required
              autoComplete="username"
              style={{
                width: "100%",
                padding: "12px 14px",
                border: "1.5px solid #E5E7EB",
                borderRadius: 8,
                fontSize: 14,
                boxSizing: "border-box",
                outline: "none",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#F36B12")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
            />
          </div>

          <div style={{ marginBottom: 26 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <label
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#374151",
                }}
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 12,
                  color: "#F36B12",
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              autoComplete="current-password"
              style={{
                width: "100%",
                padding: "12px 14px",
                border: "1.5px solid #E5E7EB",
                borderRadius: 8,
                fontSize: 14,
                boxSizing: "border-box",
                outline: "none",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#F36B12")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px 20px",
              background: "#F36B12",
              color: "#FFFFFF",
              border: "none",
              borderRadius: 8,
              fontSize: 14.5,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              boxShadow: "0 4px 12px rgba(243, 107, 18, 0.3)",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.background = "#D9570A"
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.background = "#F36B12"
            }}
          >
            {loading ? "Authenticating…" : "Sign In to Portal"}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: "center", borderTop: "1px solid #F3F4F6", paddingTop: 18 }}>
          <span style={{ fontSize: 12, color: "#9CA3AF" }}>
            Protected Server Session • Single Manager Account
          </span>
        </div>
      </div>
    </div>
  )
}
