"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Calendar, ChevronRight } from "lucide-react";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date();
    const dateStr = format(today, "dd-MM-yyyy");

    // Fetch real-time Hijri from Aladhan
    fetch(`https://api.aladhan.com/v1/gToH/${dateStr}`)
      .then(r => r.json())
      .then(d => {
        if (d.code === 200 && d.data?.hijri) {
          const h = d.data.hijri;
          setHijri(h);
          setGregorian(format(today, "d MMMM yyyy"));

          // Calculate upcoming events
          const currentMonth = parseInt(h.month.number);
          const currentDay = parseInt(h.day);

          const futureEvents = hijriEvents
            .map(event => {
              const isFuture =
                event.hijriMonth > currentMonth ||
                (event.hijriMonth === currentMonth && (event.hijriDay || 1) >= currentDay);
              return { ...event, isFuture };
            })
            .filter(e => e.isFuture)
            .slice(0, 3);

          setUpcoming(futureEvents.length > 0 ? futureEvents : []);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false); // No fallback → show nothing
      });
  }, []);

  // Show loader while fetching
  if (loading) {
    return (
      <Card className="group border-green-100 bg-green-50/50 hover:bg-green-50 hover:border-green-300 transition-all h-full">
        <CardContent className="flex flex-col items-center justify-center py-8 space-y-3">
          <Loader2 className="size-6 animate-spin text-emerald-600" />
          <p className="text-xs text-muted-foreground">Fetching Hijri date...</p>
        </CardContent>
      </Card>
    );
  }

  // If no data (API failed), show nothing
  if (!hijri) {
    return null;
  }

  return (
    <Card className="group border-green-100 bg-green-50/50 hover:bg-green-50 hover:border-green-300 transition-all h-full">
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
        {/* Current Hijri Date */}
        <div className="text-center p-3 bg-white/70 rounded-lg border border-green-200">
          <p className="text-2xl font-bold text-green-800">
            {hijri.day} {hijri.month.en}
          </p>
          <p className="text-sm font-medium text-green-700">
            {hijri.year} AH
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {gregorian}
          </p>
        </div>

        {/* Upcoming Events */}
        {upcoming.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-green-700 uppercase tracking-wider">
              Upcoming
            </p>
            {upcoming.map((event, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-sm p-2 bg-white/50 rounded-md border border-green-100"
              >
                <span className="font-medium text-green-800">
                  {event.name}
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
        )}

        <p className="text-xs text-center text-muted-foreground italic">
          Dates are approximate • Subject to moon sighting
        </p>
        <div className="mt-2 text-center">
          <Link href="/calendar">
            <Button variant="outline" size="sm" className="mt-2 w-full border-green-300 text-green-700 hover:bg-green-50">
                      View Full 12-Month Calendar →
                    </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
