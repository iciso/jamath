"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface CertificateFormProps {
  profileId: string
}

export function CertificateForm({ profileId }: CertificateFormProps) {
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)

    const form = e.currentTarget
    const formData = new FormData(form)
    const certificateType = String(formData.get("certificateType") || "").trim()
    const details = {
      applicantName: String(formData.get("applicantName") || "").trim(),
      dateOfEvent: String(formData.get("dateOfEvent") || "").trim(),
      placeOfEvent: String(formData.get("placeOfEvent") || "").trim(),
      additionalInfo: String(formData.get("additionalInfo") || "").trim(),
    }

    try {
      const res = await fetch("/api/certificates/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, certificateType, details }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed to submit")

      form.reset()
      toast({ title: "Success", description: "Certificate application submitted" })
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Something went wrong", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="certificateType">Certificate Type</Label>
        <select
          id="certificateType"
          name="certificateType"
          required
          className="rounded-md border border-input bg-background px-3 py-2"
        >
          <option value="">Select type...</option>
          <option value="birth">Birth Certificate</option>
          <option value="marriage">Marriage Certificate</option>
          <option value="talaq">Talaq Certificate</option>
          <option value="death">Death Certificate</option>
        </select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="applicantName">Applicant Name</Label>
        <Input id="applicantName" name="applicantName" required />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="dateOfEvent">Date of Event</Label>
        <Input id="dateOfEvent" name="dateOfEvent" type="date" required />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="placeOfEvent">Place of Event</Label>
        <Input id="placeOfEvent" name="placeOfEvent" required />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="additionalInfo">Additional Information</Label>
        <textarea
          id="additionalInfo"
          name="additionalInfo"
          className="rounded-md border border-input bg-background px-3 py-2 min-h-24"
          placeholder="Any additional details..."
        />
      </div>

      <Button type="submit" disabled={submitting} className="bg-primary text-primary-foreground">
        {submitting ? "Submitting..." : "Submit Application"}
      </Button>
    </form>
  )
}
