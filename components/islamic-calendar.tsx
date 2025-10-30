"use client";

import { useEffect, useState } from "react";
import { format, addYears } from "date-fns";
import IslamicCalendarFull from "@/components/islamic-calendar-full";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface HijriEvent {
  name: string;
  hijriMonth: number;
  hijriDay?: number;
  gregorianApprox: string;
}

const hijriEvents: HijriEvent[] = [
  { name: "Ramadan Begins", hijriMonth: 9, hijriDay: 1, gregorianApprox: "19 Feb 2026" },
  { name: "Eid al-Fitr", hijriMonth: 10, hijriDay: 1, gregorianApprox: "20 Mar 2026" },
  { name: "Dhul-Hijjah", hijriMonth: 12, hijriDay: 1, gregorianApprox: "18 May 2026" },
  { name: "Eid al-Adha", hijriMonth: 12, hijriDay: 10, gregorianApprox: "27 May 2026" },
  { name: "Muharram 1448", hijriMonth: 1, hijriDay: 1, gregorianApprox: "7 Jul 2026" },
];

const hijriMonthsArabic = [
  "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani",
  "Jumada al-Ula", "Jumada al-Akhirah", "Rajab", "Sha'ban",
  "Ramadan", "Shawwal", "Dhul-Qi'dah", "Dhul-Hijjah"
];

export default function IslamicCalendar() {
  const [hijri, setHijri] = useState<any>(null);
  const [gregorian, setGregorian] = useState<string>("");
  const [upcoming, setUpcoming] = useState<HijriEvent[]>([]);

  useEffect(() => {
    // Fetch real-time Hijri + Gregorian from Aladhan
    fetch("https://api.aladhan.com/v1/gToH?date=today")
      .then(r => r.json())
      .then(d => {
        const h = d.data.hijri;
        setHijri(h);
        setGregorian(format(new Date(), "d MMMM yyyy"));

        // Find upcoming events
        const currentMonth = parseInt(h.month.number);
        const currentDay = h.day;

        const futureEvents = hijriEvents
          .map(event => {
            const isFuture = 
              event.hijriMonth > currentMonth ||
              (event.hijriMonth === currentMonth && (event.hijriDay || 1) >= currentDay);

            return { ...event, isFuture };
          })
          .filter(e => e.isFuture)
          .slice(0, 3);

        // If none this year, show next year's
        setUpcoming(futureEvents.length > 0 ? futureEvents : hijriEvents.slice(0, 3));
      })
      .catch(() => {
        // Fallback
        const fallback = { day: "8", month: { en: "Jumada al-Ula" }, year: "1447" };
        setHijri(fallback);
        setGregorian(format(new Date(), "d MMMM yyyy"));
        setUpcoming(hijriEvents.slice(0, 3));
      });
  }, []);

  if (!hijri) return null;

  return (
    <Card className="group border-green-100 bg-gradient-to-br from-emerald-50 to-white shadow-sm hover:shadow-md transition-all h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 group-hover:scale-110 transition-transform">
              <Calendar className="size-4" />
            </div>
            <CardTitle className="text-base text-green-800">Islamic Calendar</CardTitle>
          </div>
          <span className="text-xs font-medium text-emerald-600">Live</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Date - Dual Calendar */}
        <div className="text-center p-4 bg-white/80 rounded-lg border border-green-200">
          <p className="text-2xl font-bold text-green-800">
            {hijri.day} {hijri.month?.en || hijriMonthsArabic[parseInt(hijri.month.number) - 1]}
          </p>
          <p className="text-sm font-medium text-green-700">
            {hijri.year} AH
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {gregorian}
          </p>
        </div>

        {/* Upcoming Events */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-green-700 uppercase tracking-wider">
            Upcoming
          </p>
          {upcoming.map((event, i) => (
            <div
              key={i}
              className="flex items-center justify-between text-sm p-2 bg-white/60 rounded-md border border-green-100"
            >
              <span className="font-medium text-green-800">
                {event.hijriDay ? `${event.hijriDay} ` : ""}{hijriMonthsArabic[event.hijriMonth - 1]}
              </span>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span className="font-medium text-green-600">
                  {event.gregorianApprox}
                </span>
                <ChevronRight className="size-3 text-emerald-600" />
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-center text-muted-foreground italic">
          Dates are approximate • Subject to moon sighting
        </p>
        <div className="mt-2 text-center">
            <Link href="/calendar" className="text-xs font-medium text-emerald-600 hover:underline">
            View Full 12-Month Calendar →
            </Link>
        </div>
      </CardContent>
    </Card>
  );
}
