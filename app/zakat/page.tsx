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

export const revalidate = 0
export const dynamic = 'force-dynamic'

export default async function ZakatPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/auth/signin")

  let profileId = (session.user as any)?.profileId

  // CALL EXISTING /api/profile TO SYNC
  if (!profileId) {
    try {
      const res = await fetch(`${process.env.NEXTAUTH_URL || ''}/api/profile`, {
        method: 'GET',
        cache: 'no-store',
      })
      if (res.ok) {
        const data = await res.json()
        profileId = data.profileId
      }
    } catch (err) {
      console.error("[Zakat] Profile sync failed:", err)
    }
  }

  if (!profileId) {
    return (
      <div className="container mx-auto p-8 text-center">
        <p className="text-orange-600 font-bold">Finalizing your profile...</p>
        <p className="text-sm text-gray-600 mt-2">Please wait...</p>
      </div>
    )
  }

  // FETCH TOTAL
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
