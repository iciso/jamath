// app/api/donations/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getSql } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { profileId, headId, amount, method, transactionId, notes } = await req.json()
    if (!profileId || !headId || !amount || !method) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const sql = getSql()
    const result = await sql`
      INSERT INTO donations (profile_id, head_id, amount, payment_method, transaction_id, notes)
      VALUES (${profileId}, ${headId}, ${amount}, ${method}, ${transactionId}, ${notes})
      RETURNING id
    `

    return NextResponse.json({ success: true, donationId: result[0].id })
  } catch (err) {
    console.error("[API] donation submit error:", err)
    return NextResponse.json({ error: "Failed to submit" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const profileId = searchParams.get("profileId")
    if (!profileId) return NextResponse.json({ error: "profileId required" }, { status: 400 })

    const sql = getSql()
    const donations = await sql`
      SELECT d.*, h.name as head_name, h.is_zakat
      FROM donations d
      JOIN donation_heads h ON h.id = d.head_id
      WHERE d.profile_id = ${profileId}
      ORDER BY d.created_at DESC
    `

    return NextResponse.json(donations)
  } catch (err) {
    console.error("[API] donations list error:", err)
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}
