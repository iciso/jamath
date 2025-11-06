// app/zakat/page.tsx
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { sql } from "@/lib/db"

export default async function ZakatPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/auth/signin")

  const userId = session.user.id

  // Get profile
  const [profile] = await sql`
    SELECT id, name FROM profiles WHERE user_id = ${userId} LIMIT 1
  `

  if (!profile) {
    redirect("/profile")
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Zakat Portal</h1>
      <p className="mb-8">Assalamu Alaikum, {profile.name}</p>

      {/* Your existing donation form/history here */}
      <div className="bg-white p-6 rounded-lg shadow">
        <p>Donation form goes here (use profile.id = {profile.id})</p>
      </div>
    </div>
  )
}
