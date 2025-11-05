// app/api/donations/receipt/route.ts
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sql } from "@/lib/db"
import { PDFDocument, StandardFonts, rgb } from "pdf-lib"

export const dynamic = 'force-dynamic'

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

    const rows = await sql`
      SELECT 
        d.*, 
        h.name as head_name, 
        p.name as donor_name
      FROM donations d
      JOIN donation_heads h ON h.id = d.head_id
      JOIN profiles p ON p.id = d.profile_id
      WHERE d.id = ${id} AND d.status = 'verified'
    `

    const donation = rows[0]
    if (!donation) {
      return new Response(JSON.stringify({ error: "Not found or not verified" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    const amount = Number(donation.amount)
    if (isNaN(amount)) throw new Error("Invalid amount")

    // Generate PDF
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([600, 800])
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    const { height } = page.getSize()

    page.drawText("MANACAUD VALIYAPALLY MUSLIM HANAFI JAMATH", {
      x: 50,
      y: height - 50,
      size: 16,
      font: fontBold,
      color: rgb(0, 0.4, 0),
    })

    page.drawText("DONATION RECEIPT", {
      x: 50,
      y: height - 100,
      size: 20,
      font: fontBold,
      color: rgb(0, 0.5, 0),
    })

    page.drawText(`Receipt No: RCPT-${donation.id.slice(0, 8).toUpperCase()}`, {
      x: 50,
      y: height - 140,
      size: 12,
      font: fontBold,
    })

    page.drawText(`Donor: ${donation.donor_name}`, {
      x: 50,
      y: height - 180,
      size: 14,
      font,
    })

    page.drawText(`Cause: ${donation.head_name}`, {
      x: 50,
      y: height - 210,
      size: 12,
      font,
    })

    // ← FINAL FIX: Use "INR" instead of "₹"
    page.drawText(`Amount: INR ${amount.toFixed(2)}`, {
      x: 50,
      y: height - 240,
      size: 14,
      font: fontBold,
      color: rgb(0, 0.5, 0),
    })

    page.drawText(`Method: ${donation.payment_method.toUpperCase()}`, {
      x: 50,
      y: height - 270,
      size: 12,
      font,
    })

    page.drawText(`Date: ${new Date(donation.created_at).toLocaleDateString()}`, {
      x: 50,
      y: height - 300,
      size: 12,
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
        "Content-Disposition": `attachment; filename="receipt-${donation.id.slice(0, 8)}.pdf"`,
        "Cache-Control": "no-cache",
      },
    })
  } catch (err: any) {
    console.error("[PDF] ERROR:", err)
    return new Response(
      JSON.stringify({ 
        error: "Failed to generate receipt",
        details: err.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    )
  }
}
