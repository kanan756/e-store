"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

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

function generateSecurePassword(length = 14): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ"
  const lower = "abcdefghijkmnopqrstuvwxyz"
  const digits = "23456789"
  const special = "!@#$%^&*_-+="
  const all = upper + lower + digits + special

  const pick = (charset: string): string => {
    const buf = new Uint32Array(1)
    window.crypto.getRandomValues(buf)
    return charset[buf[0] % charset.length]
  }

  const chars: string[] = [pick(upper), pick(lower), pick(digits), pick(special)]
  for (let i = chars.length; i < length; i++) {
    chars.push(pick(all))
  }

  for (let i = chars.length - 1; i > 0; i--) {
    const buf = new Uint32Array(1)
    window.crypto.getRandomValues(buf)
    const j = buf[0] % (i + 1)
    const tmp = chars[i]
    chars[i] = chars[j]
    chars[j] = tmp
  }

  return chars.join("")
}

export default function SignupClient() {
  const router = useRouter()
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  })
  const [suggestedPassword, setSuggestedPassword] = useState("")
  const [showSuggestion, setShowSuggestion] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const strength = getPasswordStrength(form.password)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
    if (error) setError("")
  }

  const handlePasswordFocus = () => {
    if (!suggestedPassword) {
      setSuggestedPassword(generateSecurePassword(14))
    }
    setShowSuggestion(true)
  }

  const handleUseSuggestedPassword = () => {
    const next = suggestedPassword || generateSecurePassword(14)
    setSuggestedPassword(next)
    setForm((prev) => ({
      ...prev,
      password: next,
    }))
    setShowPass(true)
    setShowSuggestion(false)
    if (error) setError("")
  }

  const handleGenerateAnother = () => {
    setSuggestedPassword(generateSecurePassword(14))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (form.fullName.trim().length < 2) {
      setError("Please enter your full name (at least 2 characters).")
      return
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    if (!form.terms) {
      setError("You must accept the Terms and Conditions to register.")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          password: form.password,
          confirmPassword: form.confirmPassword,
          terms: form.terms,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Registration failed")
      }

      setSuccess("Account created successfully! Logging you in…")

      const loginRes = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      })

      if (loginRes?.ok) {
        router.push("/account")
      } else {
        router.push("/login?registered=true")
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during registration.")
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setError("")
    setGoogleLoading(true)
    try {
      const res = await signIn("google", { callbackUrl: "/account" })
      if (res?.error) {
        setError("Google Sign-In failed. Please check your Google OAuth configuration and try again.")
        setGoogleLoading(false)
      }
    } catch {
      setError("Unable to connect to Google Sign-In. Please try again.")
      setGoogleLoading(false)
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F5F5F5", paddingTop: 140, paddingBottom: 80 }}>
      <div className="W" style={{ display: "flex", justifyContent: "center" }}>
        <div
          style={{
            width: "100%",
            maxWidth: 520,
            background: "#FFFFFF",
            borderRadius: 20,
            border: "1px solid #E5E5E5",
            boxShadow: "0 12px 40px rgba(0, 0, 0, 0.05)",
            padding: "clamp(24px, 5vw, 40px) clamp(18px, 5vw, 36px)",
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
                fontSize: 26,
                fontWeight: 900,
                color: "#17191C",
                letterSpacing: "-0.02em",
                marginBottom: 8,
              }}
            >
              Create Your CLASPO Account
            </h1>
            <p style={{ fontSize: 14.5, color: "#747474", margin: 0, lineHeight: 1.5 }}>
              Join CLASPO and discover smarter solutions for everyday living.
            </p>
          </div>

          {/* Social OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={googleLoading || loading}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              padding: "13px 20px",
              background: "#FFFFFF",
              border: "1.5px solid #E5E5E5",
              borderRadius: 10,
              color: "#17191C",
              fontSize: 14.5,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s",
              marginBottom: 24,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#F9F9F9"
              e.currentTarget.style.borderColor = "#D0D0D0"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#FFFFFF"
              e.currentTarget.style.borderColor = "#E5E5E5"
            }}
          >
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.8 33.9 29.4 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6-6C34.5 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.9 0 20.4-7.9 20.4-21 0-1.4-.1-2.7-.4-4z" />
              <path fill="#FF3D00" d="M6.3 14.7l7 5.1C15.1 15.7 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6-6C34.5 5.1 29.5 3 24 3 16.3 3 9.6 7.9 6.3 14.7z" />
              <path fill="#4CAF50" d="M24 45c5.4 0 10.3-1.9 14.1-5.1l-6.5-5.5C29.6 36 26.9 37 24 37c-5.3 0-9.8-3.1-11.3-7.5l-7 5.4C9.6 41.1 16.3 45 24 45z" />
              <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.5-2.5 4.5-4.6 6l6.5 5.5C40.9 36.2 44 30.6 44 24c0-1.4-.1-2.7-.4-4z" />
            </svg>
            {googleLoading ? "Connecting with Google…" : "Continue with Google"}
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <div style={{ flex: 1, height: 1, background: "#E5E5E5" }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#A0A0A0", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Or register with email
            </span>
            <div style={{ flex: 1, height: 1, background: "#E5E5E5" }} />
          </div>

          {/* Feedback Alerts */}
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

          {/* Registration Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Full Name */}
            <div>
              <label htmlFor="signup-fullname" style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#17191C", marginBottom: 6 }}>
                Full Name <span style={{ color: "#F36B12" }}>*</span>
              </label>
              <input
                id="signup-fullname"
                type="text"
                name="fullName"
                autoComplete="name"
                value={form.fullName}
                onChange={handleChange}
                placeholder="e.g. Aarav Sharma"
                required
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: "1.5px solid #E5E5E5",
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                }}
              />
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="signup-email" style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#17191C", marginBottom: 6 }}>
                Email Address <span style={{ color: "#F36B12" }}>*</span>
              </label>
              <input
                id="signup-email"
                type="email"
                name="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: "1.5px solid #E5E5E5",
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="signup-password" style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#17191C", marginBottom: 6 }}>
                Password <span style={{ color: "#F36B12" }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="signup-password"
                  type={showPass ? "text" : "password"}
                  name="password"
                  autoComplete="new-password"
                  value={form.password}
                  onFocus={handlePasswordFocus}
                  onChange={handleChange}
                  placeholder="At least 8 chars, 1 uppercase, 1 number"
                  required
                  style={{
                    width: "100%",
                    padding: "12px 42px 12px 14px",
                    borderRadius: 10,
                    border: "1.5px solid #E5E5E5",
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  aria-label={showPass ? "Hide password" : "Show password"}
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

              {/* Compact inline Password Suggestion */}
              {showSuggestion && (
                <div
                  style={{
                    marginTop: 8,
                    padding: "8px 12px",
                    borderRadius: 8,
                    background: "#FAFAFA",
                    border: "1px solid #E5E5E5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ fontSize: 12, color: "#303638", display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                    <span style={{ fontWeight: 700, color: "#747474" }}>Suggested Password:</span>
                    <code style={{ fontFamily: "var(--font-mono), monospace", fontSize: 12, fontWeight: 700, color: "#17191C" }}>
                      {suggestedPassword}
                    </code>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button
                      type="button"
                      onClick={handleUseSuggestedPassword}
                      style={{
                        padding: "4px 10px",
                        borderRadius: 6,
                        border: "none",
                        background: "#F36B12",
                        color: "#FFFFFF",
                        fontSize: 11.5,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Use Password
                    </button>
                    <button
                      type="button"
                      onClick={handleGenerateAnother}
                      style={{
                        padding: "4px 8px",
                        borderRadius: 6,
                        border: "1px solid #E5E5E5",
                        background: "#FFFFFF",
                        color: "#303638",
                        fontSize: 11.5,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Generate Another
                    </button>
                  </div>
                </div>
              )}

              {/* Password strength bar */}
              {form.password && (
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

            {/* Confirm Password */}
            <div>
              <label htmlFor="signup-confirm-password" style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#17191C", marginBottom: 6 }}>
                Confirm Password <span style={{ color: "#F36B12" }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="signup-confirm-password"
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat your password"
                  required
                  style={{
                    width: "100%",
                    padding: "12px 42px 12px 14px",
                    borderRadius: 10,
                    border: "1.5px solid #E5E5E5",
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
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

            {/* Terms and conditions */}
            <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", marginTop: 4 }}>
              <input
                type="checkbox"
                name="terms"
                checked={form.terms}
                onChange={handleChange}
                required
                style={{ width: 18, height: 18, accentColor: "#F36B12", marginTop: 2, flexShrink: 0 }}
              />
              <span style={{ fontSize: 13, color: "#747474", lineHeight: 1.5 }}>
                I agree to the{" "}
                <Link href="/terms" style={{ color: "#F36B12", fontWeight: 700, textDecoration: "none" }}>
                  Terms &amp; Conditions
                </Link>{" "}
                and{" "}
                <Link href="/privacy" style={{ color: "#F36B12", fontWeight: 700, textDecoration: "none" }}>
                  Privacy Policy
                </Link>
                .
              </span>
            </label>

            {/* Register Button */}
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
              {loading ? "Registering…" : "Register"}
            </button>
          </form>

          {/* Footer Link: Existing account */}
          <div style={{ textAlign: "center", marginTop: 28, paddingTop: 20, borderTop: "1px solid #E5E5E5", fontSize: 14, color: "#747474" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "#F36B12", fontWeight: 800, textDecoration: "none" }}>
              Sign In &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
