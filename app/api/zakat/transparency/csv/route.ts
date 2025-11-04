// app/api/zakat/transparency/csv/route.ts
import { getSql } from "@/lib/db"

export async function GET() {
  const sql = getSql()

  const data = await sql`
    SELECT 
      TO_CHAR(d.created_at, 'YYYY-MM-DD') as date,
      p.name as donor,
      h.name as cause,
      d.amount::text,
      d.payment_method
    FROM donations d
    JOIN profiles p ON p.id = d.profile_id
    JOIN donation_heads h ON h.id = d.head_id
    WHERE d.status = 'verified'
    ORDER BY d.created_at DESC
  `

  const csv = [
    ["Date", "Donor", "Cause", "Amount (INR)", "Method"],
    ...data.map(row => [
      row.date,
      row.donor,
      row.cause,
      row.amount,
      row.payment_method.toUpperCase()
    ])
  ].map(row => row.join(",")).join("\n")

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=zakat-transparency.csv",
    },
  })
}
