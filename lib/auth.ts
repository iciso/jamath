// lib/auth.ts
import { sql } from "@/lib/db"

export const authOptions = {
  // ... your existing config
  callbacks: {
    async session({ session, user }) {
      if (user?.id) {
        // Fetch or create profile
        let profileId: string | null = null

        try {
          const result = await sql`
            SELECT id FROM profiles WHERE user_id = ${user.id} LIMIT 1
          `
          profileId = result.rows[0]?.id ?? null

          if (!profileId) {
            const newProfile = await sql`
              INSERT INTO profiles (user_id, name, phone, address)
              VALUES (${user.id}, ${user.name || "Member"}, '', '')
              RETURNING id
            `
            profileId = newProfile.rows[0].id
          }
        } catch (err) {
          console.error("Profile sync failed:", err)
          // Don't break login
        }

        // Attach to session
        session.user.profileId = profileId
      }
      return session
    }
  }
}
