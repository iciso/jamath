// lib/auth.ts
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { sql } from "@/lib/db"  // CORRECT

export const authOptions = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "Phone",
      credentials: {
        phone: { label: "Phone", type: "text" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize() { return null },
    }),
  ],
  pages: { signIn: "/auth/signin" },
  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async session({ session, token }) {
      if (!token?.sub) return session

      let profileId: string | null = null

      try {
        const result = await sql`
          SELECT id FROM profiles WHERE user_id = ${token.sub} LIMIT 1
        `
        profileId = result.rows[0]?.id ?? null

        if (!profileId) {
          const newProfile = await sql`
            INSERT INTO profiles (user_id, name, phone, address)
            VALUES (${token.sub}, ${token.name || "Member"}, '', '')
            RETURNING id
          `
          profileId = newProfile.rows[0]?.id
        }
      } catch (error) {
        console.error("[Auth] Profile sync failed:", error)
      }

      if (profileId && session.user) {
        ;(session.user as any).profileId = profileId
      }

      return session
    },
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions)
