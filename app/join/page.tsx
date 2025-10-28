"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export default function JoinPage() {
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    setSubmitting(true)
    setMessage(null)
    setError(null)

    const formData = new FormData(form)
    const name = String(formData.get("name") || "").trim()
    const phone = String(formData.get("phone") || "").trim()
    const email = String(formData.get("email") || "").trim()
    const gender = String(formData.get("gender") || "").trim()
    const password = String(formData.get("password") || "").trim() // added password field

    try {
      const res = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email: email || null, gender, password }), // include password
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || "Failed to submit")
      }

      form.reset()
      setMessage("Your request has been received. The Jamath will review and contact you, in shaa Allah.")
    } catch (err: any) {
      setError(err?.message || "Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Join the Masjid Community</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" name="name" required placeholder="Your full name" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Phone (required)</Label>
              <Input id="phone" name="phone" required inputMode="tel" placeholder="+1 234 567 8901" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email (optional)</Label>
              <Input id="email" name="email" type="email" placeholder="you@example.com" />
            </div>

            <fieldset className="grid gap-2">
              <legend className="text-sm font-medium">Gender</legend>
              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input type="radio" name="gender" value="male" required />
                  <span>Male</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="gender" value="female" required />
                  <span>Female</span>
                </label>
              </div>
            </fieldset>

            <div className="grid gap-2">
              <Label htmlFor="password">Password (required)</Label>
              <Input id="password" name="password" type="password" required placeholder="Choose a secure password" />
            </div>

            <Button type="submit" disabled={submitting} className={cn("bg-primary text-primary-foreground")}>
              {submitting ? "Submitting..." : "Submit request"}
            </Button>

            {message && (
              <p className="text-sm rounded-md bg-secondary text-secondary-foreground px-3 py-2">{message}</p>
            )}
            {error && <p className="text-sm rounded-md bg-destructive text-white px-3 py-2">{error}</p>}

            <p className="text-xs text-muted-foreground">
              By submitting, you agree to the{" "}
              <a className="underline" href="/terms">
                Terms & Conditions
              </a>
              .
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
