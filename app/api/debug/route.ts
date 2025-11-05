// app/api/debug/route.ts
import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    env: {
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "SET" : "MISSING",
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "SET" : "MISSING",
    },
  })
}
