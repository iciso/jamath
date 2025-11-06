// lib/auth.ts
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { sql } from "@/lib/db"

// === HARD-CODED — REQUIRED BY VERCEL ===
const NEXTAUTH_SECRET = "PtMVsl0yXjXlZHZKiG2yZH0PSusIVK8PY4I0ZkYx5dU="
const NEXTAUTH_URL = "https://v0-masjid-community-app.vercel.app"
const GOOGLE_CLIENT_ID = "215508504819-l9sgava2j04ie992cpqie3mmpt93kugb.apps.googleusercontent.com"
const GOOGLE_CLIENT_SECRET = "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"

console.log("NextAuth: HARD-CODED VALUES LOADED")

export const authOptions = {
  providers: [
    Google({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  pages: { signIn: "/auth/signin" },
  secret: NEXTAUTH_SECRET,
  baseUrl: NEXTAUTH_URL,
  session: { strategy: "jwt" as const },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && account.provider === "google") {
        // Extract sub from id_token (JWT)
        if (account.id_token) {
          try {
            const payload = JSON.parse(Buffer.from(account.id_token.split('.')[1], 'base64').toString())
            if (payload.sub) {
              token.sub = payload.sub
            }
          } catch (e) {
            console.error("Failed to parse id_token:", e)
          }
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token?.sub) {
        session.user.id = token.sub  // ← FINAL: userId from Google sub
        let profileId: string | null = null
        try {
          const result = await sql`
            SELECT id FROM profiles WHERE user_id = ${token.sub} LIMIT 1
          `
          profileId = result.rows[0]?.id ?? null

          if (!profileId) {
            const newProfile = await sql`
              INSERT INTO profiles (user_id, name, phone, address)
              VALUES (${token.sub}, ${session.user.name || "Member"}, '', '')
              RETURNING id
            `
            profileId = newProfile.rows[0]?.id
          }
        } catch (error) {
          console.error("[Auth] Profile sync failed:", error)
        }
        ;(session.user as any).profileId = profileId
      }
      return session
    },
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions)
