import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sql } from "@/lib/neon"

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
    update pending_members
    set review_status = 'rejected',
        reviewed_by = ${userId},
        reviewed_at = now(),
        notes = coalesce(${notes ?? null}, notes)
    where id = ${id} and review_status = 'pending'
  `

  return NextResponse.json({ ok: true })
}
