// app/api/admin/donations/verify/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const role = (session?.user as any)?.role ?? "member"
    if (!session || role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { donationId, action } = await req.json()
    if (!donationId || !["verified", "rejected"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    await sql`
      UPDATE donations
      SET status = ${action}, verified_by = ${session.user.id}, verified_at = now()
      WHERE id = ${donationId} AND status = 'pending'
    `

    return NextResponse.json({ success: true, message: `Donation ${action}!` })
  } catch (err: any) {
    console.error("[API] verify donation error:", err)
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}
