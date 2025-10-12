"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"

type Prayer = {
  name: string
  time: string
}

export default function PrayerTimes() {
  const prayers: Prayer[] = useMemo(
    () => [
      { name: "Fajr", time: "05:25" },
      { name: "Sunrise", time: "06:45" },
      { name: "Dhuhr", time: "12:15" },
      { name: "Asr", time: "15:45" },
      { name: "Maghrib", time: "18:10" },
      { name: "Isha", time: "19:30" },
    ],
    [],
  )

  return (
    <ul className="grid grid-cols-2 gap-2 text-sm">
      {prayers.map((p) => (
        <li key={p.name} className={cn("flex items-center justify-between rounded-md border px-3 py-2")}>
          <span className="font-medium">{p.name}</span>
          <time className="tabular-nums text-muted-foreground">{p.time}</time>
        </li>
      ))}
    </ul>
  )
}
