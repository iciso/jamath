// app/api/debug-session/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  const session = await getServerSession(authOptions)
  return NextResponse.json({
    user: session?.user,
    profileId: (session?.user as any)?.profileId,
    raw: session,
  })
}
