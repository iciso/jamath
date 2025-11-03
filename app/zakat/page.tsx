// app/zakat/page.tsx
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { ZakatCalculator } from "@/components/zakat/calculator"
import { DonationForm } from "@/components/zakat/donation-form"
import { DonationHistory } from "@/components/zakat/donation-history"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function ZakatPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth/signin")

  const profileId = (session.user as any)?.profileId
  if (!profileId) redirect("/profile")

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Zakat & Charity</h1>

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
