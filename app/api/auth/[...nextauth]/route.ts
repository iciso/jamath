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
      // On first login
      if (user) {
        token.sub = user.id
        token.name = user.name
        token.email = user.email
      }
      return token
    },
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub
        session.user.name = token.name
        session.user.email = token.email

        // GET OR CREATE PROFILE
        try {
          const result = await sql`
            INSERT INTO profiles (user_id, name, phone, address)
            VALUES (${token.sub}, ${token.name || "Member"}, '', '')
            ON CONFLICT (user_id) DO NOTHING
            RETURNING id
          `

          const profileId = result.rows[0]?.id || (
            await sql`SELECT id FROM profiles WHERE user_id = ${token.sub}`
          ).rows[0]?.id

          if (profileId) {
            session.user.profileId = profileId
            token.profileId = profileId  // ← CRITICAL: SAVE IN JWT
          }
        } catch (error) {
          console.error("Profile error:", error)
        }
      }
      return session
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
