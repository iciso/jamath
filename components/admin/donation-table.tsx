"use client"

import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export function AdminDonationTable() {
  const { data: donations, mutate } = useSWR("/api/admin/donations", (url) => fetch(url).then(r => r.json()))
  const { toast } = useToast()

  const verify = async (id: string, action: "verified" | "rejected") => {
    const res = await fetch("/api/admin/donations/verify", {
      method: "POST",
      body: JSON.stringify({ donationId: id, action }),
      headers: { "Content-Type": "application/json" }
    })
    if (res.ok) {
      toast({ title: action === "verified" ? "Verified" : "Rejected" })
      mutate()
    }
  }

  if (!donations?.length) return <p>No pending donations.</p>

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="border-b"><th>Donor</th><th>Cause</th><th>Amount</th><th>Method</th><th>Actions</th></tr></thead>
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
