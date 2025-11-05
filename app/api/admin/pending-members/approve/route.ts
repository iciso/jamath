// app/api/admin/pending-members/approve/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id as string | undefined
  const role = (session?.user as any)?.role ?? "member"
  if (!session || role !== "admin" || !userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const { id, notes } = (body || {}) as { id?: string; notes?: string }
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  await sql`
    WITH pr AS (
      DELETE FROM pending_members
      WHERE id = ${id}
      RETURNING name, email, phone, gender, password_hash
    ),
    ins_approved AS (
      INSERT INTO approved_members (name, email, phone, gender, review_status, reviewed_by, reviewed_at, notes)
      SELECT name, email, phone, gender, 'approved', ${userId}, NOW(), ${notes ?? null}
      FROM pr
      RETURNING id
    ),
    existing AS (
      SELECT id
      FROM profiles
      WHERE EXISTS (SELECT 1 FROM pr)
        AND (
          email IS NOT DISTINCT FROM (SELECT email FROM pr)
          OR phone IS NOT DISTINCT FROM (SELECT phone FROM pr)
        )
      LIMIT 1
    ),
    ins_profile AS (
      INSERT INTO profiles (name, email, phone, gender)
      SELECT name, email, phone, gender
      FROM pr
      WHERE EXISTS (SELECT 1 FROM pr)
        AND NOT EXISTS (SELECT 1 FROM existing)
      RETURNING id
    ),
    final_profile AS (
      SELECT id FROM ins_profile
      UNION ALL
      SELECT id FROM existing
    ),
    ins_members AS (
      INSERT INTO members (profile_id)
      SELECT id FROM final_profile
      ON CONFLICT (profile_id) DO NOTHING
      RETURNING profile_id
    ),
    ins_user AS (
      INSERT INTO users (email, name, password_hash, role)
      SELECT email, name, password_hash, 'member'
      FROM pr
      WHERE EXISTS (SELECT 1 FROM pr)
        AND NOT EXISTS (SELECT 1 FROM users WHERE email = (SELECT email FROM pr))
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    )
    SELECT 1
  `

  return NextResponse.json({ ok: true })
}
