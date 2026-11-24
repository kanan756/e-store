import type { AuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { getCustomerByEmail, appendCustomer } from "@/lib/sheets"

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

        // Authenticate customer from Google Sheets
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
            role: "customer",
          }
        } catch (err) {
          console.error("Customer authorize error:", err)
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
        token.role = "customer"
        token.username = (user as any).username || ""
      }
      // If customer signed in via Google or username is missing, retrieve from Google Sheets customer data
      if ((!token.username || !token.id || String(token.id).startsWith("google-") || !String(token.id).startsWith("usr_")) && token.email) {
        try {
          const cust = await getCustomerByEmail(token.email)
          if (cust) {
            token.id = cust.userId
            token.username = cust.username
            if (cust.fullName) token.name = cust.fullName
          }
        } catch (err) {
          console.error("JWT customer lookup error:", err)
        }
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
        (session.user as any).role = "customer";
        (session.user as any).username = token.username || "";
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "claspo_secure_auth_secret_production_2026",
}
