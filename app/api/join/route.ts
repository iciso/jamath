// app/api/join/route.ts
import { NextResponse } from "next/server"
import { sql } from "@/lib/db"  // ← Use our Neon driver
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

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be 6+ characters" },
        { status: 400 }
      )
    }

    const normalizedGender = gender.toLowerCase()
    if (!["male", "female"].includes(normalizedGender)) {
      return NextResponse.json(
        { error: "Gender must be male or female" },
        { status: 400 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 10)

    // === INSERT ===
    try {
      await sql`
        INSERT INTO pending_members (
          name, phone, email, gender, password_hash
        ) VALUES (
          ${name}, ${phone}, ${email || null}, ${normalizedGender}, ${passwordHash}
        )
      `
    } catch (error: any) {
      console.error("SQL INSERT FAILED:", error)

      const msg = error.message?.toLowerCase() || ""

      if (msg.includes("pending_members") && msg.includes("does not exist")) {
        return NextResponse.json(
          { error: "Database table missing. Contact admin." },
          { status: 500 }
        )
      }

      if (msg.includes("unique") || msg.includes("duplicate")) {
        if (msg.includes("phone")) {
          return NextResponse.json(
            { error: "Phone number already used" },
            { status: 409 }
          )
        }
        if (msg.includes("email")) {
          return NextResponse.json(
            { error: "Email already used" },
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
    console.error("[JOIN API] Crash:", err)
    return NextResponse.json(
      { error: "Server error. Please try again." },
      { status: 500 }
    )
  }
}
