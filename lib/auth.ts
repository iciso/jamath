import type { NextAuthOptions } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { sql } from "@/lib/neon"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        if (!creds?.email || !creds?.password) return null

        const approvedCheck = await sql<{ id: string }[]>`
          select id from approved_members 
          where email = ${creds.email.toLowerCase()} and review_status = 'approved'
          limit 1
        `

        if (!approvedCheck[0]) {
          return null // User not approved yet
        }

        // Fetch user by email
        const rows = await sql<
          { id: string; email: string; name: string | null; password_hash: string; role: "admin" | "member" }[]
        >`
            select id, email, name, password_hash, role
            from users
            where email = ${creds.email.toLowerCase()}
            limit 1
          `

        const user = rows[0]
        if (!user) return null

        const ok = await bcrypt.compare(creds.password, user.password_hash)
        if (!ok) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          role: user.role,
        } as any
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // attach role/id when logging in
        token.id = (user as any).id
        token.role = (user as any).role ?? "member"
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).id = token.id
        ;(session.user as any).role = token.role ?? "member"
      }
      return session
    },
  },
}

// Helper to use in RSC or route handlers
export function requiredRole(role: "admin" | "member", session?: any) {
  const r = (session?.user as any)?.role ?? "member"
  if (role === "admin" && r !== "admin") return false
  return true
}
