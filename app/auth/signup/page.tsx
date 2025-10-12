"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function SignUpPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || "Could not create account")
        setLoading(false)
        return
      }
      setSuccess("Account created. Please sign in.")
      setTimeout(() => router.push("/auth/signin"), 800)
    } catch (err: any) {
      setError("Unexpected error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container mx-auto max-w-md px-4 py-10">
      <h1 className="text-2xl font-semibold text-pretty mb-6">Create account</h1>

      {error ? <p className="mb-4 rounded-md bg-destructive/10 text-destructive px-3 py-2 text-sm">{error}</p> : null}
      {success ? (
        <p className="mb-4 rounded-md bg-green-600/10 text-green-700 dark:text-green-400 px-3 py-2 text-sm">
          {success}
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm">Full name</span>
          <input
            className="rounded-md border border-border bg-background px-3 py-2 outline-none"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm">Email</span>
          <input
            className="rounded-md border border-border bg-background px-3 py-2 outline-none"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm">Password</span>
          <input
            className="rounded-md border border-border bg-background px-3 py-2 outline-none"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            minLength={8}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-primary text-primary-foreground px-4 py-2 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-sm">
        {"Already have an account? "}
        <a href="/auth/signin" className="underline underline-offset-2">
          Sign in
        </a>
      </p>
    </main>
  )
}
