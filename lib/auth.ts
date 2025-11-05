// lib/auth.ts
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { sql } from "@/lib/db"

// === FORCE ENV VARS (TEMP FIX) ===
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "PtMVsl0yXjXlZHZKiG2yZH0PSusIVK8PY4I0ZkYx5dU="
const NEXTAUTH_URL = process.env.NEXTAUTH_URL || "https://v0-masjid-community-app.vercel.app"
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "215508504819-l9sgava2j04ie992cpqie3mmpt93kugb.apps.googleusercontent.com"
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "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"

console.log("NextAuth DEBUG:", {
  secret: NEXTAUTH_SECRET ? "SET" : "MISSING",
  clientId: GOOGLE_CLIENT_ID ? "SET" : "MISSING",
  clientSecret: GOOGLE_CLIENT_SECRET ? "SET" : "MISSING",
  url: NEXTAUTH_URL
})

export const authOptions = {
  providers: [
    Google({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: { signIn: "/auth/signin" },
  secret: NEXTAUTH_SECRET,
  baseUrl: NEXTAUTH_URL,
  session: { strategy: "jwt" as const },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.sub = user.id
      return token
    },
    async session({ session, token }) {
      if (token?.sub && session.user) {
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
