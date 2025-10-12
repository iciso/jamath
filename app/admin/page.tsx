import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role ?? "member"
  if (!session || role !== "admin") {
    redirect("/auth/signin?callbackUrl=/admin")
  }

  return (
    <main className="container mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold text-pretty mb-6">Admin Dashboard</h1>
      <p className="text-sm opacity-80">
        In shaa Allah, this page will list pending member requests for approval and actions.
      </p>
    </main>
  )
}
