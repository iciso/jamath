// lib/auth.ts
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { sql } from "@/lib/db"

// === FORCE SECRET ===
const SECRET = process.env.NEXTAUTH_SECRET
if (!SECRET) {
  console.error("NEXTAUTH_SECRET IS MISSING!")
  throw new Error("NEXTAUTH_SECRET is required")
}

console.log("NextAuth initialized with SECRET:", SECRET.slice(0, 10) + "...")

export const authOptions = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: { signIn: "/auth/signin" },
  secret: SECRET,
  session: { strategy: "jwt" as const },
  callbacks: {
    async jwt({ token, user }) {
      console.log("JWT callback:", { userId: user?.id, tokenSub: token.sub })
      if (user?.id) token.sub = user.id
      return token
    },
    async session({ session, token }) {
      console.log("Session callback:", { tokenSub: token.sub })
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
