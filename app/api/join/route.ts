// app/api/join/route.ts
import { NextResponse } from "next/server"
import { sql } from "@/lib/neon"  // ← Use same as admin routes
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, phone, email, gender, password } = body

    // === VALIDATION ===
    if (!name || !phone || !gender || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    const normalizedGender = String(gender).toLowerCase()
    if (!["male", "female"].includes(normalizedGender)) {
      return NextResponse.json(
        { error: "Gender must be male or female" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 10)

    // === INSERT INTO pending_members ===
    try {
      await sql`
        INSERT INTO pending_members (
          name, phone, email, gender, password_hash
        ) VALUES (
          ${name}, ${phone}, ${email || null}, ${normalizedGender}, ${passwordHash}
        )
      `
    } catch (error: any) {
      console.error("SQL Insert Error:", error)

      const msg = error.message?.toLowerCase() || ""

      if (msg.includes("unique") || msg.includes("duplicate")) {
        if (msg.includes("phone")) {
          return NextResponse.json(
            { error: "This phone number is already registered" },
            { status: 409 }
          )
        }
        if (msg.includes("email")) {
          return NextResponse.json(
            { error: "This email is already registered" },
            { status: 409 }
          )
        }
      }

      return NextResponse.json(
        { error: "Database error. Please try again." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      message: "Request submitted. Awaiting admin approval."
    })

  } catch (err: any) {
    console.error("[JOIN API] Unexpected error:", err)
    return NextResponse.json(
      { error: "Server error. Please try again later." },
      { status: 500 }
    )
  }
}
