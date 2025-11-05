// app/zakat/page.tsx
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export default async function ZakatPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/signin")

  const profileId = (session.user as any).profileId

  if (!profileId) {
    return (
      <div className="container mx-auto p-8 text-center">
        <p className="text-orange-600">Finalizing profile... Refresh in 5s</p>
        <pre className="mt-4 text-xs bg-gray-100 p-2 rounded">
          Session: {JSON.stringify(session, null, 2)}
        </pre>
      </div>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-green-800">Zakat & Charity</h1>
      <p className="text-green-600 mb-4">Profile ID: {profileId}</p>
      {/* Rest of your UI */}
    </main>
  )
}
