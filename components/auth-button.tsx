"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function AuthButton() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <Button variant="outline" size="sm" disabled>
        Loading...
      </Button>
    )
  }

  if (session) {
    return (
      <Button variant="outline" size="sm" onClick={() => signOut({ redirectTo: "/" })}>
        Sign Out
      </Button>
    )
  }

  return (
    <Link href="/auth/signin">
      <Button variant="outline" size="sm">
        Sign In
      </Button>
    </Link>
  )
}
