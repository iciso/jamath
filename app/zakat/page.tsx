// app/zakat/page.tsx
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { sql } from "@/lib/db"

export default async function ZakatPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/auth/signin")

  const googleId = session.user.id

  // Get user → profile
  const [user] = await sql`
    SELECT id FROM users WHERE google_id = ${googleId} LIMIT 1
  `
  if (!user) redirect("/profile")

  const [profile] = await sql`
    SELECT id, name FROM profiles WHERE user_id = ${user.id} LIMIT 1
  `
  if (!profile) redirect("/profile")

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Zakat Portal</h1>
      <p className="mb-8">Assalamu Alaikum, {profile.name}</p>

      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-green-600 font-semibold">
          Profile ready! Donation form will use profile.id = {profile.id}
        </p>
        <p className="mt-4">
          Insert into <code>donations</code> table with <code>profile_id = {profile.id}</code>
        </p>
      </div>
    </div>
  )
}
