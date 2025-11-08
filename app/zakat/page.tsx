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

  const userId = session.user.id as string

  // userId is now ALWAYS the DB UUID (from token)
  const [profile] = await sql`
    SELECT id, name FROM profiles WHERE user_id = ${userId} LIMIT 1
  `

  if (!profile) redirect("/profile")

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 text-green-700">Zakat & Charity Portal</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Assalamu Alaikum, <strong>{profile.name}</strong>
      </p>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Zakat Calculator</CardTitle></CardHeader>
          <CardContent><ZakatCalculator /></CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Donate Now</CardTitle></CardHeader>
          <CardContent><DonationForm profileId={profile.id} /></CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader><CardTitle>Your Donation History</CardTitle></CardHeader>
        <CardContent><DonationHistory profileId={profile.id} /></CardContent>
      </Card>
    </main>
  )
}
