"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"

export default function ForgotPasswordClient() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to process request")
      }

      setStatus("success")
      setMessage(data.message || "If an account with that email exists, a password reset link has been sent.")
    } catch (err: any) {
      setStatus("error")
      setMessage(err.message || "An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F5F5F5", paddingTop: 140, paddingBottom: 80 }}>
      <div className="W" style={{ display: "flex", justifyContent: "center" }}>
        <div
          style={{
            width: "100%",
            maxWidth: 460,
            background: "#FFFFFF",
            borderRadius: 20,
            border: "1px solid #E5E5E5",
            boxShadow: "0 12px 40px rgba(0, 0, 0, 0.05)",
            padding: "44px 36px",
          }}
        >
          {/* Logo & Header */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <Link href="/" style={{ display: "inline-block", position: "relative", width: 160, height: 48, marginBottom: 12 }}>
              <Image
                src="/images/claspo-latest-logo.png"
                alt="CLASPO™ - SMART HOME SOLUTIONS"
                fill
                style={{ objectFit: "contain" }}
                priority
                unoptimized
              />
            </Link>
            <h1
              style={{
                fontFamily: "var(--font-sora), sans-serif",
                fontSize: 24,
                fontWeight: 900,
                color: "#17191C",
                letterSpacing: "-0.02em",
                marginBottom: 8,
              }}
            >
              Reset Your Password
            </h1>
            <p style={{ fontSize: 14, color: "#747474", margin: 0, lineHeight: 1.5 }}>
              Enter your registered email address and we&apos;ll send you a secure link to reset your password.
            </p>
          </div>

          {status === "success" ? (
            <div style={{ textAlign: "center", padding: "10px 0" }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "#F0FDF4",
                  border: "1px solid #86EFAC",
                  color: "#16A34A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  margin: "0 auto 16px",
                }}
              >
                ✓
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#17191C", marginBottom: 10 }}>Check Your Inbox</h3>
              <p style={{ fontSize: 14, color: "#747474", lineHeight: 1.6, marginBottom: 24 }}>
                {message}
              </p>
              <Link
                href="/login"
                style={{
                  display: "inline-block",
                  padding: "12px 28px",
                  background: "#F36B12",
                  color: "#FFFFFF",
                  fontWeight: 700,
                  fontSize: 14,
                  borderRadius: 8,
                  textDecoration: "none",
                  boxShadow: "0 4px 12px rgba(243, 107, 18, 0.25)",
                }}
              >
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {status === "error" && (
                <div
                  style={{
                    padding: "12px 16px",
                    background: "#FEF2F2",
                    border: "1px solid #FCA5A5",
                    borderRadius: 10,
                    color: "#DC2626",
                    fontSize: 13.5,
                    fontWeight: 600,
                  }}
                >
                  {message}
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#17191C", marginBottom: 6 }}>
                  Email Address <span style={{ color: "#F36B12" }}>*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  style={{
                    width: "100%",
                    padding: "13px 14px",
                    borderRadius: 10,
                    border: "1.5px solid #E5E5E5",
                    fontSize: 14.5,
                    outline: "none",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: "#F36B12",
                  color: "#FFFFFF",
                  fontSize: 15,
                  fontWeight: 800,
                  borderRadius: 10,
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 14px rgba(243, 107, 18, 0.3)",
                  transition: "all 0.2s",
                  opacity: loading ? 0.7 : 1,
                }}
                onMouseEnter={(e) => !loading && (e.currentTarget.style.background = "#D9570A")}
                onMouseLeave={(e) => !loading && (e.currentTarget.style.background = "#F36B12")}
              >
                {loading ? "Sending Reset Link…" : "Send Reset Link"}
              </button>
            </form>
          )}

          <div style={{ textAlign: "center", marginTop: 28, paddingTop: 20, borderTop: "1px solid #E5E5E5", fontSize: 14, color: "#747474" }}>
            Remembered your password?{" "}
            <Link href="/login" style={{ color: "#F36B12", fontWeight: 800, textDecoration: "none" }}>
              Back to Login &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
