"use client"

import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export function CertificateReviewTable() {
  const { data: applications, mutate } = useSWR("/api/admin/certificates", (url) => fetch(url).then((r) => r.json()))
  const { toast } = useToast()

  async function handleApprove(id: string) {
    try {
      const res = await fetch("/api/admin/certificates/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: id }),
      })
      if (!res.ok) throw new Error("Failed to approve")
      toast({ title: "Approved" })
      mutate()
    } catch (err: any) {
      toast({ title: "Error", description: err?.message, variant: "destructive" })
    }
  }

  async function handleReject(id: string) {
    try {
      const res = await fetch("/api/admin/certificates/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: id }),
      })
      if (!res.ok) throw new Error("Failed to reject")
      toast({ title: "Rejected" })
      mutate()
    } catch (err: any) {
      toast({ title: "Error", description: err?.message, variant: "destructive" })
    }
  }

  if (!applications?.length) return <p className="text-muted-foreground">No pending applications</p>

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">Type</th>
            <th className="text-left p-2">Applicant</th>
            <th className="text-left p-2">Date</th>
            <th className="text-left p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app: any) => (
            <tr key={app.id} className="border-b">
              <td className="p-2 capitalize">{app.certificate_type}</td>
              <td className="p-2">{app.details?.applicantName}</td>
              <td className="p-2">{new Date(app.created_at).toLocaleDateString()}</td>
              <td className="p-2 flex gap-2">
                <Button size="sm" onClick={() => handleApprove(app.id)}>
                  Approve
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleReject(app.id)}>
                  Reject
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
