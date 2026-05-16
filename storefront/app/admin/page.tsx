"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function AdminLoginPage() {
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
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.push("/admin/dashboard")
    } else {
      setError("Invalid password. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #0f0f13 0%, #1a1a24 100%)",
      fontFamily: "system-ui, sans-serif",
    }}>
      <div style={{
        background: "#1e1e2a", border: "1px solid #2a2a3a", borderRadius: 20,
        padding: "48px 40px", width: "100%", maxWidth: 400, boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
      }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: "linear-gradient(135deg, #2563eb, #7c3aed)",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, marginBottom: 16,
          }}>🛡️</div>
          <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 800, margin: 0 }}>Admin Panel</h1>
          <p style={{ color: "#8888aa", margin: "8px 0 0", fontSize: 14 }}>Client Store Management</p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", color: "#aaa", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
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
                background: "#252535", border: "1px solid #333344", borderRadius: 10,
                color: "#fff", fontSize: 15, outline: "none",
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
              width: "100%", padding: "13px", background: "linear-gradient(135deg, #2563eb, #7c3aed)",
              color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700,
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
