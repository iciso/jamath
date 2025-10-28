"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Clock, Sun, Moon, CloudSun, CloudMoon, Sunrise, Sunset } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

type PrayerName = "Fajr" | "Sunrise" | "Dhuhr" | "Asr" | "Maghrib" | "Isha"
type PrayerData = Record<PrayerName, string>

const PRAYER_ICONS: Record<PrayerName, React.ReactNode> = {
  Fajr: <Moon className="size-4" />,
  Sunrise: <Sunrise className="size-4" />,
  Dhuhr: <Sun className="size-4" />,
  Asr: <CloudSun className="size-4" />,
  Maghrib: <Sunset className="size-4" />,
  Isha: <CloudMoon className="size-4" />,
}

const PRAYER_NAMES_ML: Record<PrayerName, string> = {
  Fajr: "ഫജ്‌ർ",
  Sunrise: "സൂര്യോദയം",
  Dhuhr: "ലുഹ്‌ർ",
  Asr: "അസ്‌ർ",
  Maghrib: "മഗ്‌രിബ്",
  Isha: "ഇശാ",
}

interface PrayerTimesProps {
  locale?: "en" | "ml"
}

export default function PrayerTimes({ locale = "en" }: PrayerTimesProps) {
  const [prayers, setPrayers] = useState<PrayerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>("")

  const fetchPrayerTimes = async () => {
    try {
      setLoading(true)
      setError(null)

      {/* Use server-side API route to avoid exposing coordinates in client */}
      const res = await fetch("/api/prayer-times")
      const data = await res.json()

      if (data.error) throw new Error(data.error)

      setPrayers(data.timings)
      setLastUpdated(format(new Date(), "MMM d, yyyy – h:mm a"))
    } catch (err) {
      setError("Failed to load prayer times. Using cached data.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPrayerTimes()
    const interval = setInterval(fetchPrayerTimes, 6 * 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return <PrayerSkeleton />
  }

  if (error && !prayers) {
    return <PrayerError message={error} />
  }

  const prayerList: PrayerName[] = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"]

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {prayerList.map((prayer) => {
          const time = prayers?.[prayer] || "--:--"
          const name = locale === "ml" ? PRAYER_NAMES_ML[prayer] : prayer
          const isNow = isCurrentPrayer(prayer, time)

          return (
            <div
              key={prayer}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg border transition-all",
                isNow
                  ? "bg-green-100 border-green-400 shadow-sm ring-2 ring-green-400/20"
                  : "bg-white border-green-200"
              )}
            >
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full",
                    isNow ? "bg-green-600 text-white" : "bg-green-100 text-green-700"
                  )}
                >
                  {PRAYER_ICONS[prayer]}
                </div>
                <span className={cn("font-medium text-sm", isNow && "text-green-900")}>
                  {name}
                </span>
              </div>
              <span className={cn("font-bold text-lg", isNow && "text-green-900")}>
                {time}
              </span>
            </div>
          )
        })}
      </div>

      <p className="text-xs text-muted-foreground text-center italic">
        Updated: {lastUpdated} • Source: Aladhan.com
      </p>
    </div>
  )
}

   {/*  Helper: Check if current prayer */}
function isCurrentPrayer(prayer: string, time: string): boolean {
  const now = new Date()
  const [hours, minutes] = time.split(":").map(Number)
  const prayerTime = new Date()
  prayerTime.setHours(hours, minutes, 0, 0)

  const diff = now.getTime() - prayerTime.getTime()
  const isToday = now.toDateString() === prayerTime.toDateString()

  if (!isToday) return false
  if (prayer === "Sunrise" || prayer === "Sunset") return false

  return diff > -15 * 60 * 1000 && diff < 60 * 60 * 1000 
}

    {/*  Loading Skeleton */}
function PrayerSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-green-200 bg-white">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-6 w-12" />
        </div>
      ))}
    </div>
  )
}

 {/*   Error State */}
function PrayerError({ message }: { message: string }) {
  return (
    <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm text-center">
      {message}
    </div>
  )
}
