// lib/auth.ts
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { sql } from "@/lib/db"

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
      console.log("[NextAuth] Session callback triggered", { token })

      if (!token?.sub) {
        console.log("[NextAuth] No token.sub → skipping")
        return session
      }

      let profileId: string | null = null

      try {
        console.log("[NextAuth] Querying profile for user:", token.sub)
        const result = await sql`
          SELECT id FROM profiles WHERE user_id = ${token.sub} LIMIT 1
        `
        profileId = result.rows[0]?.id ?? null
        console.log("[NextAuth] Profile found:", profileId)

        if (!profileId) {
          console.log("[NextAuth] Creating new profile...")
          const newProfile = await sql`
            INSERT INTO profiles (user_id, name, phone, address)
            VALUES (${token.sub}, ${token.name || "Member"}, '', '')
            RETURNING id
          `
          profileId = newProfile.rows[0]?.id
          console.log("[NextAuth] Profile created:", profileId)
        }
      } catch (error) {
        console.error("[NextAuth] PROFILE SYNC FAILED:", error)
        // DO NOT THROW
      }

      if (profileId && session.user) {
        ;(session.user as any).profileId = profileId
        console.log("[NextAuth] profileId attached to session:", profileId)
      }

      return session
    },
  },

  debug: process.env.NODE_ENV === "development", // Only in dev
}

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions)
