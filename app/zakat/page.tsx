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
import { sql } from "@/lib/neon"
import { v4 as uuidv4 } from 'uuid'

export const revalidate = 0
export const dynamic = 'force-dynamic'

export default async function ZakatPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth/signin")

  const userId = session.user.id as string
  const userName = session.user.name || "Member"
  const userEmail = session.user.email || ""

  let profileId: string | null = null

  try {
    const newUuid = uuidv4()

    const result = await sql`
      INSERT INTO profiles (
        id, user_id, name, email, phone
      ) VALUES (
        ${newUuid},
        ${userId},
        ${userName},
        ${userEmail},
        ''
      )
      ON CONFLICT (user_id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email
      RETURNING id
    `

    profileId = result.rows[0]?.id

  } catch (error: any) {
    console.error("Profile upsert failed:", error.message)
  }

  if (!profileId) {
    try {
      const result = await sql`
        SELECT id FROM profiles WHERE user_id = ${userId}
      `
      profileId = result.rows[0]?.id
    } catch (error: any) {
      console.error("Profile fetch failed:", error.message)
    }
  }

  if (!profileId) {
    return (
      <div className="container mx-auto p-8 text-center">
        <p className="text-orange-600 font-bold">Unable to set up profile</p>
        <p className="text-sm text-red-600 mt-4">
          Please check server logs for error.
        </p>
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
