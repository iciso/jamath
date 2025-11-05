// app/zakat/page.tsx
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { sql } from "@/lib/db"

export default async function ZakatPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/signin")

  const userId = session.user.id as string

  let profileId: string | null = null

  try {
    // UPSERT: INSERT OR UPDATE
    const result = await sql`
      INSERT INTO profiles (id, user_id, name, phone, address, email, is_active)
      VALUES (
        gen_random_uuid(),
        ${userId},
        ${session.user.name || "Member"},
        '',
        '',
        ${session.user.email},
        true
      )
      ON CONFLICT (user_id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email
      RETURNING id
    `

    profileId = result.rows[0]?.id

    if (!profileId) {
      const select = await sql`SELECT id FROM profiles WHERE user_id = ${userId}`
      profileId = select.rows[0]?.id
    }

  } catch (error: any) {
    console.error("Profile upsert failed:", error.message)
  }

  if (!profileId) {
    return (
      <div className="container mx-auto p-8 text-center">
        <p className="text-orange-600 font-bold">Finalizing profile... Refresh in 5s</p>
        <p className="text-sm text-red-600 mt-4">
          DB Error: Check Vercel logs for details.
        </p>
      </div>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-green-800 text-center">Zakat & Charity</h1>
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8 text-center">
        <p className="text-green-800 font-bold text-lg">Alhamdulillah! Profile Ready</p>
        <p className="text-sm text-green-700">
          Profile ID: <code className="bg-white px-2 py-1 rounded font-mono">{profileId}</code>
        </p>
      </div>
    </main>
  )
}
