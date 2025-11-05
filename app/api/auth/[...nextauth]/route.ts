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
      if (user) {
        token.sub = user.id
        token.name = user.name
        token.email = user.email
      }
      return token
    },
    async session({ session, token }) {
      console.log("SESSION CALLBACK:", { tokenSub: token.sub, tokenProfileId: token.profileId })

      if (token.sub) {
        session.user.id = token.sub
        session.user.name = token.name
        session.user.email = token.email
      }

      if (token.sub && !token.profileId) {
        try {
          let result = await sql`
            SELECT id FROM profiles WHERE user_id = ${token.sub} LIMIT 1
          `

          let profileId = result.rows[0]?.id

          if (!profileId) {
            result = await sql`
              INSERT INTO profiles (user_id, name, phone, address)
              VALUES (${token.sub}, ${token.name || "Member"}, '', '')
              RETURNING id
            `
            profileId = result.rows[0].id
          }

          token.profileId = profileId
          session.user.profileId = profileId
        } catch (error) {
          console.error("Profile error:", error)
        }
      } else if (token.profileId) {
        session.user.profileId = token.profileId
      }

      // CRITICAL: RETURN SESSION
      return session
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
