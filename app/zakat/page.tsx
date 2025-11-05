// app/zakat/page.tsx
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { ZakatCalculator } from "@/components/zakat/calculator"
import { DonationForm } from "@/components/zakat/donation-form"      // IMPORTED
import { DonationHistory } from "@/components/zakat/donation-history" // IMPORTED
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { sql } from "@/lib/db"  // Correct import

export default async function ZakatPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth/signin")

  const userId = (session.user as any)?.id
  if (!userId) redirect("/auth/signin")

  let profileId: string | null = null
  let totalAmount = 0
  let error = null

  try {
    // === FETCH OR CREATE PROFILE ===
    const profileResult = await sql`
      SELECT id FROM profiles WHERE user_id = ${userId} LIMIT 1
    `
    profileId = profileResult.rows[0]?.id ?? null

    if (!profileId) {
      const newProfileResult = await sql`
        INSERT INTO profiles (user_id, name, phone, address)
        VALUES (${userId}, ${session.user?.name || "Member"}, '', '')
        RETURNING id
      `
      profileId = newProfileResult.rows[0]?.id
    }

    // === FETCH TOTAL ZAKAT THIS MONTH ===
    const totalResult = await sql`
      SELECT COALESCE(SUM(amount), 0)::text as total
      FROM donations
      WHERE status = 'verified'
        AND created_at >= date_trunc('month', CURRENT_DATE)
    `
    totalAmount = Number(totalResult.rows[0]?.total || 0)

  } catch (err: any) {
    console.error("[Zakat Page] Database Error:", err)
    error = "Failed to load profile or total. Please try again."
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

      {/* Total Zakat Card */}
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

      {/* Error Message */}
      {error && (
        <Card className="mb-8 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-700 text-center">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Main Grid */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Zakat Calculator */}
        <Card>
          <CardHeader><CardTitle>Zakat Calculator</CardTitle></CardHeader>
          <CardContent><ZakatCalculator /></CardContent>
        </Card>

        {/* DONATION FORM — FULLY WORKING */}
        <Card>
          <CardHeader><CardTitle>Donate Now</CardTitle></CardHeader>
          <CardContent>
            {profileId ? (
              <DonationForm profileId={profileId} />
            ) : (
              <p className="text-center text-muted-foreground">
                Setting up your profile...
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Donation History */}
      <Card className="mt-8">
        <CardHeader><CardTitle>Your Donation History</CardTitle></CardHeader>
        <CardContent>
          {profileId ? (
            <DonationHistory profileId={profileId} />
          ) : (
            <p className="text-center text-muted-foreground">
              Profile is being created...
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
