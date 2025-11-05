// app/zakat/page.tsx
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { sql } from "@/lib/db"  // THIS LINE WAS MISSING

export default async function ZakatPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/signin")

  const userId = session.user.id

  // SERVER-SIDE PROFILE CREATION
  let profileId: string | null = null
  try {
    const result = await sql`
      INSERT INTO profiles (user_id, name, phone, address)
      VALUES (${userId}, ${session.user.name || "Member"}, '', '')
      ON CONFLICT (user_id) DO NOTHING
      RETURNING id
    `
    profileId = result.rows[0]?.id || (await sql`SELECT id FROM profiles WHERE user_id = ${userId}`).rows[0]?.id
  } catch (error) {
    console.error("Profile creation failed:", error)
  }

  if (!profileId) {
    return (
      <div className="container mx-auto p-8 text-center">
        <p className="text-orange-600 font-bold">Finalizing profile... Refresh in 5s</p>
      </div>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-green-800 text-center">Zakat & Charity</h1>
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8 text-center">
        <p className="text-green-800 font-bold text-lg">Alhamdulillah! Profile Ready</p>
        <p className="text-sm text-green-700">Profile ID: <code className="bg-white px-2 py-1 rounded">{profileId}</code></p>
      </div>

      <div className="text-center">
        <p className="text-gray-600">You can now calculate Zakat and donate.</p>
      </div>
    </main>
  )
}
