// components/zakat/donation-history.tsx

'use client'

import { useEffect, useState } from "react"
import { sql } from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Donation {
  id: string
  amount: string
  head_name: string
  created_at: string
  status: string
}

export function DonationHistory({ profileId }: { profileId: string }) {
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDonations() {
      try {
        const rows = await sql`
          SELECT d.id, d.amount::text, h.name as head_name, d.created_at, d.status
          FROM donations d
          JOIN donation_heads h ON h.id = d.head_id
          WHERE d.profile_id = ${profileId}
          ORDER BY d.created_at DESC
          LIMIT 20
        `
        setDonations(rows as Donation[])
      } catch (err) {
        console.error("Failed to fetch donations:", err)
        setDonations([])
      } finally {
        setLoading(false)
      }
    }
    fetchDonations()
  }, [profileId])

  if (loading) return <p className="text-center">Loading...</p>
  if (donations.length === 0) return <p className="text-center text-muted-foreground">No donations yet</p>

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Cause</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {donations.map((d) => (
          <TableRow key={d.id}>
            <TableCell>{new Date(d.created_at).toLocaleDateString()}</TableCell>
            <TableCell>{d.head_name}</TableCell>
            <TableCell className="text-right font-mono">₹{Number(d.amount).toFixed(2)}</TableCell>
            <TableCell>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                d.status === 'verified' ? 'bg-green-100 text-green-800' :
                d.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {d.status}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
