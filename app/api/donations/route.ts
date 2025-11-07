// app/api/donations/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const isGoogle = !userId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)

    let dbUserId: string
    if (isGoogle) {
      const [user] = await sql`SELECT id FROM users WHERE google_id = ${userId} LIMIT 1`
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })
      dbUserId = user.id
    } else {
      dbUserId = userId
    }

    const { headId, amount, payment_method, transaction_id, notes } = await req.json()

    if (!headId || !amount || amount <= 0 || !payment_method) {
      return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 })
    }

    const [profile] = await sql`
      SELECT id FROM profiles WHERE user_id = ${dbUserId} LIMIT 1
    `
    if (!profile) {
      return NextResponse.json({ error: "Profile not complete" }, { status: 400 })
    }

    const [donation] = await sql`
      INSERT INTO donations (
        profile_id, head_id, amount, payment_method, 
        transaction_id, notes, status
      )
      VALUES (
        ${profile.id}, ${headId}, ${amount}, ${payment_method},
        ${transaction_id || null}, ${notes || null}, 'pending'
      )
      RETURNING id, amount, created_at, head_id
    `

    const [head] = await sql`
      SELECT name, is_zakat FROM donation_heads WHERE id = ${headId}
    `

    return NextResponse.json({
      success: true,
      donationId: donation.id,
      amount: donation.amount,
      head: head?.name || "Unknown",
      isZakat: head?.is_zakat || false,
      message: head?.is_zakat 
        ? "Zakat submitted! Awaiting verification."
        : "Donation submitted. JazakAllah khairan."
    })

  } catch (err: any) {
    console.error("[API] donation submit error:", err)
    return NextResponse.json({ error: "Failed to submit donation", details: err.message }, { status: 500 })
  }
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
