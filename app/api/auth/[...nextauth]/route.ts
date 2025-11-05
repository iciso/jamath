// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { sql } from "@/lib/db"  // ← MUST BE IMPORTED

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
      if (user?.id) {
        token.sub = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub

        // CREATE PROFILE IF NOT EXISTS
        try {
          const result = await sql`
            INSERT INTO profiles (user_id, name, phone, address)
            VALUES (${token.sub}, ${session.user.name || "Member"}, '', '')
            ON CONFLICT (user_id) DO UPDATE SET name = EXCLUDED.name
            RETURNING id
          `
          ;(session.user as any).profileId = result.rows[0].id
        } catch (error) {
          console.error("Profile creation failed:", error)
        }
      }
      return session
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
