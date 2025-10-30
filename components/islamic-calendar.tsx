"use client";

import { useEffect, useState } from "react";
import { HijriDate, toHijri } from "hijri-converter";
import { Calendar, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface HijriEvent {
  name: string;
  date: string; 
  hijriMonth: number;
  hijriDay?: number;
}

const hijriEvents: HijriEvent[] = [
  { name: "Ramadan", hijriMonth: 9, date: "Mar/Apr" },
  { name: "Eid al-Fitr", hijriMonth: 10, hijriDay: 1, date: "Apr/May" },
  { name: "Dhul-Hijjah", hijriMonth: 12, date: "Jun/Jul" },
  { name: "Eid al-Adha", hijriMonth: 12, hijriDay: 10, date: "Jul" },
  { name: "Muharram (Islamic New Year)", hijriMonth: 1, hijriDay: 1, date: "Jul/Aug" },
  { name: "12 Rabi' al-Awwal (Mawlid)", hijriMonth: 3, hijriDay: 12, date: "Sep" },
];

const hijriMonthsArabic = [
  "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani",
  "Jumada al-Ula", "Jumada al-Akhirah", "Rajab", "Sha'ban",
  "Ramadan", "Shawwal", "Dhul-Qi'dah", "Dhul-Hijjah"
];

export default function IslamicCalendar() {
  const [hijri, setHijri] = useState<HijriDate | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<HijriEvent[]>([]);

  useEffect(() => {
    const today = new Date();
    const hijriDate = toHijri(today.getFullYear(), today.getMonth() + 1, today.getDate());
    setHijri(hijriDate);

    {/* Find upcoming events */}
    const currentMonth = hijriDate.hm;
    const currentDay = hijriDate.hd;

    const eventsThisYear = hijriEvents.map(event => {
      let targetMonth = event.hijriMonth;
      let targetDay = event.hijriDay || 1;

    {/* Simple future check */}
      const isFuture = targetMonth > currentMonth || 
                      (targetMonth === currentMonth && targetDay >= currentDay);

      return { ...event, isFuture };
    });

    const future = eventsThisYear
      .filter(e => e.isFuture)
      .slice(0, 3);

  {/* If no future events this year, show next year's first 3 */}
    if (future.length === 0) {
      setUpcomingEvents(hijriEvents.slice(0, 3));
    } else {
      setUpcomingEvents(future);
    }
  }, []);

  if (!hijri) return null;

  return (
    <Card className="group border-green-100 bg-green-50/50 hover:bg-green-50 hover:border-green-300 transition-all h-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 group-hover:scale-110 transition-transform">
            <Calendar className="size-4" />
          </div>
          <CardTitle className="text-base text-green-800">Islamic Calendar</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Hijri Date */}
        <div className="text-center p-3 bg-white/70 rounded-lg border border-green-200">
          <p className="text-2xl font-bold text-green-800">
            {hijri.hd}
          </p>
          <p className="text-sm font-medium text-green-700">
            {hijriMonthsArabic[hijri.hm - 1]}
          </p>
          <p className="text-xs text-muted-foreground">
            {hijri.hy} AH
          </p>
        </div>

        {/* Upcoming Events */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-green-700 uppercase tracking-wider">
            Upcoming
          </p>
          {upcomingEvents.map((event, i) => (
            <div
              key={i}
              className="flex items-center justify-between text-sm p-2 bg-white/50 rounded-md border border-green-100"
            >
              <span className="font-medium text-green-800">
                {event.name}
              </span>
              <div className="flex items-center gap-1 text-muted-foreground">
                <span className="text-xs">
                  {event.hijriDay ? `${event.hijriDay} ` : ""}{hijriMonthsArabic[event.hijriMonth - 1]}
                </span>
                <ChevronRight className="size-3" />
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-center text-muted-foreground italic">
          Dates are approximate and subject to moon sighting.
        </p>
      </CardContent>
    </Card>
  );
}
