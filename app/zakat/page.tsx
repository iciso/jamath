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

export default async function ZakatPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth/signin")

  const profileId = (session.user as any)?.profileId
  if (!profileId) redirect("/profile")

  // Fetch total zakat this month
  const { rows } = await import("@/lib/db").then(m => m.sql)`
    SELECT COALESCE(SUM(amount), 0) as total
    FROM donations
    WHERE status = 'verified'
      AND created_at >= date_trunc('month', CURRENT_DATE)
  `

  const total = Number(rows[0]?.total || 0)

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

      {/* Live Counter */}
      <Card className="mb-8 bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200">
        <CardHeader>
          <CardTitle className="text-green-800">This Month's Zakat</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-emerald-700">₹{total.toLocaleString('en-IN')}</p>
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
          <CardContent><DonationForm profileId={profileId} /></CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader><CardTitle>Your Donation History</CardTitle></CardHeader>
        <CardContent><DonationHistory profileId={profileId} /></CardContent>
      </Card>
    </main>
  )
}
