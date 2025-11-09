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

        return { id: user.id, name: user.name, email: user.email, role: user.role, provider: 'credentials' }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.provider = user.provider || account?.provider
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
          await sql`UPDATE users SET name = ${name}, google_id = ${googleId} WHERE id = ${dbUserId}`
          token.id = dbUserId
          token.role = existing.role
        } else {
          const [newUser] = await sql`
            INSERT INTO users (google_id, name, email, role)
            VALUES (${googleId}, ${name}, ${email}, 'member')
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
        session.user.provider = token.provider as string
      }
      return session
    },
  },

  jwt: {
    // Use HS512 signing algorithm (no encryption, fixes decryption error)
    encode: async ({ secret, token, maxAge }) => {
      const jwt = await import('jsonwebtoken')
      return jwt.sign(token, secret, { algorithm: 'HS512' })
    },
    decode: async ({ secret, token }) => {
      const jwt = await import('jsonwebtoken')
      return jwt.verify(token, secret, { algorithms: ['HS512'] }) as any
    },
  },

  pages: { signIn: "/auth/signin" },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
}

export default NextAuth(authOptions)
