"use client"

import useSWR from "swr"
import { Button } from "@/components/ui/button"

export function DonationHistory({ profileId }: { profileId: string }) {
  const { data: donations, isLoading } = useSWR(`/api/donations?profileId=${profileId}`, (url) =>
    fetch(url).then(r => r.json())
  )

  if (isLoading) return <p>Loading...</p>
  if (!donations?.length) return <p>No donations yet.</p>

  return (
    <div className="space-y-4">
      {donations.map((d: any) => (
        <div key={d.id} className="flex justify-between items-center p-4 border rounded-lg">
          <div>
            <p className="font-semibold">{d.head_name}</p>
            <p className="text-sm text-muted-foreground">₹{d.amount} • {new Date(d.created_at).toLocaleDateString()}</p>
            <p className="text-xs text-green-600">Status: {d.status}</p>
          </div>
          {d.status === "verified" && (
            <Button size="sm" onClick={() => window.open(`/api/donations/receipt?id=${d.id}`, "_blank")}>
              Receipt
            </Button>
          )}
        </div>
      ))}
    </div>
  )
}
