// app/api/admin/donations/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const role = (session?.user as any)?.role ?? "member"
    if (!session || role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const pending = await sql`
      SELECT d.*, h.name as head_name, p.name as donor_name
      FROM donations d
      JOIN donation_heads h ON h.id = d.head_id
      JOIN profiles p ON p.id = d.profile_id
      WHERE d.status = 'pending'
      ORDER BY d.created_at ASC
    `

    return NextResponse.json(pending)
  } catch (err: any) {
    console.error("[API] admin donations error:", err)
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}
