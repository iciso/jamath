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
      // First login: attach user
      if (user) {
        token.sub = user.id
        token.name = user.name
        token.email = user.email
      }
      return token
    },
    async session({ session, token }) {
      console.log("SESSION CALLBACK START:", { tokenSub: token.sub, hasProfileId: !!token.profileId })

      // Attach user basics
      if (token.sub) {
        session.user.id = token.sub
        session.user.name = token.name
        session.user.email = token.email
      }

      // ENSURE profileId IS IN JWT
      if (token.sub) {
        let profileId = token.profileId

        if (!profileId) {
          try {
            // Try to get from DB
            let result = await sql`
              SELECT id FROM profiles WHERE user_id = ${token.sub} LIMIT 1
            `
            profileId = result.rows[0]?.id

            // Create if missing
            if (!profileId) {
              result = await sql`
                INSERT INTO profiles (user_id, name, phone, address)
                VALUES (${token.sub}, ${token.name || "Member"}, '', '')
                RETURNING id
              `
              profileId = result.rows[0].id
            }

            // FORCE INTO JWT
            token.profileId = profileId
          } catch (error) {
            console.error("Profile error:", error)
          }
        }

        // ATTACH TO SESSION
        if (profileId) {
          session.user.profileId = profileId
        }
      }

      console.log("SESSION CALLBACK END:", { profileId: session.user.profileId })

      return session
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
