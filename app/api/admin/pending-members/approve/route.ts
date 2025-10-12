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
    with pm as (
      update pending_members
      set review_status = 'approved',
          reviewed_by = ${userId},
          reviewed_at = now(),
          notes = coalesce(${notes ?? null}, notes)
      where id = ${id} and review_status = 'pending'
      returning name, email, phone, gender
    ),
    existing as (
      select id
      from profiles
      where exists (select 1 from pm)
        and (
          email is not distinct from (select email from pm)
          or phone is not distinct from (select phone from pm)
        )
      limit 1
    ),
    ins_profile as (
      insert into profiles (name, email, phone, gender)
      select name, email, phone, gender
      from pm
      where exists (select 1 from pm)
        and not exists (select 1 from existing)
      returning id
    ),
    final_profile as (
      select id from ins_profile
      union all
      select id from existing
    )
    insert into members (profile_id)
    select id from final_profile
    on conflict (profile_id) do nothing
  `

  return NextResponse.json({ ok: true })
}
