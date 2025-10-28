import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getSql } from "@/lib/db"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const role = (session?.user as any)?.role ?? "member"

    if (!session || role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sql = getSql()
    const applications = await sql`
      SELECT id, certificate_type, details, status, created_at
      FROM certificate_applications
      WHERE status = 'pending'
      ORDER BY created_at ASC
    `

    return NextResponse.json(applications)
  } catch (err) {
    console.error("[v0] Admin certificates error:", err)
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 })
  }
}
