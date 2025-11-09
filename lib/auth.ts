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
        `

        if (!user || !user.password_hash) return null
        if (!bcrypt.compareSync(credentials.password, user.password_hash)) return null

        return { id: user.id, name: user.name, email: user.email, role: user.role }
      },
    }),
  ],

  jwt: {
    encryption: false,  // DISABLE ENCRYPTION: Signed JWT only (fixes decryption error)
  },

  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }

      if (account?.provider === "google" && profile?.sub) {
        const googleId = profile.sub
        const email = profile.email
        const name = profile.name

        const [existing] = await sql`
          SELECT id, role FROM users 
          WHERE google_id = ${googleId} OR email = ${email}
        `

        let dbUserId: string
        if (existing) {
          dbUserId = existing.id
          await sql`UPDATE users SET name = ${name} WHERE id = ${dbUserId}`
        } else {
          const [newUser] = await sql`
            INSERT INTO users (google_id, name, email, role)
            VALUES (${googleId}, ${name}, ${email}, 'member')
            RETURNING id
          `
          dbUserId = newUser.id
        }

        token.id = dbUserId
        token.role = existing?.role || 'member'
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

  pages: { signIn: "/auth/signin" },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
}

export default NextAuth(authOptions)
