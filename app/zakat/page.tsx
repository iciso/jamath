// app/zakat/page.tsx
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { ZakatCalculator } from "@/components/zakat/calculator"
import { DonationForm } from "@/components/zakat/donation-form"
import { DonationHistory } from "@/components/zakat/donation-history"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function ZakatPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/signin")

  const profileId = (session.user as any).profileId
  if (!profileId) {
    return (
      <div className="container mx-auto p-8 text-center">
        <p className="text-orange-600">Creating your profile... Refresh in 10s</p>
      </div>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Zakat & Charity</h1>
      <p className="text-green-600 mb-4">Profile ID: {profileId}</p>

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
