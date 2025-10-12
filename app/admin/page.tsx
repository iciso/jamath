import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PendingMembersTable } from "@/components/admin/pending-members-table"

export default async function AdminPage() {
  let session: any = null
  try {
    session = await getServerSession(authOptions)
  } catch (err) {
    console.log("[v0] getServerSession error:", (err as Error)?.message)
    redirect("/auth/signin?callbackUrl=/admin")
  }
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
      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-4 text-pretty">Pending Member Requests</h2>
        <PendingMembersTable />
      </section>
    </main>
  )
}
