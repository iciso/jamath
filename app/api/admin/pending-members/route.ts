import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sql } from "@/lib/neon"

export async function GET() {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role ?? "member"
  if (!session || role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const rows = await sql<
    { id: string; name: string; phone: string; email: string | null; gender: "male" | "female"; created_at: string }[]
  >`
    select id, name, phone, email, gender, created_at
    from approved_members
    where review_status = 'pending'
    order by created_at asc
  `

  return NextResponse.json({ items: rows })
}
