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
  const userName = session.user.name || "Member"
  const userEmail = session.user.email || ""

  // Sync profile: insert if missing
  try {
    await sql`
      INSERT INTO profiles (user_id, name, email, phone, gender)
      VALUES (${userId}, ${userName}, ${userEmail}, '', 'male')
      ON CONFLICT (user_id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email
    `
  } catch (error) {
    console.error("Profile sync failed:", error)
  }

  // Fetch profile
  const [profile] = await sql`
    SELECT id, name, email, phone, gender
    FROM profiles
    WHERE user_id = ${userId}
    LIMIT 1
  `

  if (!profile) {
    redirect("/auth/signin")
  }

  // If profile complete, go to zakat
  if (profile.phone && profile.gender) {
    redirect("/zakat")
  }

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
