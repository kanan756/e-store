"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    if (res.ok) {
      router.push("/admin/dashboard")
    } else {
      setError("Invalid email or password. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      backgroundImage: "linear-gradient(rgba(248, 249, 250, 0.85), rgba(248, 249, 250, 0.85)), url('https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      fontFamily: "system-ui, sans-serif",
    }}>
      <div style={{
        background: "#ffffff", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 20,
        padding: "48px 40px", width: "100%", maxWidth: 400, boxShadow: "0 24px 60px rgba(0,0,0,0.05)",
      }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            marginBottom: 16,
          }}>
            <img src="/images/logo.png" alt="Logo" style={{ height: "80px", width: "auto" }} />
          </div>
          <h1 style={{ color: "#1c1c18", fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>Admin Panel</h1>
          <p style={{ color: "#737874", margin: "8px 0 0", fontSize: 14 }}>SHA Store Management</p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", color: "#434844", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
              Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter admin email"
              required
              style={{
                width: "100%", boxSizing: "border-box", padding: "12px 16px",
                background: "#e9ecef", border: "1px solid rgba(0,0,0,0.15)", borderRadius: 10,
                color: "#1c1c18", fontSize: 15, outline: "none",
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", color: "#434844", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
              Admin Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              required
              style={{
                width: "100%", boxSizing: "border-box", padding: "12px 16px",
                background: "#e9ecef", border: "1px solid rgba(0,0,0,0.15)", borderRadius: 10,
                color: "#1c1c18", fontSize: 15, outline: "none",
              }}
            />
          </div>

          {error && (
            <div style={{
              padding: "10px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 8, color: "#ef4444", fontSize: 13, marginBottom: 16,
            }}>{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "13px", background: "#111111",
              color: "#e9ecef", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  )
}
