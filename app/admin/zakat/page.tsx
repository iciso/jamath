// app/admin/zakat/page.tsx
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { AdminDonationTable } from "@/components/admin/donation-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function AdminZakatPage() {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role ?? "member"
  if (!session || role !== "admin") redirect("/auth/signin")

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin: Zakat & Donations</h1>
      <Card>
        <CardHeader><CardTitle>Pending Verifications</CardTitle></CardHeader>
        <CardContent><AdminDonationTable /></CardContent>
      </Card>
    </main>
  )
}
