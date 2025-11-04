// app/api/certificates/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { profileId, certificateType, details } = await req.json()

    if (!profileId || !certificateType || !details) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const validTypes = ["birth", "marriage", "talaq", "death"]
    if (!validTypes.includes(certificateType)) {
      return NextResponse.json({ error: "Invalid certificate type" }, { status: 400 })
    }

    const sql = sql()
    await sql`
      INSERT INTO certificate_applications (profile_id, certificate_type, details, status)
      VALUES (${profileId}, ${certificateType}, ${JSON.stringify(details)}, 'pending')
    `

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[v0] Certificate apply error:", err)
    return NextResponse.json({ error: "Failed to submit application" }, { status: 500 })
  }
}
