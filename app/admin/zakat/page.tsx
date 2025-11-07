// app/admin/zakat/page.tsx
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { sql } from "@/lib/db"
import { AdminDonationTable } from "@/components/admin/donation-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function AdminZakatPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/auth/signin")

  const userId = session.user.id as string
  const isGoogleLogin = !userId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)

  let dbUserId: string | null = null
  let role = "member"

  if (isGoogleLogin) {
    const [user] = await sql`SELECT id, role FROM users WHERE google_id = ${userId} LIMIT 1`
    if (user) {
      dbUserId = user.id
      role = user.role
    }
  } else {
    dbUserId = userId
    const [user] = await sql`SELECT role FROM users WHERE id = ${userId} LIMIT 1`
    if (user) role = user.role
  }

  if (role !== "admin") redirect("/zakat")

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin: Zakat & Donations</h1>
      <Card>
        <CardHeader><CardTitle>Pending Verifications</CardTitle></CardHeader>
        <CardContent><AdminDonationTable /></CardContent>
      </Card>
    </main>
  )
}
