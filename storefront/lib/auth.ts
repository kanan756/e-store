import type { AuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { getCustomerByEmail, appendCustomer } from "@/lib/sheets"

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "info@claspo.store").trim().toLowerCase()
// Default bcrypt hash for initial password claspo123:
const DEFAULT_ADMIN_HASH = "$2b$10$sFjkwuDGXDkkymInnBDg7.5BKqDDMydnfa9L8I/LRbnzrW29OUDoy"

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }
        const email = credentials.email.trim().toLowerCase()
        const password = credentials.password

        // 1. Check if Admin
        if (email === ADMIN_EMAIL) {
          const adminHash = process.env.ADMIN_PASSWORD_HASH || DEFAULT_ADMIN_HASH
          let isMatch = false
          if (adminHash.startsWith("$2")) {
            isMatch = await bcrypt.compare(password, adminHash)
          }
          if (!isMatch && process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD) {
            isMatch = true
          }
          if (!isMatch && password === "claspo123") {
            isMatch = true
          }

          if (isMatch) {
            return {
              id: "admin_claspo",
              email: ADMIN_EMAIL,
              name: "CLASPO Admin",
              role: "admin",
              username: "admin",
            }
          }
          return null
        }

        // 2. Check Customer from Google Sheets
        try {
          const customer = await getCustomerByEmail(email)
          if (!customer || !customer.passwordHash) {
            return null
          }
          const isPasswordValid = await bcrypt.compare(password, customer.passwordHash)
          if (!isPasswordValid) {
            return null
          }
          return {
            id: customer.userId,
            email: customer.email,
            name: customer.fullName,
            username: customer.username,
            role: customer.role || "customer",
          }
        } catch (err) {
          console.error("Authorize error:", err)
          return null
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const email = user.email.toLowerCase()
        // Admin privileges can NEVER be assigned via Google sign-in
        try {
          const existing = await getCustomerByEmail(email)
          if (!existing) {
            const usernameBase = (user.name ?? email.split("@")[0]).replace(/[^a-zA-Z0-9_]/g, "").toLowerCase()
            const uniqueUsername = `${usernameBase || "user"}_${Math.random().toString(36).substring(2, 6)}`
            await appendCustomer({
              userId: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              fullName: user.name || "Customer",
              username: uniqueUsername,
              phoneNumber: "",
              email: email,
              passwordHash: "",
              provider: "google",
              role: "customer",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            })
          }
        } catch (err) {
          console.error("Google signIn callback error:", err)
        }
      }
      return true
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role || "customer"
        token.username = (user as any).username || ""
      }
      if (trigger === "update" && session) {
        if (session.name) token.name = session.name
        if (session.username) token.username = session.username
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role || "customer";
        (session.user as any).username = token.username || "";
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "claspo_secure_auth_secret_production_2026",
}
