// components/admin/donation-table.tsx
"use client"

import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function AdminDonationTable() {
  const { data: donations, mutate, error } = useSWR("/api/admin/donations", fetcher)
  const { toast } = useToast()

  const verify = async (id: string, action: "verified" | "rejected") => {
    try {
      const res = await fetch("/api/admin/donations/verify", {
        method: "POST",
        body: JSON.stringify({ donationId: id, action }),
        headers: { "Content-Type": "application/json" }
      })
      if (!res.ok) throw new Error(await res.json().error)

      toast({ title: action === "verified" ? "Verified successfully" : "Rejected" })
      mutate()
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to update", variant: "destructive" })
    }
  }

  if (error) return <p className="text-red-600">Failed to load pending donations.</p>
  if (!donations) return <p>Loading...</p>
  if (donations.length === 0) return <p>No pending donations.</p>

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th>Donor</th>
            <th>Cause</th>
            <th>Amount</th>
            <th>Method</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {donations.map((d: any) => (
            <tr key={d.id} className="border-b">
              <td>{d.donor_name}</td>
              <td>{d.head_name}</td>
              <td>₹{d.amount}</td>
              <td>{d.payment_method}</td>
              <td className="flex gap-2">
                <Button size="sm" onClick={() => verify(d.id, "verified")}>Verify</Button>
                <Button size="sm" variant="outline" onClick={() => verify(d.id, "rejected")}>Reject</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
