// components/zakat/donation-form.tsx

"use client"

import { useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

export function DonationForm({ profileId }: { profileId: string }) {
  const { data: heads } = useSWR("/api/donation-heads", (url) => fetch(url).then(r => r.json()))
  const [amount, setAmount] = useState("")
  const [head, setHead] = useState("")
  const [method, setMethod] = useState("")
  const { toast } = useToast()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch("/api/donations", {
      method: "POST",
      body: JSON.stringify({ profileId, headId: head, amount: +amount, method }),
      headers: { "Content-Type": "application/json" }
    })
    const data = await res.json()
    if (res.ok) {
      toast({ title: "Thank you!", description: "Donation recorded." })
    } else {
      toast({ title: "Error", description: data.error, variant: "destructive" })
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Select onValueChange={setHead}>
        <SelectTrigger><SelectValue placeholder="Select cause" /></SelectTrigger>
        <SelectContent>
          {heads?.map(h => (
            <SelectItem key={h.id} value={h.id}>{h.name} {h.is_zakat && "(Zakat)"}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input placeholder="Amount (₹)" type="number" value={amount} onChange={e => setAmount(e.target.value)} required />

      <Select onValueChange={setMethod}>
        <SelectTrigger><SelectValue placeholder="Payment method" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="cash">Cash</SelectItem>
          <SelectItem value="upi">UPI</SelectItem>
          <SelectItem value="bank">Bank Transfer</SelectItem>
        </SelectContent>
      </Select>

      <Button className="w-full bg-green-600 hover:bg-green-700">Donate Now</Button>
    </form>
  )
}
