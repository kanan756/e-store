"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams, useRouter } from "next/navigation"

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

function getPasswordStrength(pass: string): { label: string; score: number; color: string } {
  if (!pass) return { label: "", score: 0, color: "#E5E5E5" }
  let score = 0
  if (pass.length >= 8) score++
  if (/[A-Z]/.test(pass)) score++
  if (/[0-9]/.test(pass)) score++
  if (/[^A-Za-z0-9]/.test(pass)) score++

  if (score === 1) return { label: "Weak", score: 1, color: "#EF4444" }
  if (score === 2) return { label: "Fair", score: 2, color: "#F59E0B" }
  if (score === 3) return { label: "Good", score: 3, color: "#3B82F6" }
  return { label: "Strong", score: 4, color: "#10B981" }
}

export default function ResetPasswordClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""
  const email = searchParams.get("email") || ""

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const strength = getPasswordStrength(password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!token || !email) {
      setError("Invalid password reset link. Please request a new one.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          token,
          password,
          confirmPassword,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password")
      }

      setSuccess("Your password has been reset successfully! Redirecting to login…")
      setTimeout(() => {
        router.push("/login?reset=true")
      }, 1500)
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.")
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
              Set New Password
            </h1>
            <p style={{ fontSize: 14, color: "#747474", margin: 0, lineHeight: 1.5 }}>
              Choose a strong password for your CLASPO account.
            </p>
          </div>

          {error && (
            <div
              style={{
                padding: "12px 16px",
                background: "#FEF2F2",
                border: "1px solid #FCA5A5",
                borderRadius: 10,
                color: "#DC2626",
                fontSize: 13.5,
                fontWeight: 600,
                marginBottom: 20,
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              style={{
                padding: "12px 16px",
                background: "#F0FDF4",
                border: "1px solid #86EFAC",
                borderRadius: 10,
                color: "#16A34A",
                fontSize: 13.5,
                fontWeight: 600,
                marginBottom: 20,
              }}
            >
              {success}
            </div>
          )}

          {!token || !email ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <p style={{ color: "#DC2626", fontWeight: 600, marginBottom: 20 }}>
                This password reset link is invalid or incomplete.
              </p>
              <Link
                href="/forgot-password"
                style={{
                  display: "inline-block",
                  padding: "12px 24px",
                  background: "#F36B12",
                  color: "#FFFFFF",
                  fontWeight: 700,
                  fontSize: 14,
                  borderRadius: 8,
                  textDecoration: "none",
                }}
              >
                Request a New Link
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#17191C", marginBottom: 6 }}>
                  New Password <span style={{ color: "#F36B12" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 chars, 1 uppercase, 1 number"
                    required
                    style={{
                      width: "100%",
                      padding: "13px 42px 13px 14px",
                      borderRadius: 10,
                      border: "1.5px solid #E5E5E5",
                      fontSize: 14.5,
                      outline: "none",
                      boxSizing: "border-box",
                      fontFamily: "inherit",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#747474",
                      display: "flex",
                      alignItems: "center",
                      padding: 4,
                    }}
                  >
                    <EyeIcon open={showPass} />
                  </button>
                </div>

                {/* Password strength bar */}
                {password && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ display: "flex", gap: 4, height: 4, borderRadius: 2, overflow: "hidden" }}>
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          style={{
                            flex: 1,
                            background: step <= strength.score ? strength.color : "#E5E5E5",
                            transition: "background 0.2s",
                          }}
                        />
                      ))}
                    </div>
                    <div style={{ fontSize: 11, color: strength.color, fontWeight: 700, marginTop: 4 }}>
                      Password Strength: {strength.label}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#17191C", marginBottom: 6 }}>
                  Confirm New Password <span style={{ color: "#F36B12" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    required
                    style={{
                      width: "100%",
                      padding: "13px 42px 13px 14px",
                      borderRadius: 10,
                      border: "1.5px solid #E5E5E5",
                      fontSize: 14.5,
                      outline: "none",
                      boxSizing: "border-box",
                      fontFamily: "inherit",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#747474",
                      display: "flex",
                      alignItems: "center",
                      padding: 4,
                    }}
                  >
                    <EyeIcon open={showConfirm} />
                  </button>
                </div>
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
                  marginTop: 6,
                  opacity: loading ? 0.7 : 1,
                }}
                onMouseEnter={(e) => !loading && (e.currentTarget.style.background = "#D9570A")}
                onMouseLeave={(e) => !loading && (e.currentTarget.style.background = "#F36B12")}
              >
                {loading ? "Updating Password…" : "Update Password"}
              </button>
            </form>
          )}

          <div style={{ textAlign: "center", marginTop: 28, paddingTop: 20, borderTop: "1px solid #E5E5E5", fontSize: 14, color: "#747474" }}>
            Remember your credentials?{" "}
            <Link href="/login" style={{ color: "#F36B12", fontWeight: 800, textDecoration: "none" }}>
              Back to Login &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
