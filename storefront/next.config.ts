/**
 * @file next.config.ts
 * @description Next.js configuration for Client Store.
 *   - Security headers on every response (CSP, HSTS, no-sniff, frame deny, etc.)
 *   - Allowed image domains for next/image remote patterns
 *   - Turbopack / build settings
 *
 * @owner Heet-P
 * @lastModified May 16, 2026
 */

import type { NextConfig } from "next"
import path from "path"
import os from "os"

/**
 * Collect all active local IPv4 addresses so Next.js HMR WebSocket
 * connections are authorized across localhost, LAN, and virtual adapters.
 */
function getLocalDevOrigins(): string[] {
  const origins = new Set<string>([
    "localhost",
    "127.0.0.1",
    "192.168.56.1",
    "192.168.1.8",
  ])
  try {
    const ifaces = os.networkInterfaces()
    for (const name in ifaces) {
      for (const iface of ifaces[name] || []) {
        if (iface.family === "IPv4" && !iface.internal) {
          origins.add(iface.address)
        }
      }
    }
  } catch {}
  return Array.from(origins)
}

// ── Security headers applied to every route ──────────────────────────────────
const securityHeaders = [
  // Block pages from being embedded in iframes (clickjacking protection)
  { key: "X-Frame-Options", value: "DENY" },

  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },

  // Control referrer info sent with requests
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

  // Restrict browser feature access
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },

  // Enable DNS prefetch for performance
  { key: "X-DNS-Prefetch-Control", value: "on" },

  // Strict HTTPS — 1 year, include subdomains (only active over HTTPS)
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },

  // Content Security Policy
  // Allows: self, Google Fonts, Google OAuth, trusted image CDNs
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Scripts: self + inline/eval (Next.js needs these) + Google Analytics (consent-gated)
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https: http://localhost:* http://127.0.0.1:* http://192.168.*:*",
      // Frames: Google OAuth
      "frame-src https://accounts.google.com https://*.stripe.com",
      // Fetch/XHR/WebSockets: own API + Google OAuth + GA + dev HMR WebSockets
      "connect-src 'self' ws: wss: http: https: https://accounts.google.com https://oauth2.googleapis.com https://www.googleapis.com https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com",
      "form-action 'self' http://localhost:* http://127.0.0.1:* http://192.168.*:* https://*.stripe.com",
      "base-uri 'self'",
    ].join("; "),
  },
]

const nextConfig: NextConfig = {
  allowedDevOrigins: getLocalDevOrigins(),
  outputFileTracingRoot: path.join(__dirname),
  turbopack: {
    root: path.join(__dirname),
  },

  // Apply security headers to all responses
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ]
  },

  // Allowed remote image hostnames for next/image
  // Add any CDN or external image host your products use here
  images: {
    remotePatterns: [
      // Google user profile photos (used in OAuth track-order page)
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      // General HTTPS images (product images, blog covers stored externally)
      { protocol: "https", hostname: "**" },
      // Local dev only
      { protocol: "http", hostname: "localhost" },
    ],
  },
  serverExternalPackages: ["pdfkit"],
}

export default nextConfig
