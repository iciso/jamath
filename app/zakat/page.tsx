// app/zakat/page.tsx
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { sql } from "@/lib/db"
import { ZakatCalculator } from "@/components/zakat/calculator"
import { DonationForm } from "@/components/zakat/donation-form"
import { DonationHistory } from "@/components/zakat/donation-history"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function ZakatPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/auth/signin")

  const googleId = session.user.id

  // Resolve profileId via google_id → users → profiles
  const [user] = await sql`
    SELECT id FROM users WHERE google_id = ${googleId} LIMIT 1
  `
  if (!user) redirect("/profile")

  const [profile] = await sql`
    SELECT id, name FROM profiles WHERE user_id = ${user.id} LIMIT 1
  `
  if (!profile) redirect("/profile")

  const profileId = profile.id
  const memberName = profile.name

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 text-green-700">
        Zakat & Charity Portal
      </h1>
      <p className="text-lg text-muted-foreground mb-8">
        Assalamu Alaikum, <strong>{memberName}</strong>
      </p>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Zakat Calculator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Zakat Calculator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ZakatCalculator />
          </CardContent>
        </Card>

        {/* Donation Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Donate Now
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DonationForm profileId={profileId} />
          </CardContent>
        </Card>
      </div>

      {/* Donation History */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Your Donation History</CardTitle>
        </CardHeader>
        <CardContent>
          <DonationHistory profileId={profileId} />
        </CardContent>
      </Card>
    </main>
  )
}
