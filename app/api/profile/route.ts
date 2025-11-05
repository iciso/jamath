import { getServerSession } from "next-auth"
import { sql } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return Response.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { profileId, name, email, phone, gender } = body

    // Validate input
    if (!profileId || !name || !gender) {
      return Response.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Verify the profile belongs to the current user
    const profiles = await sql<{ id: string }[]>`
      select id from profiles
      where id = ${profileId} and email = ${session.user.email}
      limit 1
    `

    if (profiles.length === 0) {
      return Response.json({ message: "Profile not found or unauthorized" }, { status: 403 })
    }

    // Update profile
    await sql`
      update profiles
      set name = ${name},
          email = ${email || null},
          phone = ${phone || null},
          gender = ${gender}
      where id = ${profileId}
    `

    return Response.json({ message: "Profile updated successfully" })
  } catch (error) {
    console.error("[v0] Profile update error:", error)
    return Response.json({ message: "Internal server error" }, { status: 500 })
  }
}
