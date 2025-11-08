// lib/auth.ts
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { sql } from "@/lib/db"
import bcrypt from "bcryptjs"

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const [user] = await sql`
          SELECT id, name, email, password_hash, role 
          FROM users 
          WHERE email = ${credentials.email} 
          LIMIT 1
        `

        if (!user || !user.password_hash) return null

        const isValid = bcrypt.compareSync(credentials.password, user.password_hash)
        if (!isValid) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, account, profile }) {
      // First time login
      if (user) {
        token.id = user.id
        token.role = user.role
      }

      // ONLY for Google OAuth
      if (account?.provider === "google" && profile?.sub) {
        const googleId = profile.sub
        const email = profile.email
        const name = profile.name

        const [existing] = await sql`
          SELECT id, role FROM users WHERE google_id = ${googleId} OR email = ${email}
        `

        if (existing) {
          token.id = existing.id
          token.role = existing.role
          // Update name if changed
          await sql`UPDATE users SET name = ${name} WHERE id = ${existing.id}`
        } else {
          const [newUser] = await sql`
            INSERT INTO users (google_id, name, email, role, password_hash)
            VALUES (${googleId}, ${name}, ${email}, 'member', NULL)
            RETURNING id, role
          `
          token.id = newUser.id
          token.role = newUser.role
        }
      }

      return token
    },

    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },

  pages: {
    signIn: "/auth/signin",
  },

  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
}

export default NextAuth(authOptions)
