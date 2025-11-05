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
        <p className="text-orange-600 font-bold">Finalizing profile... Refresh in 5s</p>
        <pre className="mt-4 text-xs bg-gray-100 p-3 rounded max-w-2xl mx-auto overflow-auto text-left">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-green-800 text-center">Zakat & Charity</h1>
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8 text-center">
        <p className="text-green-800 font-bold text-lg">Alhamdulillah! Profile Ready</p>
        <p className="text-sm text-green-700">Profile ID: <code className="bg-white px-2 py-1 rounded">{profileId}</code></p>
      </div>

      {/* Your Zakat UI here */}
      <div className="text-center">
        <p className="text-gray-600">You can now calculate Zakat and donate.</p>
      </div>
    </main>
  )
}
