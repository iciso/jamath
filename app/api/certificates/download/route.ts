// app/api/certificates/download/route.ts
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sql } from "@/lib/neon"
import { PDFDocument, StandardFonts, rgb } from "pdf-lib"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) {
      return new Response(JSON.stringify({ error: "ID required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const sql = sql
    const [app] = await sql`
      SELECT ca.*, ic.certificate_number, p.name as member_name
      FROM certificate_applications ca
      JOIN issued_certificates ic ON ic.application_id = ca.id
      JOIN profiles p ON p.id = ca.profile_id
      WHERE ca.id = ${id} AND ca.status = 'issued'
    `

    if (!app) {
      return new Response(JSON.stringify({ error: "Not found or not issued" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Generate PDF
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([600, 800])
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    const { width, height } = page.getSize()

    // Header
    page.drawText("MANACAUD VALIYAPALLY MUSLIM HANAFI JAMATH", {
      x: 50,
      y: height - 50,
      size: 16,
      font: fontBold,
      color: rgb(0, 0.4, 0),
    })

    page.drawText(app.certificate_type.toUpperCase() + " CERTIFICATE", {
      x: 50,
      y: height - 100,
      size: 20,
      font: fontBold,
      color: rgb(0, 0.5, 0),
    })

    page.drawText(`Certificate No: ${app.certificate_number}`, {
      x: 50,
      y: height - 140,
      size: 12,
      font: fontBold,
    })

    page.drawText(`Issued to: ${app.details.applicantName}`, {
      x: 50,
      y: height - 180,
      size: 14,
      font,
    })

    page.drawText(`Date of Event: ${app.details.dateOfEvent}`, {
      x: 50,
      y: height - 210,
      size: 12,
      font,
    })

    page.drawText(`Place: ${app.details.placeOfEvent}`, {
      x: 50,
      y: height - 240,
      size: 12,
      font,
    })

    if (app.details.additionalInfo) {
      page.drawText(`Notes: ${app.details.additionalInfo}`, {
        x: 50,
        y: height - 280,
        size: 10,
        font,
        maxWidth: 500,
      })
    }

    page.drawText(`Issued on: ${new Date().toLocaleDateString()}`, {
      x: 50,
      y: height - 340,
      size: 10,
      font,
    })

    page.drawText("Wakf Board Reg No. 3721/RA • +91 4712455824", {
      x: 50,
      y: 50,
      size: 10,
      font,
      color: rgb(0.5, 0.5, 0.5),
    })

    const pdfBytes = await pdfDoc.save()

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${app.certificate_type}-certificate-${app.certificate_number}.pdf"`,
        "Cache-Control": "no-cache",
      },
    })
  } catch (err) {
    console.error("[PDF] Error:", err)
    return new Response(JSON.stringify({ error: "Failed to generate PDF" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
