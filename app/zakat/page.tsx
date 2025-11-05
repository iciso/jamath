// app/zakat/page.tsx
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { sql } from "@/lib/db"

export default async function ZakatPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/signin")

  const userId = session.user.id

  console.log("ZAKAT PAGE: userId =", userId)
  console.log("DATABASE_URL =", process.env.DATABASE_URL?.slice(0, 50) + "...")

  // FORCE sql to work
  if (!sql) {
    console.error("sql is undefined")
    return <div>Error: Database not connected</div>
  }

  let profileId: string | null = null
  try {
    const result = await sql`
      INSERT INTO profiles (user_id, name, phone, address)
      VALUES (${userId}, ${session.user.name || "Member"}, '', '')
      ON CONFLICT (user_id) DO NOTHING
      RETURNING id
    `
    profileId = result.rows[0]?.id

    if (!profileId) {
      const select = await sql`SELECT id FROM profiles WHERE user_id = ${userId}`
      profileId = select.rows[0]?.id
    }

    console.log("Profile ID created/found:", profileId)
  } catch (error: any) {
    console.error("DB ERROR:", error.message)
    console.error("Full error:", error)
  }

  if (!profileId) {
    return (
      <div className="container mx-auto p-8 text-center">
        <p className="text-orange-600 font-bold">Finalizing profile... Refresh in 5s</p>
        <pre className="mt-4 text-xs bg-red-100 p-3 rounded">
          userId: {userId}
          <br />
          DATABASE_URL: {process.env.DATABASE_URL ? "SET" : "MISSING"}
          <br />
          sql: {sql ? "OK" : "MISSING"}
        </pre>
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
    </main>
  )
}
