import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sql } from "@/lib/neon"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const role = (session?.user as any)?.role ?? "member"

    if (!session || role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { applicationId } = await req.json()
    const sql = sql

    await sql`
      UPDATE certificate_applications
      SET status = 'rejected', reviewed_by = ${session.user?.id}, reviewed_at = now()
      WHERE id = ${applicationId}
    `

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[v0] Reject certificate error:", err)
    return NextResponse.json({ error: "Failed to reject" }, { status: 500 })
  }
}
