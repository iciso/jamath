import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { name, phone, email, gender } = await req.json()

    if (!name || !phone || !gender) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    const normalizedGender = String(gender).toLowerCase()
    if (!["male", "female"].includes(normalizedGender)) {
      return NextResponse.json({ error: "Invalid gender" }, { status: 400 })
    }

    const sql = getSql()

    // Insert into approved_members
    try {
      await sql /* sql */`
        INSERT INTO approved_members (name, phone, email, gender)
        VALUES (${name}, ${phone}, ${email}, ${normalizedGender})
      `
    } catch (e: any) {
      // Constraint violation (e.g., unique phone)
      if (
        String(e?.message || "")
          .toLowerCase()
          .includes("unique")
      ) {
        return NextResponse.json({ error: "This phone number is already submitted" }, { status: 409 })
      }
      throw e
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
