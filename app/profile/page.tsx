// app/profile/page.tsx
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export default async function Profile() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/signin")

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Welcome, {session.user.name}</h1>
      <p>Email: {session.user.email}</p>
      <p>User ID: {session.user.id}</p>
      <a href="/zakat" className="text-blue-600 hover:underline">Go to Zakat Page →</a>
    </div>
  )
}
