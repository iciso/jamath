// lib/auth.ts
import type { NextAuthOptions } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { sql } from "@/lib/neon"
import bcrypt from "bcryptjs"
import { sql } from "@/lib/db" // ← Add this import

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
        token.id = (user as any).id
        token.role = (user as any).role ?? "member"
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).id = token.id
        ;(session.user as any).role = token.role ?? "member"

        // ← NEW: Inject profileId from profiles table
        try {
          const db = sql()
          const [profile] = await db`
            SELECT id FROM profiles WHERE user_id = ${token.id} LIMIT 1
          `
          if (profile) {
            ;(session.user as any).profileId = profile.id
          }
        } catch (err) {
          console.error("[Auth] Failed to fetch profileId:", err)
          // Don't break login — just no profileId
        }
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
