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

    const app = await sql`
      SELECT id, profile_id, certificate_type FROM certificate_applications WHERE id = ${applicationId}
    `

    if (!app[0]) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    const certificateNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    await sql`
      UPDATE certificate_applications
      SET status = 'issued', reviewed_by = ${session.user?.id}, reviewed_at = now()
      WHERE id = ${applicationId}
    `

    await sql`
      INSERT INTO issued_certificates (application_id, profile_id, certificate_type, certificate_number)
      VALUES (${applicationId}, ${app[0].profile_id}, ${app[0].certificate_type}, ${certificateNumber})
    `

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[v0] Approve certificate error:", err)
    return NextResponse.json({ error: "Failed to approve" }, { status: 500 })
  }
}
