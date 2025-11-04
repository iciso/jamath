import { NextResponse } from "next/server"
import { sql } from "@/lib/neon"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const profileId = searchParams.get("profileId")

    if (!profileId) {
      return NextResponse.json({ error: "Missing profileId" }, { status: 400 })
    }

    const sql = sql
    const certificates = await sql`
      SELECT ca.id, ca.certificate_type, ca.status, ic.certificate_number
      FROM certificate_applications ca
      LEFT JOIN issued_certificates ic ON ca.id = ic.application_id
      WHERE ca.profile_id = ${profileId}
      ORDER BY ca.created_at DESC
    `

    return NextResponse.json(certificates)
  } catch (err) {
    console.error("[v0] Certificates list error:", err)
    return NextResponse.json({ error: "Failed to fetch certificates" }, { status: 500 })
  }
}
