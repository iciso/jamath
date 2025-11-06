// app/zakat/page.tsx
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sql } from "@/lib/db"
import { redirect } from "next/navigation"
import DonationForm from "@/components/zakat/donation-form"  // Adjust if path differs
import DonationHistory from "@/components/zakat/donation-history"  // Adjust if path differs

export default async function ZakatPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  const userId = session.user.id

  let profileId: string | null = null
  let profileName = session.user.name || "Member"

  try {
    // Sync profile if missing (creates/links user_id)
    const syncResult = await sql`
      INSERT INTO profiles (user_id, name, email, phone, gender)
      VALUES (${userId}, ${profileName}, ${session.user.email || ''}, '', 'male')
      ON CONFLICT (user_id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email
      RETURNING id
    `
    profileId = syncResult.rows[0].id

    // Fetch full profile
    const profileResult = await sql`
      SELECT id, name FROM profiles WHERE user_id = ${userId} LIMIT 1
    `
    if (profileResult.rows.length > 0) {
      profileId = profileResult.rows[0].id
      profileName = profileResult.rows[0].name
    }
  } catch (error) {
    console.error("[Zakat] Profile setup failed:", error)
    // Fallback: redirect to complete profile
    redirect("/profile")
  }

  // If no profileId, force profile completion
  if (!profileId) {
    redirect("/profile")
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Zakat Donation Portal</h1>
      <p className="text-muted-foreground mb-8">Assalamu Alaikum, {profileName}</p>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Make a Donation</h2>
          <DonationForm profileId={profileId!} />
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Your Donation History</h2>
          <DonationHistory userId={userId} />
        </div>
      </div>
    </div>
  )
}
