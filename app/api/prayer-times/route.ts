{/* app/api/prayer-times/route.ts  */}
import { NextResponse } from "next/server"

let cachedData: { timings: any; timestamp: number } | null = null
const CACHE_DURATION = 6 * 60 * 60 * 1000 

const LAT = 8.470573225475345
const LNG = 76.95030782883602
const METHOD = 5 

export async function GET() {
  const now = Date.now()

  if (cachedData && now - cachedData.timestamp < CACHE_DURATION) {
    return NextResponse.json({ timings: cachedData.timings })
  }

  try {
    const date = new Date().toISOString().split("T")[0]
    const url = `https://api.aladhan.com/v1/timings/${date}?latitude=${LAT}&longitude=${LNG}&method=${METHOD}`

    const res = await fetch(url, { next: { revalidate: 21600 } })
    const data = await res.json()

    if (!data.data?.timings) {
      throw new Error("Invalid response from Aladhan API")
    }

    const timings = {
      Fajr: data.data.timings.Fajr,
      Sunrise: data.data.timings.Sunrise,
      Dhuhr: data.data.timings.Dhuhr,
      Asr: data.data.timings.Asr,
      Maghrib: data.data.timings.Maghrib,
      Isha: data.data.timings.Isha,
    }

    cachedData = { timings, timestamp: now }

    return NextResponse.json({ timings })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch prayer times" }, { status: 500 })
  }
}
