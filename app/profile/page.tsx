// app/profile/page.tsx
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { sql } from "@/lib/db"
import { ProfileForm } from "@/components/profile/profile-form"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/auth/signin")

  const userId = session.user.id as string
  const isGoogleLogin = !userId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)  // Check if UUID (password) or string (Google)
  const userName = session.user.name || "Member"
  const userEmail = session.user.email || ""

  let dbUserId: string | null = null

  if (isGoogleLogin) {
    // Google: INSERT/UPDATE users with google_id
    const [user] = await sql`
      INSERT INTO users (google_id, name, email, role, password_hash)
      VALUES (${userId}, ${userName}, ${userEmail}, 'member', NULL)
      ON CONFLICT (google_id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email
      RETURNING id
    `
    dbUserId = user.id
  } else {
    // Password: Use existing user.id (UUID)
    dbUserId = userId
  }

  if (!dbUserId) redirect("/auth/signin")

  // Sync profile
  await sql`
    INSERT INTO profiles (user_id, name, email, phone, gender)
    VALUES (${dbUserId}, ${userName}, ${userEmail}, '', 'male')
    ON CONFLICT (user_id) DO UPDATE SET
      name = EXCLUDED.name,
      email = EXCLUDED.email
  `

  // Fetch profile
  const [profile] = await sql`
    SELECT id, name, email, phone, gender
    FROM profiles
    WHERE user_id = ${dbUserId}
    LIMIT 1
  `

  if (!profile) redirect("/auth/signin")

  // If complete, go to zakat
  if (profile.phone && profile.gender) redirect("/zakat")

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-2">
          Assalamu Alaikum, {userName}
        </h1>
        <p className="text-muted-foreground mb-6">
          Complete your profile to donate Zakat
        </p>
        <ProfileForm initialProfile={profile} />
      </div>
    </div>
  )
}
