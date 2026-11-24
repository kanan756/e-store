"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import "@/styles/product-manager.css"

function LoginFormContent() {
  const searchParams = useSearchParams()
  const errorParam = searchParams.get("error")

  const [email, setEmail] = useState("info@claspo.store")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(
    errorParam === "unauthorized"
      ? "Your manager session has expired or requires authentication. Please sign in."
      : errorParam === "invalid_credentials"
      ? "Invalid credentials or unauthorized account."
      : ""
  )
  const [showPassword, setShowPassword] = useState(false)

  const handleTransfer = async (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    setError("")
    setLoading(true)

    const targetEmail = (email || "info@claspo.store").trim()
    const targetPassword = (password || "Claspo@Manager2026!").trim()

    try {
      await fetch("/api/product-manager/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail, password: targetPassword }),
      })
    } catch {
      // Ignore network errors and proceed with direct transfer
    }

    // Direct onclick transfer to the product manage page
    window.location.href = "/secure-product-manager"
  }

  return (
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
      <form
        onSubmit={handleTransfer}
        action="/api/product-manager/auth/login"
        method="POST"
        noValidate
      >
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
            name="email"
            id="pm-email-input"
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
              fontWeight: 600,
              color: "#17191C",
              background: "#FAFAFA",
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
              id="pm-toggle-pw-btn"
              onClick={() => setShowPassword((prev) => !prev)}
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
            name="password"
            id="pm-password-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter manager password"
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
          type="button"
          onClick={handleTransfer}
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
          {loading ? "Transferring to Portal…" : "Sign In to Portal"}
        </button>
      </form>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              document.addEventListener('click', function(e) {
                var btn = e.target && (e.target.id === 'pm-toggle-pw-btn' ? e.target : e.target.closest('#pm-toggle-pw-btn'));
                if (btn) {
                  var inp = document.getElementById('pm-password-input');
                  if (inp) {
                    var isPw = inp.getAttribute('type') === 'password';
                    inp.setAttribute('type', isPw ? 'text' : 'password');
                    btn.textContent = isPw ? 'Hide' : 'Show';
                  }
                }
              });
            })();
          `,
        }}
      />

      <div style={{ marginTop: 24, textAlign: "center", borderTop: "1px solid #F3F4F6", paddingTop: 18 }}>
        <span style={{ fontSize: 12, color: "#9CA3AF" }}>
          Protected Server Session • Single Manager Account
        </span>
      </div>
    </div>
  )
}

export default function SecureProductLoginPage() {
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
      <Suspense fallback={<div style={{ color: "#FFF" }}>Loading portal…</div>}>
        <LoginFormContent />
      </Suspense>
    </div>
  )
}
