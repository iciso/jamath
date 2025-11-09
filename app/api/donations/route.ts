// app/api/donations/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sql } from "@/lib/db"

// Only replace POST
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = session.user.id as string  // ALWAYS UUID
  const { headId, amount, payment_method, transaction_id, notes } = await req.json()

  const [profile] = await sql`SELECT id FROM profiles WHERE user_id = ${userId} LIMIT 1`
  if (!profile) return NextResponse.json({ error: "Complete profile" }, { status: 400 })

  const [donation] = await sql`
    INSERT INTO donations (profile_id, head_id, amount, payment_method, transaction_id, notes, status)
    VALUES (${profile.id}, ${headId}, ${amount}, ${payment_method}, ${transaction_id}, ${notes}, 'pending')
    RETURNING id
  `

  return NextResponse.json({ success: true, message: "Donation submitted!" })
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const googleId = session.user.id

    // Get profile_id via google_id → users → profiles
    const [user] = await sql`
      SELECT id FROM users WHERE google_id = ${googleId} LIMIT 1
    `
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const [profile] = await sql`
      SELECT id FROM profiles WHERE user_id = ${user.id} LIMIT 1
    `
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 400 })

    const donations = await sql`
      SELECT 
        d.id, d.amount, d.payment_method, d.transaction_id,
        d.notes, d.status, d.created_at,
        h.name AS head_name, h.is_zakat
      FROM donations d
      JOIN donation_heads h ON h.id = d.head_id
      WHERE d.profile_id = ${profile.id}
      ORDER BY d.created_at DESC
    `

    return NextResponse.json(donations)

  } catch (err: any) {
    console.error("[API] donations list error:", err)
    return NextResponse.json(
      { error: "Failed to fetch donations" },
      { status: 500 }
    )
  }
}
