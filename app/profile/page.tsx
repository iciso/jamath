import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { sql } from "@/lib/neon"
import { authOptions } from "@/lib/auth"
import { ProfileForm } from "@/components/profile/profile-form"

export default async function ProfilePage() {
  let session
  try {
    session = await getServerSession(authOptions)
  } catch (err) {
    console.log("[v0] getServerSession error:", (err as Error)?.message)
  }

  if (!session?.user?.email) {
    redirect("/auth/signin?callbackUrl=/profile")
  }

  // Fetch user's profile from profiles table by email
  const profiles = await sql<
    { id: string; name: string; email: string | null; phone: string | null; gender: string; is_active: boolean }[]
  >`
    select id, name, email, phone, gender, is_active
    from profiles
    where email = ${session.user.email}
    limit 1
  `

  const profile = profiles[0]

  if (!profile) {
    return (
      <main className="min-h-screen bg-background p-4">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-lg border border-border bg-card p-6 text-center">
            <h1 className="text-2xl font-bold text-foreground">Profile Not Found</h1>
            <p className="mt-2 text-muted-foreground">
              Your profile has not been created yet. Please contact the Jamath administrator.
            </p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg border border-border bg-card p-6">
          <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
          <p className="mt-1 text-muted-foreground">View and edit your profile information</p>
          <div className="mt-6">
            <ProfileForm initialProfile={profile} />
          </div>
        </div>
      </div>
    </main>
  )
}
