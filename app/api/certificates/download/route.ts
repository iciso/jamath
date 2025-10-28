import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Missing certificate ID" }, { status: 400 })
    }

    const sql = getSql()
    const cert = await sql`
      SELECT ic.certificate_number, ic.certificate_type, p.name, ic.issued_date
      FROM issued_certificates ic
      JOIN profiles p ON ic.profile_id = p.id
      WHERE ic.id = ${id}
    `

    if (!cert[0]) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 })
    }

    const c = cert[0]
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Certificate</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .certificate { border: 3px solid #333; padding: 40px; text-align: center; }
          h1 { color: #333; }
          .details { margin-top: 30px; text-align: left; }
        </style>
      </head>
      <body>
        <div class="certificate">
          <h1>${c.certificate_type.toUpperCase()} CERTIFICATE</h1>
          <p>Certificate Number: ${c.certificate_number}</p>
          <div class="details">
            <p><strong>Name:</strong> ${c.name}</p>
            <p><strong>Issued Date:</strong> ${new Date(c.issued_date).toLocaleDateString()}</p>
          </div>
        </div>
      </body>
      </html>
    `

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `attachment; filename="certificate-${c.certificate_number}.html"`,
      },
    })
  } catch (err) {
    console.error("[v0] Download certificate error:", err)
    return NextResponse.json({ error: "Failed to download" }, { status: 500 })
  }
}
