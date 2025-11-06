// app/zakat/page.tsx
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { ZakatCalculator } from "@/components/zakat/calculator"
import { DonationForm } from "@/components/zakat/donation-form"
import { DonationHistory } from "@/components/zakat/donation-history"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { sql } from "@/lib/db"
import { v4 as uuidv4 } from 'uuid'

export const revalidate = 0
export const dynamic = 'force-dynamic'

export default async function ZakatPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/auth/signin")

    const userId = session.user.id
  if (!userId) {
    console.error("USER ID MISSING IN SESSION")
    return <div>Authentication Error</div>
  }
  console.log("USER ID FROM SESSION:", userId)

  const userName = session.user.name || "Member"
  const userEmail = session.user.email || ""

  let profileId: string | null = null

  try {
    const existing = await sql`
      SELECT id FROM profiles WHERE user_id = ${userId} LIMIT 1
    `

    if (existing.rows.length > 0) {
      profileId = existing.rows[0].id
      console.log("Profile found:", profileId)
    } else {
      const newUuid = uuidv4()
      const result = await sql`
        INSERT INTO profiles (id, user_id, name, email, phone, address)
        VALUES (${newUuid}, ${userId}, ${userName}, ${userEmail}, '', '')
        RETURNING id
      `
      profileId = result.rows[0].id
      console.log("Profile created:", profileId)
    }
  } catch (error: any) {
    console.error("[Zakat] Profile setup failed:", error.message)
  }

  if (!profileId) {
    return (
      <div className="container mx-auto p-8 text-center">
        <p className="text-red-600 font-bold">Failed to set up profile</p>
        <p className="text-sm text-gray-600 mt-2">Check Vercel logs.</p>
      </div>
    )
  }

  let totalAmount = 0
  try {
    const result = await sql`
      SELECT COALESCE(SUM(amount), 0)::text as total
      FROM donations
      WHERE status = 'verified'
        AND created_at >= date_trunc('month', CURRENT_DATE)
    `
    totalAmount = Number(result.rows[0]?.total || 0)
  } catch (err) {
    console.error("[Zakat] Total fetch failed:", err)
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Zakat & Charity</h1>
        <Link href="/zakat/transparency">
          <Button variant="outline" size="sm">
            View Transparency Report
          </Button>
        </Link>
      </div>

      <Card className="mb-8 bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200">
        <CardHeader>
          <CardTitle className="text-green-800">This Month's Zakat</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-emerald-700">
            ₹{totalAmount.toLocaleString('en-IN')}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Verified donations from the community
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Zakat Calculator</CardTitle></CardHeader>
          <CardContent><ZakatCalculator /></CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Donate Now</CardTitle></CardHeader>
          <CardContent>
            <DonationForm profileId={profileId} />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader><CardTitle>Your Donation History</CardTitle></CardHeader>
        <CardContent>
          <DonationHistory profileId={profileId} />
        </CardContent>
      </Card>
    </main>
  )
}
