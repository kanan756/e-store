import type { AuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { getUserByEmail, appendUser, updateUser, logUserActivity, getUserByUsername } from "@/lib/sheets"

async function generateUniqueUsername(base: string): Promise<string> {
  const cleanBase = base.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase() || "user"
  let candidate = cleanBase
  let counter = 1

  while (await getUserByUsername(candidate)) {
    candidate = `${cleanBase}_${Math.random().toString(36).substring(2, 6)}`
    counter++
    if (counter > 10) break
  }
  return candidate
}

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

        // Authenticate customer from Users sheet in Google Sheets
        try {
          const user = await getUserByEmail(email)
          if (!user || !user.passwordHash) {
            return null
          }
          const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
          if (!isPasswordValid) {
            return null
          }

          // Log successful login activity
          await logUserActivity(
            user.userId,
            "USER_LOGIN",
            `Customer logged in with email ${user.email}`
          ).catch(() => {})

          return {
            id: user.userId,
            email: user.email,
            name: user.fullName,
            username: user.username,
            image: user.profileImage || null,
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
          const existing = await getUserByEmail(email)
          if (!existing) {
            const rawBase = (user.name ?? email.split("@")[0])
            const uniqueUsername = await generateUniqueUsername(rawBase)
            const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
            const now = new Date().toISOString()

            await appendUser({
              userId,
              fullName: user.name || "Customer",
              username: uniqueUsername,
              phoneNumber: "",
              email,
              passwordHash: "",
              provider: "google",
              profileImage: user.image || "",
              emailVerified: now,
              createdAt: now,
              updatedAt: now,
            })

            await logUserActivity(
              userId,
              "USER_REGISTER_GOOGLE",
              `Created account via Google OAuth (${email})`
            ).catch(() => {})
          } else {
            // Update profile image if missing
            if (user.image && !existing.profileImage) {
              await updateUser(existing.userId, { profileImage: user.image })
            }

            await logUserActivity(
              existing.userId,
              "USER_LOGIN_GOOGLE",
              `Logged in via Google OAuth (${email})`
            ).catch(() => {})
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
        token.username = (user as any).username || ""
        if (user.image) token.picture = user.image
      }

      // If username or valid userId is missing (e.g. initial Google login token), lookup from Users sheet
      if ((!token.username || !token.id || !String(token.id).startsWith("usr_")) && token.email) {
        try {
          const found = await getUserByEmail(token.email)
          if (found) {
            token.id = found.userId
            token.username = found.username
            if (found.fullName) token.name = found.fullName
            if (found.profileImage) token.picture = found.profileImage
          }
        } catch (err) {
          console.error("JWT user lookup error:", err)
        }
      }

      if (trigger === "update" && session) {
        if (session.name) token.name = session.name
        if (session.username) token.username = session.username
        if (session.image) token.picture = session.image
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).username = token.username || "";
        if (token.picture) session.user.image = token.picture as string;
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "claspo_secure_auth_secret_production_2026",
}
