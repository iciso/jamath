// app/api/donation-heads/route.ts
import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const heads = await sql`
      SELECT id, name, is_zakat 
      FROM donation_heads 
      ORDER BY name
    `
    return NextResponse.json(heads)
  } catch (error: any) {
    console.error("[API] donation-heads error:", error)
    return NextResponse.json({ error: "Failed to load causes" }, { status: 500 })
  }
}
