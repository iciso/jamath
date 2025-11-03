// app/api/donation-heads/route.ts
import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"

export async function GET() {
  try {
    const sql = getSql()
    const heads = await sql`
      SELECT id, slug, name, description, is_zakat, is_fitr, is_qurabani
      FROM donation_heads
      WHERE active = true
      ORDER BY name
    `
    return NextResponse.json(heads)
  } catch (err) {
    console.error("[API] donation-heads error:", err)
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}
