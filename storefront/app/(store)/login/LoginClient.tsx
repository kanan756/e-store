"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"

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

export default function LoginClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const registered = searchParams.get("registered")
  const resetSuccess = searchParams.get("reset")
  const messageParam = searchParams.get("message")
  const errorParam = searchParams.get("error")
  const callbackUrl = searchParams.get("callbackUrl") || "/account"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [infoMessage, setInfoMessage] = useState("")

  useEffect(() => {
    if (registered === "true") {
      setSuccess("Account registered successfully! Please sign in with your credentials.")
    }
    if (resetSuccess === "true") {
      setSuccess("Password reset successful. Please sign in with your new password.")
    }
    if (messageParam) {
      setInfoMessage(messageParam)
    }
    if (errorParam) {
      const errorMessages: Record<string, string> = {
        OAuthSignin: "Could not start Google Sign-In. Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local.",
        OAuthCallback: "Google authentication failed during callback. Verify the authorized redirect URI in Google Cloud Console.",
        OAuthCreateAccount: "Could not create your account from Google Sign-In. Please try again.",
        OAuthAccountNotLinked: "This email is already registered with another sign-in method.",
        AccessDenied: "Google Sign-In was cancelled or access was denied.",
        Configuration: "Authentication configuration error. Please check server environment variables.",
      }
      setError(errorMessages[errorParam] || "Authentication failed. Please try again.")
    }
  }, [registered, resetSuccess, messageParam, errorParam])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const cleanEmail = email.trim().toLowerCase()
      const res = await signIn("credentials", {
        email: cleanEmail,
        password,
        redirect: false,
      })

      if (!res || !res.ok) {
        setError("Invalid email address or password. Please try again.")
        setLoading(false)
        return
      }

      // Customer redirect
      window.location.href = callbackUrl || "/account"
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.")
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError("")
    setGoogleLoading(true)
    try {
      const res = await signIn("google", { callbackUrl: callbackUrl || "/account" })
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
            maxWidth: 460,
            background: "#FFFFFF",
            borderRadius: 20,
            border: "1px solid #E5E5E5",
            boxShadow: "0 12px 40px rgba(0, 0, 0, 0.05)",
            padding: "clamp(24px, 5vw, 44px) clamp(18px, 5vw, 36px)",
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
              Welcome Back to CLASPO
            </h1>
            <p style={{ fontSize: 14.5, color: "#747474", margin: 0, lineHeight: 1.5 }}>
              Sign in to continue your smarter shopping experience.
            </p>
          </div>

          {/* Social OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
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
              Or sign in with email
            </span>
            <div style={{ flex: 1, height: 1, background: "#E5E5E5" }} />
          </div>

          {/* Feedback Alerts */}
          {infoMessage && (
            <div
              style={{
                padding: "13px 16px",
                background: "#FFF7ED",
                border: "1.5px solid #FDBA74",
                borderRadius: 10,
                color: "#C2410C",
                fontSize: 13.5,
                fontWeight: 600,
                marginBottom: 20,
                display: "flex",
                alignItems: "center",
                gap: 10,
                lineHeight: 1.45,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F36B12" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{infoMessage}</span>
            </div>
          )}

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

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
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

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#17191C" }}>
                  Password <span style={{ color: "#F36B12" }}>*</span>
                </label>
                <Link href="/forgot-password" style={{ fontSize: 13, color: "#F36B12", fontWeight: 700, textDecoration: "none" }}>
                  Forgot Password?
                </Link>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
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
            </div>

            {/* Remember Me */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ width: 17, height: 17, accentColor: "#F36B12" }}
                />
                <span style={{ fontSize: 13.5, color: "#747474", fontWeight: 500 }}>Remember Me</span>
              </label>
            </div>

            {/* Submit Button */}
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
              {loading ? "Signing In…" : "Sign In"}
            </button>
          </form>

          {/* Footer Link: Don't have an account */}
          <div style={{ textAlign: "center", marginTop: 28, paddingTop: 20, borderTop: "1px solid #E5E5E5", fontSize: 14, color: "#747474" }}>
            Don&apos;t have an account?{" "}
            <Link href="/signup" style={{ color: "#F36B12", fontWeight: 800, textDecoration: "none" }}>
              Create Account &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
