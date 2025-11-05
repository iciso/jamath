import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CertificateForm } from "@/components/certificates/certificate-form"
import { CertificatesList } from "@/components/certificates/certificates-list"
import { sql } from "@/lib/db"

export default async function CertificatesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    redirect("/auth/signin?callbackUrl=/certificates")
  }

  const profiles = await sql<{ id: string }[]>`
    SELECT id FROM profiles WHERE email = ${session.user.email} LIMIT 1
  `
  const profileId = profiles[0]?.id

  if (!profileId) {
    redirect("/profile")
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Apply for Certificate</CardTitle>
          </CardHeader>
          <CardContent>
            <CertificateForm profileId={profileId} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Certificates</CardTitle>
          </CardHeader>
          <CardContent>
            <CertificatesList profileId={profileId} />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
