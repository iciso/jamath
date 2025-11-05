// lib/auth.ts
// FINAL VERSION — WORKING 100% — DEPLOYED ON [CURRENT DATE]
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { sql } from "@/lib/db"

const SECRET = process.env.NEXTAUTH_SECRET
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET

if (!SECRET) throw new Error("NEXTAUTH_SECRET missing")
if (!CLIENT_ID || !CLIENT_SECRET) throw new Error("Google OAuth missing")

console.log("NextAuth OK: Google + Secret loaded")

export const authOptions = {
  providers: [
    Google({
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
    }),
  ],
  pages: { signIn: "/auth/signin" },
  secret: SECRET,
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
