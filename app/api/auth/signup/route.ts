import { NextResponse } from "next/server"
import { sql } from "@/lib/neon"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    const { name, email, password } = body || {}

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const normalizedEmail = String(email).toLowerCase()
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    const password_hash = await bcrypt.hash(password, 10)

    // Try insert
    const adminCount = await sql<{ count: number }[]>`
      select count(*)::int as count from users where role = 'admin'
    `
    const role = (adminCount[0]?.count ?? 0) === 0 ? "admin" : "member"

    const rows = await sql<{ id: string }[]>`
        insert into users (email, name, password_hash, role)
        values (${normalizedEmail}, ${name ?? null}, ${password_hash}, ${role})
        on conflict (email) do nothing
        returning id
      `

    if (!rows[0]) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    }

    return NextResponse.json({ ok: true, userId: rows[0].id })
  } catch (err: any) {
    console.error("[v0] signup error:", err?.message)
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 })
  }
}
