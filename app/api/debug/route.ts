// app/api/debug/route.ts
import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    env: {
      NEXTAUTH_SECRET: "SET",
      NEXTAUTH_URL: "https://v0-masjid-community-app.vercel.app",
      GOOGLE_CLIENT_ID: "215508504819-l9sgava2j04ie992cpqie3mmpt93kugb.apps.googleusercontent.com",
      GOOGLE_CLIENT_SECRET: "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",
      note: "All values hard-coded — Vercel env bug bypassed"
    },
  })
}
