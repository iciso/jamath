// app/zakat/transparency/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { sql } from "@/lib/db"  // Uses your perfect lib/db.ts

export const dynamic = 'force-dynamic'

export default async function TransparencyPage() {
  // === SAFE DATA FETCHING WITH ERROR BOUNDARY ===
  let summary: any[] = []
  let recent: any[] = []
  let grandTotal = 0
  let error = null

  try {
    // Fetch donation summary
    const summaryResult = await sql`
      SELECT 
        h.name as head_name,
        COALESCE(SUM(d.amount), 0)::text as total,
        COUNT(d.id) as count
      FROM donation_heads h
      LEFT JOIN donations d ON d.head_id = h.id AND d.status = 'verified'
      WHERE COALESCE(h.active, true) = true
      GROUP BY h.id, h.name
      ORDER BY total::numeric DESC
    `
    summary = summaryResult.rows || []

    // Calculate grand total
    grandTotal = summary.reduce((sum, s) => sum + Number(s.total), 0)

    // Fetch recent donations
    const recentResult = await sql`
      SELECT 
        COALESCE(p.name, 'Anonymous') as donor_name,
        h.name as cause,
        d.amount::text,
        COALESCE(d.payment_method, 'unknown') as payment_method,
        TO_CHAR(d.created_at, 'DD Mon YYYY') as date
      FROM donations d
      JOIN profiles p ON p.id = d.profile_id
      JOIN donation_heads h ON h.id = d.head_id
      WHERE d.status = 'verified'
      ORDER BY d.created_at DESC
      LIMIT 10
    `
    recent = recentResult.rows || []

  } catch (err: any) {
    console.error("Zakat Transparency SQL Error:", err)
    error = "Failed to load donation data. Please try again later."
  }

  // === RENDER UI ===
  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-green-700 mb-2">
          Zakat & Charity Transparency
        </h1>
        <p className="text-muted-foreground">
          MANACAUD VALIYAPALLY MUSLIM HANAFI JAMATH
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Wakf Board Reg No. 3721/RA • +91 4712455824
        </p>
      </div>

      {/* Error State */}
      {error && (
        <Card className="mb-8 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-700 text-center">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Donation Summary */}
      <Card className="mb-8 bg-gradient-to-br from-green-50 to-emerald-50 border-emerald-200">
        <CardHeader>
          <CardTitle className="text-green-800">Donation Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {summary.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cause</TableHead>
                  <TableHead className="text-right">Total (INR)</TableHead>
                  <TableHead className="text-right">Donations</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.map((s, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{s.head_name}</TableCell>
                    <TableCell className="text-right font-mono text-green-700">
                      ₹{Number(s.total).toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell className="text-right">{s.count}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold border-t-2 border-green-300">
                  <TableCell>Grand Total</TableCell>
                  <TableCell className="text-right text-emerald-700 font-bold">
                    ₹{grandTotal.toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell className="text-right">
                    {summary.reduce((sum, s) => sum + Number(s.count), 0)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-6">
              No verified donations yet
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recent Donations */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recent Verified Donations</CardTitle>
        </CardHeader>
        <CardContent>
          {recent.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Donor</TableHead>
                  <TableHead>Cause</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell>{r.donor_name}</TableCell>
                    <TableCell>{r.cause}</TableCell>
                    <TableCell className="text-right font-mono">
                      ₹{Number(r.amount).toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell>{r.payment_method.toUpperCase()}</TableCell>
                    <TableCell>{r.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No recent donations to display
            </p>
          )}
        </CardContent>
      </Card>

      {/* CSV Download */}
      <div className="mt-8 text-center">
        <Button asChild>
          <a
            href="/api/zakat/transparency/csv"
            download
            className="inline-flex items-center gap-2"
          >
            Download Full Report (CSV)
          </a>
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-10">
        All data is live • Verified by Jamath Admin • Updated in real-time
      </p>
    </main>
  )
}
