// lib/auth.ts
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { sql } from "@/lib/db"
import bcrypt from "bcryptjs"

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null
        const [user] = await sql`SELECT * FROM users WHERE email = ${credentials.email}`
        if (!user || !bcrypt.compareSync(credentials.password, user.password_hash || "")) {
          return null
        }
        return { id: user.id, name: user.name, email: user.email, role: user.role }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      if (account?.provider === "google" && profile) {
        token.accessToken = account.access_token
        const [existingUser] = await sql`
          SELECT * FROM users WHERE google_id = ${profile.id} OR email = ${profile.email}
        `
        if (existingUser) {
          await sql`
            UPDATE users SET google_id = ${profile.id}, name = ${profile.name} WHERE id = ${existingUser.id}
          `
          token.id = existingUser.id
          token.role = existingUser.role
        } else {
          const [newUser] = await sql`
            INSERT INTO users (google_id, name, email, role, password_hash)
            VALUES (${profile.id}, ${profile.name}, ${profile.email}, 'member', NULL)
            RETURNING id, role
          `
          token.id = newUser.id
          token.role = newUser.role
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
        session.accessToken = token.accessToken
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: { signIn: "/auth/signin" },
}

export default NextAuth(authOptions)
