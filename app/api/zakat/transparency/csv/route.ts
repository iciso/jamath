// app/api/zakat/transparency/csv/route.ts
import { sql } from "@/lib/db"  // CORRECT — Neon Serverless
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const { rows } = await sql`
      SELECT 
        TO_CHAR(d.created_at, 'YYYY-MM-DD') as date,
        COALESCE(p.name, 'Anonymous') as donor,
        COALESCE(h.name, 'General') as cause,
        d.amount::text,
        COALESCE(d.payment_method, 'unknown') as payment_method
      FROM donations d
      LEFT JOIN profiles p ON p.id = d.profile_id
      LEFT JOIN donation_heads h ON h.id = d.head_id
      WHERE d.status = 'verified'
      ORDER BY d.created_at DESC
    `

    const csv = [
      ["Date", "Donor", "Cause", "Amount (INR)", "Method"],
      ...rows.map(row => [
        row.date,
        row.donor,
        row.cause,
        row.amount,
        row.payment_method.toUpperCase()
      ])
    ].map(row => row.join(",")).join("\n")

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=zakat-transparency.csv",
      },
    })
  } catch (error: any) {
    console.error("CSV API Error:", error)
    return new Response(
      "Error generating CSV. Please try again later.",
      { status: 500 }
    )
  }
}
