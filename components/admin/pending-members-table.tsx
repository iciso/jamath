"use client"

import useSWR from "swr"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

type PendingMember = {
  id: string
  name: string
  phone: string
  email: string | null
  gender: "male" | "female"
  created_at: string
}

const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) throw new Error("Failed to load")
  return res.json()
}

export function PendingMembersTable({ initial = [] }: { initial?: PendingMember[] }) {
  const { toast } = useToast()
  const { data, mutate, isValidating } = useSWR<{ items: PendingMember[] }>("/api/admin/pending-members", fetcher, {
    fallbackData: { items: initial },
  })
  const [notesById, setNotesById] = useState<Record<string, string>>({})

  const setNotes = (id: string, v: string) => setNotesById((s) => ({ ...s, [id]: v }))

  async function act(id: string, action: "approve" | "reject") {
    try {
      const notes = notesById[id]?.trim() || undefined
      const res = await fetch(`/api/admin/pending-members/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, notes }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || "Action failed")
      }
      toast({ description: `Request ${action}d` })
      await mutate()
    } catch (err: any) {
      toast({ description: err?.message || "Unexpected error", variant: "destructive" })
    }
  }

  const items = data?.items ?? []

  return (
    <div className="space-y-4">
      <div className="text-sm opacity-80">{isValidating ? "Refreshing..." : `${items.length} pending request(s)`}</div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((m) => (
            <TableRow key={m.id}>
              <TableCell className="font-medium">{m.name}</TableCell>
              <TableCell className="font-mono">{m.phone}</TableCell>
              <TableCell>{m.email || "-"}</TableCell>
              <TableCell className="capitalize">{m.gender}</TableCell>
              <TableCell className="text-xs opacity-70">{new Date(m.created_at).toLocaleString()}</TableCell>
              <TableCell className="min-w-56">
                <Textarea
                  value={notesById[m.id] ?? ""}
                  onChange={(e) => setNotes(m.id, e.target.value)}
                  placeholder="Optional notes..."
                  className="h-10"
                />
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button size="sm" onClick={() => act(m.id, "approve")}>
                  Approve
                </Button>
                <Button size="sm" variant="destructive" onClick={() => act(m.id, "reject")}>
                  Reject
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-10 text-sm opacity-70">
                No pending requests at the moment.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
