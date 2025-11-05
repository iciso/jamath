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

export default async function ZakatPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth/signin")

  const userId = (session.user as any)?.id
  if (!userId) redirect("/auth/signin")

  let profileId: string | null = null
  let totalAmount = 0

  // ——— PROFILE: FETCH OR CREATE ———
  try {
    const rows = await sql`
      SELECT id FROM profiles WHERE user_id = ${userId} LIMIT 1
    `
    profileId = rows[0]?.id ?? null
  } catch (err: any) {
    console.error("[Zakat] Profile fetch failed:", err)
  }

  if (!profileId) {
    try {
      const newProfileRows = await sql`
        INSERT INTO profiles (user_id, name, phone, address)
        VALUES (${userId}, ${session.user?.name || "Member"}, '', '')
        RETURNING id
      `
      profileId = newProfileRows[0].id
    } catch (err: any) {
      console.error("[Zakat] Profile creation failed:", err)
    }
  }

  // ——— TOTAL ZAKAT THIS MONTH ———
  try {
    const totalRows = await sql`
      SELECT COALESCE(SUM(amount), 0)::text as total
      FROM donations
      WHERE status = 'verified'
        AND created_at >= date_trunc('month', CURRENT_DATE)
    `
    totalAmount = Number(totalRows[0].total)
  } catch (err: any) {
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
