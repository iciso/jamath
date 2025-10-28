import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CertificateReviewTable } from "@/components/admin/certificate-review-table"

export default async function AdminCertificatesPage() {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role ?? "member"

  if (!session || role !== "admin") {
    redirect("/auth/signin?callbackUrl=/admin/certificates")
  }

  return (
    <main className="container mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">Certificate Applications</h1>
      <Card>
        <CardHeader>
          <CardTitle>Pending Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <CertificateReviewTable />
        </CardContent>
      </Card>
    </main>
  )
}
