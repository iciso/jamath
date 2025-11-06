// app/profile/page.tsx
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { ProfileForm } from "@/components/profile/profile-form"
import { sql } from "@/lib/db"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/auth/signin")

  // Step 1: Force sync profile (insert user_id if missing)
  const userId = session.user.id
  const userName = session.user.name || "Member"
  const userEmail = session.user.email || ""

  let profileId: string | null = null

  try {
    const result = await sql`
      INSERT INTO profiles (user_id, name, email)
      VALUES (${userId}, ${userName}, ${userEmail})
      ON CONFLICT (user_id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email
      RETURNING id
    `
    profileId = result.rows[0].id
  } catch (error) {
    console.error("Profile sync failed:", error)
    // Continue — we'll show form anyway
  }

  // Step 2: Fetch full profile for form
  const profileResult = await sql`
    SELECT id, name, email, phone, gender, is_active
    FROM profiles
    WHERE user_id = ${userId}
    LIMIT 1
  `

  const profile = profileResult.rows[0] || {
    id: profileId,
    name: userName,
    email: userEmail,
    phone: "",
    gender: "male",
    is_active: true,
  }

  // If profile complete → redirect to zakat
  if (profile.name && profile.phone && profile.gender) {
    redirect("/zakat")
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-2">
          Assalamu Alaikum, {session.user.name || "Brother/Sister"}
        </h1>
        <p className="text-muted-foreground mb-6">
          Please complete your profile to donate Zakat
        </p>

        <ProfileForm initialProfile={profile} />
      </div>
    </div>
  )
}
