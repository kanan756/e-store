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
      background: "#131310",
      fontFamily: "system-ui, sans-serif",
    }}>
      <div style={{
        background: "#1c1c18", border: "1px solid #2a2a24", borderRadius: 20,
        padding: "48px 40px", width: "100%", maxWidth: 400, boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
      }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: "rgba(0,109,55,0.15)", border: "1px solid rgba(74,225,131,0.2)",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            marginBottom: 16,
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#4ae183" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <h1 style={{ color: "#fcf9f2", fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>Admin Panel</h1>
          <p style={{ color: "#737874", margin: "8px 0 0", fontSize: 14 }}>SHA Store Management</p>
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
                background: "#252520", border: "1px solid #333330", borderRadius: 10,
                color: "#e5e2db", fontSize: 15, outline: "none",
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
              width: "100%", padding: "13px", background: "#4ae183",
              color: "#131310", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700,
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
