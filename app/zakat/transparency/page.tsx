// app/zakat/transparency/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { sql } from "@/lib/neon"
import { ZakatChart } from "@/components/ZakatChart"

export const dynamic = 'force-dynamic'

export default async function TransparencyPage() {
  const summary = await sql`
    SELECT 
      h.name as head_name,
      COALESCE(SUM(d.amount), 0)::text as total,
      COUNT(d.id) as count
    FROM donation_heads h
    LEFT JOIN donations d ON d.head_id = h.id AND d.status = 'verified'
    WHERE h.active = true
    GROUP BY h.id, h.name
    ORDER BY total::numeric DESC
  `

  const grandTotal = summary.reduce((sum, s) => sum + Number(s.total), 0)

  const recent = await sql`
    SELECT 
      p.name as donor_name,
      h.name as cause,
      d.amount::text,
      d.payment_method,
      TO_CHAR(d.created_at, 'DD Mon YYYY') as date
    FROM donations d
    JOIN profiles p ON p.id = d.profile_id
    JOIN donation_heads h ON h.id = d.head_id
    WHERE d.status = 'verified'
    ORDER BY d.created_at DESC
    LIMIT 10
  `

  const chartData = summary
    .filter(s => Number(s.total) > 0)
    .map(s => ({ name: s.head_name, value: Number(s.total) }))

  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
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

      {/* Summary Table */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Donation Summary</CardTitle>
        </CardHeader>
        <CardContent>
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
                  <TableCell className="text-right font-mono text-green-700">{s.total}</TableCell>
                  <TableCell className="text-right">{s.count}</TableCell>
                </TableRow>
              ))}
              <TableRow className="font-bold border-t-2">
                <TableCell>Grand Total</TableCell>
                <TableCell className="text-right text-emerald-700">INR {grandTotal.toFixed(2)}</TableCell>
                <TableCell className="text-right">{summary.reduce((sum, s) => sum + Number(s.count), 0)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pie Chart — Client Component */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Distribution by Cause</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ZakatChart data={chartData} />
          ) : (
            <p className="text-center text-muted-foreground">No donations to display</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Donations */}
      <Card className="mt-8">
        <CardHeader><CardTitle>Recent Verified Donations</CardTitle></CardHeader>
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
                    <TableCell className="text-right font-mono">INR {r.amount}</TableCell>
                    <TableCell>{r.payment_method.toUpperCase()}</TableCell>
                    <TableCell>{r.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground">No verified donations yet</p>
          )}
        </CardContent>
      </Card>

      <div className="mt-8 text-center">
        <Button asChild>
          <a href="/api/zakat/transparency/csv" download className="inline-flex items-center">
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
