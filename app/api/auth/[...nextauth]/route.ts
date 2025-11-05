// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { sql } from "@/lib/db"

export const authOptions = {
  providers: [
    Google({
      clientId: "215508504819-l9sgava2j04ie992cpqie3mmpt93kugb.apps.googleusercontent.com",
      clientSecret: "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",
    }),
  ],
  pages: { signIn: "/signin" },
  secret: "PtMVsl0yXjXlZHZKiG2yZH0PSusIVK8PY4I0ZkYx5dU=",
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      // First login: attach user data
      if (user) {
        token.sub = user.id
        token.name = user.name
        token.email = user.email
      }
      return token
    },
    async session({ session, token }) {
      // Always attach from token
      if (token.sub) {
        session.user.id = token.sub
        session.user.name = token.name
        session.user.email = token.email
      }

      // GET OR CREATE PROFILE + SAVE IN JWT
      if (token.sub && !token.profileId) {
        try {
          // Try to get existing profile
          let result = await sql`
            SELECT id FROM profiles WHERE user_id = ${token.sub} LIMIT 1
          `

          let profileId = result.rows[0]?.id

          // Create if not exists
          if (!profileId) {
            result = await sql`
              INSERT INTO profiles (user_id, name, phone, address)
              VALUES (${token.sub}, ${token.name || "Member"}, '', '')
              RETURNING id
            `
            profileId = result.rows[0].id
          }

          // SAVE IN JWT → SURVIVES REFRESH
          token.profileId = profileId
          session.user.profileId = profileId
        } catch (error) {
          console.error("Profile sync failed:", error)
        }
      } else if (token.profileId) {
        // Already in JWT → attach to session
        session.user.profileId = token.profileId
      }

      return session
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
