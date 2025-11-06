// components/zakat/donation-form.tsx
"use client"

import { useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function DonationForm({ profileId }: { profileId: string }) {
  const { data: heads, error: headsError } = useSWR("/api/donation-heads", fetcher)
  const [amount, setAmount] = useState("")
  const [head, setHead] = useState("")
  const [method, setMethod] = useState("")
  const { toast } = useToast()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!head || !amount || !method) return

    const res = await fetch("/api/donations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profileId,
        headId: head,
        amount: +amount,
        method,
        transactionId: `txn_${Date.now()}`,
        notes: `Donation via ${method}`
      })
    })

    const data = await res.json()
    if (res.ok) {
      toast({ title: "Alhamdulillah!", description: "Donation recorded successfully." })
      setAmount("")
      setHead("")
      setMethod("")
    } else {
      toast({ title: "Error", description: data.error || "Failed to submit", variant: "destructive" })
    }
  }

  if (headsError) return <p className="text-red-600">Failed to load causes.</p>
  if (!heads) return <p>Loading causes...</p>

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Select onValueChange={setHead} value={head}>
        <SelectTrigger>
          <SelectValue placeholder="Select cause" />
        </SelectTrigger>
        <SelectContent>
          {heads.map((h: any) => (
            <SelectItem key={h.id} value={h.id}>
              {h.name} {h.is_zakat && "(Zakat)"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        placeholder="Amount (₹)"
        type="number"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        required
        min="1"
      />

      <Select onValueChange={setMethod} value={method}>
        <SelectTrigger>
          <SelectValue placeholder="Payment method" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="cash">Cash</SelectItem>
          <SelectItem value="upi">UPI</SelectItem>
          <SelectItem value="bank">Bank Transfer</SelectItem>
          <SelectItem value="razorpay">Razorpay</SelectItem>
        </SelectContent>
      </Select>

      <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
        Donate Now
      </Button>
    </form>
  )
}
