// app/api/profile/route.ts
import { getServerSession } from "next-auth"
import { sql } from "@/lib/db"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

// GET: Sync or create profile + return profileId
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id
  const userName = session.user.name || "Member"
  const userEmail = session.user.email || ""

  try {
    // UPSERT PROFILE
    const result = await sql`
      INSERT INTO profiles (user_id, name, email, phone, address)
      VALUES (${userId}, ${userName}, ${userEmail}, '', '')
      ON CONFLICT (user_id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email
      RETURNING id
    `

    const profileId = result.rows[0].id
    return NextResponse.json({ profileId })
  } catch (error) {
    console.error("[Profile API] Sync failed:", error)
    return NextResponse.json({ error: "Failed to sync profile" }, { status: 500 })
  }
}

// PUT: Update existing profile (your original code)
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { profileId, name, email, phone, gender } = body

    if (!profileId || !name || !gender) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const profiles = await sql`
      SELECT id FROM profiles
      WHERE id = ${profileId} AND email = ${session.user.email}
      LIMIT 1
    `

    if (profiles.rows.length === 0) {
      return NextResponse.json({ message: "Profile not found or unauthorized" }, { status: 403 })
    }

    await sql`
      UPDATE profiles
      SET name = ${name},
          email = ${email || null},
          phone = ${phone || null},
          gender = ${gender}
      WHERE id = ${profileId}
    `

    return NextResponse.json({ message: "Profile updated successfully" })
  } catch (error) {
    console.error("[Profile API] Update error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
