"use client"

import type React from "react"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"

export default function SignInPage() {
  const router = useRouter()
  const params = useSearchParams()
  const callbackUrl = params.get("callbackUrl") || "/profile"
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl,
    })
    setLoading(false)
    if (res?.error) {
      setError("Invalid email or password")
      return
    }
    router.push(callbackUrl)
  }

  return (
    <main className="container mx-auto max-w-md px-4 py-10">
      <h1 className="text-2xl font-semibold text-pretty mb-6">Sign in</h1>

      {error ? <p className="mb-4 rounded-md bg-destructive/10 text-destructive px-3 py-2 text-sm">{error}</p> : null}

      <form onSubmit={handleSubmit} className="grid gap-4">
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
            autoComplete="current-password"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-primary text-primary-foreground px-4 py-2 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-sm">
        {"Don't have an account? "}
        <a href="/auth/signup" className="underline underline-offset-2">
          Create one
        </a>
      </p>
    </main>
  )
}
