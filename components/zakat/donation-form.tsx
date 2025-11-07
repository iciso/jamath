// components/zakat/donation-form.tsx
"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
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
    if (!head || !amount || !method || !profileId) {
      toast({ title: "Error", description: "All fields are required.", variant: "destructive" })
      return
    }

    const payload = {
      headId: head,
      amount: Number(amount),
      payment_method: method,           // DB column
      transaction_id: `txn_${Date.now()}`, // DB column
      notes: `Donation via ${method}`
    }

    console.log("[DonationForm] Submitting:", payload)  // Debug

    try {
      const res = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      console.log("[DonationForm] Response:", res.status, data)  // Debug

      if (res.ok) {
        toast({
          title: "Alhamdulillah!",
          description: data.message || "Donation submitted successfully. Awaiting verification."
        })
        setAmount("")
        setHead("")
        setMethod("")
        // Refresh history
        mutate(`/api/donations?profileId=${profileId}`)
      } else {
        toast({
          title: "Failed",
          description: data.error || "Something went wrong.",
          variant: "destructive"
        })
      }
    } catch (err: any) {
      console.error("[DonationForm] Network error:", err)
      toast({
        title: "Error",
        description: "Network error. Check console.",
        variant: "destructive"
      })
    }
  }

  if (headsError) {
    console.error("[DonationForm] Failed to load heads:", headsError)
    return <p className="text-red-600">Failed to load causes.</p>
  }
  if (!heads) return <p className="text-muted-foreground">Loading causes...</p>

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Cause */}
      <Select onValueChange={setHead} value={head}>
        <SelectTrigger>
          <SelectValue placeholder="Select cause" />
        </SelectTrigger>
        <SelectContent>
          {Array.isArray(heads) && heads.length > 0 ? (
            heads.map((h: any) => (
              <SelectItem key={h.id} value={h.id}>
                {h.name} {h.is_zakat && "(Zakat)"}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="" disabled>
              No causes available
            </SelectItem>
          )}
        </SelectContent>
      </Select>

      {/* Amount */}
      <Input
        placeholder="Amount (₹)"
        type="number"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        required
        min="1"
        step="0.01"
      />

      {/* Payment Method */}
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

      {/* Submit */}
      <Button
        type="submit"
        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium"
        disabled={!head || !amount || !method}
      >
        Donate Now
      </Button>
    </form>
  )
}
